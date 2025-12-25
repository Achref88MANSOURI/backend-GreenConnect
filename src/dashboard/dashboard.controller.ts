/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  async getOverview(@Req() req) {
    return this.dashboardService.getUserOverview(req.user.id);
  }

  @Get('seller')
  async getSellerStats(@Req() req) {
    return this.dashboardService.getSellerDashboard(req.user.id);
  }

  @Get('buyer')
  async getBuyerStats(@Req() req) {
    return this.dashboardService.getBuyerDashboard(req.user.id);
  }

  @Get('investor')
  async getInvestorStats(@Req() req) {
    return this.dashboardService.getInvestorDashboard(req.user.id);
  }

  @Get('equipment-owner')
  async getEquipmentOwnerStats(@Req() req) {
    return this.dashboardService.getEquipmentOwnerDashboard(req.user.id);
  }

  @Get('carrier')
  async getCarrierStats(@Req() req) {
    return this.dashboardService.getCarrierDashboard(req.user.id);
  }

  @Get('recent-activities')
  async getRecentActivities(@Req() req) {
    return this.dashboardService.getRecentActivities(req.user.id);
  }
}
