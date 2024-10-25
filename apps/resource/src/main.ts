import { NestFactory } from '@nestjs/core';
import { ResourceModule } from './resource.module';

async function bootstrap() {
  const app = await NestFactory.create(ResourceModule);

  app.listen(3001, () => {
    console.log('HTTP Server is running on http://localhost:3001');
  });

  const grpcApp = await NestFactory.createMicroservice(ResourceModule);

  grpcApp.listen();
  console.log('gRPC Server is running');
}
bootstrap();
