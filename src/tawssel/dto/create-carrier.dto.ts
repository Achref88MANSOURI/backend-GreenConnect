import { IsString, IsEmail, IsUUID, IsInt, IsNumber, IsOptional, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

class ServiceZoneDto {
  @IsString()
  name: string;

  // coordinates can be complex (GeoJSON). We validate presence as string/object.
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

export class CreateCarrierDto {
  // --- Profil de l'entreprise ---
  @IsString()
  companyName: string;

  @IsEmail()
  contactEmail: string;

  @IsInt()
  userId: number;

  // --- Caractéristiques du Véhicule ---
  @IsString()
  vehicleType: string;

  @IsInt()
  capacity_kg: number;

  // --- Tarification ---
  @IsNumber()
  pricePerKm: number;

  @IsOptional()
  @IsNumber()
  pricePerTonne?: number;

  // --- Zones de Service ---
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceZoneDto)
  serviceZones: ServiceZoneDto[];

  // --- Disponibilité et Horaires ---
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilityDto)
  availability: AvailabilityDto[];
}