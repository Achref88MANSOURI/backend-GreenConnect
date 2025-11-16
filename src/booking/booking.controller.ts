/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
import { Controller, Post, Param, Body, UseGuards, Patch, Get } from '@nestjs/common';
import { BookingService } from './booking.service';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus } from './entities/booking.entity';
import { User } from 'src/users/decorators/user.decorator';

@Controller('booking')
@UseGuards(JwtAuthGuard)
export class BookingController {
  constructor(private service: BookingService) {}

  @Post(':id')
  create(@Param('id') id: number, @Body() dto: CreateBookingDto, @User() user) {
    return this.service.create(id, dto, user);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: number,
    @Body('status') status: BookingStatus,
    @User() user,
  ) {
    return this.service.updateStatus(id, status, user);
  }

  @Get('mine')
  myBookings(@User() user) {
    return this.service.myBookings(user);
  }

  @Get('received')
  receivedBookings(@User() user) {
    return this.service.receivedBookings(user);
  }
}
