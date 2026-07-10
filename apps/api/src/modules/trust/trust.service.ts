import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

/** Trust event types and their point values per the report spec */
export const TRUST_EVENTS = {
  REQUEST_COMPLETED: {
    points: +8,
    reason: 'Solicitud completada exitosamente',
  },
  FAST_RESPONSE: {
    points: +3,
    reason: 'Respuesta al cliente en menos de 2 horas',
  },
  WEEKLY_ACTIVE: {
    points: +2,
    reason: 'Uso activo de la plataforma (semanal)',
  },
  CANCEL_NO_REASON: { points: -10, reason: 'Cancelación injustificada' },
  CANCEL_REPEATED: {
    points: -20,
    reason: 'Cancelación reiterada (3+ en 30 días)',
  },
  REQUEST_EXPIRED: {
    points: -8,
    reason: 'Solicitud expirada por falta de respuesta',
  },
  ADMIN_REPORT: { points: -15, reason: 'Reporte validado por administrador' },
  INACTIVITY: { points: -5, reason: 'Inactividad prolongada (más de 60 días)' },
} as const;

/** SL Points event values per the report spec */
export const SL_POINTS = {
  REQUEST_COMPLETED: 10,
  FIRST_MONTHLY_COMPLETION: 5,
  FAST_RESPONSE_1H: 3,
  WEEKLY_ACTIVE: 2,
  HIGH_TRUST_30_DAYS: 5,
} as const;

@Injectable()
export class TrustService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Record a trust event and update the user's trustScore.
   * Trust score is clamped between 0 and 100.
   */
  async recordTrustEvent(params: {
    userId: string;
    eventType: keyof typeof TRUST_EVENTS;
    requestId?: string;
    customReason?: string;
    customPoints?: number;
  }) {
    const eventDef = TRUST_EVENTS[params.eventType];
    const points = params.customPoints ?? eventDef.points;
    const reason = params.customReason ?? eventDef.reason;

    // Interactive transaction: read + write in the same TX to prevent race conditions
    // where two concurrent events read the same score and overwrite each other.
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: params.userId },
        select: { trustScore: true },
      });

      if (!user) return null;

      const newScore = Math.max(0, Math.min(100, user.trustScore + points));

      await tx.trustEvent.create({
        data: {
          userId: params.userId,
          eventType: params.eventType,
          points,
          reason,
          requestId: params.requestId ?? null,
        },
      });

      await tx.user.update({
        where: { id: params.userId },
        data: { trustScore: newScore },
      });

      return { previousScore: user.trustScore, newScore, points, reason };
    });
  }

  /**
   * Award SL points to a user.
   */
  async awardSlPoints(userId: string, points: number) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { slPoints: { increment: points } },
    });
  }

  /**
   * Handle trust + points logic when a request is completed.
   */
  async onRequestCompleted(
    requestId: string,
    clientUserId: string,
    providerUserId: string,
  ) {
    // +8 trust for both users
    await this.recordTrustEvent({
      userId: providerUserId,
      eventType: 'REQUEST_COMPLETED',
      requestId,
    });

    await this.recordTrustEvent({
      userId: clientUserId,
      eventType: 'REQUEST_COMPLETED',
      requestId,
    });

    // +10 SL points for both
    await this.awardSlPoints(providerUserId, SL_POINTS.REQUEST_COMPLETED);
    await this.awardSlPoints(clientUserId, SL_POINTS.REQUEST_COMPLETED);

    // Check if first completion this month for provider
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const completionsThisMonth = await this.prisma.trustEvent.count({
      where: {
        userId: providerUserId,
        eventType: 'REQUEST_COMPLETED',
        createdAt: { gte: firstDayOfMonth },
      },
    });

    if (completionsThisMonth === 1) {
      await this.awardSlPoints(
        providerUserId,
        SL_POINTS.FIRST_MONTHLY_COMPLETION,
      );
    }
  }

  /**
   * Handle trust logic when a request expires (provider didn't respond in 48h).
   */
  async onRequestExpired(requestId: string, providerUserId: string) {
    await this.recordTrustEvent({
      userId: providerUserId,
      eventType: 'REQUEST_EXPIRED',
      requestId,
    });
  }

  /**
   * Handle trust logic when a request is cancelled.
   * Checks for repeated cancellations in last 30 days.
   */
  async onRequestCancelled(
    requestId: string,
    cancelledByUserId: string,
    hasCancelReason: boolean,
  ) {
    if (!hasCancelReason) {
      await this.recordTrustEvent({
        userId: cancelledByUserId,
        eventType: 'CANCEL_NO_REASON',
        requestId,
      });
    }

    // Check for repeated cancellations (3+ in 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentCancellations = await this.prisma.trustEvent.count({
      where: {
        userId: cancelledByUserId,
        eventType: { in: ['CANCEL_NO_REASON', 'CANCEL_REPEATED'] },
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    if (recentCancellations >= 3) {
      await this.recordTrustEvent({
        userId: cancelledByUserId,
        eventType: 'CANCEL_REPEATED',
        requestId,
      });
    }
  }

  /**
   * Get trust summary for a user.
   */
  async getTrustSummary(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { trustScore: true, slPoints: true },
    });

    if (!user) return null;

    const levelLabel = this.getTrustLevel(user.trustScore);
    const levelColor = this.getTrustColor(user.trustScore);

    const recentEvents = await this.prisma.trustEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        eventType: true,
        points: true,
        reason: true,
        createdAt: true,
      },
    });

    return {
      score: user.trustScore,
      slPoints: user.slPoints,
      levelLabel,
      levelColor,
      recentEvents,
    };
  }

  /**
   * Get full list of trust events for a user (for rewards/history pages).
   */
  async getUserEvents(userId: string, take = 50) {
    const events = await this.prisma.trustEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take,
      select: {
        id: true,
        eventType: true,
        points: true,
        reason: true,
        createdAt: true,
        request: {
          select: {
            id: true,
            serviceTitle: true,
          },
        },
      },
    });

    return { total: events.length, items: events };
  }

  private getTrustLevel(score: number): string {
    if (score >= 90) return 'Destacado';
    if (score >= 70) return 'Confianza alta';
    if (score >= 50) return 'Confianza media';
    if (score >= 30) return 'Confianza baja';
    return 'Sin reputación suficiente';
  }

  private getTrustColor(score: number): string {
    if (score >= 90) return 'blue';
    if (score >= 70) return 'green';
    if (score >= 50) return 'yellow';
    if (score >= 30) return 'red';
    return 'gray';
  }
}
