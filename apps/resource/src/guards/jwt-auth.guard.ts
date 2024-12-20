import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const requestPath = request.path;

    if (requestPath === '/auth/refresh') {
      return true;
    }

    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token is missing');
    }

    try {
      // gRPC로 인증 서버의 validateToken 호출
      const validateTokenResponse = await this.authService.validateToken(token);

      // 요청에 사용자 정보 추가
      request['user'] = validateTokenResponse;
      return true;
    } catch (error) {
      console.log('호출 에러 발생', error);

      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: Request): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : null;
  }
}
