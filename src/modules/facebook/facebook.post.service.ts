import { Injectable } from "@nestjs/common";
import { ConnectionRepository } from "../../repositories/connection.repository";
import {
  FacebookPostParams,
  SocialPostStrategy,
} from "../interfaces/media-factory";
import { FacebookGraphClient } from "./facebook-graph.client";

@Injectable()
export class FacebookPostService
  implements SocialPostStrategy<FacebookPostParams>
{
  platform = "FACEBOOK" as const;
  constructor(
    private readonly facebookGraphClient: FacebookGraphClient,
    private readonly connectionRepository: ConnectionRepository
  ) {}

  async createPost(
    params: FacebookPostParams
  ): Promise<{ id: string; error: null | Error }> {
    try {
      const { connectionId, type, message, url } = params;
      const connection = await this.connectionRepository.findFirst({
        where: {
          platform: "FACEBOOK",
          original_id: connectionId,
        },
        select: {
          original_id: true,
          access_token: true,
        },
      });
      if (type === "IMAGE") {
        const response = await this.facebookGraphClient.uploadImage(
          connectionId,
          connection.access_token,
          message,
          url
        );
        return { id: response.id, error: null };
      } else if (type === "VIDEO") {
        const response = await this.facebookGraphClient.uploadVideo(
          connectionId,
          connection.access_token,
          message,
          url
        );
        return { id: response.id, error: null };
      } else {
        const response = await this.facebookGraphClient.uploadText(
          connectionId,
          connection.access_token,
          message
        );
        return { id: response.id, error: null };
      }
    } catch (error) {
      return { id: null, error };
    }
  }
}
