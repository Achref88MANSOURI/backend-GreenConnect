import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @Column()
  type: string; // RESERVATION_ACCEPTED, RESERVATION_REJECTED, NEW_RESERVATION, DELIVERY_STATUS

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ type: 'int', nullable: true })
  relatedId: number; // ID of related entity (delivery, carrier, etc.)

  @Column({ nullable: true })
  relatedType: string; // Type of related entity (delivery, carrier, etc.)

  @CreateDateColumn()
  createdAt: Date;
}
