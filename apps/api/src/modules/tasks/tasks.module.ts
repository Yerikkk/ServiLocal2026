import { Module } from '@nestjs/common';
import { ServiceRequestsModule } from '../service-requests/service-requests.module';
import { TrustModule } from '../trust/trust.module';
import { TasksService } from './tasks.service';

@Module({
  imports: [ServiceRequestsModule, TrustModule],
  providers: [TasksService],
})
export class TasksModule {}
