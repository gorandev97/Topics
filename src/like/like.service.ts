import { Injectable } from '@nestjs/common';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LikeService {
  constructor(private readonly prisma: PrismaService) {}
  create(createLikeDto: CreateLikeDto) {
    return 'This action adds a new like';
  }

  async toggleLikeDislike(
    userId: string,
    targetId: string,
    isTopic: boolean,
    isLike: boolean,
  ) {
    // Step 1: Determine if it's a topic or comment
    const target = isTopic
      ? await this.prisma.topic.findUnique({
          where: { id: targetId },
        })
      : await this.prisma.comment.findUnique({
          where: { id: targetId },
        });

    if (!target) {
      throw new Error(isTopic ? 'Topic not found' : 'Comment not found');
    }

    // Step 2: Check if the user has already liked or disliked the target
    const existingLike = isTopic
      ? await this.prisma.like.findFirst({
          where: {
            userId: userId,
            topicId: targetId,
          },
        })
      : await this.prisma.like.findFirst({
          where: {
            userId: userId,
            commentId: targetId,
          },
        });

    if (existingLike) {
      if (existingLike.isLike === isLike) {
        // If it's the same like/dislike, ignore (user cannot like/dislike again)
        throw new Error('User has already performed this action.');
        return;
      } else {
        // Step 3: If it's a different like/dislike (e.g., switching from like to dislike or vice versa)

        // Remove the old like/dislike
        await this.prisma.like.delete({
          where: { id: existingLike.id },
        });

        // Update counts: Decrease the old count (like or dislike)
        if (existingLike.isLike) {
          // Was a like, now changing to dislike
          await this.prisma.topic.update({
            where: { id: targetId },
            data: {
              likesCount: target.likesCount - 1,
              dislikesCount: target.dislikesCount + 1,
            },
          });
        } else {
          // Was a dislike, now changing to like
          await this.prisma.topic.update({
            where: { id: targetId },
            data: {
              likesCount: target.likesCount + 1,
              dislikesCount: target.dislikesCount - 1,
            },
          });
        }

        // Step 4: Create a new like/dislike with the updated action (like or dislike)
        await this.prisma.like.create({
          data: {
            userId: userId,
            topicId: isTopic ? targetId : null,
            commentId: isTopic ? null : targetId,
            isLike: isLike,
          },
        });

        throw new Error('Like/dislike has been toggled.');
      }
    } else {
      const existingDislike = isTopic
        ? await this.prisma.like.findFirst({
            where: {
              userId: userId,
              topicId: targetId,
              isLike: false,
            },
          })
        : await this.prisma.like.findFirst({
            where: {
              userId: userId,
              commentId: targetId,
              isLike: false,
            },
          });

      if (existingDislike) {
        if (isLike === false) {
          throw new Error('User has already disliked this post.');
        }
      }
      const existingLike = isTopic
        ? await this.prisma.like.findFirst({
            where: {
              userId: userId,
              topicId: targetId,
              isLike: true,
            },
          })
        : await this.prisma.like.findFirst({
            where: {
              userId: userId,
              commentId: targetId,
              isLike: true,
            },
          });

      if (existingLike) {
        if (isLike === true) {
          // If the user is trying to like a post they've already liked, do nothing
          throw new Error('User has already liked this post.');
          return;
        }
      }

      // Now, create the like/dislike record
      await this.prisma.like.create({
        data: {
          userId: userId,
          topicId: isTopic ? targetId : null,
          commentId: isTopic ? null : targetId,
          isLike: isLike,
        },
      });

      // Update the counts: Increment the appropriate count (like or dislike)
      if (isTopic) {
        await this.prisma.topic.update({
          where: { id: targetId },
          data: {
            likesCount: target.likesCount + (isLike ? 1 : 0),
            dislikesCount: target.dislikesCount + (isLike ? 0 : 1),
          },
        });
      } else {
        await this.prisma.comment.update({
          where: { id: targetId },
          data: {
            likesCount: target.likesCount + (isLike ? 1 : 0),
            dislikesCount: target.dislikesCount + (isLike ? 0 : 1),
          },
        });
      }

      throw new Error('New like/dislike added.');
    }
  }
  findAll() {
    return `This action returns all like`;
  }

  findOne(id: number) {
    return `This action returns a #${id} like`;
  }

  update(id: number, updateLikeDto: UpdateLikeDto) {
    return `This action updates a #${id} like`;
  }

  remove(id: number) {
    return `This action removes a #${id} like`;
  }
}
