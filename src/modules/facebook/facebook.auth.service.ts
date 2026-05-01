import { Injectable } from "@nestjs/common";
import { FACEBOOK_GRAPH_BASE_URL } from "../../common/api.constant";
import { ConnectionRepository } from "../../repositories/connection.repository";
import { FacebookGraphClient } from "./facebook-graph.client";
import { ConnectionAuthStrategy, AuthCallbackParams } from "../interfaces/auth-strategy";
import { PlatformSettingRepository } from "../../repositories/platform-setting.repository";
import { ConnectionPlatform } from "@prisma/client";

@Injectable()
export class FacebookAuthService implements ConnectionAuthStrategy {
  readonly platform = "FACEBOOK";

  constructor(
    private readonly connectionRepo: ConnectionRepository,
    private readonly facebookGraphClient: FacebookGraphClient,
    private readonly platformSettingRepo: PlatformSettingRepository
  ) {}

  async getLoginUrl(userId: string): Promise<string> {
    const settings = await this.platformSettingRepo.getByPlatform(ConnectionPlatform.FACEBOOK);
    if (!settings) throw new Error("Facebook platform settings not found in database");

    const scopes = ["email", "pages_show_list", "pages_read_engagement", "pages_manage_posts"];

    return this.facebookGraphClient.constructLoginUrl({
      clientId: settings.client_id,
      redirectUri: settings.redirect_uri,
      scopes,
      state: userId,
    });
  }

  async handleCallback(params: AuthCallbackParams): Promise<void> {
    const settings = await this.platformSettingRepo.getByPlatform(ConnectionPlatform.FACEBOOK);
    if (!settings) throw new Error("Facebook platform settings not found in database");

    const { access_token } = await this.facebookGraphClient.exchangeCodeForToken({
      clientId: settings.client_id,
      clientSecret: settings.client_secret,
      redirectUri: settings.redirect_uri,
      code: params.code,
    });

    const { email, id, profileImage } =
      (await this.facebookGraphClient.getUserProfile(access_token)) || {};
    const pageData = await this.facebookGraphClient.getUserPages(access_token);

    await this.saveCredentials({
      clientId: settings.client_id,
      pageData,
      email,
      id,
      profileImage,
      userId: params.userId,
    });
  }

  async refreshToken(connectionId: bigint): Promise<void> {
    const connection = await this.connectionRepo.findUnique({
      where: { id: connectionId },
    });

    if (!connection || !connection.access_token) return;

    const settings = await this.platformSettingRepo.getByPlatform(ConnectionPlatform.FACEBOOK);
    if (!settings) throw new Error("Facebook platform settings not found in database");

    const data = await this.facebookGraphClient.refreshAccessToken(
      { facebook_client_id: settings.client_id, facebook_client_secret: settings.client_secret },
      connection.access_token
    );

    await this.connectionRepo.update({
      where: { id: connectionId },
      data: {
        access_token: data.access_token,
        token_expires_at: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : null,
      },
    });
  }

  async saveCredentials({ clientId, pageData, email, id, profileImage, userId }) {
    const facebookClientId = clientId;

    const pages = pageData.map((page) => ({
      original_id: page.id,
      platform: "FACEBOOK" as const,
      type: "PAGE" as const,
      status: "CONNECTED" as const,
      name: page.name,
      email,
      access_token: page.access_token,
      user: { connect: { uid: userId } },
      metadata: {
        picture: `${FACEBOOK_GRAPH_BASE_URL}/${page.id}/picture?app_id=${facebookClientId}`,
        profileImage,
        facebookUserId: id,
      },
    }));

    await Promise.all(
      pages.map((page) =>
        this.connectionRepo.upsert({
          where: {
            user_id_platform_original_id: {
              user_id: userId,
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
