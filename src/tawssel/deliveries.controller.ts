import { Controller, Get, Post, Patch, Body, Param, HttpStatus, HttpCode, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { DeliveriesService } from './deliveries.service';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { SubmitReviewDto } from './dto/submit-review.dto';
import { UpdateDeliveryStatusDto } from './dto/update-delivery-status.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

// L'URL de base pour ce contrôleur sera /deliveries
@Controller('deliveries')
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  // --- 1. Suggestion automatique de transporteurs (Pré-réservation) ---
  // Route: POST /deliveries/suggestions
  // Permet au client de voir les options et les coûts avant de finaliser la commande.
  @Post('suggestions')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  getSuggestions(
    @Req() req,
    @Body() createDeliveryDto: CreateDeliveryDto,
  ): Promise<any[]> {
    // Attach the authenticated user id to the DTO for server-side use
    (createDeliveryDto as any).userId = req.user?.id;
    return this.deliveriesService.getSuggestions(createDeliveryDto);
  }

  // --- 2. SOUMISSION D'ÉVALUATION (POST /deliveries/review) ---
  // Cette route doit être avant toute route dynamique comme @Get(':id')
  @Post('review')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  submitReview(
    @Req() req,
    @Body() submitReviewDto: SubmitReviewDto,
  ): Promise<any> {
    const reviewerId = req.user?.id;
    return this.deliveriesService.submitReview(submitReviewDto, reviewerId);
  }

  // --- 3. Création de la Livraison (Réservation) ---
  // Route: POST /deliveries
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  create(
    @Req() req,
    @Body() createDeliveryDto: CreateDeliveryDto,
  ): Promise<any> {
    (createDeliveryDto as any).userId = req.user?.id;
    return this.deliveriesService.create(createDeliveryDto);
  }

  // --- 4. Mes livraisons ---
  // Route: GET /deliveries/mine
  @Get('mine')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  getMyDeliveries(@Req() req): Promise<any[]> {
    const userId = req.user?.id;
    return this.deliveriesService.findMine(userId);
  }

  // --- 5. Suivi en temps réel des livraisons (Page 28) ---
  // Route: GET /deliveries/{id}
  @Get(':id')
  trackDelivery(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.deliveriesService.trackDelivery(id);
  }

  // --- 6. Mettre à jour le statut d'une livraison (transporteur / système) ---
  // Route: PATCH /deliveries/:id/status
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  updateStatus(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDeliveryStatusDto,
  ): Promise<any> {
    const actorId = req.user?.id;
    return this.deliveriesService.updateStatus(id, dto.status, actorId);
  }
}