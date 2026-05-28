import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';

function trimValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : value;
}

export class ResetPasswordDto {
  @IsString()
  @MinLength(20)
  @MaxLength(255)
  @Transform(({ value }) => trimValue(value))
  token!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  confirmPassword!: string;
}
