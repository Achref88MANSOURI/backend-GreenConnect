import { IsUUID, IsNumber, Min, Max, IsOptional, IsString } from 'class-validator';

export class SubmitReviewDto {
  // --- Identifiants ---

  // L'ID de la livraison qui est évaluée. C'est la clé de liaison.
  @IsUUID()
  deliveryId: string;

  // L'ID de l'utilisateur qui soumet l'évaluation (pour la sécurité).
  @IsUUID()
  reviewerId: string;

  // --- Contenu de l'Évaluation ---

  // Note donnée au transporteur (sur une échelle de 1 à 5, par exemple).
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  // Commentaire facultatif sur le service du transporteur.
  @IsOptional()
  @IsString()
  comment?: string;
}