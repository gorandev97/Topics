import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayInit,
  WsResponse,
  WebSocketServer,
} from '@nestjs/websockets';
import { Notification } from '@prisma/client';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class NotificationGateway implements OnGatewayInit {
  @WebSocketServer() server: Server;
  afterInit() {
    console.log('WebSocket Gateway Initialized');
  }

  @SubscribeMessage('notificationCreated')
  handleNotificationCreated(@MessageBody() data: any): WsResponse<any> {
    return { event: 'notification', data };
  }

  emitNotification(notificationData: Notification) {
    this.server.emit('notificationCreated', notificationData);
  }
  emitNumberOfNotifications(notificationsCount: {
    notificationsCount: number;
    id: string;
  }) {
    this.server.emit('notificationsCount', notificationsCount);
  }
  emitUnreadNotifications(unreadNotifications: {
    unreadNotifications: Notification[];
    id: string;
  }) {
    this.server.emit('unreadNotifications', unreadNotifications);
  }
}
