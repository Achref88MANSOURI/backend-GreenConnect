/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { IsString, IsNumber, IsOptional, Min, IsDateString, IsArray } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsNumber()
  @Min(0)
  targetAmount: number;

  @IsNumber()
  @Min(0)
  minimumInvestment: number;

  @IsNumber()
  @Min(0)
  expectedROI: number;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsDateString()
  fundingDeadline?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
