/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Booking } from 'src/booking/entities/booking.entity';

@Entity()
export class Equipment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  type?: string;

  @Column()
  pricePerDay: number;

  @ManyToOne(() => User, (user) => user.equipments, { onDelete: 'CASCADE' })
  owner: User;
  @OneToMany(() => Booking, (b) => b.equipment)
  bookings: Booking[];

}
