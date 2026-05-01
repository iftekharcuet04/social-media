export interface AuthCallbackParams {
  userId: string;
  code: string;
  state: string;
  redirectUri?: string;
}

export interface ConnectionAuthStrategy {
  readonly platform: string;

  /**
   * Generates the OAuth login URL for the platform.
   */
  getLoginUrl(userId: string, redirectUri?: string): string | Promise<string>;

  /**
   * Handles the OAuth callback, exchanges code for tokens,
   * and persists the connection(s) in the database.
   */
  handleCallback(params: AuthCallbackParams): Promise<void>;

  /**
   * Refreshes the access token for a specific connection.
   * Implementation depends on the platform's specific token lifecycle.
   */
  refreshToken(connectionId: bigint): Promise<void>;

  /**
   * Triggers a background sync of feeds for all connections of a specific user on this platform.
   */
  syncFeeds(userId: string): Promise<void>;
}
