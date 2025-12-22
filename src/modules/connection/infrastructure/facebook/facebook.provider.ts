import { Injectable } from '@nestjs/common';
import { OAuthProvider } from '../../domain/providers/oauth.provider';
import { ProfileProvider } from '../../domain/providers/profile.provider';
import { PageProvider } from '../../domain/providers/page.provider';

@Injectable()
export class FacebookProvider
  implements OAuthProvider, ProfileProvider, PageProvider {

  async exchangeCode(dto: {
    code: string;
    redirectUri: string;
  }) {
    // call Facebook OAuth API
    return {
      accessToken: 'fb_access_token',
      expiresIn: 3600
    };
  }

  async getProfile(accessToken: string) {
    // call Graph API /me
    return {
      id: 'fb_user_id',
      email: 'user@facebook.com',
      name: 'FB User'
    };
  }

  async getPages(accessToken: string) {
    // call Graph API /me/accounts
    return [
      {
        id: 'page_1',
        name: 'My Page',
        accessToken: 'page_access_token'
      }
    ];
  }
}
