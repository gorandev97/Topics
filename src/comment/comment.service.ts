import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class CommentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async create(createCommentDto: CreateCommentDto, email: string) {
    const { topicId, content } = createCommentDto;
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

  async findManyByTopicId(skip: number, take: number, id: string) {
    return await this.prisma.comment.findMany({
      skip,
      take,
      where: {
        topicId: id,
      },
      include: {
        author: true,
        likes: true,
      },
      orderBy: { likesCount: 'desc' },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} comment`;
  }

  update(id: number, updateCommentDto: UpdateCommentDto) {
    return `This action updates a #${id} comment`;
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      include: { topic: true, author: true },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.postedBy !== userId && comment.topic.postedBy !== userId) {
      throw new ForbiddenException(
        'You are not allowed to delete this comment',
      );
    }

    return this.prisma.comment.delete({
      where: { id: commentId },
    });
  }

  async editComment(commentId: string, content: string, email: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email } });
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
      data: { content },
    });
  }
}
