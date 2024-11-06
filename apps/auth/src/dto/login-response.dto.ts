import { IsString } from 'class-validator';

export class UserResponse {
  @IsString()
  accessToken: string;

  @IsString()
  refreshToken: string;

  @IsString()
  username: string;

  @IsString()
  email: string;

  @IsString()
  role: string;

  createdAt: Date;
}
