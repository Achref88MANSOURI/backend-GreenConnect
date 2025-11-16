import { Controller, Get, Post, Body, Param, Patch, Delete, Req, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddItemDto } from './dto/add-item.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
	constructor(private readonly cartService: CartService) {}

	private getUserId(req: any) {
		return req.user.id;
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
