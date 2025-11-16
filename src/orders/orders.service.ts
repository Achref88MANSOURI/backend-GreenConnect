import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CartService } from '../cart/cart.service';
import { Cart } from '../cart/entities/cart.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private itemRepo: Repository<OrderItem>,
    private cartService: CartService,
  ) {}

  async createOrderFromCart(userId: number) {
    const cart = await this.cartService.getCartForUser(userId);
    if (!cart || !cart.items || cart.items.length === 0) {
      throw new NotFoundException('Cart is empty');
    }

    // Calculate total
    const total = cart.items.reduce((sum, i) => sum + Number(i.unitPrice) * i.quantity, 0);

    // Build order and items
    const order = this.orderRepo.create({ user: cart.user, total, status: 'paid' });
    order.items = cart.items.map(ci => {
      const oi = new OrderItem();
      oi.product = ci.product;
      oi.quantity = ci.quantity;
      oi.unitPrice = Number(ci.unitPrice);
      return oi;
    });

    const saved = await this.orderRepo.save(order);

    // Clear the cart
    await this.cartService.clearCart(userId);

    return saved;
  }
}
