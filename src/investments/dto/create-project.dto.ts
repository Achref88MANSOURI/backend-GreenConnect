/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { IsString, IsNumber, IsOptional, Min, IsDateString, IsArray, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

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

  // Land rental fields
  @IsNumber()
  @Min(0.1)
  @Transform(({ value }) => {
    if (typeof value === 'string') return parseFloat(value);
    return value;
  })
  areaHectares: number;

  @IsNumber()
  @Min(0)
  @Transform(({ value }) => {
    if (typeof value === 'string') return parseFloat(value);
    return value;
  })
  leasePrice: number; // Price per month/season in TND

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => {
    if (value === '' || value === null) return undefined;
    if (typeof value === 'string') return parseFloat(value);
    return value;
  })
  leaseCommissionPercentage?: number; // Percentage commission for platform (0-5%)

  @IsOptional()
  @IsString()
  soilType?: string; // Type of soil (fertile, sandy, clay, etc.)

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  hasWaterAccess?: boolean; // Is there water access/irrigation?

  @IsOptional()
  @IsString()
  cropType?: string; // Suitable crops (wheat, barley, dates, olives, etc.)

  // Season/Availability
  @IsDateString()
  @Transform(({ value }) => {
    if (!value) return value;
    // Ensure we have a valid ISO date string
    if (typeof value === 'string' && value.length === 10) {
      // Format is YYYY-MM-DD, convert to ISO with time
      return `${value}T00:00:00Z`;
    }
    return value;
  })
  availableFrom: string; // When the land is available for lease

  @IsDateString()
  @Transform(({ value }) => {
    if (!value) return value;
    // Ensure we have a valid ISO date string
    if (typeof value === 'string' && value.length === 10) {
      // Format is YYYY-MM-DD, convert to ISO with time
      return `${value}T00:00:00Z`;
    }
    return value;
  })
  availableUntil: string; // When the lease must be completed

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => {
    if (value === '' || value === null) return undefined;
    if (typeof value === 'string') return parseInt(value);
    return value;
  })
  minSeasonMonths?: number; // Minimum lease duration in months

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => {
    if (value === '' || value === null) return undefined;
    if (typeof value === 'string') return parseInt(value);
    return value;
  })
  maxSeasonMonths?: number; // Maximum lease duration in months

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
