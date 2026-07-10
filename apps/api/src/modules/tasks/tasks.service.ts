import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../database/prisma.service';
import { TrustService, TRUST_EVENTS, SL_POINTS } from '../trust/trust.service';
import { ServiceRequestsService } from '../service-requests/service-requests.service';

/**
 * TasksService
 *
 * Runs background scheduled jobs for ServiLocal.
 * Manages:
 *   - Hourly expiration of PENDING service requests past their expiresAt date.
 *   - Daily cleanup of expired sessions and password reset tokens.
 *   - Weekly activity rewards (trust + SL points).
 *   - Daily inactivity penalties.
 *   - Daily sustained high trust rewards.
 */
@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly serviceRequestsService: ServiceRequestsService,
    private readonly prisma: PrismaService,
    private readonly trustService: TrustService,
  ) {}

  /**
   * Runs every hour at minute 0.
   * Expires PENDING service requests that have passed their 48-hour window,
   * notifies both parties, and records a trust penalty for the provider.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async expireServiceRequests(): Promise<void> {
    this.logger.log('⏰ Running scheduled expiration of pending service requests...');
    try {
      const count = await this.serviceRequestsService.expirePendingRequests();
      if (count > 0) {
        this.logger.log(`✅ Expired ${count} pending service request(s).`);
      } else {
        this.logger.debug('No pending requests to expire.');
      }
    } catch (err) {
      this.logger.error('❌ Error during scheduled expiration:', err);
    }
  }

  /**
   * Runs every day at 3:00 AM.
   * Cleans up expired and revoked sessions to prevent table bloat.
   */
  @Cron('0 3 * * *')
  async cleanExpiredSessions(): Promise<void> {
    this.logger.log('⏰ Cleaning expired and revoked sessions...');
    try {
      const now = new Date();
      const result = await this.prisma.session.deleteMany({
        where: {
          OR: [
            { status: 'EXPIRED' },
            { status: 'REVOKED' },
            { expiresAt: { lt: now } },
          ],
        },
      });
      this.logger.log(`✅ Cleaned ${result.count} expired/revoked session(s).`);
    } catch (err) {
      this.logger.error('❌ Error during session cleanup:', err);
    }
  }

  /**
   * Runs every day at 3:30 AM.
   * Cleans up expired password reset tokens to prevent table bloat.
   */
  @Cron('0 3 * * *')
  async cleanExpiredPasswordResetTokens(): Promise<void> {
    this.logger.log('⏰ Cleaning expired password reset tokens...');
    try {
      const now = new Date();
      const result = await this.prisma.passwordResetToken.deleteMany({
        where: {
          expiresAt: { lt: now },
        },
      });
      this.logger.log(`✅ Cleaned ${result.count} expired password reset token(s).`);
    } catch (err) {
      this.logger.error('❌ Error during password reset token cleanup:', err);
    }
  }

  /**
   * Runs every day at midnight.
   * Checks for prolonged inactivity (>60 days) and applies -5 trust penalty.
   * Uses batch operations: finds users without a recent INACTIVITY event
   * and processes them via recordTrustEvent (which handles the transaction).
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async penalizeInactivity(): Promise<void> {
    this.logger.log('⏰ Checking for prolonged inactivity (>60 days)...');
    try {
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      // Find inactive users who haven't already been penalized recently
      const inactiveUsers = await this.prisma.user.findMany({
        where: {
          lastLoginAt: { lt: sixtyDaysAgo },
          status: 'ACTIVE',
          // Exclude users who already received an inactivity penalty in the last 60 days
          NOT: {
            trustEvents: {
              some: {
                eventType: 'INACTIVITY',
                createdAt: { gte: sixtyDaysAgo },
              },
            },
          },
        },
        select: { id: true },
      });

      if (inactiveUsers.length > 0) {
        // Batch create trust events
        await this.prisma.trustEvent.createMany({
          data: inactiveUsers.map((user) => ({
            userId: user.id,
            eventType: 'INACTIVITY',
            points: TRUST_EVENTS.INACTIVITY.points,
            reason: TRUST_EVENTS.INACTIVITY.reason,
          })),
        });

        // Batch decrement trust scores (clamped at 0 via DB constraint or app logic)
        await this.prisma.$executeRaw`
          UPDATE "User" 
          SET "trustScore" = GREATEST(0, "trustScore" + ${TRUST_EVENTS.INACTIVITY.points}) 
          WHERE "id" = ANY(${inactiveUsers.map((u) => u.id)})
        `;

        this.logger.log(`✅ Applied inactivity penalty to ${inactiveUsers.length} user(s).`);
      } else {
        this.logger.debug('No inactive users found.');
      }
    } catch (err) {
      this.logger.error('❌ Error during inactivity penalty:', err);
    }
  }

  /**
   * Runs every week on Monday at 1:00 AM.
   * Rewards active weekly use with +2 trust and +2 SL points.
   * Uses batch operations instead of user-by-user loops.
   */
  @Cron('0 1 * * 1')
  async rewardWeeklyActivity(): Promise<void> {
    this.logger.log('⏰ Rewarding weekly activity...');
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const activeUsers = await this.prisma.user.findMany({
        where: {
          lastLoginAt: { gte: sevenDaysAgo },
          status: 'ACTIVE',
        },
        select: { id: true },
      });

      if (activeUsers.length > 0) {
        const userIds = activeUsers.map((u) => u.id);

        // Batch create trust events for all active users
        await this.prisma.trustEvent.createMany({
          data: userIds.map((userId) => ({
            userId,
            eventType: 'WEEKLY_ACTIVE',
            points: TRUST_EVENTS.WEEKLY_ACTIVE.points,
            reason: TRUST_EVENTS.WEEKLY_ACTIVE.reason,
          })),
        });

        // Batch update trust scores (clamped at 100)
        await this.prisma.$executeRaw`
          UPDATE "User" 
          SET "trustScore" = LEAST(100, "trustScore" + ${TRUST_EVENTS.WEEKLY_ACTIVE.points}) 
          WHERE "id" = ANY(${userIds})
        `;

        // Batch award SL points
        await this.prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { slPoints: { increment: SL_POINTS.WEEKLY_ACTIVE } },
        });

        this.logger.log(`✅ Rewarded weekly activity to ${activeUsers.length} user(s).`);
      } else {
        this.logger.debug('No active users found this week.');
      }
    } catch (err) {
      this.logger.error('❌ Error during weekly activity reward:', err);
    }
  }

  /**
   * Runs every day at 2:00 AM.
   * Rewards high trust sustained for 30 days.
   */
  @Cron('0 2 * * *')
  async rewardHighTrustSustained(): Promise<void> {
    this.logger.log('⏰ Checking for sustained high trust (30 days)...');
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Find high-trust users who have no negative events AND no recent reward in 30 days
      const eligibleUsers = await this.prisma.user.findMany({
        where: {
          trustScore: { gte: 80 },
          status: 'ACTIVE',
          NOT: {
            OR: [
              // Exclude users with negative trust events in the last 30 days
              {
                trustEvents: {
                  some: {
                    points: { lt: 0 },
                    createdAt: { gte: thirtyDaysAgo },
                  },
                },
              },
              // Exclude users who already received this reward in the last 30 days
              {
                auditLogs: {
                  some: {
                    action: 'SUSTAINED_HIGH_TRUST_REWARD',
                    createdAt: { gte: thirtyDaysAgo },
                  },
                },
              },
            ],
          },
        },
        select: { id: true },
      });

      if (eligibleUsers.length > 0) {
        const userIds = eligibleUsers.map((u) => u.id);

        // Batch award SL points
        await this.prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { slPoints: { increment: SL_POINTS.HIGH_TRUST_30_DAYS } },
        });

        // Batch create audit log entries
        await this.prisma.auditLog.createMany({
          data: userIds.map((userId) => ({
            actorUserId: userId,
            action: 'SUSTAINED_HIGH_TRUST_REWARD',
            metadata: { pointsRewarded: SL_POINTS.HIGH_TRUST_30_DAYS },
          })),
        });

        this.logger.log(`✅ Rewarded ${eligibleUsers.length} user(s) for sustained high trust.`);
      } else {
        this.logger.debug('No eligible high trust users found.');
      }
    } catch (err) {
      this.logger.error('❌ Error during high trust reward:', err);
    }
  }
}

