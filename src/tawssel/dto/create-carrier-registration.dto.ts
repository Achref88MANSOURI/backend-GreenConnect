import { IsString, IsEmail, IsInt, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ServiceZoneDto {
  @IsString()
  name: string;

  @IsOptional()
  coordinates: any;
}

class AvailabilityDto {
  @IsInt()
  dayOfWeek: number;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;
}

export class CreateCarrierRegistrationDto {
  @IsString()
  companyName: string;

  @IsEmail()
  contactEmail: string;

  @IsString()
  contactPhone: string;

  @IsString()
  vehicleType: string;

  @IsInt()
  capacity_kg: number;

  @IsNumber()
  pricePerKm: number;

  @IsOptional()
  @IsNumber()
  pricePerTonne?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceZoneDto)
  serviceZones: ServiceZoneDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilityDto)
  availability: AvailabilityDto[];
}
