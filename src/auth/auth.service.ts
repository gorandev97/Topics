import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
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
      sub: user.userId,
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
    const payload = { sub: user.userId, email: user.email, id: user.id };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
