import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { PurchaseRequest } from './entities/purchase-request.entity';
import { CartModule } from '../cart/cart.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { PurchaseRequestsService } from './purchase-requests.service';
import { PurchaseRequestsController } from './purchase-requests.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, PurchaseRequest, Product, User]),
    CartModule,
    NotificationsModule,
  ],
  providers: [OrdersService, PurchaseRequestsService],
  controllers: [OrdersController, PurchaseRequestsController],
  exports: [OrdersService, PurchaseRequestsService],
})
export class OrdersModule {}
