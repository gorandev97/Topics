import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
  Patch,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDTO } from './dto/createUser.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { UpdateUserDto } from './dto/updateUser.dto';

@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getMe(@Request() req) {
    return this.usersService.getMe(req.user.id);
  }

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

  @Patch('/me')
  async updateMe(@Body() userData: UpdateUserDto, @Request() req) {
    return this.usersService.updateMe(req.user.id, userData);
  }

  @Delete('/delete')
  remove(@Request() req) {
    return this.usersService.remove(req.user.id);
  }
}
