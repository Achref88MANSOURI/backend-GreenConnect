import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

export enum PurchaseRequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Entity('purchase_requests')
export class PurchaseRequest {
  @PrimaryGeneratedColumn()
  id: number;

  // The buyer who makes the request
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'buyerId' })
  buyer: User;

  @Column()
  buyerId: number;

  // The product being requested
  @ManyToOne(() => Product, { nullable: false })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  productId: number;

  // The owner/seller of the product
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'sellerId' })
  seller: User;

  @Column()
  sellerId: number;

  // Request details
  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  totalPrice: number;

  // Buyer's personal information for the request
  @Column()
  buyerName: string;

  @Column()
  buyerPhone: string;

  @Column({ nullable: true })
  buyerAddress: string;

  @Column({ type: 'text', nullable: true })
  buyerMessage: string;

  // Status
  @Column({
    type: 'simple-enum',
    enum: PurchaseRequestStatus,
    default: PurchaseRequestStatus.PENDING,
  })
  status: PurchaseRequestStatus;

  // Seller response
  @Column({ type: 'text', nullable: true })
  sellerResponse: string;

  // When accepted, the seller's phone becomes visible to buyer
  @Column({ nullable: true })
  sellerPhone: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
