import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// 타입스크립트로 되어있지 않은 라이브러리 사용시
import * as Joi from 'joi';
import { SocketIoModule } from './socket-io/socket-io.module';

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
      }),
    }),
    SocketIoModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
