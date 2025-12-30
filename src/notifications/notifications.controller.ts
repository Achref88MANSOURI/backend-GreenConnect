import { Controller, Get, Patch, Delete, Param, ParseIntPipe, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Get unread count for the current user
   * GET /notifications/unread-count
   * NOTE: This route MUST be declared BEFORE any :id routes
   */
  @Get('unread-count')
  @UseGuards(JwtAuthGuard)
  async getUnreadCount(@Req() req) {
    const userId = req.user?.id;
    const count = await this.notificationsService.getUnreadCount(userId);
    return { count };
  }

  /**
   * Get all notifications for the current user
   * GET /notifications
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async getAll(@Req() req) {
    const userId = req.user?.id;
    return this.notificationsService.findAllForUser(userId);
  }

  /**
   * Mark all notifications as read
   * PATCH /notifications/mark-all-read
   * NOTE: This route MUST be declared BEFORE any :id routes
   */
  @Patch('mark-all-read')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(@Req() req) {
    const userId = req.user?.id;
    await this.notificationsService.markAllAsRead(userId);
    return { success: true };
  }

  /**
   * Mark a specific notification as read
   * PATCH /notifications/:id/read
   */
  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async markAsRead(@Req() req, @Param('id', ParseIntPipe) id: number) {
    const userId = req.user?.id;
    const notification = await this.notificationsService.markAsRead(id, userId);
    return notification || { success: false, message: 'Notification non trouvée' };
  }

  /**
   * Delete a notification
   * DELETE /notifications/:id
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async delete(@Req() req, @Param('id', ParseIntPipe) id: number) {
    const userId = req.user?.id;
    const deleted = await this.notificationsService.delete(id, userId);
    return { success: deleted };
  }
}
