/* eslint-disable prettier/prettier */
 
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { TawsselModule } from '../tawssel/tawssel.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './roles.guard';
@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: 'supersecretkey123',
      signOptions: { expiresIn: '7d' },
    }),
    TawsselModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy,RolesGuard],
  exports: [AuthService],
})
export class AuthModule {}