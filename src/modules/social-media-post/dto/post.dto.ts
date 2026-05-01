import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsEnum, IsOptional, IsNotEmpty } from 'class-validator';

export enum PostType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
}

export class CreatePostDto {
  @ApiProperty({ example: 'FACEBOOK', description: 'Social platform' })
  @IsString()
  @IsNotEmpty()
  platform: string;

  @ApiProperty({ example: 'page_id_123', description: 'Social platform connection ID' })
  @IsString()
  @IsNotEmpty()
  connectionId: string;

  @ApiProperty({ example: 'Hello world!', description: 'Post content' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ enum: PostType, example: 'TEXT' })
  @IsEnum(PostType)
  type: PostType;

  @ApiProperty({ type: [String], required: false, example: ['https://example.com/image.jpg'] })
  @IsArray()
  @IsOptional()
  urls?: string[];

  @ApiProperty({ required: false, example: 'reels', description: 'Instagram specific media type' })
  @IsString()
  @IsOptional()
  mediaType?: string;

  // Set internally
  userId: string;
}

export class DeletePostDto {
  @ApiProperty({ example: 'FACEBOOK' })
  @IsString()
  @IsNotEmpty()
  platform: string;

  @ApiProperty({ example: 'page_id_123' })
  @IsString()
  @IsNotEmpty()
  connectionId: string;

  @ApiProperty({ example: 'post_id_456' })
  @IsString()
  @IsNotEmpty()
  postId: string;

  // Set internally
  userId: string;
}
