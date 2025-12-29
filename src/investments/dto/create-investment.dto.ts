import { IsNumber, IsOptional, IsString, Min, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInvestmentDto {
  @Type(() => Number)
  @IsNumber()
  projectId: number;

  // For land rental: this becomes the lease request
  @IsDateString()
  seasonStartDate: string; // When the renter wants to start farming

  @IsOptional()
  @IsDateString()
  seasonEndDate?: string; // When the renter wants to finish and return the land

  @IsOptional()
  @IsNumber()
  @Min(1)
  customDurationMonths?: number; // If they specify duration instead of end date

  @IsOptional()
  @IsString()
  farmingPlan?: string; // What they plan to grow/do on the land

  @IsOptional()
  @IsString()
  notes?: string;
}
