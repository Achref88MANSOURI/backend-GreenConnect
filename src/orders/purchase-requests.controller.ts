import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { PurchaseRequestsService } from './purchase-requests.service';
import { CreatePurchaseRequestDto } from './dto/create-purchase-request.dto';
import { UpdatePurchaseRequestDto } from './dto/update-purchase-request.dto';
import { RespondPurchaseRequestDto } from './dto/respond-purchase-request.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { User as UserDecorator } from '../users/decorators/user.decorator';

@Controller('purchase-requests')
@UseGuards(JwtAuthGuard)
export class PurchaseRequestsController {
  constructor(private readonly purchaseRequestsService: PurchaseRequestsService) {}

  /**
   * Create a new purchase request
   */
  @Post()
  async create(
    @UserDecorator() user: any,
    @Body() dto: CreatePurchaseRequestDto,
  ) {
    return this.purchaseRequestsService.create(user.id, dto);
  }

  /**
   * Get all purchase requests made by the current user (as buyer)
   */
  @Get('my-requests')
  async getMyRequests(@UserDecorator() user: any) {
    return this.purchaseRequestsService.findByBuyer(user.id);
  }

  /**
   * Get all purchase requests for the current user's products (as seller)
   */
  @Get('received')
  async getReceivedRequests(@UserDecorator() user: any) {
    return this.purchaseRequestsService.findBySeller(user.id);
  }

  /**
   * Get a specific purchase request
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.purchaseRequestsService.findOne(id);
  }

  /**
   * Update a purchase request (buyer only, pending only)
   */
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @UserDecorator() user: any,
    @Body() dto: UpdatePurchaseRequestDto,
  ) {
    return this.purchaseRequestsService.update(id, user.id, dto);
  }

  /**
   * Cancel/Delete a purchase request (buyer only, pending only)
   */
  @Delete(':id')
  async cancel(
    @Param('id', ParseIntPipe) id: number,
    @UserDecorator() user: any,
  ) {
    await this.purchaseRequestsService.cancel(id, user.id);
    return { success: true, message: 'Demande annulée avec succès' };
  }

  /**
   * Accept a purchase request (seller only)
   */
  @Patch(':id/accept')
  async accept(
    @Param('id', ParseIntPipe) id: number,
    @UserDecorator() user: any,
    @Body() dto: RespondPurchaseRequestDto,
  ) {
    return this.purchaseRequestsService.accept(id, user.id, dto);
  }

  /**
   * Reject a purchase request (seller only)
   */
  @Patch(':id/reject')
  async reject(
    @Param('id', ParseIntPipe) id: number,
    @UserDecorator() user: any,
    @Body() dto: RespondPurchaseRequestDto,
  ) {
    return this.purchaseRequestsService.reject(id, user.id, dto);
  }
}
