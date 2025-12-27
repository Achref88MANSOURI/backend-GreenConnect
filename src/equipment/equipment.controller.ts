/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { EquipmentService } from './equipment.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

const storage = diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    const filename = `${uuidv4()}${extname(file.originalname)}`;
    cb(null, filename);
  },
});

@Controller('equipment')
export class EquipmentController {
  constructor(private readonly service: EquipmentService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'images', maxCount: 10 },
      ],
      { storage },
    ),
  )
  async create(
    @Body() rawDto: any,
    @UploadedFiles() files: { images?: Express.Multer.File[] },
    @Req() req
  ) {
    // Convert form data values to proper types
    const parsedDto: CreateEquipmentDto = {
      name: String(rawDto.name || '').trim(),
      description: String(rawDto.description || '').trim(),
      category: String(rawDto.category || '').trim(),
      location: String(rawDto.location || '').trim(),
      pricePerDay: parseFloat(rawDto.pricePerDay) || 0,
      availability: rawDto.availability === 'true' || rawDto.availability === true,
      images: files?.images ? files.images.map((f) => `/uploads/${f.filename}`) : [],
    };

    // Validate required fields
    if (!parsedDto.name) throw new BadRequestException('name is required');
    if (!parsedDto.description) throw new BadRequestException('description is required');
    if (!parsedDto.category) throw new BadRequestException('category is required');
    if (parsedDto.pricePerDay <= 0) throw new BadRequestException('pricePerDay must be a positive number');
    if (!parsedDto.location) throw new BadRequestException('location is required');
    
    return this.service.create(parsedDto, req.user);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEquipmentDto, @Req() req) {
    return this.service.update(+id, dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.service.remove(+id, req.user);
  }
}
