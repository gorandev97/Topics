import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { TopicsModule } from 'src/topics/topics.module';

@Module({
  imports: [PrismaModule, UsersModule, NotificationsModule, TopicsModule],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
