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
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { InvestmentsService } from './investments.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('investments')
export class InvestmentsController {
  constructor(private readonly investmentsService: InvestmentsService) {}

  // ========== LAND LISTING ENDPOINTS ==========

  @Get('lands')
  async findAllListings(
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('location') location?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('minArea') minArea?: number,
    @Query('maxArea') maxArea?: number,
  ) {
    return this.investmentsService.findAllProjects({
      status,
      category,
      location,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
    });
  }

  @Get('my-listings')
  @UseGuards(JwtAuthGuard)
  async getMyListings(@Req() req) {
    return this.investmentsService.getMyListings(req.user.id);
  }

  @Get('lands/:id')
  async findListingById(@Param('id', ParseIntPipe) id: number) {
    return this.investmentsService.findProjectById(id);
  }

  @Post('lands')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('images', 10)) // max 10 images
  async createListing(
    @Body() dto: CreateProjectDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req,
  ) {
    return this.investmentsService.createProject(dto, req.user.id, files);
  }

  @Patch('lands/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', 10)) // max 10 images
  async updateListing(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProjectDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req,
  ) {
    return this.investmentsService.updateProject(id, dto, req.user.id, files);
  }

  @Delete('lands/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteListing(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
  ) {
    await this.investmentsService.deleteProject(id, req.user.id);
  }

  // ========== LEASE REQUEST ENDPOINTS ==========

  @Post('lease-request')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createLeaseRequest(
    @Body() dto: CreateInvestmentDto,
    @Req() req,
  ) {
    return this.investmentsService.createLeaseRequest(dto, req.user.id);
  }

  @Get('my-leases')
  @UseGuards(JwtAuthGuard)
  async getMyLeases(@Req() req) {
    return this.investmentsService.getMyLeaseRequests(req.user.id);
  }

  @Get('my-investments')
  @UseGuards(JwtAuthGuard)
  async getMyInvestments(@Req() req) {
    return this.investmentsService.getMyInvestments(req.user.id);
  }

  @Get('lands/:id/lease-requests')
  @UseGuards(JwtAuthGuard)
  async getListingLeaseRequests(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
  ) {
    return this.investmentsService.getListingLeaseRequests(id, req.user.id);
  }

  @Patch('leases/:id/approve')
  @UseGuards(JwtAuthGuard)
  async approveLeaseRequest(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
  ) {
    return this.investmentsService.approveLeaseRequest(id, req.user.id);
  }

  @Patch('leases/:id/reject')
  @UseGuards(JwtAuthGuard)
  async rejectLeaseRequest(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
  ) {
    return this.investmentsService.rejectLeaseRequest(id, req.user.id);
  }

  @Patch('leases/:id/start')
  @UseGuards(JwtAuthGuard)
  async startLease(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
  ) {
    // Not implemented
    return { message: 'Not yet implemented' };
  }

  @Patch('leases/:id/complete')
  @UseGuards(JwtAuthGuard)
  async completeLease(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
  ) {
    // Not implemented
    return { message: 'Not yet implemented' };
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getStats(@Req() req) {
    return this.investmentsService.getRentalStats(req.user.id);
  }
}

