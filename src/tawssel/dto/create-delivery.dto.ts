import { IsInt, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateDeliveryDto {
  // --- Informations du Demandeur ---

  // L'ID du client qui fait la réservation (renseigné côté serveur)
  @IsOptional()
  @IsInt()
  userId?: number;

  // --- Détails de la Marchandise et Trajet ---

  // Type de marchandise (pour la suggestion de transporteurs)
  @IsString()
  goodsType: string;

  // Poids total en kilogrammes (pour la tarification et la capacité)
  @IsNumber()
  weight_kg: number;

  // Adresse de collecte
  @IsString()
  pickupAddress: string;

  // Adresse de livraison
  @IsString()
  deliveryAddress: string;

  // Date et heure de livraison souhaitée
  @IsString()
  desiredDeliveryDate: string;

  // --- Choix du Transporteur ---
  // L'ID du transporteur choisi par le client après la suggestion.
  @IsOptional()
  @IsInt()
  carrierId?: number;

  // Le coût final calculé est souvent généré par le service, mais une estimation peut être incluse.
}