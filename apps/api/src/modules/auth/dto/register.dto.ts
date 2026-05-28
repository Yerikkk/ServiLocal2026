import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { ServiceCategory } from '@prisma/client';

export enum RegisterAccountType {
  CLIENT = 'CLIENT',
  PROVIDER = 'PROVIDER',
}

function trimValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : value;
}

function trimOptionalValue(value: unknown) {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export class RegisterDto {
  @IsEnum(RegisterAccountType)
  accountType!: RegisterAccountType;

  @IsString()
  @MinLength(3)
  @MaxLength(120)
  @Transform(({ value }) => trimValue(value))
  fullName!: string;

  @IsEmail()
  @Transform(({ value }) => String(value).trim().toLowerCase())
  email!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(30)
  @Transform(({ value }) => trimValue(value))
  phone!: string;

  @ValidateIf((o) => o.accountType === RegisterAccountType.CLIENT)
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Transform(({ value }) => trimOptionalValue(value))
  documentNumber?: string;

  @ValidateIf((o) => o.accountType === RegisterAccountType.PROVIDER)
  @IsString()
  @MinLength(11)
  @MaxLength(11)
  @Transform(({ value }) => trimValue(value))
  ruc?: string;

  @ValidateIf((o) => o.accountType === RegisterAccountType.PROVIDER)
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  @Transform(({ value }) => trimValue(value))
  businessName?: string;

  @ValidateIf((o) => o.accountType === RegisterAccountType.PROVIDER)
  @IsEnum(ServiceCategory)
  category?: ServiceCategory;

  @ValidateIf(
    (o) =>
      o.accountType === RegisterAccountType.PROVIDER &&
      o.category === ServiceCategory.OTHER,
  )
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  @Transform(({ value }) => trimValue(value))
  customServiceName?: string;

  @ValidateIf((o) => o.accountType === RegisterAccountType.PROVIDER)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  @Transform(({ value }) => trimOptionalValue(value))
  specialty?: string;

  @ValidateIf((o) => o.accountType === RegisterAccountType.PROVIDER)
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  @Transform(({ value }) => trimValue(value))
  serviceZone?: string;

  @ValidateIf((o) => o.accountType === RegisterAccountType.PROVIDER)
  @IsString()
  @MinLength(10)
  @MaxLength(300)
  @Transform(({ value }) => trimValue(value))
  description?: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  confirmPassword!: string;
}
