import { Injectable } from "@nestjs/common";
import { CreatePostParams, SocialPostStrategy } from "../interfaces/media-factory";

@Injectable()
export class SocialMediaPostService {
  constructor(private readonly strategies: SocialPostStrategy<any>[]) {}

  async createPost(params: CreatePostParams) {
    const strategy = this.strategies.find(
      (s) => s.platform === params.platform
    );

    if (!strategy) throw new Error("Unsupported platform");

    return strategy.createPost(params);
  }
}
