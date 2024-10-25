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

  @GrpcMethod('AuthService', 'ValidateToken')
  async validateToken(
    data: ValidateTokenRequest,
  ): Promise<ValidateTokenResponse> {
    const { token } = data;

    try {
      // JWT 토큰 검증
      const payload = this.jwtService.verify(token);
      const email = payload.sub;
      console.log('email: ' + email);

      const user = await this.userService.findByEmail(email);
      console.log('user : ' + user.id + ', ' + user.username);

      return {
        userId: String(user.id),
        username: user.username,
        email: user.email,
        role: user.role,
      };
    } catch (error) {
      // 유효하지 않은 토큰일 경우 빈 값을 반환
      return { userId: '', username: '', email: '', role: '' };
    }
  }
}
