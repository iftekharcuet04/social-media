export interface PageProvider {
    getPages(accessToken: string): Promise<
      {
        id: string;
        name: string;
        accessToken: string;
      }[]
    >;
  }
  