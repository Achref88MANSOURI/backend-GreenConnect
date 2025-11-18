import { Controller, Get, Post, Body, Param, HttpStatus, HttpCode, UseGuards, Req } from '@nestjs/common';
import { DeliveriesService } from './deliveries.service';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { SubmitReviewDto } from './dto/submit-review.dto'; // DTO pour la soumission d'évaluation
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
  getSuggestions(@Req() req, @Body() createDeliveryDto: CreateDeliveryDto): Promise<any[]> {
    // Attach the authenticated user id to the DTO for server-side use
    (createDeliveryDto as any).userId = req.user?.id;
    return this.deliveriesService.getSuggestions(createDeliveryDto);
  }
  // --- 2. SOUMISSION D'ÉVALUATION (POST /deliveries/review) ---
  // Cette route doit être avant toute route dynamique comme @Get(':id')
  @Post('review')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  submitReview(@Req() req, @Body() submitReviewDto: SubmitReviewDto): Promise<any> {
    const reviewerId = req.user?.id;
    return this.deliveriesService.submitReview(submitReviewDto, reviewerId);
  }

  // --- 3. Création de la Livraison (Réservation) ---
  // Route: POST /deliveries
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  create(@Req() req, @Body() createDeliveryDto: CreateDeliveryDto): Promise<any> {
    (createDeliveryDto as any).userId = req.user?.id;
    return this.deliveriesService.create(createDeliveryDto);
  }

  // --- 4. Suivi en temps réel des livraisons (Page 28) ---
  // Route: GET /deliveries/{id}
  @Get(':id')
  trackDelivery(@Param('id') id: string): Promise<any> {
    return this.deliveriesService.trackDelivery(id);
  }
  
  // NOTE: On pourrait ajouter une route PUT /deliveries/:id/update-status 
  // pour que le transporteur puisse mettre à jour le statut (ex: 'IN_TRANSIT').
}