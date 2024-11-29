import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDTO } from './dto/createUser.dto';
import { UserAlreadyExistsError } from 'src/exceptions/userExeptions';
export type User = any;

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

  async getUsersByComments(skip: number, take: number): Promise<User[]> {
    return await this.prisma.user.findMany({
      skip,
      take,
      orderBy: {
        comments: {
          _count: 'desc', // Sort by the count of comments in descending order
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profileImage: true,
        _count: {
          select: {
            comments: true, // Fetch the count of comments
          },
        },
      },
    });
  }
}
