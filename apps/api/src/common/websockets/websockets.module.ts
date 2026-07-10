import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { AuthModule } from '../../modules/auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [NotificationsGateway],
  exports: [NotificationsGateway],
})
export class WebsocketsModule {}
