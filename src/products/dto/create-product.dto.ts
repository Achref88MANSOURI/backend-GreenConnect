import { IsNotEmpty, IsNumber, IsOptional, IsString, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;

  @Type(() => Number)
  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  vendeur?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9\s-]{7,15}$/)
  phoneNumber?: string;
}
