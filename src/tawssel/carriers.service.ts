import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Carrier } from './entities/carrier.entity';
import { CreateCarrierDto } from './dto/create-carrier.dto';
import { UpdateCarrierDto } from './dto/update-carrier.dto';

@Injectable()
export class CarriersService {
  constructor(
    // Injection du repository pour interagir avec la table 'carriers'
    @InjectRepository(Carrier)
    private readonly carrierRepository: Repository<Carrier>,
  ) {}

  /**
   * Crée un nouveau profil de transporteur (Page 26)
   */
  async create(createCarrierDto: CreateCarrierDto): Promise<Carrier> {
    const newCarrier = this.carrierRepository.create(createCarrierDto);
    // Ajoutez ici toute logique de validation métier avant la sauvegarde (ex: vérif unicité du contactEmail)
    return this.carrierRepository.save(newCarrier);
  }

  /**
   * Récupère tous les transporteurs disponibles (Page 24)
   * Peut être filtré par zone, disponibilité, ou type de véhicule
   */
  async findAll(): Promise<Carrier[]> {
    // Dans un scénario réel, vous appliqueriez des filtres (WHERE clause)
    // Retourner les champs pertinents pour la logique de suggestion
    return this.carrierRepository.find({
      relations: ['user'],
      select: {
        id: true,
        companyName: true,
        vehicleType: true,
        averageRating: true,
        pricePerKm: true,
        pricePerTonne: true,
        capacity_kg: true,
        status: true,
        serviceZones: true,
        availability: true,
        contactEmail: true,
        userId: true,
        user: {
          id: true,
          name: true,
        },
      },
    });
  }

  /**
   * Récupère les transporteurs d'un utilisateur spécifique
   */
  async findByUserId(userId: number): Promise<Carrier[]> {
    return this.carrierRepository.find({
      where: { userId },
      relations: ['user'],
    });
  }

  /**
   * Récupère le profil d'un transporteur spécifique (Page 25)
   */
  async findOne(id: number): Promise<Carrier> {
    const carrier = await this.carrierRepository.findOne({ 
      where: { id },
      relations: ['user'],
    });
    
    if (!carrier) {
      throw new NotFoundException(`Le transporteur avec l'ID ${id} n'a pas été trouvé.`);
    }
    return carrier;
  }
  
  /**
   * Met à jour le profil du transporteur
   */
  async update(id: number, updateCarrierDto: UpdateCarrierDto, userId?: number): Promise<Carrier> {
    const carrier = await this.findOne(id);
    
    // Vérifier que l'utilisateur est le propriétaire
    if (userId && carrier.userId !== userId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à modifier ce transporteur.');
    }

    const result = await this.carrierRepository.update(id, updateCarrierDto);

    if (result.affected === 0) {
      throw new NotFoundException(`Mise à jour échouée: Transporteur avec ID ${id} non trouvé.`);
    }

    // Récupérer et retourner l'objet mis à jour
    return this.findOne(id);
  }

  /**
   * Supprime un transporteur
   */
  async remove(id: number, userId?: number): Promise<void> {
    const carrier = await this.findOne(id);
    
    // Vérifier que l'utilisateur est le propriétaire
    if (userId && carrier.userId !== userId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à supprimer ce transporteur.');
    }

    await this.carrierRepository.remove(carrier);
  }

  // NOTE: D'autres méthodes spécifiques (ex: calculateRoutePrice, getDashboardStats) seront ajoutées plus tard.
}