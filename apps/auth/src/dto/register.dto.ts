import { IsEmail, IsString } from 'class-validator';

export class RegisterRequest {
  @IsEmail()
  email: string;

  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsString()
  role: string;
}
