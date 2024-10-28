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
  }

  async validateToken(token: string): Promise<ValidateTokenResponse> {
    const request: ValidateTokenRequest = { token };

    // gRPC 요청을 보내고 응답을 받기
    const response: Observable<ValidateTokenResponse> =
      this.authServiceGrpc.validateToken(request);

    return await firstValueFrom(response);
  }
}
