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
    topicId: string,
  ): Promise<Notification> {
    const notification = await this.prisma.notification.create({
      data: { userId, content, topicId },
    });

    this.notificationGateway.handleNotificationCreated(notification);
    this.notificationGateway.emitNotification({ notification, topicId });
    const notifications = await this.prisma.notification.findMany({
      where: {
        userId,
        isRead: false,
      },
    });
    this.notificationGateway.emitNumberOfNotifications({
      notificationsCount: notifications.length,
      id: userId,
    });
    this.notificationGateway.emitUnreadNotifications({
      unreadNotifications: notifications,
      id: userId,
    });
    return notification;
  }

  async getUnreadNotificationsForUser(userId: string) {
    const unreadNotifications = await this.prisma.notification.findMany({
      where: {
        OR: [
          { isRead: false, userId },
          {
            isRead: true,
            userId,
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          },
        ],
      },
      orderBy: {
        isRead: 'asc',
      },
    });
    const unreadCount = unreadNotifications.filter((n) => !n.isRead).length;
    return {
      count: unreadCount,
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
    this.notificationGateway.emitNumberOfNotifications({
      notificationsCount: count,
      id: userId,
    });
  }
}
