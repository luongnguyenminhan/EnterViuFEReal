import {
  CommonResponse,
  RequestSchema,
  FilterableRequestSchema,
  Pagination,
} from "./common.type";

// User Response matching actual API response
export interface UserResponse {
  statusCode: number;
  message: string;
  data: {
    id: number;
    email: string;
    passwordHash?: string | null;
    name?: string | null;
    phone?: string | null;
    province?: string | null;
    district?: string | null;
    ward?: string | null;
    addressBonus?: string | null;
    avatarUrl?: string | null;
    googleId?: string | null;
    role: number;
    fcmtoken?: string | null;
  };
}

// User data only (for use in app state)
export interface UserData {
  id: number;
  email: string;
  passwordHash?: string | null;
  name?: string | null;
  phone?: string | null;
  province?: string | null;
  district?: string | null;
  ward?: string | null;
  addressBonus?: string | null;
  avatarUrl?: string | null;
  googleId?: string | null;
  role: number;
  fcmtoken?: string | null;
}

// Search User Request matching Python SearchUserRequest
export type SearchUserRequest = FilterableRequestSchema;

// Refresh Token Request matching Python RefreshTokenRequest
export interface RefreshTokenRequest extends RequestSchema {
  refresh_token: string;
}

// Google Direct Login Request matching Python GoogleDirectLoginRequest
export interface GoogleDirectLoginRequest {
  access_token: string;
  id_token?: string | null;
  refresh_token?: string | null;
  expires_in?: number | null;
  token_type?: string | null;
  scope?: string | null;
}

// Google Revoke Token Request matching Python GoogleRevokeTokenRequest
export interface GoogleRevokeTokenRequest {
  token: string;
}

// OAuth User Info matching Python OAuthUserInfo
export interface OAuthUserInfo {
  email: string;
  name?: string | null;
  picture?: string | null;
}

// Google OAuth Login Response (matches actual API response structure)
export interface GoogleOAuthLoginResponse {
  statusCode: number;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

// Response Types
export type SearchUserResponse = CommonResponse<Pagination<UserData>>;
export type GoogleLoginResponse = CommonResponse<UserData>;
export type TokenRefreshResponse = CommonResponse<UserData>;
export type GoogleRevokeResponse = CommonResponse<null>;
export type MeResponse = CommonResponse<UserData>;

// Legacy type aliases for backward compatibility with existing code
export type TokenRefreshRequest = RefreshTokenRequest;

export type LoginResponseModel = GoogleLoginResponse;
export type TokenRefreshResponseModel = TokenRefreshResponse;
export type LogoutResponseModel = CommonResponse<null>;
export type GoogleAuthUrlResponse = string; // This returns HTML or redirect URL
export type GoogleCallbackResponse = GoogleLoginResponse;
export type MeResponseModel = MeResponse;
