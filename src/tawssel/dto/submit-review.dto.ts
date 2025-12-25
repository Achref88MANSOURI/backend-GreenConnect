import { IsInt, IsNumber, Min, Max, IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class SubmitReviewDto {
  // --- Identifiants ---

  @IsNotEmpty()
  @IsInt()
  deliveryId: number;

  @IsNotEmpty()
  @IsInt()
  reviewerId: number;

  // --- Contenu de l'Évaluation ---

  // NOTE: Utilisation de @Type pour s'assurer que le body JSON (qui lit la note comme string par défaut)
  // est bien transformé en nombre avant la validation IsInt/Min/Max.
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;
}