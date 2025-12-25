import { Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany, Column, CreateDateColumn, RelationId } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @RelationId((order: Order) => order.user)
  userId: number;

  @OneToMany(() => OrderItem, item => item.order, { cascade: true })
  items: OrderItem[];

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  total: number;

  @Column({ default: 'paid' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
