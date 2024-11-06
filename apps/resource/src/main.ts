import { NestFactory } from '@nestjs/core';
import { ResourceModule } from './resource.module';
import {
  initializeTransactionalContext,
  addTransactionalDataSource,
} from 'typeorm-transactional';
import { DataSource } from 'typeorm';

async function bootstrap() {
  // 트랜잭션 컨텍스트 초기화
  initializeTransactionalContext();

  const app = await NestFactory.create(ResourceModule);

  // 트랜잭션에 사용할 데이터 소스를 추가
  const dataSource = app.get(DataSource);
  addTransactionalDataSource(dataSource);

  app.listen(4001, () => {
    console.log('HTTP Server is running on http://localhost:4001');
  });

  const grpcApp = await NestFactory.createMicroservice(ResourceModule);

  grpcApp.listen();
  console.log('gRPC Server is running');
}
bootstrap();
