import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Equipment } from './entities/equipment.entity';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class EquipmentService {
  constructor(
    @InjectRepository(Equipment)
    private readonly repo: Repository<Equipment>,
  ) {}

  create(dto: CreateEquipmentDto, owner: User) {
    const eq = this.repo.create({ ...dto, owner });
    return this.repo.save(eq);
  }

  findAll() {
    return this.repo.find({ relations: ['owner'] });
  }

  async findOne(id: number) {
    const eq = await this.repo.findOne({ where: { id }, relations: ['owner'] });
    if (!eq) throw new NotFoundException('Equipment not found');
    return eq;
  }

  async update(id: number, dto: UpdateEquipmentDto, user: User) {
    const eq = await this.findOne(id);
    if (eq.owner.id !== user.id) {
      throw new ForbiddenException('Not your equipment');
    }
    Object.assign(eq, dto);
    return this.repo.save(eq);
  }

  async remove(id: number, user: User) {
    const eq = await this.findOne(id);
    if (eq.owner.id !== user.id) {
      throw new ForbiddenException('Not your equipment');
    }
    return this.repo.remove(eq);
  }
}
