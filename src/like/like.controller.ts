import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { LikeService } from './like.service';
import { AuthGuard } from 'src/auth/auth.guard';
@UseGuards(AuthGuard)
@Controller('like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post()
  async toggleLikeDislike(
    @Body()
    body: {
      likeCredentials: {
        userId: string;
        targetId: string;
        isTopic: boolean;
        isLike: boolean;
      };
    },
  ) {
    const { userId, targetId, isTopic, isLike } = body.likeCredentials;
    console.log('usao u controller', body);
    if (!userId || !targetId || isLike === undefined || isTopic === undefined) {
      return { error: 'Missing required parameters' };
    }
    console.log('usao u controller');
    try {
      await this.likeService.toggleLikeDislike(
        userId,
        targetId,
        isTopic,
        isLike,
      );
      return { message: 'Like/dislike action successful' };
    } catch (error) {
      console.error(error);
      return {
        error: 'Something went wrong while processing the like/dislike',
      };
    }
  }
}
