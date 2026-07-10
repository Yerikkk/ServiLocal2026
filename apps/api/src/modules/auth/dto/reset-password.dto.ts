import { Transform } from 'class-transformer';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

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
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/, {
    message: 'La contraseña debe incluir mayúsculas, minúsculas, números y un carácter especial',
  })
  password!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  confirmPassword!: string;
}
