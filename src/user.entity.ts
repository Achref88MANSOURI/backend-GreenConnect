// src/users/user.entity.ts

import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Product } from './products/entities/product.entity';

@Entity('users') // This maps the class to a table named 'users' in PostgreSQL
export class User {
  @PrimaryGeneratedColumn()
  id: number; // The unique primary key (auto-incrementing)

  @Column({ length: 500 })
  firstName: string; // A text column for the first name

  @Column({ length: 500 })
  lastName: string; // A text column for the last name

  @Column({ default: true })
  isActive: boolean; // A boolean column

  @OneToMany(() => Product, product => product.farmer)
  products: Product[];
}