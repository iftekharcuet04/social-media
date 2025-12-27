import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import axios from "axios";
import {
  INSTAGRAM_API_BASE_URL,
  INSTAGRAM_AUTH_BASE_URL,
  INSTAGRAM_GRAPH_BASE_URL,
  INSTAGRAM_VERSION,
} from "../../common/api.constant";

@Injectable()
export class InstagramGraphApiClient {
  constructor(private readonly httpService: HttpService) {}

  buildLoginurl(params: {
    clientId: string;
    redirectUri: string;
    scopes: string;
    state?: string;
  }) {
    const { clientId, redirectUri, state } = params;

    return (
      `${INSTAGRAM_AUTH_BASE_URL}/authorize` +
      `?force_reauth=true` +
      `&client_id=${clientId}` +
      `&redirect_uri=${redirectUri}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(params.scopes)}` +
      `&state=${state}`
    );
  }

  async getShortLivedToken(params: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    code: string;
  }) {
    const { clientId, clientSecret, redirectUri, code } = params;

    const response = await this.httpService
      .post(
        `${INSTAGRAM_API_BASE_URL}/oauth/access_token`,
        new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
          code,
        }).toString(),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      )
      .toPromise();

    return response?.data || {};
  }

  // short-lived -> long-lived token
  async getLongLivedToken(params: {
    shortLivedToken: string;
    clientSecret: string;
  }) {
    const { shortLivedToken, clientSecret } = params;

    const url = `${INSTAGRAM_GRAPH_BASE_URL}/access_token?grant_type=ig_exchange_token&client_secret=${clientSecret}&access_token=${shortLivedToken}`;

    const response = await this.httpService.get(url).toPromise();
    return response?.data || {};
  }

  async getUserInfo(accessToken: string) {
    const userInfoUrl = `${INSTAGRAM_GRAPH_BASE_URL}/${INSTAGRAM_VERSION}/me?fields=user_id,name,username&access_token=${accessToken}`;
    console.log("userInfoUrl;: ", userInfoUrl);

    const userDataResponse = await this.httpService
      .get(userInfoUrl)
      .toPromise();
    console.log("userDataResponse: ", userDataResponse?.data);

    const { name, username, email, user_id } = userDataResponse?.data || {};
    return { name, email: email || username, username, user_id };
  }

  // social post api

  async createImageMediaContainer(params: {
    apiUrl: string;
    accessToken: string;
    caption: string;
    mediaType?: string;
    url?: string;
  }) {
    return axios.post(
      `${params.apiUrl}/media`,
      {},
      {
        params: {
          caption: params.caption,
          image_url: params.url,
          media_type: params.mediaType, // reels, stories
          access_token: params.accessToken,
        },
      }
    );
  }

  async createVideoMediaContainer(params: {
    apiUrl: string;
    accessToken: string;
    caption: string;
    mediaType?: string;
    url?: string;
  }) {
    return axios.post(
      `${params.apiUrl}/media`,
      {},
      {
        params: {
          caption: params.caption,
          video_url: params.url,
          media_type: params.mediaType, // reels, stories
          access_token: params.accessToken,
        },
      }
    );
  }

  async publishMedia(apiUrl: string, creationId: string, accessToken: string) {
    return axios.post(
      `${apiUrl}/media_publish`,
      {},
      {
        params: {
          creation_id: creationId,
          access_token: accessToken,
        },
      }
    );
  }

  async getMediaDetails(apiUrl: string, mediaId: string, accessToken: string) {
    const response = await axios.get(`${apiUrl}/${mediaId}`, {
      params: {
        fields: "id,permalink",
        access_token: accessToken,
      },
    });

    const { id, permalink } = response?.data || {};
    return `${id}|${permalink}`;
  }
}
