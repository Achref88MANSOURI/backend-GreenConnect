import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),  // <<---- OBLIGATOIRE
    MulterModule.register({
      dest: './uploads', // Définit un dossier de destination par défaut
    }),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService], // optionnel
})
export class ProductsModule {}
