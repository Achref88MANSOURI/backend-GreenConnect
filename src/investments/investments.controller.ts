import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { InvestmentsService } from './investments.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('investments')
export class InvestmentsController {
  constructor(private readonly investmentsService: InvestmentsService) {}

  // ========== PROJECT ENDPOINTS ==========

  @Get('projects')
  async findAllProjects(
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('location') location?: string,
    @Query('minAmount') minAmount?: number,
    @Query('maxAmount') maxAmount?: number,
  ) {
    return this.investmentsService.findAllProjects({
      status,
      category,
      location,
      minAmount,
      maxAmount,
    });
  }

  @Get('projects/my')
  @UseGuards(JwtAuthGuard)
  async getMyProjects(@Req() req) {
    return this.investmentsService.getMyProjects(req.user.id);
  }

  @Get('projects/:id')
  async findProjectById(@Param('id', ParseIntPipe) id: number) {
    return this.investmentsService.findProjectById(id);
  }

  @Post('projects')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createProject(
    @Body() dto: CreateProjectDto,
    @Req() req,
  ) {
    return this.investmentsService.createProject(dto, req.user.id);
  }

  @Patch('projects/:id')
  @UseGuards(JwtAuthGuard)
  async updateProject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProjectDto,
    @Req() req,
  ) {
    return this.investmentsService.updateProject(id, dto, req.user.id);
  }

  @Delete('projects/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProject(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
  ) {
    await this.investmentsService.deleteProject(id, req.user.id);
  }

  // ========== INVESTMENT ENDPOINTS ==========

  @Post('invest')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createInvestment(
    @Body() dto: CreateInvestmentDto,
    @Req() req,
  ) {
    return this.investmentsService.createInvestment(dto, req.user.id);
  }

  @Get('my-investments')
  @UseGuards(JwtAuthGuard)
  async getMyInvestments(@Req() req) {
    return this.investmentsService.getMyInvestments(req.user.id);
  }

  @Get('projects/:id/investors')
  @UseGuards(JwtAuthGuard)
  async getProjectInvestors(@Param('id', ParseIntPipe) id: number) {
    return this.investmentsService.getProjectInvestors(id);
  }

  @Get('projects/:id/investments')
  @UseGuards(JwtAuthGuard)
  async getProjectInvestments(@Param('id', ParseIntPipe) id: number) {
    return this.investmentsService.getProjectInvestments(id);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getStats(@Req() req) {
    return this.investmentsService.getInvestmentStats(req.user.id);
  }
}
