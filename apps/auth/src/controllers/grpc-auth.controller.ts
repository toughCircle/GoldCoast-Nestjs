import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ValidateTokenRequest, ValidateTokenResponse } from '../auth.interface';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../services/user.service';

@Controller()
export class AuthController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  @GrpcMethod()
  async validateToken(
    data: ValidateTokenRequest,
  ): Promise<ValidateTokenResponse> {
    console.log(
      'validateToken method in AuthController called with data:',
      data,
    ); // 메서드 호출 확인용 로그

    const { token } = data;

    try {
      const payload = this.jwtService.verify(token);
      const email = payload.sub;
      console.log('email:', email);

      const user = await this.userService.findByEmail(email);
      console.log('user:', user.id, user.username);

      return {
        userId: String(user.id),
        username: user.username,
        email: user.email,
        role: user.role,
      };
    } catch (error) {
      console.error('Token validation failed:', error);
      throw new Error('Invalid token');
    }
  }
}
