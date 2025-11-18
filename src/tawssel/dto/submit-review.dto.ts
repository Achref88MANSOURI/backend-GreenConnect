import { IsUUID, IsNumber, Min, Max, IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class SubmitReviewDto {
  // L'ID de la livraison qui est évaluée.
  @IsUUID()
  deliveryId: string;

  // Note donnée au transporteur (1-5).
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  // Commentaire optionnel.
  @IsOptional()
  @IsString()
  comment?: string;
}