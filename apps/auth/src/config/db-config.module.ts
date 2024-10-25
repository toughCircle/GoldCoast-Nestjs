import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { appConfig } from './config'; // 환경 설정 가져오기

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'mysql', // 사용하는 DB 타입 (mysql, postgres 등)
        host: appConfig.db.host,
        port: appConfig.db.port,
        username: appConfig.db.user,
        password: appConfig.db.password,
        database: appConfig.db.name,
        entities: [__dirname + '/../**/*.model{.ts,.js}'], // 엔터티 파일 위치
        synchronize: true, // 개발 환경에서만 true (자동으로 DB 스키마를 동기화)
        logging: true,
      }),
    }),
  ],
})
export class DBConfigModule {}
