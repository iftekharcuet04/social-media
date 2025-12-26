import { Injectable } from "@nestjs/common";
import { FACEBOOK_GRAPH_BASE_URL } from "../../common/api.constant";
import { ConnectionRepository } from "../../repositories/connection.repository";
import { FacebookGraphClient } from "./facebook-graph.client";

@Injectable()
export class FacebookAuthService {
  constructor(
    private readonly connectionRepo: ConnectionRepository,
    private readonly facebookGraphClient: FacebookGraphClient
  ) {}

  constructLoginUrl(params: {
    clientId: string;
    redirectUri: string;
    scopes: string[];
    state?: string;
  }) {
    return this.facebookGraphClient.constructLoginUrl(params);
  }

  async callback(params: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    code: string;
  }) {
    const { access_token } =
      await this.facebookGraphClient.exchangeCodeForToken(params);
    const { email, id, profileImage } =
      (await this.facebookGraphClient.getUserProfile(access_token)) || {};
    const pageData = await this.facebookGraphClient.getUserPages(access_token);

    this.saveCredentials({
      clientId: params.clientId,
      pageData,
      email,
      id,
      profileImage,
    });
    
    return { access_token };
  }

  async saveCredentials({ clientId, pageData, email, id, profileImage }) {
    const facebookClientId = clientId;

    const pages = pageData.map((page) => ({
      original_id: page.id,
      platform: "FACEBOOK",
      type: "PAGE",
      status: "CONNECTED",
      name: page.name,
      email,
      access_token: page.access_token,
      metadata: {
        picture: `${FACEBOOK_GRAPH_BASE_URL}/${page.id}/picture?app_id=${facebookClientId}`,
        profileImage,
        userId: id,
      },
    }));

    await Promise.all(
      pages.map((page) =>
        this.connectionRepo.upsert({
          where: {
            platform_original_id: {
              platform: page.platform,
              original_id: page.original_id,
            },
          },
          update: {
            access_token: page.access_token,
            name: page.name,
            metadata: page.metadata,
            status: "CONNECTED",
            is_active: true,
          },
          create: page,
        })
      )
    );
  }
}
