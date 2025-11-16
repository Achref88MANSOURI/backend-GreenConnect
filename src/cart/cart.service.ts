import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { AddItemDto } from './dto/add-item.dto';


@Injectable()
export class CartService {
	constructor(
		@InjectRepository(Cart)
		private cartRepo: Repository<Cart>,
		@InjectRepository(CartItem)
		private itemRepo: Repository<CartItem>,
		@InjectRepository(Product)
		private productRepo: Repository<Product>,
		@InjectRepository(User)
		private userRepo: Repository<User>,
	) {}

	async getCartForUser(userId: number) {
		let cart = await this.cartRepo.findOne({ where: { user: { id: userId } }, relations: ['user', 'items', 'items.product'] });
		if (!cart) {
			const user = await this.userRepo.findOne({ where: { id: userId } });
			if (!user) throw new NotFoundException('User not found');
			cart = this.cartRepo.create({ user, items: [] });
			await this.cartRepo.save(cart);
		}
		return cart;
	}

	async addItem(userId: number, dto: AddItemDto) {
		const cart = await this.getCartForUser(userId);
		const product = await this.productRepo.findOne({ where: { id: dto.productId } });
		if (!product) throw new NotFoundException('Product not found');

		let item = cart.items?.find(i => i.product.id === product.id);
		if (item) {
			item.quantity += dto.quantity;
			return this.itemRepo.save(item);
		}

		item = this.itemRepo.create({ cart, product, quantity: dto.quantity, unitPrice: Number(product.price) });
		return this.itemRepo.save(item);
	}

	async updateItemQuantity(itemId: number, quantity: number) {
		const item = await this.itemRepo.findOne({ where: { id: itemId } });
		if (!item) throw new NotFoundException('Cart item not found');
		item.quantity = quantity;
		return this.itemRepo.save(item);
	}

	async removeItem(itemId: number) {
		return this.itemRepo.delete(itemId);
	}

	async clearCart(userId: number) {
		const cart = await this.getCartForUser(userId);
		await this.itemRepo.delete({ cart: { id: cart.id } as any });
		return { ok: true };
	}
}
