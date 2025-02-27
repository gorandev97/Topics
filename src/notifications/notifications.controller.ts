import {
  Controller,
  Post,
  Body,
  Get,
  Request,
  UseGuards,
  Put,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationService: NotificationsService) {}

  @Post()
  createNotification(@Body() notificationData: CreateNotificationDto) {
    return this.notificationService.createNotification(
      notificationData.userId,
      notificationData.content,
      notificationData.topicId,
    );
  }

  @Get()
  getNotificationForUser(@Request() res) {
    return this.notificationService.getUnreadNotificationsForUser(res.user.id);
  }

  @Put()
  updateNotifications(@Request() res) {
    return this.notificationService.markAllAsRead(res.user.id);
  }
}
