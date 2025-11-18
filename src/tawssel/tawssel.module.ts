import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Import des Entités
import { Carrier } from './entities/carrier.entity';
import { Delivery } from './entities/delivery.entity';

// Import des Contrôleurs
import { CarriersController } from './carriers.controller';
import { DeliveriesController } from './deliveries.controller';

// Import des Services
import { CarriersService } from './carriers.service';
import { DeliveriesService } from './deliveries.service';

@Module({
  // 1. Déclarer les entités pour TypeORM :
  imports: [
    TypeOrmModule.forFeature([
      Carrier, // Pour la gestion des transporteurs
      Delivery, // Pour la gestion des livraisons/suivi
    ]),
  ],
  // 2. Déclarer les contrôleurs (gestion des routes API) :
  controllers: [
    CarriersController,
    DeliveriesController,
  ],
  // 3. Déclarer les services (logique métier) :
  providers: [
    CarriersService,
    DeliveriesService,
  ],
  // 4. Exporter les services si d'autres modules (ex: 'orders' ou 'users')
  // doivent interagir avec la logique des transporteurs :
  exports: [
    CarriersService,
    DeliveriesService,
  ],
})
export class TawsselModule {}