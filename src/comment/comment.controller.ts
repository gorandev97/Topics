import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { ReplyCommentDto } from './dto/create-reply.dto';

@UseGuards(AuthGuard)
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  create(@Body() createCommentDto: CreateCommentDto, @Request() req) {
    return this.commentService.create(createCommentDto, req.user.email);
  }

  @Post('/reply')
  reply(@Body() replyCommentData: ReplyCommentDto, @Request() req) {
    return this.commentService.replyToComment(replyCommentData, req.user.email);
  }

  @Get('/like')
  async findAllByLikes(
    @Query('topicId') topicId: string,
    @Query('skip', ParseIntPipe) skip = 0,
    @Query('take', ParseIntPipe) take = 10,
  ) {
    return this.commentService.findManyByTopicId(skip, take, topicId);
  }

  @Put(':id')
  async editComment(
    @Param('id') id: string,
    @Body() commentData: UpdateCommentDto,
    @Request() req,
  ) {
    return this.commentService.editComment(id, commentData, req.user.id);
  }

  @Delete(':id')
  async deleteComment(@Param('id') id: string, @Request() req) {
    return this.commentService.deleteComment(id, req.user.id);
  }
}
