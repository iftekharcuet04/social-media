import { Injectable } from "@nestjs/common";
import { ConnectionRepository } from "../../repositories/connection.repository";
import { FacebookGraphClient } from "../facebook/facebook-graph.client";
import { FacebookPostService } from "../facebook/facebook.post.service";
import { InstagramGraphApiClient } from "../instagram/instagram-graph.api";
import { InstagramPostService } from "../instagram/instagram.post.service";

@Injectable()
export class SocialMediaPostService {
  private facebookService: FacebookPostService;
  private instagramService: InstagramPostService;

  constructor(
    facebookGraphClient: FacebookGraphClient,
    instagramGraphClient: InstagramGraphApiClient,
    connectionRepository: ConnectionRepository
  ) {
    this.facebookService = new FacebookPostService(
      facebookGraphClient,
      connectionRepository
    );
    this.instagramService = new InstagramPostService(
      instagramGraphClient,
      connectionRepository
    );
  }

  async createPost(params: {
    platform: "FACEBOOK" | "INSTAGRAM";
    connectionId?: string;
    type: "TEXT" | "IMAGE" | "VIDEO";
    accessToken: string;
    message: string;
    url?: string;
    mediaType?: string;
  }): Promise<{ id: string | null; error: Error | null }> {
    const { platform, type, accessToken, message, url, mediaType } = params;

    if (platform === "FACEBOOK") {
      return this.facebookService.createPost(
        type as "TEXT" | "IMAGE" | "VIDEO",
        accessToken,
        message,
        url
      );
    } else if (platform === "INSTAGRAM") {
      return this.instagramService.createPost({
        type: type as "IMAGE" | "VIDEO",
        accessToken,
        message,
        url,
        mediaType,
      });
    } else {
      throw new Error("Unsupported platform");
    }
  }
}
