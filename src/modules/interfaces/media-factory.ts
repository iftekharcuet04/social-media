type Platform = "FACEBOOK" | "INSTAGRAM";
type MediaType = "TEXT" | "IMAGE" | "VIDEO";

interface CreatePostBase {
  connectionId: string;
  platform: Platform;
  type: MediaType;
  message: string;
  url?: string;
}

interface FacebookPostParams extends CreatePostBase {
  platform: "FACEBOOK";
  type: "TEXT" | "IMAGE" | "VIDEO";
}

interface InstagramPostParams extends CreatePostBase {
  platform: "INSTAGRAM";
  type: "IMAGE" | "VIDEO";
  mediaType?: string;
}

type CreatePostParams = FacebookPostParams | InstagramPostParams;

interface IMedia {
  createPost(
    params: CreatePostParams
  ): Promise<{ id: string | null; error: Error | null }>;
}
