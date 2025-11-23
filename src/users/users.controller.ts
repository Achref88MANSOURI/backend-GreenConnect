import { Controller, Get, Patch, Body, UseGuards, Req, Param, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  getProfile(@Req() req) {
    return this.usersService.getProfile(req.user.id);
  }

  @Patch('profile')
  updateProfile(@Req() req, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, dto);
  }

  @Get('settings')
  getSettings(@Req() req) {
    return this.usersService.getSettings(req.user.id);
  }

  @Patch('settings')
  updateSettings(@Req() req, @Body() dto: UpdateSettingsDto) {
    return this.usersService.updateSettings(req.user.id, dto);
  }

  @Get('notifications')
  getNotifications(@Req() req) {
    return this.usersService.getNotifications(req.user.id);
  }

  @Patch('notifications/:id/read')
  markNotificationRead(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.usersService.markNotificationRead(id, req.user.id);
  }
}
