export type FacebookPostParams = {
  platform: "FACEBOOK";
  connectionId: string;
  type: "TEXT" | "IMAGE" | "VIDEO";
  message: string;
  url?: string;
};

export type InstagramPostParams = {
  platform: "INSTAGRAM";
  connectionId: string;
  type: "IMAGE" | "VIDEO";
  message: string;
  url?: string;
  mediaType?: string;
};

export type CreatePostParams = FacebookPostParams | InstagramPostParams;

export interface SocialPostStrategy<T extends { platform: string }> {
  platform: T["platform"];
  createPost(params: T): Promise<{ id: string | null; error: Error | null }>;
}
