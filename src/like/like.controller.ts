import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpException,
  HttpStatus,
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
    if (!userId || !targetId || isLike === undefined || isTopic === undefined) {
      throw new HttpException(
        'Missing required parameters',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      return await this.likeService.toggleLikeDislike(
        userId,
        targetId,
        isTopic,
        isLike,
      );
    } catch (error) {
      console.error(error);
      throw new HttpException(
        error || 'An error occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
