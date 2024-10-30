import { IsString } from 'class-validator';

export class UserResponse {
  @IsString()
  accessToken: string;

  @IsString()
  refreshToken: string;

  @IsString()
  role: string;
}
