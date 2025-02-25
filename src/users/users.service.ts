import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDTO } from './dto/createUser.dto';
import { UserAlreadyExistsError } from 'src/exceptions/userExeptions';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UserInterface } from './interface/user';
import { User } from '@prisma/client';


@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async getMe(id: string): Promise<UserInterface | null> {
    return this.prisma.user.findUnique({
      where: {
      id,
      },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        profileImage: true,
        id: true,
      }

    });
  }

  async updateMe(id: string, userData: UpdateUserDto) {
    if (userData.password) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      return this.prisma.user.update({
        where: {
          id,
        },
        data: {
          ...userData,
          password: hashedPassword,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          profileImage: true,
          password: false,
        },
      });
    }
    return this.prisma.user.update({
      where: {
        id,
      },
      data: {
        ...userData,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profileImage: true,
        password: false,
      },
    });
  }

  async create(userData: CreateUserDTO): Promise<User> {
    const user = await this.findOne(userData.email);
    if (user) {
      throw new UserAlreadyExistsError('User with that email already exists');
    }
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = await this.prisma.user.create({
      data: {
        ...userData,
        profileImage: `https://robohash.org/${userData.firstName + userData.lastName}.png`,
        password: hashedPassword,
      },
    });

    return newUser;
  }

  async getUsersByComments(skip: number, take: number) {
    return await this.prisma.user.findMany({
      skip,
      take,
      orderBy: {
        comments: {
          _count: 'desc',
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profileImage: true,
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });
  }
  async remove(id: string) {
    return await this.prisma.user.delete({
      where: {
        id: id,
      },
    });
  }
}
