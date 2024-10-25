import { IsString } from 'class-validator';

export class Tokens {
  @IsString()
  accessToken: string;

  @IsString()
  refreshToken: string;
}
