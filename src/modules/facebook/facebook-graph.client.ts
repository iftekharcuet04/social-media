import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import axios from "axios";
import { lastValueFrom } from "rxjs";
import {
  FACEBOOK_AUTH_BASE_URL,
  FACEBOOK_GRAPH_BASE_URL,
  FACEBOOK_VERSION,
} from "../../common/api.constant";

@Injectable()
export class FacebookGraphClient {
  constructor(private readonly http: HttpService) {}

  constructLoginUrl(params: {
    clientId: string;
    redirectUri: string;
    scopes: string[];
    state?: string;
  }) {
    const {
      clientId: facebookClientId,
      redirectUri: redirectUri,
      scopes: permission_scopes,
      state = "",
    } = params;
    return `${FACEBOOK_AUTH_BASE_URL}?client_id=${facebookClientId}&redirect_uri=${redirectUri}&scope=${permission_scopes}&state=${state}`;
  }
  async exchangeCodeForToken(params: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    code: string;
  }) {
    const url = `${FACEBOOK_GRAPH_BASE_URL}/${FACEBOOK_VERSION}/oauth/access_token`;

    const { data } = await lastValueFrom(this.http.get(url, { params }));

    return data;
  }

  async getUserProfile(accessToken: string) {
    const url = `${FACEBOOK_GRAPH_BASE_URL}/${FACEBOOK_VERSION}/me`;

    const { data } = await lastValueFrom(
      this.http.get(url, {
        params: {
          fields: "id,name,email,picture",
          access_token: accessToken,
        },
      })
    );

    return {
      id: data.id,
      email: data.email ?? data.name,
      profileImage: data.picture?.data?.url,
    };
  }

  async getUserPages(accessToken: string) {
    const url = `${FACEBOOK_GRAPH_BASE_URL}/${FACEBOOK_VERSION}/me/accounts`;

    const { data } = await lastValueFrom(
      this.http.get(url, { params: { access_token: accessToken } })
    );

    return data?.data ?? [];
  }

  async refreshAccessToken(
    auth: { facebook_client_id: string; facebook_client_secret: string },
    accessToken: string
  ) {
    const url = `${FACEBOOK_GRAPH_BASE_URL}/${FACEBOOK_VERSION}/oauth/access_token`;

    const { data } = await lastValueFrom(
      this.http.get(url, {
        params: {
          grant_type: "fb_exchange_token",
          client_id: auth.facebook_client_id,
          client_secret: auth.facebook_client_secret,
          fb_exchange_token: accessToken,
        },
      })
    );

    return data;
  }

  async deletePost(postId: string, accessToken: string) {
    const url = `${FACEBOOK_GRAPH_BASE_URL}/${FACEBOOK_VERSION}/${postId}`;

    const { data } = await lastValueFrom(
      this.http.delete(url, { params: { access_token: accessToken } })
    );

    return data;
  }

  // for post service

   async uploadImage(
    pageId: string,
    accessToken: string,
    message: string,
    url: string
  ) {
    const apiUrl = `${FACEBOOK_GRAPH_BASE_URL}/${FACEBOOK_VERSION}/${pageId}/photos`;
    try {
      const response = await axios.post(
        apiUrl,
        {},
        {
          params: {
            message,
            published: true,
            access_token: accessToken,
            url: url,
          },
        }
      );
      return { id: response.data.id, error: null };
    } catch (error) {
      return {
        id: null,
        error: error,
      };
    }
  }

   async uploadText(
    pageId: string,
    accessToken: string,
    message: string
  ) {
    const apiUrl = `${FACEBOOK_GRAPH_BASE_URL}/${FACEBOOK_VERSION}/${pageId}/feed`;
    try {
      const response = await axios.post(
        apiUrl,
        {},
        {
          params: { message, published: true, access_token: accessToken },
        }
      );
      return { id: response.data.id, error: null };
    } catch (error) {
      return { id: null, error: error };
    }
  }

   async uploadVideo(
    pageId: string,
    accessToken: string,
    message: string,
    url: string
  ) {
    const apiUrl = `${FACEBOOK_GRAPH_BASE_URL}/${FACEBOOK_VERSION}/${pageId}/videos`;
    try {
      const response = await axios.post(
        apiUrl,
        {},
        {
          params: {
            description: message,
            published: true,
            access_token: accessToken,
            file_url: url,
          },
        }
      );
      return { id: response.data.id || response.data.video_id, error: null };
    } catch (error) {
      return { error: error };
    }
  }
}
