import { plainToInstance } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

export class EnvValidation {
  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsString()
  @IsOptional()
  REDIS_URL?: string;

  @IsString()
  @IsOptional()
  MAIL_HOST?: string;

  @IsOptional()
  MAIL_PORT?: string;

  @IsString()
  @IsOptional()
  MAIL_FROM?: string;

  @IsString()
  @IsNotEmpty()
  APP_WEB_URL!: string;

  @IsString()
  @IsNotEmpty()
  API_URL!: string;

  @IsString()
  @IsNotEmpty()
  AUTH_ACCESS_SECRET!: string;

  @IsNumberString()
  AUTH_ACCESS_TTL_SECONDS!: string;

  @IsNumberString()
  AUTH_REFRESH_TTL_DAYS!: string;

  @IsNumberString()
  PASSWORD_RESET_TTL_MINUTES!: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvValidation, config, {
    enableImplicitConversion: false,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return config;
}
