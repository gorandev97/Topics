import { Injectable, NotAcceptableException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LikeService {
  constructor(private readonly prisma: PrismaService) {}

  async toggleLikeDislike(
    userId: string,
    targetId: string,
    isTopic: boolean,
    isLike: boolean,
  ) {
    const existingLike = isTopic
      ? await this.prisma.like.findFirst({
          where: {
            userId: userId,
            topicId: targetId,
          },
        })
      : await this.prisma.like.findFirst({
          where: { userId: userId, commentId: targetId },
        });
    if (!existingLike) {
      if (isTopic) {
        if (isLike) {
          await this.prisma.topic.update({
            where: {
              id: targetId,
            },
            data: {
              likesCount: { increment: 1 },
            },
          });
        } else {
          await this.prisma.topic.update({
            where: {
              id: targetId,
            },
            data: {
              dislikesCount: { increment: 1 },
            },
          });
        }
      } else {
        if (isLike) {
          await this.prisma.comment.update({
            where: {
              id: targetId,
            },
            data: {
              likesCount: { increment: 1 },
            },
          });
        } else {
          await this.prisma.comment.update({
            where: {
              id: targetId,
            },
            data: {
              dislikesCount: { increment: 1 },
            },
          });
        }
      }

      return this.prisma.like.create({
        data: {
          userId,
          topicId: isTopic ? targetId : null,
          commentId: !isTopic ? targetId : null,
          isLike: isLike,
        },
        include: {
          topic: true,
          comment: true,
        },
      });
    } else if (existingLike.isLike === isLike) {
      throw new NotAcceptableException('User already performed this action.');
    } else {
      if (isTopic) {
        if (isLike) {
          await this.prisma.topic.update({
            where: {
              id: targetId,
            },
            data: {
              likesCount: { increment: 1 },
              dislikesCount: { decrement: 1 },
            },
          });
        } else {
          await this.prisma.topic.update({
            where: {
              id: targetId,
            },
            data: {
              likesCount: { decrement: 1 },
              dislikesCount: { increment: 1 },
            },
          });
        }
      } else {
        if (isLike) {
          await this.prisma.comment.update({
            where: {
              id: targetId,
            },
            data: {
              likesCount: { increment: 1 },
              dislikesCount: { decrement: 1 },
            },
          });
        } else {
          await this.prisma.comment.update({
            where: {
              id: targetId,
            },
            data: {
              likesCount: { decrement: 1 },
              dislikesCount: { increment: 1 },
            },
          });
        }
      }

      return this.prisma.like.update({
        where: {
          id: existingLike.id,
        },
        data: {
          isLike: isLike,
        },
        include: {
          topic: true,
          comment: true,
        },
      });
    }
  }
}
