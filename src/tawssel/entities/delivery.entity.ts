// Utilisez TypeORM pour la persistance des données
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Carrier } from './carrier.entity';

@Entity('deliveries')
export class Delivery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // --- Relation avec le Transporteur ---
  // @ManyToOne permet de lier cette livraison à un seul transporteur
  @ManyToOne(() => Carrier)
  @JoinColumn({ name: 'carrierId' })
  carrier: Carrier;

  @Column()
  carrierId: string; // Clé étrangère

  // --- Détails du Client et Marchandise ---
  @Column()
  userId: string; // Le client qui a fait la réservation

  @Column()
  goodsType: string; // Type de marchandise (pour la suggestion/tarification)

  @Column({ type: 'int' })
  weight_kg: number; // Poids de la marchandise

  // --- Détails du Trajet ---
  @Column()
  pickupAddress: string;

  @Column()
  deliveryAddress: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  distance_km: number; // Calculé pour la tarification

  @Column()
  desiredDeliveryDate: Date; // Délai souhaité

  // --- Coût et Statut ---
  
  // Calcul automatique du coût
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  carrierRating: number; // Note donnée par l'utilisateur après livraison

  // Suivi en temps réel des livraisons (Page 28)
  @Column({ default: 'PENDING' })
  status: string; // Ex: PENDING, IN_TRANSIT, DELIVERED, CANCELED

  // Mises à jour du suivi (coordonnées GPS ou messages)
  @Column('simple-json', { nullable: true })
  trackingUpdates: { timestamp: Date; location: string; message: string }[];
}