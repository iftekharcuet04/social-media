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
    type: "TEXT" | "IMAGE" | "VIDEO",
    accessToken: string,
    message: string,
    url?: string
  ): Promise<{ id: string; error: null | Error }> {
    try {
      const connection = await this.connectionRepository.findFirst({
        where: {
          platform: "FACEBOOK",
        },
        select: {
          original_id: true,
        },
      });
      const connectionId = connection.original_id;
      if (type === "IMAGE") {
        const response = await this.facebookGraphClient.uploadImage(
          connectionId,
          accessToken,
          message,
          url as string
        );
        return { id: response.id, error: null };
      } else if (type === "VIDEO") {
        const response = await this.facebookGraphClient.uploadVideo(
          connectionId,
          accessToken,
          message,
          url as string
        );
        return { id: response.id, error: null };
      } else {
        const response = await this.facebookGraphClient.uploadText(
          connectionId,
          accessToken,
          message
        );
        return { id: response.id, error: null };
      }
    } catch (error) {
      return { id: null, error };
    }
  }
}
