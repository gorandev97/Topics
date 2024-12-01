import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { EmailService } from './email.service';
import { UpdateUserDto } from 'src/users/dto/updateUser.dto';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  async signIn(email: string, pass: string): Promise<{ access_token: string }> {
    const user = await this.usersService.findOne(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(pass, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      id: user.id,
      profilePicture: user.profileImage,
    };
    return {
      access_token: await this.jwtService.signAsync(payload, {
        expiresIn: '24h',
      }),
    };
  }

  async registerUser(
    email: string,
    pass: string,
    firstName: string,
    lastName: string,
  ): Promise<{ access_token: string }> {
    const user = await this.usersService.create({
      email,
      password: pass,
      firstName,
      lastName,
    });
    if (!user) {
      throw new Error("Can't create user");
    }
    const payload = {
      sub: user.id,
      email: user.email,
      id: user.id,
      profilePicture: user.profileImage,
    };
    return {
      access_token: await this.jwtService.signAsync(payload, {
        expiresIn: '24h',
      }),
    };
  }
  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findOne(email);
    if (!user) {
      throw new NotFoundException(`No user found for email: ${email}`);
    }
    await this.emailService.sendResetPasswordLink(email);
  }
  async resetPassword(password: string, token: string) {
    const decoded = this.jwtService.verify(token, {
      secret: this.configService.get<string>('JWT_SECRET'),
    });
    const user = await this.usersService.findOne(decoded.email);
    if (!user) throw new NotFoundException('User not found');
    const userData: UpdateUserDto = {
      firstName: undefined,
      lastName: undefined,
      email: undefined,
      password: password,
    };
    this.usersService.updateMe(user.id, userData);
  }
}
