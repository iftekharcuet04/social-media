import { Body, Controller, Delete, Post, Query, ValidationPipe } from '@nestjs/common';
import { SocialMediaPostService } from './social-media-post.service';
import { CreatePostParams, DeletePostParams } from '../interfaces/media-factory';

@Controller('social-media')
export class SocialMediaController {
  constructor(
    private readonly socialMediaPostService: SocialMediaPostService,
  ) {}

  @Post('create')
  async createPost(
    @Body(new ValidationPipe()) createPostDto: CreatePostParams,
  ) {
    return await this.socialMediaPostService.createPost(createPostDto);
  }

  @Delete('delete')
  async deletePost(
    @Body(new ValidationPipe()) deletePostDto: DeletePostParams,
  ) {
    return await this.socialMediaPostService.deletePost(deletePostDto);
  }
}
