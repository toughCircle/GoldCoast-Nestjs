// src/auth/jwt-manager.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { appConfig } from '../config/config';

@Injectable()
export class JwtManager {
  constructor(private readonly jwtService: JwtService) {}

  // Refresh Token 생성
  generateRefreshToken(user: any, ip: string, userAgent: string): string {
    const payload = {
      sub: user.email, // 사용자 Email
      ip, // 사용자의 IP 주소
      userAgent, // 사용자의 User-Agent
    };

    return this.jwtService.sign(payload, {
      expiresIn: '7d', // Refresh Token의 유효 기간
      secret: appConfig.jwtSecret, // 시크릿 키 환경변수
    });
  }

  // Access Token 생성
  generateAccessToken(user: any): string {
    try {
      const payload = {
        sub: user.email,
      };
      console.log('Payload:', payload);
      console.log('Secret Key:', appConfig.jwtSecret);

      const token = this.jwtService.sign(payload, {
        expiresIn: '3600s',
        secret: appConfig.jwtSecret,
      });

      console.log('Generated Access Token:', token);
      return token;
    } catch (error) {
      console.error('Error generating access token:', error);
      throw new Error('Failed to generate access token');
    }
  }

  // Refresh Token 검증 (토큰에서 IP와 User-Agent 확인)
  verifyRefreshToken(
    token: string,
    currentIp: string,
    currentUserAgent: string,
  ): boolean {
    try {
      const secret = appConfig.jwtSecret;
      const decoded = this.jwtService.verify(token, { secret });

      // IP와 User-Agent를 비교하여 검증
      if (decoded.ip !== currentIp || decoded.userAgent !== currentUserAgent) {
        throw new UnauthorizedException(
          'Token is being used from an invalid IP or device.',
        );
      }

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid Refresh Token');
    }
  }

  // JWT 토큰 검증
  verifyToken(token: string): any {
    try {
      return this.jwtService.verify(token, {
        secret: appConfig.jwtSecret,
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  // JWT 토큰에서 사용자 Email 추출
  getUserEmailFromToken(token: string): string {
    const decoded = this.jwtService.decode(token);
    return decoded ? decoded['sub'] : null;
  }
}
