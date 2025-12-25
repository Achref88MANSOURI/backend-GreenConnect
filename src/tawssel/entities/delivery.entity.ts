// Utilisez TypeORM pour la persistance des données
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Carrier } from './carrier.entity';
import { User } from '../../users/entities/user.entity';

@Entity('deliveries')
export class Delivery {
  @PrimaryGeneratedColumn()
  id: number;

  // --- Relation avec le Transporteur ---
  @ManyToOne(() => Carrier)
  @JoinColumn({ name: 'carrierId' })
  carrier: Carrier;

  @Column()
  carrierId: number;

  // --- Détails du Client ---
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

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