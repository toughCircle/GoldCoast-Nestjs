// src/middleware/jwt.middleware.ts

import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { appConfig } from '../config/config';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const token = authHeader.split(' ')[1]; // Bearer 토큰 형식에서 토큰만 추출
    if (!token) {
      throw new UnauthorizedException('Token is missing');
    }

    try {
      const secret = appConfig.jwtSecret;
      const decoded = jwt.verify(token, secret);

      // 사용자 정보를 요청 객체에 저장
      req['user'] = decoded;

      // 다음 미들웨어나 컨트롤러로 요청을 넘김
      next();
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
