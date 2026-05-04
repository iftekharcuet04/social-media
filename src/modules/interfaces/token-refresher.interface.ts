export const TOKEN_REFRESHER = Symbol('TOKEN_REFRESHER');

export interface ITokenRefresher {
  refreshToken(connectionId: bigint): Promise<void>;
}
