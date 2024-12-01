import { Injectable } from '@nestjs/common';
import { NotificationGateway } from './notifications.gateway';
import { PrismaService } from '../prisma/prisma.service';
import { Notification } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async createNotification(
    userId: string,
    content: string,
  ): Promise<Notification> {
    const notification = await this.prisma.notification.create({
      data: { userId, content },
    });

    this.notificationGateway.handleNotificationCreated(notification);
    this.notificationGateway.emitNotification(notification);
    const notifications = await this.prisma.notification.findMany({
      where: {
        userId,
        isRead: false,
      },
    });
    this.notificationGateway.emitNumberOfNotifications(notifications.length);
    this.notificationGateway.emitUnreadNotifications(notifications);
    return notification;
  }

  async getUnreadNotificationsForUser(userId: string) {
    const unreadNotifications = await this.prisma.notification.findMany({
      where: { isRead: false, userId },
    });
    return {
      count: unreadNotifications.length,
      notifications: unreadNotifications,
    };
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: {
        userId,
      },
      data: {
        isRead: true,
      },
    });
    const count = await this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
    this.notificationGateway.emitNumberOfNotifications(count);
  }
}
