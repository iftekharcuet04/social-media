export interface SocialPageEntity {
  id?: string;
  pageId: string;
  name: string;
  accessToken: string;
}

export interface SocialAccountEntity {
  id?: string;
  provider: string;
  providerUserId: string;
  email?: string;
  pages?: SocialPageEntity[];
}
