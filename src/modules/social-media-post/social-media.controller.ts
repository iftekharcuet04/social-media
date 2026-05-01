import { Body, Controller, Delete, Post, UseGuards, Request, ValidationPipe } from '@nestjs/common';
import { SocialMediaPostService } from './social-media-post.service';
import { CreatePostParams, DeletePostParams } from '../interfaces/media-factory';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('social-media')
@UseGuards(JwtAuthGuard)
export class SocialMediaController {
  constructor(
    private readonly socialMediaPostService: SocialMediaPostService,
  ) {}

  @Post('create')
  async createPost(
    @Request() req,
    @Body(new ValidationPipe()) createPostDto: CreatePostParams,
  ) {
    createPostDto.userId = req.user.uid;
    return await this.socialMediaPostService.createPost(createPostDto);
  }

  @Delete('delete')
  async deletePost(
    @Request() req,
    @Body(new ValidationPipe()) deletePostDto: DeletePostParams,
  ) {
    deletePostDto.userId = req.user.uid;
    return await this.socialMediaPostService.deletePost(deletePostDto);
  }
}
