/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { InvestmentProject, Investment } from './entities/investment.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateInvestmentDto } from './dto/create-investment.dto';

@Injectable()
export class InvestmentsService {
  constructor(
    @InjectRepository(InvestmentProject)
    private readonly projectRepo: Repository<InvestmentProject>,
    @InjectRepository(Investment)
    private readonly investmentRepo: Repository<Investment>,
  ) {}

  // ========== LAND LISTING MANAGEMENT ==========

  private buildAbsoluteUrls(paths?: string[]): string[] {
    if (!paths || paths.length === 0) return [];
    const base = process.env.BASE_URL || 'http://localhost:5000';
    return paths.map(p => (p?.startsWith('http') ? p : `${base}${p}`));
  }

  /**
   * Create a new land listing with image uploads
   * Maps land rental fields to old crowdfunding columns for database compatibility
   */
  async createProject(dto: CreateProjectDto, ownerId: number, files?: Express.Multer.File[]): Promise<InvestmentProject> {
    let imageUrls: string[] = [];
    
    // Save uploaded files
    if (files && files.length > 0) {
      const uploadsDir = path.join(process.cwd(), 'uploads', 'investments');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      imageUrls = files.map(file => {
        const ext = path.extname(file.originalname || '').toLowerCase() || '.png';
        const safeName = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
        const filepath = path.join(uploadsDir, safeName);
        // Read from buffer (memory storage) or path (disk storage)
        const filePath = (file as unknown as { path?: string }).path;
        let dataBuf: Buffer | undefined;
        if (file.buffer && Buffer.isBuffer(file.buffer)) {
          dataBuf = file.buffer;
        } else if (filePath) {
          dataBuf = fs.readFileSync(filePath);
        }
        if (!dataBuf) {
          throw new BadRequestException('Failed to process uploaded image file');
        }
        fs.writeFileSync(filepath, dataBuf);
        return `/uploads/investments/${safeName}`;
      });
    }

    const project = this.projectRepo.create({
      title: dto.title,
      description: dto.description,
      category: dto.category,
      location: dto.location,
      targetAmount: dto.areaHectares,
      currentAmount: dto.leasePrice,
      minimumInvestment: dto.minSeasonMonths || 1,
      expectedROI: dto.maxSeasonMonths || 12,
      duration: dto.minSeasonMonths || 12,
      availableFrom: new Date(dto.availableFrom),
      fundingDeadline: new Date(dto.availableUntil),
      images: imageUrls.length > 0 ? imageUrls : [],
      ownerId,
      status: 'available',
    });
    const saved = await this.projectRepo.save(project);
    // Return with absolute image URLs for frontend consumption
    return { ...saved, images: this.buildAbsoluteUrls(saved.images || []) } as InvestmentProject;
  }

  /**
   * Get all land listings with optional filters (public exploration - only available lands by default)
   */
  async findAllProjects(filters?: {
    status?: string;
    category?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
  }): Promise<InvestmentProject[]> {
    let query = this.projectRepo.createQueryBuilder('project')
      .leftJoinAndSelect('project.owner', 'owner')
      .leftJoinAndSelect('project.investments', 'investments');

    // Filter to only available lands by default (public exploration shows available lands)
    const status = filters?.status || 'available';
    query = query.where('project.status = :status', { status });

    // Override if explicit status filter requested
    if (filters?.status) {
      query = query.andWhere('project.status = :status', { status: filters.status });
    }

    if (filters?.category) {
      query = query.andWhere('project.category = :category', { category: filters.category });
    }

    if (filters?.location) {
      query = query.andWhere('project.location LIKE :location', { location: `%${filters.location}%` });
    }

    if (filters?.minPrice) {
      query = query.andWhere('project.currentAmount >= :minPrice', { minPrice: filters.minPrice });
    }

    if (filters?.maxPrice) {
      query = query.andWhere('project.currentAmount <= :maxPrice', { maxPrice: filters.maxPrice });
    }

    if (filters?.minArea) {
      query = query.andWhere('project.targetAmount >= :minArea', { minArea: filters.minArea });
    }

    if (filters?.maxArea) {
      query = query.andWhere('project.targetAmount <= :maxArea', { maxArea: filters.maxArea });
    }

    query = query.orderBy('project.createdAt', 'DESC');

    const projects = await query.getMany();
    return projects.map(p => ({ ...p, images: this.buildAbsoluteUrls(p.images) })) as InvestmentProject[];
  }

  /**
   * Get a specific land listing by ID
   */
  async findProjectById(id: number): Promise<InvestmentProject> {
    const project = await this.projectRepo.findOne({
      where: { id },
      relations: ['owner', 'investments'],
    });

    if (!project) {
      throw new NotFoundException(`Project with id ${id} not found`);
    }

    return { ...project, images: this.buildAbsoluteUrls(project.images) } as InvestmentProject;
  }

  /**
   * Update a land listing
   */
  async updateProject(id: number, dto: UpdateProjectDto, userId: number, files?: Express.Multer.File[]): Promise<InvestmentProject> {
    const project = await this.findProjectById(id);

    if (project.ownerId !== userId) {
      throw new BadRequestException('You can only update your own listings');
    }

    // Handle image uploads
    let imageUrls: string[] = [];
    
    if (files && files.length > 0) {
      const uploadsDir = path.join(process.cwd(), 'uploads', 'investments');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      imageUrls = files.map(file => {
        const ext = path.extname(file.originalname || '').toLowerCase() || '.png';
        const safeName = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
        const filepath = path.join(uploadsDir, safeName);
        const filePath = (file as unknown as { path?: string }).path;
        let dataBuf: Buffer | undefined;
        if (file.buffer && Buffer.isBuffer(file.buffer)) {
          dataBuf = file.buffer;
        } else if (filePath) {
          dataBuf = fs.readFileSync(filePath);
        }
        if (dataBuf) {
          fs.writeFileSync(filepath, dataBuf);
        }
        return `/uploads/investments/${safeName}`;
      });
    }

    const updated = Object.assign(project, {
      title: dto.title ?? project.title,
      description: dto.description ?? project.description,
      category: dto.category ?? project.category,
      location: dto.location ?? project.location,
      targetAmount: dto.areaHectares ?? project.targetAmount,
      currentAmount: dto.leasePrice ?? project.currentAmount,
      minimumInvestment: dto.minSeasonMonths ?? project.minimumInvestment,
      expectedROI: dto.maxSeasonMonths ?? project.expectedROI,
      availableFrom: dto.availableFrom ?? project.availableFrom,
      fundingDeadline: dto.availableUntil ?? project.fundingDeadline,
      status: dto.status ?? project.status,
      images: imageUrls.length > 0 ? imageUrls : project.images,
    });

    const result = await this.projectRepo.save(updated);
    return { ...result, images: this.buildAbsoluteUrls(result.images || []) } as InvestmentProject;
  }

  /**
   * Delete a land listing
   */
  async deleteProject(id: number, userId: number): Promise<void> {
    const project = await this.findProjectById(id);

    if (project.ownerId !== userId) {
      throw new BadRequestException('You can only delete your own listings');
    }

    await this.projectRepo.delete(id);
  }

  /**
   * Get listings owned by a user
   */
  async getMyListings(userId: number): Promise<InvestmentProject[]> {
    const listings = await this.projectRepo.find({
      where: { ownerId: userId },
      relations: ['investments', 'investments.investor'],
      order: { createdAt: 'DESC' },
    });
    return listings.map(p => ({ ...p, images: this.buildAbsoluteUrls(p.images) })) as InvestmentProject[];
  }

  // ========== LEASE REQUEST MANAGEMENT ==========

  /**
   * Create a new lease request
   */
  async createLeaseRequest(dto: CreateInvestmentDto, renterId: number): Promise<Investment> {
    const project = await this.findProjectById(dto.projectId);

    if (project.ownerId === renterId) {
      throw new BadRequestException('You cannot rent your own land');
    }

    // Land must be available to accept a lease request
    if (project.status !== 'available') {
      throw new BadRequestException('This land is not available for rent');
    }

    const durationMonths = dto.customDurationMonths || project.duration;
    const leasePrice = project.currentAmount;
    const rentTotal = leasePrice * durationMonths;

    if (durationMonths < project.minimumInvestment) {
      throw new BadRequestException(
        `Minimum rental duration is ${project.minimumInvestment} months`,
      );
    }
    if (durationMonths > project.expectedROI) {
      throw new BadRequestException(
        `Maximum rental duration is ${project.expectedROI} months`,
      );
    }

    const investment = this.investmentRepo.create({
      projectId: dto.projectId,
      investorId: renterId,
      amount: rentTotal,
      returnsReceived: 0,
      status: 'ACTIVE', // pending approval by owner
      notes: dto.customDurationMonths ? `${durationMonths} months` : undefined,
    });

    // Mark project as reserved while a request is pending
    project.status = 'reserved';
    await this.projectRepo.save(project);

    return this.investmentRepo.save(investment);
  }

  /**
   * Get all lease requests for a specific land
   */
  async getListingLeaseRequests(projectId: number, userId: number): Promise<Investment[]> {
    const project = await this.findProjectById(projectId);

    if (project.ownerId !== userId) {
      throw new BadRequestException('You can only view lease requests for your own lands');
    }

    return this.investmentRepo.find({
      where: { projectId },
      relations: ['investor'],
      order: { investedAt: 'DESC' },
    });
  }

  /**
   * Get my lease requests (as a renter)
   */
  async getMyLeaseRequests(userId: number): Promise<Investment[]> {
    return this.investmentRepo
      .createQueryBuilder('investment')
      .leftJoinAndSelect('investment.project', 'project')
      .leftJoinAndSelect('project.owner', 'owner')
      .where('investment.investorId = :userId', { userId })
      .orderBy('investment.investedAt', 'DESC')
      .getMany();
  }

  /**
   * Get my investments/locations (lands I've rented from other farmers)
   */
  async getMyInvestments(userId: number): Promise<Investment[]> {
    const investments = await this.investmentRepo
      .createQueryBuilder('investment')
      .leftJoinAndSelect('investment.project', 'project')
      .leftJoinAndSelect('project.owner', 'owner')
      .where('investment.investorId = :userId', { userId })
      .andWhere('investment.status IN (:...statuses)', { statuses: ['ACTIVE', 'APPROVED'] })
      .orderBy('investment.investedAt', 'DESC')
      .getMany();

    // Build absolute URLs for images
    return investments.map(inv => ({
      ...inv,
      project: {
        ...inv.project,
        images: this.buildAbsoluteUrls(inv.project?.images || []),
      },
    }));
  }

  /**
   * Get rental statistics for a user
   */
  async getRentalStats(userId: number) {
    const rentalData = await this.investmentRepo.find({
      where: { investorId: userId },
    });

    const totalRentPaid = rentalData.reduce((sum, inv) => sum + Number(inv.returnsReceived), 0);
    const activeLeases = rentalData.filter(inv => inv.status === 'ACTIVE').length;

    const ownedProjects = await this.projectRepo.find({
      where: { ownerId: userId },
      relations: ['investments'],
    });

    let totalPotentialIncome = 0;
    let leaseRequestCount = 0;

    ownedProjects.forEach(project => {
      const activeInvestments = project.investments.filter(inv => inv.status === 'ACTIVE');
      activeInvestments.forEach(inv => {
        totalPotentialIncome += Number(inv.amount);
      });
      leaseRequestCount += project.investments.length;
    });

    return {
      asRenter: { totalRentPaid, activeLeases },
      asLandOwner: { totalPotentialIncome, leaseRequestCount },
    };
  }

  /**
   * Get dashboard data for investor
   */
  async getInvestorDashboard(userId: number) {
    const rentalStats = await this.getRentalStats(userId);

    const recentLeases = await this.investmentRepo.find({
      where: { investorId: userId },
      relations: ['project', 'project.owner'],
      order: { investedAt: 'DESC' },
      take: 5,
    });

    return {
      stats: rentalStats,
      recentLeases: recentLeases.map(lease => ({
        id: lease.id,
        projectTitle: lease.project.title,
        landOwner: lease.project.owner.name,
        amount: lease.amount,
        paidAmount: lease.returnsReceived,
        status: lease.status,
        date: lease.investedAt,
      })),
    };
  }

  /**
   * Approve a lease request (owner accepts investor)
   */
  async approveLeaseRequest(leaseId: number, ownerId: number): Promise<Investment> {
    const lease = await this.investmentRepo.findOne({
      where: { id: leaseId },
      relations: ['project'],
    });

    if (!lease) {
      throw new NotFoundException(`Lease request ${leaseId} not found`);
    }

    if (lease.project.ownerId !== ownerId) {
      throw new BadRequestException('You can only approve requests for your own lands');
    }

    lease.status = 'APPROVED';
    const updated = await this.investmentRepo.save(lease);

    // Update project status to 'leased' when accepted
    lease.project.status = 'leased';
    await this.projectRepo.save(lease.project);

    return updated;
  }

  /**
   * Reject a lease request (owner declines investor)
   */
  async rejectLeaseRequest(leaseId: number, ownerId: number): Promise<Investment> {
    const lease = await this.investmentRepo.findOne({
      where: { id: leaseId },
      relations: ['project'],
    });

    if (!lease) {
      throw new NotFoundException(`Lease request ${leaseId} not found`);
    }

    if (lease.project.ownerId !== ownerId) {
      throw new BadRequestException('You can only reject requests for your own lands');
    }

    lease.status = 'REJECTED';
    const saved = await this.investmentRepo.save(lease);

    // If no other pending/approved requests remain, free the land
    const remaining = await this.investmentRepo.count({
      where: {
        projectId: lease.projectId,
        status: In(['ACTIVE', 'APPROVED']),
      },
    });

    if (remaining === 0) {
      lease.project.status = 'available';
      await this.projectRepo.save(lease.project);
    }

    return saved;
  }
}
