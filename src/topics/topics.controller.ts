import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { TopicsService } from './topics.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('topics')
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Post()
  create(@Body() createTopicDto: CreateTopicDto, @Request() req) {
    return this.topicsService.create(createTopicDto, req.user.email);
  }

  @Get()
  async findAll(
    @Query('skip', ParseIntPipe) skip = 0,
    @Query('take', ParseIntPipe) take = 10,
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    return this.topicsService.findAll(skip, take, search, category);
  }

  @Get('/user')
  async findAllCreatedByMe(
    @Query('skip', ParseIntPipe) skip = 0,
    @Query('take', ParseIntPipe) take = 10,

    @Request() req,
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    return this.topicsService.findAllCreatedByMe(
      skip,
      take,
      req.user.id,
      search,
      category,
    );
  }

  @Get('/like')
  async findAllByLikes(
    @Query('skip', ParseIntPipe) skip = 0,
    @Query('take', ParseIntPipe) take = 10,
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    return this.topicsService.findAllByLikes(skip, take, search, category);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.topicsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateTopicDto: UpdateTopicDto,
    @Request() req,
  ) {
    return this.topicsService.update(id, updateTopicDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.topicsService.remove(id, req.user.id);
  }
}
