import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TopicsModule } from './topics/topics.module';
import { LikeModule } from './like/like.module';
import { CommentModule } from './comment/comment.module';

@Module({
  imports: [AuthModule, UsersModule, TopicsModule, LikeModule, CommentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
