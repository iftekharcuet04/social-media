import { Injectable } from "@nestjs/common";
import { FacebookPostService } from "../facebook/facebook.post.service";
import { InstagramPostService } from "../instagram/instagram.post.service";

@Injectable()
export class SocialMediaPostService implements IMedia {
  constructor(
    private readonly facebookService: FacebookPostService,
    private readonly instagramService: InstagramPostService
  ) {}

  async createPost(params: {
    connectionId: string;
    platform: "FACEBOOK" | "INSTAGRAM";
    type: "TEXT" | "IMAGE" | "VIDEO";
    message: string;
    url?: string;
    mediaType?: string;
  }): Promise<{ id: string | null; error: Error | null }> {
    const { platform, type, connectionId, message, url, mediaType } = params;

    if (platform === "FACEBOOK") {
      return this.facebookService.createPost(
        connectionId,
        type as "TEXT" | "IMAGE" | "VIDEO",
        message,
        url
      );
    } else if (platform === "INSTAGRAM") {
      return this.instagramService.createPost({
        connectionId,
        type: type as "IMAGE" | "VIDEO",
        message,
        url,
        mediaType,
      });
    } else {
      throw new Error("Unsupported platform");
    }
  }
}
