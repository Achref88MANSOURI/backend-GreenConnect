import { Controller, Get, Post, Put, Body, Param, HttpStatus, HttpCode, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { CarriersService } from './carriers.service';
import { CreateCarrierDto } from './dto/create-carrier.dto';
import { UpdateCarrierDto } from './dto/update-carrier.dto';
import { Carrier } from './entities/carrier.entity';
import { CreateCarrierRegistrationDto } from './dto/create-carrier-registration.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

// L'URL de base pour ce contrôleur sera /carriers
@Controller('carriers')
export class CarriersController {
  constructor(private readonly carriersService: CarriersService) {}

  // --- 1. Création de profil transporteur (Page 26) ---
  // Route: POST /carriers
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCarrierDto: CreateCarrierDto): Promise<Carrier> {
    // La validation du DTO se fait automatiquement via les pipes de NestJS
    return this.carriersService.create(createCarrierDto);
  }

  // --- 1b. Enregistrement spécial transporteur (lié à l'utilisateur authentifié) ---
  // Route: POST /carriers/register
  @Post('register')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  registerAsCarrier(
    @Req() req: Request & { user?: { id?: string } },
    @Body() dto: CreateCarrierRegistrationDto,
  ): Promise<Carrier> {
    const payload: any = { ...dto, userId: req.user?.id };
    // reuse the service create method (it expects userId in the payload)
    return this.carriersService.create(payload as CreateCarrierDto);
  }

  // --- 2. Transporteurs Disponibles (Page 24) ---
  // Route: GET /carriers
  @Get()
  findAll(): Promise<Carrier[]> {
    return this.carriersService.findAll();
  }

  // --- 3. Profil Transporteur (Page 25) ---
  // Route: GET /carriers/{id}
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Carrier> {
    return this.carriersService.findOne(id);
  }
  
  // --- 4. Mise à jour du Profil Transporteur ---
  // Route: PUT /carriers/{id}
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateCarrierDto: UpdateCarrierDto,
  ): Promise<Carrier> {
    return this.carriersService.update(id, updateCarrierDto);
  }

  // --- 5. Tableau de Bord Transporteur (Page 27) ---
  // Route: GET /carriers/dashboard (Cette route doit être placée avant :id !)
  // NOTE : Dans une application réelle, cette route nécessiterait une garde d'authentification 
  // pour s'assurer que seul le transporteur peut voir son tableau de bord.
  @Get('dashboard')
  getDashboard(): any {
    // La logique spécifique pour récupérer les données du tableau de bord 
    // (ex: livraisons en cours, revenus, notes) sera implémentée dans le service.
    // return this.carriersService.getDashboardData();
    return { message: "Données du tableau de bord transporteur" };
  }
}