import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { grpcServerOptions } from './grpc/grpc-server.options';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);

  app.listen(3002, () => {
    console.log('HTTP Server is running on http://localhost:3000');
  });

  const grpcApp = await NestFactory.createMicroservice(
    AuthModule,
    grpcServerOptions,
  );

  grpcApp.listen();
  console.log('gRPC Server is running');
}
bootstrap();
