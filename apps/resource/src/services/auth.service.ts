import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ValidateTokenRequest, ValidateTokenResponse } from '../auth.interface';

interface AuthServiceClient {
  ValidateToken(data: ValidateTokenRequest): Observable<ValidateTokenResponse>;
}

@Injectable()
export class AuthService {
  private authServiceGrpc: AuthServiceClient;

  constructor(@Inject('AUTH_SERVICE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.authServiceGrpc =
      this.client.getService<AuthServiceClient>('AuthService');
  }

  // gRPC를 통해 인증 서버에 토큰 검증 요청
  validateToken(token: string): Observable<ValidateTokenResponse> {
    console.log('call validateToken');
    return this.authServiceGrpc.ValidateToken({ token });
  }
}
