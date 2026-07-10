import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ServiceRequestStatus } from '@prisma/client';

export class UpdateServiceRequestStatusDto {
  @IsEnum(ServiceRequestStatus)
  status!: ServiceRequestStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  cancelReason?: string;
}
