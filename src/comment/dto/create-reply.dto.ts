import { IsNotEmpty, IsString } from 'class-validator';

export class ReplyCommentDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsString()
  topicId: string;

  @IsNotEmpty()
  @IsString()
  commentId: string;
}
