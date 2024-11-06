import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtManager } from './jwt-manager.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../models/user.model';
import { Repository } from 'typeorm';
import { RegisterRequest } from '../dto/register.dto';
import { LoginRequest } from '../dto/login.dto';
import { UserResponse } from '../dto/login-response.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtManager: JwtManager,
  ) {}

  async registerNewUser(request: RegisterRequest) {
    const existingUser = await this.findByEmail(request.email);
    if (existingUser) {
      throw new UnauthorizedException('Email already exists');
    }

    const bcrypt = require('bcryptjs');

    // 비밀번호 해싱 (Salt Rounds: 10)
    const hashedPassword = await bcrypt.hash(request.password, 10);

    const newUser = User.registerUser(
      request.username,
      hashedPassword,
      request.email,
      request.role,
    );
    await this.createUser(newUser);
  }

  async login(
    request: LoginRequest,
    ip: string,
    userAgent: string,
  ): Promise<UserResponse> {
    const user = await this.findByEmail(request.email);

    const bcrypt = require('bcryptjs');

    // 비밀번호 비교
    const isPasswordValid = await bcrypt.compare(
      request.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.jwtManager.generateAccessToken(user);
    const refreshToken = this.jwtManager.generateRefreshToken(
      user,
      ip,
      userAgent,
    );

    const role = user.role;
    const username = user.username;
    const email = user.email;

    return { accessToken, refreshToken, username, email, role };
  }

  async refreshAccessToken(
    refreshToken: string,
    ip: string,
    userAgent: string,
  ): Promise<string> {
    try {
      const isValid = this.jwtManager.verifyRefreshToken(
        refreshToken,
        ip,
        userAgent,
      );
      console.log('Refresh token valid:', isValid);

      if (!isValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const userEmail = this.jwtManager.getUserEmailFromToken(refreshToken);
      console.log('Extracted user email:', userEmail);

      const user = await this.findByEmail(userEmail);
      console.log('User found:', user);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.jwtManager.generateAccessToken(user);
    } catch (error) {
      console.error('Error during refresh token processing:', error);
      throw new UnauthorizedException('Failed to refresh token');
    }
  }

  // 사용자 이메일로 사용자 찾기
  async findByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({ where: { email } });
  }

  async createUser(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  async deleteUser(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  async findById(id: number): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }
}
