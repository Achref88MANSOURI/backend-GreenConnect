// Utilisez TypeORM pour la persistance des données
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('carriers')
export class Carrier {
  @PrimaryGeneratedColumn()
  id: number;

  // --- Authentification / Profil ---

  @Column({ unique: true })
  companyName: string;

  @Column()
  contactEmail: string;

  @Column({ nullable: true })
  contactPhone: string;

  // L'utilisateur lié à ce transporteur
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number; 

  // --- Fonctionnalités - Transporteurs ---

  // Type de véhicule et capacité
  @Column({ nullable: true })
  vehicleType: string; // Ex: 'Camion léger', 'Semi-remorque', 'Van'

  @Column({ type: 'int' })
  capacity_kg: number; // Capacité maximale en kilogrammes

  // Zones de service (Polygones géospatiaux)
  // Utiliser un format JSON ou un type géospatial si la base de données le supporte (ex: PostGIS)
  // Pour la simplicité, nous stockons une description ou un JSON simple.
  // Une entité séparée (CarrierZone) pourrait être meilleure pour les polygones complexes.
  @Column('json', { nullable: true })
  serviceZones: { name: string; coordinates: any }[];

  // Tarification
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  pricePerKm: number; // Tarif en TND/km

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pricePerTonne: number; // Tarif en TND/tonne (Optionnel, si applicable)

  // Disponibilité et horaires
  @Column('json')
  availability: {
    dayOfWeek: number; // 0=Dim, 1=Lun...
    startTime: string; // '08:00'
    endTime: string; // '17:00'
  }[];

  // --- Fonctionnalités - Évaluation ---

  // Système de notation
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 5.0 })
  averageRating: number;

  @Column({ type: 'int', default: 0 })
  totalReviews: number;

  // Statut du transporteur (Actif, Suspendu, En attente de validation)
  @Column({ default: 'Active' })
  status: string;
}