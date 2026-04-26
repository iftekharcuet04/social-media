// Shared fields all platforms need — NO media fields here
export interface BasePostParams {
  platform: string;
  connectionId: string;
  message: string;
}

// Platforms that support MULTIPLE images/videos
export interface FacebookPostParams extends BasePostParams {
  platform: 'FACEBOOK';
  type: 'TEXT' | 'IMAGE' | 'VIDEO';
  urls?: string[];
}

export interface InstagramPostParams extends BasePostParams {
  platform: 'INSTAGRAM';
  type: 'IMAGE' | 'VIDEO';
  urls?: string[];
  mediaType?: string;
}

export interface LinkedInPostParams extends BasePostParams {
  platform: 'LINKEDIN';
  type: 'TEXT' | 'IMAGE' | 'VIDEO';
  urls?: string[];
}

// Union — grows as platforms are added
export type CreatePostParams = FacebookPostParams | InstagramPostParams | LinkedInPostParams;

export interface DeletePostParams {
  platform: string;
  connectionId: string;
  postId: string;
}

export type PostResult = { id: string | null; error: Error | null };

// Strategy interface — no generic, each impl narrows internally
export interface PublisherStrategy {
  readonly platform: string;
  readonly supportedMediaTypes: readonly string[];
  createPost(params: CreatePostParams): Promise<PostResult>;
  deletePost(params: DeletePostParams): Promise<PostResult>;
}
