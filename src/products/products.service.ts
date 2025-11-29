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

  // Overload signatures: support create(data:any) or create(dto, farmerId)
  create(data: any): Promise<Product>;
  create(dto: CreateProductDto, farmerId: number): Promise<any>;
  async create(a: any, b?: any): Promise<any> {
    // If called with (dto, farmerId)
    if (b !== undefined) {
      return this.repo.save({ ...a, farmer: { id: b } });
    }

    // If called with single `data` object
    const product = this.repo.create(a);
    return this.repo.save(product);
  }

  findAll() {
    return this.repo.find({ relations: ['farmer'] });
  }

  mine(userId: number) {
    return this.repo.find({
      where: { farmer: { id: userId } },
      relations: ['farmer'],
    });
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
