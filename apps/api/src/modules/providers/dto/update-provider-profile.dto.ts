import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { ServiceCategory } from '@prisma/client';

function trimValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : value;
}

function trimOptionalValue(value: unknown) {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export class UpdateProviderProfileDto {
  @IsString()
  @MinLength(11)
  @MaxLength(11)
  @Transform(({ value }) => trimValue(value))
  ruc!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(150)
  @Transform(({ value }) => trimValue(value))
  businessName!: string;

  @IsEnum(ServiceCategory)
  category!: ServiceCategory;

  @ValidateIf((o) => o.category === ServiceCategory.OTHER)
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  @Transform(({ value }) => trimValue(value))
  customServiceName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  @Transform(({ value }) => trimOptionalValue(value))
  specialty?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  @Transform(({ value }) => trimValue(value))
  serviceZone!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(300)
  @Transform(({ value }) => trimValue(value))
  description!: string;
}
