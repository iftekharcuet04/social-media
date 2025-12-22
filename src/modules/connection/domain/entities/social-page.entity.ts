export class SocialPage {
    constructor(
      public readonly pageId: string,
      public readonly name: string,
      public readonly accessToken: string
    ) {}
  
    static fromProvider(page: {
      id: string;
      name: string;
      accessToken: string;
    }) {
      return new SocialPage(page.id, page.name, page.accessToken);
    }
  }
  