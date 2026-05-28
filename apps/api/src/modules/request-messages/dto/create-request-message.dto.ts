import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

function trimValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : value;
}

export class CreateRequestMessageDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(1000)
  @Transform(({ value }) => trimValue(value))
  content!: string;
}
