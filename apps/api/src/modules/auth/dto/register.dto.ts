import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

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
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
    message: 'El nombre debe contener solo letras y espacios',
  })
  @Transform(({ value }) => trimValue(value))
  fullName!: string;

  @IsEmail({}, { message: 'El correo electrónico debe tener un formato válido' })
  @Transform(({ value }) => String(value).trim().toLowerCase())
  email!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(30)
  @Matches(/^\+?\d+$/, {
    message: 'El número de teléfono debe contener solo dígitos (opcionalmente con prefijo +)',
  })
  @Transform(({ value }) => trimValue(value))
  phone!: string;

  @ValidateIf((o) => o.accountType === RegisterAccountType.CLIENT)
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^\d+$/, {
    message: 'El número de documento debe contener solo dígitos',
  })
  @Transform(({ value }) => trimOptionalValue(value))
  documentNumber?: string;

  @ValidateIf((o) => o.accountType === RegisterAccountType.PROVIDER)
  @IsString()
  @MinLength(11)
  @MaxLength(11)
  @Matches(/^\d{11}$/, {
    message: 'El RUC debe consistir en exactamente 11 dígitos numéricos',
  })
  @Transform(({ value }) => trimValue(value))
  ruc?: string;

  @ValidateIf((o) => o.accountType === RegisterAccountType.PROVIDER)
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  @Transform(({ value }) => trimValue(value))
  businessName?: string;

  @ValidateIf((o) => o.accountType === RegisterAccountType.PROVIDER)
  @IsString()
  category?: string;

  @ValidateIf(
    (o) =>
      o.accountType === RegisterAccountType.PROVIDER &&
      o.category === 'otro-servicio',
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
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/, {
    message: 'La contraseña debe incluir al menos una mayúscula, una minúscula, un número y un carácter especial',
  })
  password!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  confirmPassword!: string;
}
