import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, order => order.items, { nullable: false })
  order: Order;

  @ManyToOne(() => Product, { nullable: false })
  product: Product;

  @Column('int')
  quantity: number;

  @Column('decimal', { precision: 12, scale: 2 })
  unitPrice: number;
}
