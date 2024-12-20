import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { firstValueFrom, Observable } from 'rxjs';
import {
  AuthServiceClient,
  ValidateTokenRequest,
  ValidateTokenResponse,
} from '../auth.interface';

@Injectable()
export class AuthService implements OnModuleInit {
  private authServiceGrpc: AuthServiceClient;

  constructor(@Inject('AUTH_SERVICE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.authServiceGrpc =
      this.client.getService<AuthServiceClient>('AuthService');
    console.log('authServiceGrpc initialized:', this.authServiceGrpc); // 초기화 여부 확인
  }

  async validateToken(token: string): Promise<ValidateTokenResponse> {
    console.log('validateToken 호출');
    console.log('token:', token);

    const request: ValidateTokenRequest = { token };

    // gRPC 요청을 보내고 응답을 받기
    const response: Observable<ValidateTokenResponse> =
      this.authServiceGrpc.ValidateToken(request);

    return await firstValueFrom(response);
  }
}
