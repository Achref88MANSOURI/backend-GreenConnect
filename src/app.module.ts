// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DataSource } from 'typeorm';
import { User, UserRole } from './users/entities/user.entity';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { EquipmentModule } from './equipment/equipment.module';
import { BookingModule } from './booking/booking.module';
import { TawsselModule } from './tawssel/tawssel.module';
import { AdminModule } from './admin/admin.module';
import { InvestmentsModule } from './investments/investments.module';
import { InvestmentProject } from './investments/entities/investment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Serve static assets from the frontend public folder (safe in dev)
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'front-end', 'public'),
      exclude: ['/api/(.*)'],
    }),

    // Serve uploaded files
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
      exclude: ['/api/(.*)'],
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
    TawsselModule,
    InvestmentsModule,
    AdminModule,
  ],
  controllers: [],
  providers: [
    {
      provide: 'SEED_DB',
      inject: [DataSource],
      useFactory: async (dataSource: DataSource) => {
        try {
          // Seed user
          const userRepo = dataSource.getRepository(User);
          let seedUser = await userRepo.findOne({ where: { id: 1 } });
          if (!seedUser) {
            seedUser = userRepo.create({ name: 'Seed User', email: 'seed@example.com', password: 'password', role: UserRole.USER });
            seedUser = await userRepo.save(seedUser);
            console.log('Seed user created with id', seedUser.id);
          } else {
            console.log('Seed user already exists with id', seedUser.id);
          }

          // Seed investment projects - DISABLED (database is empty by user request)
          /*
          const projectRepo = dataSource.getRepository(InvestmentProject);
          const projectCount = await projectRepo.count();
          
          if (projectCount === 0) {
            const projects = [
              {
                title: 'Blé Premium - Région Kairouan',
                description: 'Terre de 50 hectares pour la culture du blé de haute qualité. Sol fertile avec accès à l\'eau d\'irrigation.',
                category: 'Blé',
                location: 'Kairouan',
                targetAmount: 50,  // areaHectares
                currentAmount: 150, // leasePrice per month
                minimumInvestment: 3,  // min months
                expectedROI: 12,       // max months
                duration: 12,
                fundingDeadline: new Date(new Date().getTime() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
                images: ['https://via.placeholder.com/400x300?text=Blé+Kairouan'],
                ownerId: seedUser.id,
                status: 'active',
              },
              {
                title: 'Olives Koroneiki - Sfax',
                description: 'Verger d\'olives matures de 30 hectares. Variété Koroneiki pour huile de qualité. Rendement excellent.',
                category: 'Olives',
                location: 'Sfax',
                targetAmount: 30,
                currentAmount: 200,
                minimumInvestment: 6,
                expectedROI: 12,
                duration: 12,
                fundingDeadline: new Date(new Date().getTime() + 120 * 24 * 60 * 60 * 1000),
                images: ['https://via.placeholder.com/400x300?text=Olives+Sfax'],
                ownerId: seedUser.id,
                status: 'active',
              },
              {
                title: 'Dattes Deglet Noor - Tozeur',
                description: 'Plantation de 25 hectares de dattes Deglet Noor. Production certifiée. Marché garanti.',
                category: 'Dattes',
                location: 'Tozeur',
                targetAmount: 25,
                currentAmount: 250,
                minimumInvestment: 4,
                expectedROI: 12,
                duration: 12,
                fundingDeadline: new Date(new Date().getTime() + 100 * 24 * 60 * 60 * 1000),
                images: ['https://via.placeholder.com/400x300?text=Dattes+Tozeur'],
                ownerId: seedUser.id,
                status: 'active',
              },
              {
                title: 'Cultures Maraîchères - Manouba',
                description: 'Terrain de 15 hectares pour tomates, poivrons et concombres. Très rentable. Irrigation complète.',
                category: 'Maraîchage',
                location: 'Manouba',
                targetAmount: 15,
                currentAmount: 300,
                minimumInvestment: 2,
                expectedROI: 8,
                duration: 8,
                fundingDeadline: new Date(new Date().getTime() + 60 * 24 * 60 * 60 * 1000),
                images: ['https://via.placeholder.com/400x300?text=Maraîchage+Manouba'],
                ownerId: seedUser.id,
                status: 'active',
              },
              {
                title: 'Raisin de Table - Nabeul',
                description: 'Vignoble de 20 hectares produisant du raisin de table export. Infrastructure moderne.',
                category: 'Raisin',
                location: 'Nabeul',
                targetAmount: 20,
                currentAmount: 180,
                minimumInvestment: 5,
                expectedROI: 10,
                duration: 10,
                fundingDeadline: new Date(new Date().getTime() + 110 * 24 * 60 * 60 * 1000),
                images: ['https://via.placeholder.com/400x300?text=Raisin+Nabeul'],
                ownerId: seedUser.id,
                status: 'active',
              },
            ];

            for (const project of projects) {
              const newProject = projectRepo.create(project);
              await projectRepo.save(newProject);
            }
            console.log(`Seeded ${projects.length} investment projects`);
          } else {
            console.log(`Investment projects already exist (${projectCount} found)`);
          }
          */
        } catch (err) {
          console.warn('Seed provider error:', err.message || err);
        }
      },
    },
  ],
})
export class AppModule {}