import { Module } from '@nestjs/common';
import { ServiceRequestsModule } from '../service-requests/service-requests.module';
import { TasksService } from './tasks.service';

@Module({
  imports: [ServiceRequestsModule],
  providers: [TasksService],
})
export class TasksModule {}
