import { Injectable } from '@nestjs/common';
import { ValidateTokenRequest, ValidateTokenResponse } from '../auth.interface';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  @GrpcMethod('AuthService', 'ValidateToken')
  async validateToken(
    data: ValidateTokenRequest,
  ): Promise<ValidateTokenResponse> {
    console.log('validateToken method in AuthService called with data:', data); // 메서드 호출 확인용 로그

    const { token } = data;

    try {
      // JWT 토큰 검증
      const payload = this.jwtService.verify(token);
      const email = payload.sub;
      console.log('email: ' + email);

      // 사용자 조회
      const user = await this.userService.findByEmail(email);
      console.log('user : ' + user.id + ', ' + user.username);

      return {
        userId: String(user.id),
        username: user.username,
        email: user.email,
        role: user.role,
      };
    } catch (error) {
      console.error('Token validation failed:', error);
      throw new RpcException('Invalid token');
    }
  }
}
