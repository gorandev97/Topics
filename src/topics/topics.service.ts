import { Injectable } from '@nestjs/common';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class TopicsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async create(createTopicDto: CreateTopicDto, email: string) {
    return this.prisma.topic.create({
      data: {
        ...createTopicDto,
        author: {
          connect: { email: email },
        },
      },
    });
  }

  findAll(skip: number, take: number) {
    return this.prisma.topic.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { comments: true },
        },
        comments: true,
        likes: true,
        author: true,
      },
    });
  }

  findAllByLikes(skip: number, take: number) {
    return this.prisma.topic.findMany({
      skip,
      take,
      orderBy: { likesCount: 'desc' },
      include: {
        _count: {
          select: { comments: true },
        },
        comments: true,
        likes: true,
        author: true,
      },
    });
  }

  async findOne(id: string) {
    const topic = await this.prisma.topic.findUnique({
      where: {
        id,
      },
      include: {
        comments: true,
        likes: true,
      },
    });
    console.log(topic);
    return await this.prisma.topic.findUnique({
      where: {
        id,
      },
      include: {
        author: true,
        comments: true,
        likes: true,
      },
    });
  }

  update(id: number, updateTopicDto: UpdateTopicDto) {
    return `This action updates a #${id} topic`;
  }

  remove(id: number) {
    return `This action removes a #${id} topic`;
  }
}
