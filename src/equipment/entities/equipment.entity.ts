/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, RelationId } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Booking } from '../../booking/entities/booking.entity';

@Entity()
export class Equipment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true })
  type?: string;

  @Column()
  category: string;

  @Column('decimal', { precision: 10, scale: 2 })
  pricePerDay: number;

  @Column()
  location: string;

  @Column({ default: true })
  availability: boolean;

  @Column('simple-array', { nullable: true })
  images?: string[];

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.equipments, { onDelete: 'CASCADE' })
  owner: User;

  @RelationId((equipment: Equipment) => equipment.owner)
  ownerId: number;
  
  @OneToMany(() => Booking, (b) => b.equipment)
  bookings: Booking[];
}
