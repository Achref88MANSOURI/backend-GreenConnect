/* eslint-disable prettier/prettier */
import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { Equipment } from 'src/equipment/entities/equipment.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private repo: Repository<Booking>,

    @InjectRepository(Equipment)
    private eqRepo: Repository<Equipment>,
  ) {}

  async create(eqId: number, dto: CreateBookingDto, user: User) {
    const eq = await this.eqRepo.findOne({ where: { id: eqId }, relations: ['owner'] });

    if (!eq) throw new NotFoundException('Equipment not found');

    if (eq.owner.id === user.id) {
      throw new ForbiddenException('You cannot book your own equipment');
    }

    const booking = this.repo.create({
      startDate: dto.startDate,
      endDate: dto.endDate,
      user,
      equipment: eq,
    });

    return this.repo.save(booking);
  }

  async updateStatus(id: number, status: BookingStatus, owner: User) {
    const booking = await this.repo.findOne({
      where: { id },
      relations: ['equipment', 'equipment.owner'],
    });

    if (!booking) throw new NotFoundException();
    if (booking.equipment.owner.id !== owner.id) {
      throw new ForbiddenException('Not your equipment');
    }

    booking.status = status;
    return this.repo.save(booking);
  }

  async myBookings(user: User) {
    return this.repo.find({
      where: { user },
      relations: ['equipment'],
    });
  }

  async receivedBookings(user: User) {
    return this.repo.find({
      where: { equipment: { owner: { id: user.id } } },
      relations: ['equipment', 'user'],
    });
  }
}
