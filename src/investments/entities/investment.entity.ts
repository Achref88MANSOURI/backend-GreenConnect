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
  category: string; // 'Wheat', 'Olives', 'Dates', etc.

  @Column({ nullable: true })
  location: string;

  // Land rental fields (mapped to old columns for compatibility)
  @Column('decimal', { precision: 12, scale: 2 })
  targetAmount: number; // Mapped from: areaHectares (using targetAmount column)

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  currentAmount: number; // Mapped from: leasePrice (using currentAmount column)

  @Column('decimal', { precision: 12, scale: 2 })
  minimumInvestment: number; // Mapped from: minSeasonMonths

  @Column('decimal', { precision: 5, scale: 2 })
  expectedROI: number; // Mapped from: maxSeasonMonths (stored as percentage)

  @Column({ type: 'int', default: 12 })
  duration: number; // Minimum lease duration in months

  @Column({ type: 'date', nullable: true })
  availableFrom: Date; // Mapped from: availableFrom

  @Column({ type: 'date', nullable: true })
  fundingDeadline: Date; // Mapped from: availableUntil

  // Project owner (land owner/farmer)
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column()
  ownerId: number;

  // Status: available, reserved, leased, completed
  @Column({ default: 'available' }) // available, reserved, leased, completed
  status: string;

  // Media
  @Column('simple-array', { nullable: true })
  images: string[];

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

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
  investor: User; // Investor (in original) or Farmer renting (in new model)

  @Column()
  investorId: number;

  // Amount invested (in original) or rent total (in new model)
  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  // Returns received (in original) or amount paid (in new model)
  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  returnsReceived: number;

  @Column({ default: 'ACTIVE' }) // ACTIVE, WITHDRAWN, COMPLETED
  status: string;

  @CreateDateColumn()
  investedAt: Date; // When the lease request was made

  @Column({ nullable: true })
  notes: string;
}


