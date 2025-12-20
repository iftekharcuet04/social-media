export interface OAuthProvider {
    exchangeCode(dto: {
      code: string;
      redirectUri: string;
    }): Promise<{
      accessToken: string;
      expiresIn?: number;
    }>;
  }