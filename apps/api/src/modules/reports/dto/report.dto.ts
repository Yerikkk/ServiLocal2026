import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export enum ReportReasonEnum {
  INAPPROPRIATE_CONTENT = 'INAPPROPRIATE_CONTENT',
  FRAUD = 'FRAUD',
  SPAM = 'SPAM',
  HARASSMENT = 'HARASSMENT',
  FAKE_PROFILE = 'FAKE_PROFILE',
  SERVICE_NOT_PROVIDED = 'SERVICE_NOT_PROVIDED',
  OTHER = 'OTHER',
}

export class CreateReportDto {
  @IsString()
  reportedUserId: string;

  @IsOptional()
  @IsString()
  requestId?: string;

  @IsEnum(ReportReasonEnum)
  reason: ReportReasonEnum;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  description?: string;
}

export class ReviewReportDto {
  @IsEnum(['REVIEWED', 'DISMISSED'])
  action: 'REVIEWED' | 'DISMISSED';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
