import { Injectable } from '@nestjs/common';
import { ValidateTokenRequest, ValidateTokenResponse } from '../auth.interface';
import { GrpcMethod } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  @GrpcMethod('AuthService', 'validateToken')
  async validateToken(
    data: ValidateTokenRequest,
  ): Promise<ValidateTokenResponse> {
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
      throw new Error('Invalid token');
    }
  }
}
