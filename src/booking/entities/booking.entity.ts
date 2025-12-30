/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, RelationId } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Equipment } from '../../equipment/entities/equipment.entity';

export enum BookingStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELED = 'canceled',
}

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({
    type: 'simple-enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @ManyToOne(() => User, (user) => user.bookings)
  user: User;

  @RelationId((booking: Booking) => booking.user)
  userId: number;

  @ManyToOne(() => Equipment, (eq) => eq.bookings, { onDelete: 'CASCADE' })
  equipment: Equipment;
}
