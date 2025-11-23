import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Notification } from './entities/notification.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  create(data: Partial<User>) {
    const user = this.userRepo.create(data);
    return this.userRepo.save(user);
  }

  findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } });
  }

  findById(id: number) {
    return this.userRepo.findOne({ where: { id } });
  }

  async getProfile(id: number) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  async updateProfile(id: number, dto: UpdateProfileDto) {
    await this.userRepo.update(id, dto);
    return this.getProfile(id);
  }

  async getSettings(id: number) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user.settings || {};
  }

  async updateSettings(id: number, dto: UpdateSettingsDto) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    
    user.settings = { ...user.settings, ...dto };
    await this.userRepo.save(user);
    return user.settings;
  }

  async getNotifications(userId: number) {
    return this.notificationRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async markNotificationRead(id: number, userId: number) {
    const notification = await this.notificationRepo.findOne({
      where: { id, user: { id: userId } },
    });
    if (!notification) throw new NotFoundException('Notification not found');
    
    notification.isRead = true;
    return this.notificationRepo.save(notification);
  }
}
