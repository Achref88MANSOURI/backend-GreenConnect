/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  // ========== PROJECT MANAGEMENT ==========

  async createProject(dto: CreateProjectDto, ownerId: number): Promise<InvestmentProject> {
    const project = this.projectRepo.create({
      ...dto,
      ownerId,
      currentAmount: 0,
      status: 'active',
    });
    return this.projectRepo.save(project);
  }

  async findAllProjects(filters?: {
    status?: string;
    category?: string;
    location?: string;
    minAmount?: number;
    maxAmount?: number;
  }): Promise<InvestmentProject[]> {
    const query = this.projectRepo.createQueryBuilder('project')
      .leftJoinAndSelect('project.owner', 'owner')
      .leftJoinAndSelect('project.investments', 'investments');

    if (filters?.status) {
      query.andWhere('project.status = :status', { status: filters.status });
    }
    if (filters?.category) {
      query.andWhere('project.category = :category', { category: filters.category });
    }
    if (filters?.location) {
      query.andWhere('project.location LIKE :location', { location: `%${filters.location}%` });
    }
    if (filters?.minAmount) {
      query.andWhere('project.minimumInvestment >= :minAmount', { minAmount: filters.minAmount });
    }
    if (filters?.maxAmount) {
      query.andWhere('project.minimumInvestment <= :maxAmount', { maxAmount: filters.maxAmount });
    }

    return query.getMany();
  }

  async findProjectById(id: number): Promise<InvestmentProject> {
    const project = await this.projectRepo.findOne({
      where: { id },
      relations: ['owner', 'investments', 'investments.investor'],
    });

    if (!project) {
      throw new NotFoundException(`Investment project with ID ${id} not found`);
    }

    return project;
  }

  async updateProject(id: number, dto: UpdateProjectDto, userId: number): Promise<InvestmentProject> {
    const project = await this.findProjectById(id);

    // Only the owner can update the project
    if (project.ownerId !== userId) {
      throw new BadRequestException('You are not authorized to update this project');
    }

    Object.assign(project, dto);
    return this.projectRepo.save(project);
  }

  async deleteProject(id: number, userId: number): Promise<void> {
    const project = await this.findProjectById(id);

    if (project.ownerId !== userId) {
      throw new BadRequestException('You are not authorized to delete this project');
    }

    if (Number(project.currentAmount) > 0) {
      throw new BadRequestException('Cannot delete a project with active investments');
    }

    await this.projectRepo.delete(id);
  }

  async getMyProjects(ownerId: number): Promise<InvestmentProject[]> {
    return this.projectRepo.find({
      where: { ownerId },
      relations: ['investments'],
      order: { createdAt: 'DESC' },
    });
  }

  // ========== INVESTMENT MANAGEMENT ==========

  async createInvestment(dto: CreateInvestmentDto, investorId: number): Promise<Investment> {
    const projectIdNum = Number(dto.projectId);
    if (!Number.isFinite(projectIdNum) || projectIdNum <= 0) {
      throw new BadRequestException('Invalid projectId');
    }
    const project = await this.findProjectById(projectIdNum);

    // Validate investment
    if (project.status !== 'active') {
      throw new BadRequestException('This project is not accepting investments');
    }

    // Prevent owner investing in own project
    if (project.ownerId === investorId) {
      throw new BadRequestException('You cannot invest in your own project');
    }

    if (dto.amount < project.minimumInvestment) {
      throw new BadRequestException(`Minimum investment is ${project.minimumInvestment}`);
    }

    const remainingAmount = Number(project.targetAmount) - Number(project.currentAmount);
    if (dto.amount > remainingAmount) {
      throw new BadRequestException(`Only ${remainingAmount} TND remaining to fund this project`);
    }

    // Create investment
    const amountNum = Number(dto.amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      throw new BadRequestException('Invalid investment amount');
    }

    const investment = this.investmentRepo.create({
      amount: amountNum,
      notes: dto.notes,
      projectId: project.id,
      project: project,
      investorId,
      status: 'ACTIVE',
      returnsReceived: 0,
    });
    try {
      await this.investmentRepo.save(investment);
    } catch (err) {
      // Surface clearer error to client
      const msg = err instanceof Error ? err.message : 'Failed to create investment';
      throw new BadRequestException(msg);
    }

    // Update project amount raised
    project.currentAmount = Number(project.currentAmount) + Number(dto.amount);

    // Check if project is fully funded
    if (project.currentAmount >= project.targetAmount) {
      project.status = 'funded';
    }

    try {
      await this.projectRepo.save(project);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update project totals';
      throw new BadRequestException(msg);
    }

    return investment;
  }

  async getMyInvestments(investorId: number): Promise<Investment[]> {
    return this.investmentRepo.find({
      where: { investorId },
      relations: ['project', 'project.owner'],
      order: { investedAt: 'DESC' },
    });
  }

  async getProjectInvestors(projectId: number): Promise<Investment[]> {
    return this.investmentRepo.find({
      where: { projectId },
      relations: ['investor'],
      order: { investedAt: 'DESC' },
    });
  }

  async getProjectInvestments(projectId: number): Promise<Investment[]> {
    return this.getProjectInvestors(projectId);
  }

  async getInvestmentStats(userId: number): Promise<any> {
    // Get user's investments
    const investments = await this.getMyInvestments(userId);
    
    const totalInvested = investments.reduce((sum, inv) => sum + Number(inv.amount), 0);
    const totalReturns = investments.reduce((sum, inv) => sum + Number(inv.returnsReceived), 0);
    const activeInvestments = investments.filter(inv => inv.status === 'ACTIVE').length;

    // Get user's projects
    const projects = await this.getMyProjects(userId);
    const totalRaised = projects.reduce((sum, proj) => sum + Number(proj.currentAmount), 0);

    return {
      asInvestor: {
        totalInvested,
        totalReturns,
        activeInvestments,
        roi: totalInvested > 0 ? ((totalReturns / totalInvested) * 100).toFixed(2) : 0,
      },
      asProjectOwner: {
        totalProjects: projects.length,
        totalRaised,
        activeProjects: projects.filter(p => p.status === 'active' || p.status === 'funded').length,
      },
    };
  }
}
