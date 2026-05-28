import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

function trimValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : value;
}

export class CreateServiceRequestDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => trimValue(value))
  providerId!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(120)
  @Transform(({ value }) => trimValue(value))
  serviceTitle!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(600)
  @Transform(({ value }) => trimValue(value))
  message!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  @Transform(({ value }) => trimValue(value))
  serviceZone!: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => trimValue(value))
  preferredDate?: string;
}
