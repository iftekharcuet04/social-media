import { Body, Controller, Delete, Post, UseGuards, Request, ValidationPipe } from '@nestjs/common';
import { SocialMediaPostService } from './social-media-post.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreatePostDto, DeletePostDto } from './dto/post.dto';

@ApiTags('social-media')
@ApiBearerAuth()
@Controller('social-media')
@UseGuards(JwtAuthGuard)
export class SocialMediaController {
  constructor(private readonly socialMediaPostService: SocialMediaPostService) {}

  @Post('create')
  @ApiOperation({ summary: 'Queue a new social media post' })
  async createPost(@Request() req, @Body(new ValidationPipe()) createPostDto: CreatePostDto) {
    createPostDto.userId = req.user.uid;
    return await this.socialMediaPostService.createPost(createPostDto as any);
  }

  @Delete('delete')
  @ApiOperation({ summary: 'Unpublish a social media post' })
  async deletePost(@Request() req, @Body(new ValidationPipe()) deletePostDto: DeletePostDto) {
    deletePostDto.userId = req.user.uid;
    return await this.socialMediaPostService.deletePost(deletePostDto as any);
  }
}
