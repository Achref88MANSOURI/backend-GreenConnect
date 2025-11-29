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

  @ManyToOne(() => User)
  @JoinColumn({ name: 'farmerId' })
  farmer: User;

  // Expose the foreign key directly without duplicating the column definition
  @RelationId((product: Product) => product.farmer)
  farmerId: number;

  @CreateDateColumn()
  createdAt: Date;
}
