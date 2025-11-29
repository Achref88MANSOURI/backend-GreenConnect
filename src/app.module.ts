// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DataSource } from 'typeorm';
import { User, UserRole } from './users/entities/user.entity';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { EquipmentModule } from './equipment/equipment.module';
import { BookingModule } from './booking/booking.module';
import { TawsselModule } from './tawssel/tawssel.module'; // <-- NOUVEL IMPORT

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),

    UsersModule,
    AuthModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    EquipmentModule,
    BookingModule,
    TawsselModule, // <-- AJOUT DU MODULE TAWSSEL
  ],
  controllers: [],
  providers: [
    {
      provide: 'SEED_DB',
      inject: [DataSource],
      useFactory: async (dataSource: DataSource) => {
        try {
          const repo = dataSource.getRepository(User);
          const exists = await repo.findOne({ where: { id: 1 } });
          if (!exists) {
            const u = repo.create({ name: 'Seed User', email: 'seed@example.com', password: 'password', role: UserRole.BUYER });
            const saved = await repo.save(u);
            console.log('Seed user created with id', saved.id);
          } else {
            console.log('Seed user already exists with id', exists.id);
          }
        } catch (err) {
          console.warn('Seed provider error:', err.message || err);
        }
      },
    },
  ],
})
export class AppModule {}