import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';

// Public controller to expose read-only user profiles by id
@Controller('profiles')
export class PublicUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  async getPublicProfile(@Param('id', ParseIntPipe) id: number) {
    // Reuse getProfile to strip sensitive fields
    return this.usersService.getProfile(id);
  }
}
