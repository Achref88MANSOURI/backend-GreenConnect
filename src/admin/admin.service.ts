/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  getAllUsers() {
    return this.userRepo.find();
  }

  getUser(id: number) {
    return this.userRepo.findOne({
      where: { id },
    });
  }

  updateUserStatus(id: number, active: boolean) {
    return this.userRepo.update(
      { id },
      { isActive: active },
    );
  }
}
