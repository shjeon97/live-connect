import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// 타입스크립트로 되어있지 않은 라이브러리 사용시
import * as Joi from 'joi';
import { SocketIoModule } from './socket-io/socket-io.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocketIo } from './socket-io/entity/socket-io.entity';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    // Config 정의
    ConfigModule.forRoot({
      // 전역에서 사용가능하도록 정의
      isGlobal: true,
      //사용할 env 파일 이름
      envFilePath: `.env.${process.env.NODE_ENV}`,
      // 스키마 유효성 검사
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        PRIVATE_KEY: Joi.string().required(),
        PORT: Joi.string().required(),
        SERVER_ADDRESS: Joi.string().required(),
        GMAIL_SMTP_NAME: Joi.string().required(),
        GMAIL_SMTP_KEY: Joi.string().required(),
      }),
    }),
    // typeORM 정의
    TypeOrmModule.forRoot({
      // DB 종류
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      // 계정 정보
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      // DB 이름
      database: process.env.DB_NAME,
      // 마이그레이션
      synchronize: process.env.NODE_ENV !== 'production',
      // hot load 사용시 선언
      keepConnectionAlive: true,
      // DB로그
      logging: process.env.NODE_ENV !== 'production',
      // 사용할 entity들 선언
      entities: [SocketIo],
    }),
    ScheduleModule.forRoot(),
    SocketIoModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
