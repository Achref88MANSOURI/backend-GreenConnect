/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('investment_projects')
export class InvestmentProject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ nullable: true })
  category: string; // 'Olives & Trees', 'Greenhouse', 'Cold Storage', 'Renewables', etc.

  @Column({ nullable: true })
  location: string;

  // Financial details (aligned with frontend naming)
  @Column('decimal', { precision: 12, scale: 2 })
  targetAmount: number; // Total funding goal

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  currentAmount: number; // Current amount raised

  @Column('decimal', { precision: 12, scale: 2 })
  minimumInvestment: number; // Minimum investment amount

  @Column('decimal', { precision: 5, scale: 2 })
  expectedROI: number; // Expected return on investment (percentage)

  @Column({ type: 'int', default: 12 })
  duration: number; // Duration in months

  // Project owner (farmer/entrepreneur)
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column()
  ownerId: number;

  // Status
  @Column({ default: 'active' }) // active, funded, closed
  status: string;

  // Media
  @Column('simple-array', { nullable: true })
  images: string[]; // image URLs

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'date', nullable: true })
  fundingDeadline: Date;

  // Relations
  @OneToMany(() => Investment, investment => investment.project)
  investments: Investment[];
}

@Entity('investments')
export class Investment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => InvestmentProject, project => project.investments, { nullable: false })
  @JoinColumn({ name: 'projectId' })
  project: InvestmentProject;

  @Column()
  projectId: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'investorId' })
  investor: User;

  @Column()
  investorId: number;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column({ default: 'ACTIVE' }) // ACTIVE, WITHDRAWN, COMPLETED
  status: string;

  @CreateDateColumn()
  investedAt: Date;

  // Returns tracking
  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  returnsReceived: number;

  @Column({ nullable: true })
  notes: string;
}
