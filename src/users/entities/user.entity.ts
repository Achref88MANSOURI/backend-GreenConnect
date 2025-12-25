/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Equipment } from '../../equipment/entities/equipment.entity';
import { Booking } from '../../booking/entities/booking.entity';
import { Notification } from './notification.entity';

// Simplified single role; keep enum for compatibility with existing frontend references
export enum UserRole {
  USER = 'user',
  FARMER = 'farmer',
  BUYER = 'buyer',
  CARRIER = 'carrier',
  INVESTOR = 'investor',
  ADMIN = 'admin',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ type: 'simple-json', nullable: true })
  settings: any;

  @Column({ default: true })
  isActive: boolean;

  @Column({
    type: 'simple-enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  // Multi-role support per specification (RBAC with multiple profiles)
  @Column({ type: 'simple-array', nullable: true })
  roles?: string[];

  @OneToMany(() => Equipment, (equipment) => equipment.owner)
  equipments: Equipment[];

  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Booking[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];
}
