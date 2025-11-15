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
} from '@nestjs/common';
import { FileInterceptor, AnyFilesInterceptor } from '@nestjs/platform-express';
import { Req } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('upload')
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

    if (!file) {
      return { error: 'No file received. Make sure the request is multipart/form-data and contains a file.' };
    }

    return this.productsService.create({
      ...body,
      imageUrl: file.filename,
    });
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
