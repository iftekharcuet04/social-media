export interface ProfileProvider {
    getProfile(accessToken: string): Promise<{
      id: string;
      email?: string;
      name?: string;
    }>;
  }
  