import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Notification } from './entities/notification.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PublicUsersController } from './public-users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Notification])],
  controllers: [UsersController, PublicUsersController],
  providers: [UsersService],
  exports: [UsersService], // <--- OBLIGATOIRE POUR AUTH
})
export class UsersModule {}
