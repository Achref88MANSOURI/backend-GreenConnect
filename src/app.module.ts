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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USER', 'postgres'),
        password: config.get<string>('DB_PASS', 'admin'),
        database: config.get<string>('DB_NAME', 'greeenconnect'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        logging: true,
      }),
    }),

    UsersModule,
    AuthModule,
    ProductsModule,
    CartModule,
    OrdersModule,
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
