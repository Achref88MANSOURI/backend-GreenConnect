import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Delivery } from './entities/delivery.entity';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { CarriersService } from './carriers.service'; // Pour l'intégration
import { Carrier } from './entities/carrier.entity';
import { SubmitReviewDto } from './dto/submit-review.dto'; // Nouveau DTO

@Injectable()
export class DeliveriesService {
  constructor(
    @InjectRepository(Delivery)
    private readonly deliveryRepository: Repository<Delivery>,
    @InjectRepository(Carrier)
    private readonly carrierRepository: Repository<Carrier>, // Ajout du Repository Carrier
    private readonly carriersService: CarriersService, // Service pour obtenir les transporteurs
    // NOTE: Dans un cas réel, vous injecteriez un service GeoLocation pour calculer la distance
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

    // 3. Filtrage basé sur les critères de la demande (Capacité, Zones, Disponibilité)
    const suggestions = availableCarriers
      .filter(c => c.capacity_kg >= dto.weight_kg) // Filtrer par capacité
      .filter(c => c.status === 'Active') // S'assurer qu'ils sont actifs
      // NOTE: Le filtrage par zone/disponibilité serait complexe et nécessiterait une logique géospatiale

      // 4. Calculer le coût pour chaque transporteur éligible
      .map(carrier => {
        const baseCost = distance_km * carrier.pricePerKm;
        const weightCost = carrier.pricePerTonne ? (dto.weight_kg / 1000) * carrier.pricePerTonne : 0;
        const totalCost = baseCost + weightCost;

        return {
          carrierId: carrier.id,
          companyName: carrier.companyName,
          averageRating: carrier.averageRating,
          estimatedCost: totalCost,
          estimatedDistance: distance_km,
        };
      })
      // 5. Trier par coût ou par évaluation (Optimisation)
      .sort((a, b) => a.estimatedCost - b.estimatedCost);

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
    
    const baseCost = distance_km * selectedCarrier.pricePerKm;
    const weightCost = selectedCarrier.pricePerTonne ? (createDeliveryDto.weight_kg / 1000) * selectedCarrier.pricePerTonne : 0;
    const totalCost = baseCost + weightCost;

    const newDelivery = this.deliveryRepository.create({
      ...createDeliveryDto,
      distance_km,
      totalCost,
      status: 'PENDING_PICKUP', // Statut initial
    });
    
    return this.deliveryRepository.save(newDelivery);
  }

  // =========================================================================
  // SUIVI DE LIVRAISON (Page 28)
  // =========================================================================

  /**
   * Récupère les informations et le statut d'une livraison pour le suivi (Page 28).
   */
  async trackDelivery(id: string): Promise<Delivery> {
    const delivery = await this.deliveryRepository.findOne({ 
      where: { id },
      relations: ['carrier'], // Inclure les infos du transporteur pour le suivi
    });

    if (!delivery) {
      throw new NotFoundException(`Suivi de livraison impossible: ID ${id} non trouvé.`);
    }
    
    // NOTE: Le service pourrait ici faire un appel à un service externe de géolocalisation
    // pour obtenir la position GPS en temps réel si le statut est 'IN_TRANSIT'.

    return delivery;
  }

  /**
   * Enregistre l'évaluation du client et met à jour la note du transporteur.
   */
  async submitReview(submitReviewDto: SubmitReviewDto): Promise<Delivery> {
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
}