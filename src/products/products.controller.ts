import { Controller, Post, Get, Patch, Delete, Body, Param, Request, UseInterceptors, UploadedFile, ParseIntPipe, Inject } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';
import { User } from '../user.entity';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly products: ProductsService,
    @Inject(DataSource) private readonly dataSource: DataSource,
  ) {}

  @Post()
  async create(@Body() dto: CreateProductDto, @Request() req) {
    let farmerId = req?.user?.id;
    if (!farmerId) {
      // find any existing user in the users table to use as farmer
      const userRepo = this.dataSource.getRepository(User);
      const anyUser = await userRepo.findOne({ where: {} });
      if (anyUser) farmerId = anyUser.id;
    }

    if (!farmerId) {
      return { error: 'No farmer available. Create a user first.' };
    }

    return this.products.create(dto, farmerId);
  }

  @Get()
  findAll() {
    return this.products.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.products.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.products.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.products.remove(id);
  }
  
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file: any) {
    return { url: `/uploads/${file.filename}` };
  }

}
