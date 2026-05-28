import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ServiceRequestsService } from '../service-requests/service-requests.service';

/**
 * TasksService
 *
 * Runs background scheduled jobs for ServiLocal.
 * Currently manages:
 *   - Hourly expiration of PENDING service requests past their expiresAt date.
 */
@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly serviceRequestsService: ServiceRequestsService,
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
}
