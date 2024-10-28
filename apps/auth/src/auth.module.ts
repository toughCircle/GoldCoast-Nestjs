import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  RequestMethod,
} from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { CommonService } from '@app/common';
import { DBConfigModule } from './config/db-config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './models/user.model';
import { UserService } from './services/user.service';
import { JwtManager } from './services/jwt-manager.service';
import { JwtConfigModule } from './config/jwt-config.module';

@Module({
  imports: [
    DBConfigModule,
    TypeOrmModule.forFeature([User]),
    forwardRef(() => JwtConfigModule),
  ],
  controllers: [AuthController],
  providers: [AuthService, CommonService, UserService, JwtManager],
  exports: [UserService, TypeOrmModule],
})
export class AuthModule {}
