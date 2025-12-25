import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn, RelationId } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column('decimal')
  price: number;

  @Column({ nullable: true })
  imageUrl: string;
  
   @Column({ nullable: true })
  vendeur: string;
 
  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  phoneNumber: string;

  // Advanced marketplace fields per specification
  @Column({ type: 'date', nullable: true })
  harvestDate?: Date;

  @Column({ type: 'int', nullable: true })
  qualityScore?: number; // 0-100

  @Column('simple-array', { nullable: true })
  certifications?: string[]; // e.g., Bio, GlobalGAP

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'farmerId' })
  farmer: User;

  // Expose the foreign key directly without duplicating the column definition
  @RelationId((product: Product) => product.farmer)
  farmerId: number;

  @CreateDateColumn()
  createdAt: Date;
}
