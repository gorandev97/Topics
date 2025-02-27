import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { TopicsService } from 'src/topics/topics.service';
import { ReplyCommentDto } from './dto/create-reply.dto';

@Injectable()
export class CommentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly usersService: UsersService,
    private readonly topicsService: TopicsService,
  ) {}

  async create(createCommentDto: CreateCommentDto, email: string) {
    const { topicId, content } = createCommentDto;
    const user = await this.usersService.findOne(email);
    const topic = await this.topicsService.findOne(topicId);
    if (topic.author.id !== user.id)
      this.notificationsService.createNotification(
        topic.author.id,
        `${user.firstName + ' ' + user.lastName} has commented on your ${topic.title} topic`,
        topic.id,
      );
    return this.prisma.comment.create({
      data: {
        content,
        topic: {
          connect: {
            id: topicId,
          },
        },
        author: {
          connect: {
            email: email,
          },
        },
      },
    });
  }

  async replyToComment(replyToComment: ReplyCommentDto, email: string) {
    const { topicId, content, commentId } = replyToComment;
    const user = await this.usersService.findOne(email);
    const topic = await this.topicsService.findOne(topicId);
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (topic.author.id !== user.id)
      this.notificationsService.createNotification(
        topic.author.id,
        `${user.firstName + ' ' + user.lastName} has replied to your comment`,
        topicId,
      );
    return this.prisma.comment.create({
      data: {
        content,
        topic: {
          connect: {
            id: topicId,
          },
        },
        author: {
          connect: {
            email: email,
          },
        },
        parentComment: {
          connect: {
            id: commentId,
          },
        },
      },
    });
  }

  async findManyByTopicId(skip: number, take: number, id: string) {
    return await this.prisma.comment.findMany({
      skip,
      take,
      where: {
        topicId: id,
        parentCommentId: null,
      },
      include: {
        author: true,
        likes: {
          include: {
            user: true,
          },
        },
        replies: {
          include: {
            author: true,
          },
          orderBy: { likesCount: 'desc' },
        },
      },
      orderBy: { likesCount: 'desc' },
    });
  }

  async update(id: string, updateTopicDto: UpdateCommentDto) {
    const existingComment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!existingComment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    const updatedTopic = await this.prisma.comment.update({
      where: { id },
      data: {
        content: updateTopicDto.content,
      },
    });

    return updatedTopic;
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      include: { topic: true, author: true },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.postedBy !== userId) {
      throw new ForbiddenException(
        'You are not allowed to delete this comment',
      );
    }
    const comments = await this.prisma.comment.deleteMany({
      where: { parentCommentId: commentId },
    });

    return this.prisma.comment.delete({
      where: { id: commentId },
    });
  }

  async editComment(
    commentId: string,
    commentData: UpdateCommentDto,
    id: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.postedBy !== user.id) {
      throw new ForbiddenException('You are not allowed to edit this comment');
    }
    return this.prisma.comment.update({
      where: { id: commentId },
      data: { content: commentData.content },
    });
  }
}
