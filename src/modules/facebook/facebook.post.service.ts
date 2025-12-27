import { Injectable } from "@nestjs/common";
import { ConnectionRepository } from "../../repositories/connection.repository";
import { FacebookGraphClient } from "./facebook-graph.client";

@Injectable()
export class FacebookPostService {
  private mediaType: string;
  private url?: string;
  private caption?: string;
  private accessToken?: string;
  constructor(
    private readonly facebookGraphClient: FacebookGraphClient,
    private readonly connectionRepository: ConnectionRepository
  ) {}

  async createPost(
    connectionId: string,
    type: "TEXT" | "IMAGE" | "VIDEO",
    message: string,
    url?: string
  ): Promise<{ id: string; error: null | Error }> {
    try {
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
