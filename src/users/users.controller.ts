import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDTO } from './dto/createUser.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Post('create')
  async createUser(@Body() userData: CreateUserDTO) {
    return await this.usersService.create(userData);
  }
  @Get('/comments')
  async findAllByLikes(
    @Query('skip', ParseIntPipe) skip = 0,
    @Query('take', ParseIntPipe) take = 10,
  ) {
    return this.usersService.getUsersByComments(skip, take);
  }
}
