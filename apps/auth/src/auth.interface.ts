export interface ValidateTokenRequest {
  token: string;
}

export interface ValidateTokenResponse {
  userId: string;
  username: string;
  role: string;
  email: string;
}
