export interface LoginResponseUser {
  email?: string;
  [key: string]: unknown;
}

export interface LoginResponse {
  accessToken?: string;
  refreshToken?: string;
  user?: LoginResponseUser;
}
