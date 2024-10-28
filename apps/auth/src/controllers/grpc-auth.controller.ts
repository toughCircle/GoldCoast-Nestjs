import { Body, Controller, Post } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ValidateTokenRequest, ValidateTokenResponse } from '../auth.interface';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class GrpcAuthController {
  constructor(private readonly authService: AuthService) {}

  @GrpcMethod('AuthService', 'ValidateToken')
  ValidateToken(request: ValidateTokenRequest) {
    return this.authService.validateToken(request);
  }
}
