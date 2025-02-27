import { IsString, IsInt, IsOptional } from 'class-validator';

export class CreateTopicDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsInt()
  @IsOptional()
  likesCount?: number;

  @IsString()
  category: string;
}
