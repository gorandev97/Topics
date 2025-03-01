import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { TopicCategory } from '@prisma/client';
import * as AWS from 'aws-sdk';
import sizeOf from 'image-size';

@Injectable()
export class TopicsService {
  constructor(private readonly prisma: PrismaService) {}

  AWS_S3_BUCKET = process.env.AWS_BUCKET_NAME;
  s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });

  async create(
    createTopicDto: CreateTopicDto,
    email: string,
    file: Express.Multer.File,
  ) {
    let image = null;
    if (file) {
      const { originalname } = file;

      const dimensions = sizeOf(file.buffer);
      const { width, height } = dimensions;

      if (width > 1024 || height > 1024) {
        throw new Error('Image dimensions must be 1024x1024 or smaller.');
      }
      const imageData = await this.s3_upload(
        file.buffer,
        this.AWS_S3_BUCKET,
        originalname + Date.now(),
        file.mimetype,
      );
      image = imageData.Location;
    }
    return this.prisma.topic.create({
      data: {
        ...createTopicDto,
        image: image,
        category: createTopicDto.category as TopicCategory,
        author: {
          connect: { email: email },
        },
      },
    });
  }

  async s3_upload(file, bucket, name, mimetype) {
    const params = {
      Bucket: bucket,
      Key: String(name),
      Body: file,
      ContentType: mimetype,
      ContentDisposition: 'inline',
      CreateBucketConfiguration: {
        LocationConstraint: process.env.AWS_REGION,
      },
    };

    try {
      let s3Response = await this.s3.upload(params).promise();
      return s3Response;
    } catch (e) {
      console.log(e);
    }
  }

  async findAll(
    skip: number,
    take: number,
    search?: string,
    category?: string,
  ) {
    return await this.prisma.topic.findMany({
      where: {
        AND: [
          search ? { title: { contains: search, mode: 'insensitive' } } : {},
          category ? { category: category as TopicCategory } : {},
        ],
      },
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

  async findAllByLikes(
    skip: number,
    take: number,
    search?: string,
    category?: string,
  ) {
    return await this.prisma.topic.findMany({
      where: {
        AND: [
          search ? { title: { contains: search, mode: 'insensitive' } } : {},
          category ? { category: category as TopicCategory } : {},
        ],
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

  async findAllCreatedByMe(
    skip: number,
    take: number,
    userId: string,
    search?: string,
    category?: string,
  ) {
    return await this.prisma.topic.findMany({
      where: {
        AND: [
          search ? { title: { contains: search, mode: 'insensitive' } } : {},
          category ? { category: category as TopicCategory } : {},
          { postedBy: userId },
        ],
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

  async update(
    id: string,
    updateTopicDto: UpdateTopicDto,
    userId,
    file: Express.Multer.File,
  ) {
    const topic = await this.prisma.topic.findUnique({
      where: { id },
    });

    if (!topic) {
      throw new NotFoundException(`Topic with ID ${id} not found`);
    }
    if (topic.postedBy !== userId) {
      throw new Error('You are not authorized to delete this topic.');
    }

    if (file) {
      const { originalname } = file;

      const dimensions = sizeOf(file.buffer);
      const { width, height } = dimensions;

      if (width > 1024 || height > 1024) {
        throw new Error('Image dimensions must be 1024x1024 or smaller.');
      }
      const imageData = await this.s3_upload(
        file.buffer,
        this.AWS_S3_BUCKET,
        originalname + Date.now(),
        file.mimetype,
      );

      const updatedTopic = await this.prisma.topic.update({
        where: { id },
        data: {
          title: updateTopicDto.title,
          description: updateTopicDto.content,
          category: updateTopicDto.category as TopicCategory,
          image: imageData.Location,
        },
      });
      return updatedTopic;
    }

    const updatedTopic = await this.prisma.topic.update({
      where: { id },
      data: {
        title: updateTopicDto.title,
        description: updateTopicDto.content,
        category: updateTopicDto.category as TopicCategory,
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
    if (topic.image) {
      const key = topic.image.split('/').pop();
      await this.s3
        .deleteObject({
          Bucket: this.AWS_S3_BUCKET,
          Key: key,
        })
        .promise();
    }
    return await this.prisma.topic.delete({
      where: {
        id: topicId,
        postedBy: userId,
      },
    });
  }
}
