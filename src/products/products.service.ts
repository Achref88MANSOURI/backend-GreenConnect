import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private repo: Repository<Product>,
  ) {}

  create(dto: CreateProductDto, farmerId: number) {
    return this.repo.save({
      ...dto,
      farmer: { id: farmerId }
    });
  }

  findAll() {
    return this.repo.find({ relations: ['farmer'] });
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id }, relations: ['farmer'] });
  }

  update(id: number, dto: UpdateProductDto) {
    return this.repo.update(id, dto);
  }

  remove(id: number) {
    return this.repo.delete(id);
  }
}
