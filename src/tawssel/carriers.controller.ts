import { Controller, Get, Post, Put, Patch, Delete, Body, Param, HttpStatus, HttpCode, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
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
    @Req() req,
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

  // --- 2b. Mes Camions (transporteurs de l'utilisateur connecté) ---
  // Route: GET /carriers/mine
  @Get('mine')
  @UseGuards(JwtAuthGuard)
  findMine(@Req() req): Promise<Carrier[]> {
    return this.carriersService.findByUserId(req.user?.id);
  }

  // --- 3. Profil Transporteur (Page 25) ---
  // Route: GET /carriers/{id}
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Carrier> {
    return this.carriersService.findOne(id);
  }
  
  // --- 4. Mise à jour du Profil Transporteur (PUT) ---
  // Route: PUT /carriers/{id}
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCarrierDto: UpdateCarrierDto,
  ): Promise<Carrier> {
    return this.carriersService.update(id, updateCarrierDto, req.user?.id);
  }

  // --- 4b. Mise à jour partielle du Profil Transporteur (PATCH) ---
  // Route: PATCH /carriers/{id}
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  partialUpdate(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCarrierDto: UpdateCarrierDto,
  ): Promise<Carrier> {
    return this.carriersService.update(id, updateCarrierDto, req.user?.id);
  }

  // --- 5. Suppression d'un transporteur ---
  // Route: DELETE /carriers/{id}
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async remove(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.carriersService.remove(id, req.user?.id);
    return { message: 'Transporteur supprimé avec succès' };
  }

  // --- 6. Tableau de Bord Transporteur (Page 27) ---
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