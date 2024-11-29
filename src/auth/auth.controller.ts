import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { SignInDto } from './dto/sign-in-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }
  @Post('register')
  register(@Body() signInDto: RegisterUserDto) {
    return this.authService.registerUser(
      signInDto.email,
      signInDto.password,
      signInDto.firstName,
      signInDto.lastName,
    );
  }
}
