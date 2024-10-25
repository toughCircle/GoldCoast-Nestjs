import { Body, Controller, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { BaseApiResponse, CommonService } from '@app/common';
import { UserService } from '../services/user.service';
import { Request, Response } from 'express';
import { RegisterRequest } from '../dto/register.dto';
import { LoginRequest } from '../dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly commonService: CommonService,
    private readonly UserService: UserService,
  ) {}

  @Post('refresh')
  async refreshAccessToken(@Req() request: Request, @Res() response: Response) {
    try {
      const refreshToken = Array.isArray(request.headers['refresh-token'])
        ? request.headers['refresh-token'][0]
        : request.headers['refresh-token'];
      const userAgent = request.headers['user-agent'];
      const ip = request.ip;

      if (!refreshToken) {
        return BaseApiResponse.of(
          HttpStatus.UNAUTHORIZED,
          'Refresh token is missing',
        );
      }

      const newAccessToken = await this.UserService.refreshAccessToken(
        refreshToken,
        ip,
        userAgent,
      );

      // 응답 헤더 설정을 NestJS 방식으로 변경
      response.setHeader('Authorization', `Bearer ${newAccessToken}`);
      // response.setCookie(

      // response.cookie()

      return response.status(HttpStatus.OK).json(
        BaseApiResponse.of(HttpStatus.OK, 'Token refresh successfully', {
          accessToken: newAccessToken,
        }),
      );
    } catch (error) {
      console.error('Error refreshing access token:', error);
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(
          BaseApiResponse.of(HttpStatus.INTERNAL_SERVER_ERROR, 'Server error'),
        );
    }
  }

  @Post('register')
  async registerUser(
    @Body() registerRequest: RegisterRequest,
  ): Promise<BaseApiResponse<null>> {
    try {
      await this.UserService.registerNewUser(registerRequest);
      return BaseApiResponse.of(
        HttpStatus.CREATED,
        'User registered successfully',
      );
    } catch (error) {
      return BaseApiResponse.of(
        HttpStatus.BAD_REQUEST,
        'User registration failed',
      );
    }
  }

  @Post('login')
  async login(
    @Body() loginRequest: LoginRequest,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    try {
      const userAgent = request.headers['user-agent'];
      const ip = request.ip;

      const tokens = await this.UserService.login(loginRequest, ip, userAgent);

      response.header('Authorization', `Bearer ${tokens.accessToken}`);
      response.header('Refresh-Token', tokens.refreshToken);

      return response.status(HttpStatus.OK).json(
        BaseApiResponse.of(HttpStatus.OK, 'Login successful', {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        }),
      );
    } catch (error) {
      return response
        .status(HttpStatus.UNAUTHORIZED)
        .json(BaseApiResponse.of(HttpStatus.UNAUTHORIZED, 'Login failed'));
    }
  }
}
