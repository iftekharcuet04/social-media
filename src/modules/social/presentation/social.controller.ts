import { Controller, Post, Body, Get } from '@nestjs/common';
import { FacebookProvider } from '../infrastructure/facebook/facebook.provider';
import { SocialAccountUseCase } from '../application/social-connect.usecase';

@Controller('social')
export class SocialController {
  constructor(
    private readonly useCase: SocialAccountUseCase,
    private readonly facebookProvider: FacebookProvider
  ) {}

  @Get()
  index() {
    return 'Social Media';
  }
  @Post('facebook/connect')
  connectFacebook(
    @Body() body: { code: string; redirectUri: string }
  ) {
    // return this.useCase.connectAccount(this.facebookProvider);
  }
}
