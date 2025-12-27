import { Body, Controller, Post, ValidationPipe } from "@nestjs/common";
import { SocialMediaPostService } from "./social-media-post.service";

@Controller("social-media")
export class SocialMediaController {
  constructor(
    private readonly socialMediaPostService: SocialMediaPostService
  ) {}

  @Post("create")
  async createPost(
    @Body(new ValidationPipe()) createPostDto: /* CreatePostDto */ any
  ) {
    return await this.socialMediaPostService.createPost(createPostDto);
  }
}
