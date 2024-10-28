import { Observable } from 'rxjs';

export interface ValidateTokenRequest {
  token: string;
}

export interface ValidateTokenResponse {
  userId: string;
  username: string;
  role: string;
  email: string;
}

export interface AuthServiceClient {
  ValidateToken(data: ValidateTokenRequest): Observable<ValidateTokenResponse>;
}
