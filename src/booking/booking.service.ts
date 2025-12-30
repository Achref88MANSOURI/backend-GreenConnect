/* eslint-disable prettier/prettier */
import { Injectable, ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { Equipment } from '../equipment/entities/equipment.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private repo: Repository<Booking>,

    @InjectRepository(Equipment)
    private eqRepo: Repository<Equipment>,

    private notificationsService: NotificationsService,
  ) {}

  async create(eqId: number, dto: CreateBookingDto, user: User) {
    const eq = await this.eqRepo.findOne({ where: { id: eqId }, relations: ['owner'] });

    if (!eq) throw new NotFoundException('Equipment not found');

    if (eq.owner.id === user.id) {
      throw new ForbiddenException('You cannot book your own equipment');
    }

    // Prevent double bookings: check for overlap against PENDING or APPROVED
    const overlapping = await this.repo.find({
      where: {
        equipment: { id: eqId },
      },
      relations: ['equipment'],
    });

    const reqStart = new Date(dto.startDate).getTime();
    const reqEnd = new Date(dto.endDate).getTime();
    const hasOverlap = overlapping.some(b => {
      const bStart = new Date(b.startDate).getTime();
      const bEnd = new Date(b.endDate).getTime();
      const isActive = b.status === BookingStatus.PENDING || b.status === BookingStatus.APPROVED;
      // Overlap if ranges intersect
      return isActive && Math.max(bStart, reqStart) < Math.min(bEnd, reqEnd);
    });

    if (hasOverlap) {
      throw new ConflictException('Equipment is already booked for the requested dates');
    }

    const booking = this.repo.create({
      startDate: dto.startDate,
      endDate: dto.endDate,
      phoneNumber: dto.phoneNumber,
      user,
      equipment: eq,
    });

    const savedBooking = await this.repo.save(booking);

    // Notify equipment owner about new booking request
    await this.notificationsService.create({
      userId: eq.owner.id,
      type: 'booking_request',
      title: 'Nouvelle demande de réservation',
      message: `${user.name || user.email} souhaite réserver votre équipement "${eq.name}"`,
      relatedId: savedBooking.id,
      relatedType: 'booking',
    });

    return savedBooking;
  }

  async updateStatus(id: number, status: BookingStatus, owner: User) {
    const booking = await this.repo.findOne({
      where: { id },
      relations: ['equipment', 'equipment.owner', 'user'],
    });

    if (!booking) throw new NotFoundException();
    if (booking.equipment.owner.id !== owner.id) {
      throw new ForbiddenException('Not your equipment');
    }

    // Notify the requester about the status change
    const statusText = status === BookingStatus.APPROVED ? 'acceptée' : 'refusée';
    await this.notificationsService.create({
      userId: booking.user.id,
      type: status === BookingStatus.APPROVED ? 'booking_approved' : 'booking_rejected',
      title: `Demande ${statusText}`,
      message: `Votre demande de réservation pour "${booking.equipment.name}" a été ${statusText}`,
      relatedId: id,
      relatedType: 'booking',
    });

    // If rejected, delete the booking entirely
    if (status === BookingStatus.REJECTED) {
      await this.repo.remove(booking);
      return { message: 'Booking rejected and deleted', id };
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
