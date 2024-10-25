import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { appConfig } from './config';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { AuthModule } from '../auth.module';
import { JwtManager } from '../services/jwt-manager.service';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    JwtModule.register({
      secret: appConfig.jwtSecret,
      signOptions: {
        expiresIn: '3600s',
      },
    }),
  ],
  exports: [JwtModule, JwtManager],
  providers: [AuthService, UserService, JwtManager],
})
export class JwtConfigModule {}
