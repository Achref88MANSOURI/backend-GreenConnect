import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Delivery } from './entities/delivery.entity';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { CarriersService } from './carriers.service'; // Pour l'intégration
import { Carrier } from './entities/carrier.entity';
import { SubmitReviewDto } from './dto/submit-review.dto'; // Nouveau DTO
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class DeliveriesService {
  constructor(
    @InjectRepository(Delivery)
    private readonly deliveryRepository: Repository<Delivery>,
    @InjectRepository(Carrier)
    private readonly carrierRepository: Repository<Carrier>, // Ajout du Repository Carrier
    private readonly carriersService: CarriersService, // Service pour obtenir les transporteurs
    private readonly notificationsService: NotificationsService, // Service pour les notifications
  ) {}

  // =========================================================================
  // LOGIQUE DE PRÉ-RÉSERVATION (Suggestion de transporteurs et Coût)
  // =========================================================================

  /**
   * Simule le calcul de distance et la suggestion de transporteurs.
   */
  async getSuggestions(dto: CreateDeliveryDto): Promise<any[]> {
    // 1. Calculer la distance et l'itinéraire (Simulation ici)
    const distance_km = 150; // Simulation: le GeoService ferait le travail

    // 2. Trouver tous les transporteurs éligibles
    const availableCarriers = await this.carriersService.findAll(); // Récupérer tous les transporteurs

    // Ne pas lever une erreur ici; retourner une liste vide pour que le frontend
    // affiche un message convivial "Aucun transporteur disponible"
    if (!availableCarriers || availableCarriers.length === 0) {
      return [];
    }

    // Récupérer l'ID utilisateur depuis le DTO
    const userId = (dto as any).userId;

    // 3. Filtrage basé sur les critères de la demande (Capacité, Zones, Disponibilité)
    const suggestions = availableCarriers
      .filter(c => c.capacity_kg >= dto.weight_kg) // Filtrer par capacité
      .filter(c => c.status === 'Active') // S'assurer qu'ils sont actifs
      .filter(c => c.userId !== userId) // Exclure les propres camions de l'utilisateur

      // 4. Calculer le coût pour chaque transporteur éligible
      .map(carrier => {
        const baseCost = distance_km * carrier.pricePerKm;
        const weightCost = carrier.pricePerTonne ? (dto.weight_kg / 1000) * carrier.pricePerTonne : 0;
        const totalCost = baseCost + weightCost;

        return {
          carrierId: carrier.id,
          companyName: carrier.companyName,
          averageRating: carrier.averageRating,
          vehicleType: carrier.vehicleType,
          capacity_kg: carrier.capacity_kg,
          estimatedCost: totalCost,
          estimatedDistance: distance_km,
          ownerName: carrier.user?.name || 'Inconnu',
        };
      })
      // 5. Trier par coût ou par évaluation (Optimisation)
      .sort((a, b) => a.estimatedCost - b.estimatedCost);

    // Retourner la liste (possiblement vide). Le frontend gère l'affichage.
    return suggestions;
  }

  // =========================================================================
  // CRÉATION DE LA LIVRAISON (Réservation)
  // =========================================================================

  /**
   * Crée un nouvel enregistrement de livraison après qu'un transporteur ait été choisi.
   */
  async create(createDeliveryDto: CreateDeliveryDto): Promise<Delivery> {
    if (!createDeliveryDto.carrierId) {
      throw new BadRequestException("Un transporteur doit être sélectionné pour la réservation.");
    }
    
    // NOTE: On réutiliserait ici la logique de suggestion pour valider le coût/la distance
    const distance_km = 150; 
    const selectedCarrier = await this.carriersService.findOne(createDeliveryDto.carrierId);
    
    // Vérifier que l'utilisateur ne réserve pas son propre camion
    const userId = (createDeliveryDto as any).userId;
    if (selectedCarrier.userId === userId) {
      throw new BadRequestException("Vous ne pouvez pas réserver votre propre camion.");
    }
    
    const baseCost = distance_km * selectedCarrier.pricePerKm;
    const weightCost = selectedCarrier.pricePerTonne ? (createDeliveryDto.weight_kg / 1000) * selectedCarrier.pricePerTonne : 0;
    const totalCost = baseCost + weightCost;

    const newDelivery = this.deliveryRepository.create({
      ...createDeliveryDto,
      desiredDeliveryDate: new Date(createDeliveryDto.desiredDeliveryDate),
      distance_km,
      totalCost,
      status: 'PENDING', // Statut initial - en attente d'approbation
    });
    
    const savedDelivery = await this.deliveryRepository.save(newDelivery);

    // Envoyer une notification au propriétaire du transporteur
    // Récupérer le nom du client
    const delivery = await this.deliveryRepository.findOne({
      where: { id: savedDelivery.id },
      relations: ['user'],
    });
    
    const clientName = delivery?.user?.name || 'Un client';
    
    await this.notificationsService.notifyNewReservation(
      selectedCarrier.userId,
      savedDelivery.id,
      clientName,
      createDeliveryDto.goodsType,
    );

    return savedDelivery;
  }

  // =========================================================================
  // SUIVI DE LIVRAISON (Page 28)
  // =========================================================================

  /**
   * Récupère les informations et le statut d'une livraison pour le suivi (Page 28).
   */
  async trackDelivery(id: number): Promise<Delivery> {
    const delivery = await this.deliveryRepository.findOne({ 
      where: { id },
      relations: ['carrier', 'carrier.user', 'user'], // Inclure les infos du transporteur et du client
    });

    if (!delivery) {
      throw new NotFoundException(`Suivi de livraison impossible: ID ${id} non trouvé.`);
    }
    
    return delivery;
  }

  /**
   * Enregistre l'évaluation du client et met à jour la note du transporteur.
   */
  async submitReview(submitReviewDto: SubmitReviewDto, reviewerId?: number): Promise<Delivery> {
    const { deliveryId, rating } = submitReviewDto;

    // 1. Trouver la livraison et le transporteur
    const delivery = await this.deliveryRepository.findOne({ 
      where: { id: deliveryId },
      relations: ['carrier'],
    });

    if (!delivery) {
      throw new NotFoundException(`Livraison ID ${deliveryId} introuvable.`);
    }
    if (delivery.status !== 'DELIVERED') {
      throw new BadRequestException("Seules les livraisons terminées peuvent être évaluées.");
    }
    if (delivery.carrierRating != null) {
      throw new BadRequestException("Cette livraison a déjà été évaluée.");
    }


    // Verify the reviewer is the booking owner
    if (reviewerId && delivery.userId !== reviewerId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à évaluer cette livraison.');
    }


    const carrier = delivery.carrier;

    // 2. Mettre à jour l'enregistrement de la livraison
    delivery.carrierRating = rating;
    await this.deliveryRepository.save(delivery);

    // 3. Mettre à jour le profil du transporteur (Carrier)
    const oldRatingSum = Number(carrier.averageRating) * (carrier.totalReviews || 0);
    const newTotalReviews = (carrier.totalReviews || 0) + 1;
    const newAverageRating = (oldRatingSum + rating) / newTotalReviews;

    // Utilisation directe du repository pour mettre à jour l'entité Carrier
    carrier.averageRating = parseFloat(newAverageRating.toFixed(2));
    carrier.totalReviews = newTotalReviews;
    await this.carrierRepository.save(carrier);

    return delivery;
  }

  /**
   * Met à jour le statut d'une livraison.
   */
  async updateStatus(id: number, status: string, actorId?: number): Promise<Delivery> {
    const delivery = await this.deliveryRepository.findOne({ 
      where: { id },
      relations: ['carrier'],
    });
    if (!delivery) {
      throw new NotFoundException(`Livraison ID ${id} introuvable.`);
    }

    // NOTE: You can add authorization checks here (owner, carrier user, or admin)
    delivery.status = status;
    return this.deliveryRepository.save(delivery);
  }

  /**
   * Récupère les livraisons de l'utilisateur authentifié.
   */
  async findMine(userId: number): Promise<Delivery[]> {
    return this.deliveryRepository.find({
      where: { userId },
      relations: ['carrier', 'carrier.user'],
      order: { id: 'DESC' },
    });
  }

  /**
   * Récupère les demandes de réservation reçues pour les camions de l'utilisateur.
   */
  async findReceivedRequests(userId: number): Promise<Delivery[]> {
    // D'abord, trouver tous les carriers de l'utilisateur
    const userCarriers = await this.carrierRepository.find({
      where: { userId },
      select: ['id'],
    });

    if (userCarriers.length === 0) {
      return [];
    }

    const carrierIds = userCarriers.map(c => c.id);

    // Ensuite, trouver toutes les livraisons pour ces carriers
    return this.deliveryRepository.find({
      where: { carrierId: In(carrierIds) },
      relations: ['carrier', 'user'],
      order: { id: 'DESC' },
    });
  }

  /**
   * Accepter une demande de réservation (par le propriétaire du camion).
   */
  async acceptDelivery(id: number, ownerId: number): Promise<Delivery> {
    const delivery = await this.deliveryRepository.findOne({
      where: { id },
      relations: ['carrier'],
    });

    if (!delivery) {
      throw new NotFoundException(`Livraison ID ${id} introuvable.`);
    }

    // Vérifier que l'utilisateur est le propriétaire du camion
    if (delivery.carrier.userId !== ownerId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à accepter cette demande.');
    }

    if (delivery.status !== 'PENDING') {
      throw new BadRequestException('Seules les demandes en attente peuvent être acceptées.');
    }

    delivery.status = 'ACCEPTED';
    const savedDelivery = await this.deliveryRepository.save(delivery);

    // Envoyer une notification au client
    await this.notificationsService.notifyReservationAccepted(
      delivery.userId,
      delivery.id,
      delivery.carrier.companyName,
    );

    return savedDelivery;
  }

  /**
   * Refuser une demande de réservation (par le propriétaire du camion).
   */
  async rejectDelivery(id: number, ownerId: number): Promise<Delivery> {
    const delivery = await this.deliveryRepository.findOne({
      where: { id },
      relations: ['carrier'],
    });

    if (!delivery) {
      throw new NotFoundException(`Livraison ID ${id} introuvable.`);
    }

    // Vérifier que l'utilisateur est le propriétaire du camion
    if (delivery.carrier.userId !== ownerId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à refuser cette demande.');
    }

    if (delivery.status !== 'PENDING') {
      throw new BadRequestException('Seules les demandes en attente peuvent être refusées.');
    }

    delivery.status = 'REJECTED';
    const savedDelivery = await this.deliveryRepository.save(delivery);

    // Envoyer une notification au client
    await this.notificationsService.notifyReservationRejected(
      delivery.userId,
      delivery.id,
      delivery.carrier.companyName,
    );

    return savedDelivery;
  }

  /**
   * Annuler une réservation (par le client) - SUPPRIME la réservation.
   */
  async cancelDelivery(id: number, userId: number): Promise<void> {
    const delivery = await this.deliveryRepository.findOne({
      where: { id },
    });

    if (!delivery) {
      throw new NotFoundException(`Livraison ID ${id} introuvable.`);
    }

    // Vérifier que l'utilisateur est le propriétaire de la réservation
    if (delivery.userId !== userId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à annuler cette réservation.');
    }

    // On ne peut annuler que les réservations en attente ou acceptées
    if (!['PENDING', 'ACCEPTED'].includes(delivery.status)) {
      throw new BadRequestException('Cette réservation ne peut plus être annulée.');
    }

    // Supprimer la réservation au lieu de la marquer comme annulée
    await this.deliveryRepository.remove(delivery);
  }
}