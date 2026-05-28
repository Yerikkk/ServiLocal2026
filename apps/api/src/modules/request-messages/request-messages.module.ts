import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { RequestMessagesController } from './request-messages.controller';
import { RequestMessagesService } from './request-messages.service';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [RequestMessagesController],
  providers: [RequestMessagesService],
})
export class RequestMessagesModule {}
