import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CarriersService } from '../tawssel/carriers.service';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly carriersService: CarriersService,
  ) {}

  // REGISTER
  async register(dto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const created = await this.usersService.create({
      ...dto,
      password: hashedPassword,
    });

    // If the new user registered as a transporter, create a minimal Carrier profile
    try {
      if (dto.role === UserRole.TRANSPORTER) {
        const carrierPayload: any = {
          companyName: `Carrier-${created.id}`,
          contactEmail: created.email,
          userId: String(created.id),
          vehicleType: 'Not specified',
          capacity_kg: 0,
          serviceZones: [],
          pricePerKm: 0,
          pricePerTonne: 0,
          availability: [],
        };
        await this.carriersService.create(carrierPayload);
      }
    } catch (err) {
      // fail silently for now but log in console
      console.warn('Failed to auto-create carrier profile:', err?.message || err);
    }

    return created;
  }

  // LOGIN
  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate JWT
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      message: 'Login successful',
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}
