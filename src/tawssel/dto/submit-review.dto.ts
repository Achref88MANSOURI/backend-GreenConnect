import { IsUUID, IsNumber, Min, Max, IsOptional, IsString, IsInt, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class SubmitReviewDto {
  // --- Identifiants ---

  @IsNotEmpty() // Assurez-vous que l'ID de la livraison est requis
  @IsUUID()
  deliveryId: string;

  @IsNotEmpty() // Assurez-vous que l'ID de l'évaluateur est requis
  @IsUUID()
  reviewerId: string;

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