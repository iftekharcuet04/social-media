import { Injectable } from "@nestjs/common";
import { ConnectionRepository } from "../../repositories/connection.repository";
import { InstagramGraphApi } from "./instagram-graph.api";

@Injectable()
export class InstagramAuthService {
  constructor(
    private readonly instagramGraphClient: InstagramGraphApi,
    private readonly connectionRepo: ConnectionRepository
  ) {}

  consturctLoginUrl(params: {
    clientId: string;
    redirectUri: string;
    scopes: string;
    state?: string;
  }) {
    return this.instagramGraphClient.buildLoginurl(params);
  }

  async callback(params: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    code: string;
  }) {
    const { access_token, user_id } =
      await this.instagramGraphClient.getShortLivedToken(params);

    const instagramUser = await this.instagramGraphClient.getUserInfo(
      access_token
    );

    const longLivedToken = await this.instagramGraphClient.getLongLivedToken({
      shortLivedToken: access_token,
      clientSecret: params.clientSecret,
    });

    const processInfo = {
      access_token: longLivedToken.access_token,
      user_id: instagramUser.user_id,
      name: instagramUser.name,
      email: instagramUser.email,
      username: instagramUser.username,
    };

    this.savecredentials(processInfo);

    return {
      access_token: longLivedToken.access_token,
      user_id: instagramUser.user_id,
    };
  }

  async savecredentials(data: any) {
    await this.connectionRepo.create({
      data: {
        email: data.email,
        name: data.name,
        access_token: data.access_token,
        type: "PROFILE",
        platform: "INSTAGRAM",
        original_id: data.user_id,
        metadata: {
          username: data.username,
        },
      },
    });
  }
}
