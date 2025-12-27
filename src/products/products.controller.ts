import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Delete,
  UploadedFile,
  UseInterceptors,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { FileInterceptor, AnyFilesInterceptor } from '@nestjs/platform-express';
import { Req } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UseGuards, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { User as UserDecorator } from '../users/decorators/user.decorator';
import { Query } from '@nestjs/common';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, uniqueName + extname(file.originalname));
        },
      }),
    }),
  )
  async uploadProductImage(
    @Body() body: CreateProductDto,
    @Req() req: any,
    @UserDecorator() user: any,
  ) {
    // AnyFilesInterceptor populates `req.files`
    const files: any[] = req?.files || [];
    const file = files[0];
    // ensure uploads folder exists to avoid silent failures
    if (!existsSync('./uploads')) {
      mkdirSync('./uploads', { recursive: true });
    }

    // helpful debug log — remove in production
    console.log('uploadProductImage - received file:', !!file, file && file.filename);

    // Allow creating a product without an image; imageUrl stays undefined/null
    return this.productsService.create(
      {
        ...body,
        imageUrl: file ? file.filename : undefined,
        vendeur: user?.name ?? user?.username ?? 'Unknown',
      },
      user?.id,
    );
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  // Advanced search aligned with spec: location, harvest date range, quality, certifications
  @Get('search')
  async search(
    @Query('location') location?: string,
    @Query('harvestFrom') harvestFrom?: string,
    @Query('harvestTo') harvestTo?: string,
    @Query('minQuality') minQuality?: string,
    @Query('cert') cert?: string, // single cert or comma-separated
  ) {
    return this.productsService.search({ location, harvestFrom, harvestTo, minQuality, cert });
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  mine(@UserDecorator() user: any) {
    return this.productsService.mine(user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
    @UserDecorator() user: any,
  ) {
    const product = await this.productsService.findOne(id);
    if (!product) {
      throw new ForbiddenException('Product not found');
    }
    const ownerId = product.farmer?.id ?? null;
    if (!ownerId || ownerId !== user?.id) {
      throw new ForbiddenException('You are not allowed to modify this product');
    }
    return this.productsService.update(id, dto);
  }

  // Update only the product image via multipart upload
  @Patch(':id/image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, uniqueName + extname(file.originalname));
        },
      }),
    }),
  )
  async updateImage(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @UserDecorator() user: any,
  ) {
    const product = await this.productsService.findOne(id);
    if (!product) {
      throw new ForbiddenException('Product not found');
    }
    const ownerId = product.farmer?.id ?? null;
    if (!ownerId || ownerId !== user?.id) {
      throw new ForbiddenException('You are not allowed to modify this product');
    }

    // ensure uploads folder exists
    if (!existsSync('./uploads')) {
      mkdirSync('./uploads', { recursive: true });
    }

    const files: any[] = req?.files || [];
    const file = files[0];
    if (!file) {
      // No file provided, nothing to update
      return this.productsService.findOne(id);
    }

    await this.productsService.update(id, { imageUrl: file.filename } as UpdateProductDto);
    return this.productsService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @UserDecorator() user: any,
  ) {
    const product = await this.productsService.findOne(id);
    if (!product) {
      throw new ForbiddenException('Product not found');
    }
    const ownerId = product.farmer?.id ?? null;
    if (!ownerId || ownerId !== user?.id) {
      throw new ForbiddenException('You are not allowed to delete this product');
    }
    return this.productsService.remove(id);
  }
}
