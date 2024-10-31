import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { grpcServerOptions } from './grpc/grpc-server.options';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  // HTTP 서버 설정
  const app = await NestFactory.create(AuthModule);

  Logger.overrideLogger(['debug']);

  // CORS 설정 추가
  app.enableCors({
    origin: 'http://localhost:3000', // 허용할 프론트엔드 도메인
  });

  await app.listen(3001);
  console.log('HTTP Server is running on http://localhost:3001');

  // gRPC 서버 설정
  const grpcApp = await NestFactory.createMicroservice(
    AuthModule,
    grpcServerOptions,
  );
  await grpcApp.listen();
  console.log('gRPC Server is running on port 5001');
}

bootstrap();
