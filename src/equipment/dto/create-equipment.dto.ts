// src/equipment/dto/create-equipment.dto.ts
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class CreateEquipmentDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  category: string;

  @IsNotEmpty()
  @IsNumber()
  pricePerDay: number;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsOptional()
  @IsBoolean()
  availability?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
