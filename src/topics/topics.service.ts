import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TopicsService {
  constructor(private readonly prisma: PrismaService) {}

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

  async findAll(skip: number, take: number) {
    return await this.prisma.topic.findMany({
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

  async findAllByLikes(skip: number, take: number) {
    return await this.prisma.topic.findMany({
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

  async findAllCreatedByMe(skip: number, take: number, userId: string) {
    return await this.prisma.topic.findMany({
      where: {
        postedBy: userId,
      },
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

  async update(id: string, updateTopicDto: UpdateTopicDto, userId) {
    const topic = await this.prisma.topic.findUnique({
      where: { id },
    });

    if (!topic) {
      throw new NotFoundException(`Topic with ID ${id} not found`);
    }
    if (topic.postedBy !== userId) {
      throw new Error('You are not authorized to delete this topic.');
    }
    const updatedTopic = await this.prisma.topic.update({
      where: { id },
      data: {
        title: updateTopicDto.title,
        description: updateTopicDto.content,
      },
    });

    return updatedTopic;
  }

  async remove(topicId: string, userId: string) {
    const topic = await this.prisma.topic.findUnique({
      where: {
        id: topicId,
      },
    });
    if (!topic) {
      throw new Error('Topic not found.');
    }

    if (topic.postedBy !== userId) {
      throw new Error('You are not authorized to delete this topic.');
    }
    return await this.prisma.topic.delete({
      where: {
        id: topicId,
        postedBy: userId,
      },
    });
  }
}
