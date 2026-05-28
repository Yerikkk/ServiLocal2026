import { IsDecimal, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  categoryId!: string;

  @IsString()
  @MinLength(3)
  name!: string;

  @IsString()
  @MinLength(10)
  description!: string;

  @IsOptional()
  @IsString()
  referencePrice?: string;

  @IsOptional()
  @IsString()
  estimatedTime?: string;
}

export class UpdateServiceDto {
  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @IsOptional()
  @IsString()
  referencePrice?: string;

  @IsOptional()
  @IsString()
  estimatedTime?: string;

  @IsOptional()
  isActive?: boolean;
}
