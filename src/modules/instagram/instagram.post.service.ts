import { Injectable } from "@nestjs/common";
import {
  INSTAGRAM_GRAPH_BASE_URL,
  INSTAGRAM_VERSION,
} from "../../common/api.constant";
import { delay } from "../../common/util";
import { ConnectionRepository } from "../../repositories/connection.repository";
import { InstagramGraphApiClient } from "./instagram-graph.api";

@Injectable()
export class InstagramPostService {
  constructor(
    private readonly instagramGraphClient: InstagramGraphApiClient,
    private readonly connectionRepository: ConnectionRepository
  ) {}

  private determineMediaType(params: {
    type: "IMAGE" | "VIDEO";
    mediaType?: string;
  }) {
    const { type, mediaType } = params;
    if (type === "IMAGE") return "photos";
    if (type === "VIDEO") return mediaType ?? "reels";
    return mediaType;
  }
  async createPost(params: {
    connectionId: string;
    type: "IMAGE" | "VIDEO";
    message: string;
    url?: string;
    mediaType?: string;
  }): Promise<{ id: string | null; error: Error | null }> {
    try {
      const connection = await this.connectionRepository.findFirst({
        where: {
          platform: "INSTAGRAM",
          original_id: params.connectionId,
        },
        select: {
          original_id: true,
          access_token: true,
        },
      });

      if (!connection) {
        throw new Error("Connection not found");
      }
      const igUserId = connection.original_id;
      const apiUrl = `${INSTAGRAM_GRAPH_BASE_URL}/${INSTAGRAM_VERSION}/${igUserId}`;

      if (params.type === "IMAGE") {
        const response =
          await this.instagramGraphClient.createImageMediaContainer({
            ...params,
            accessToken: connection.access_token,
            apiUrl,
            caption: params.message,
          });
        const id = response?.data?.id;

        if (id) {
          const publishResponse = await this.retryPublishRequest(
            apiUrl,
            id,
            connection.access_token
          );

          const mediaInfo = await this.instagramGraphClient.getMediaDetails(
            apiUrl,
            publishResponse?.id,
            connection.access_token
          );
          return { id: mediaInfo, error: null };
        }
      } else {
        const response =
          await this.instagramGraphClient.createVideoMediaContainer({
            ...params,
            mediaType: this.determineMediaType(params),
            apiUrl,
            accessToken: connection.access_token,
            caption: params.message,
          });
        const id = response?.data?.id;
        if (id) {
          const publishResponse = await this.retryPublishRequest(
            apiUrl,
            id,
            connection.access_token
          );
          const mediaInfo = await this.instagramGraphClient.getMediaDetails(
            apiUrl,
            publishResponse?.id,
            connection.access_token
          );
          return { id: mediaInfo, error: null };
        }
      }
    } catch (error) {
      return { id: null, error };
    }
  }

  async retryPublishRequest(
    apiUrl: string,
    creationId: string,
    accessToken: string,
    retries = 3,
    delayMs = 3000
  ) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await this.publishMedia(
          apiUrl,
          creationId,
          accessToken
        );

        if (response?.id) {
          console.log(`Publish succeeded on attempt ${attempt}`);
          return response;
        }

        throw new Error("Invalid publish response");
      } catch (error) {
        console.warn(
          ` Publish attempt ${attempt} failed: ${
            error?.response?.data?.error?.message || error.message
          }`
        );
        if (attempt < retries) {
          console.log(` Retrying in ${delayMs / 1000}s...`);
          await delay(delayMs);
        } else {
          console.error(" All publish attempts failed");
          throw error;
        }
      }
    }
  }

  async publishMedia(
    apiUrl: string,
    creationId: string,
    accessToken: string
  ): Promise<{ id: string | null; error: Error | null }> {
    try {
      const response = await this.instagramGraphClient.publishMedia(
        apiUrl,
        creationId,
        accessToken
      );
      const id = response?.data?.id;
      if (!id) {
        throw new Error("Failed to publish media");
      }
      return { id, error: null };
    } catch (error) {
      return { id: null, error };
    }
  }
}
