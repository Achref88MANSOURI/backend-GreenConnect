import { Controller, Get, Post, Body, Param, Patch, Delete, Req, ParseIntPipe } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddItemDto } from './dto/add-item.dto';

@Controller('cart')
export class CartController {
	constructor(private readonly cartService: CartService) {}

	// For now we don't implement auth; userId falls back to 1 for local testing
	private getUserId(req: any) {
		return req?.user?.id ?? 1;
	}

	@Get()
	async getCart(@Req() req: any) {
		const userId = this.getUserId(req);
		return this.cartService.getCartForUser(userId);
	}

	@Post('items')
	async addItem(@Req() req: any, @Body() dto: AddItemDto) {
		const userId = this.getUserId(req);
		return this.cartService.addItem(userId, dto);
	}

	@Patch('items/:id')
	async updateItem(@Param('id', ParseIntPipe) id: number, @Body() body: { quantity: number }) {
		return this.cartService.updateItemQuantity(id, body.quantity);
	}

	@Delete('items/:id')
	async removeItem(@Param('id', ParseIntPipe) id: number) {
		return this.cartService.removeItem(id);
	}
}
