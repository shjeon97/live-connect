import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SocketIoAdapter } from './adapter/socket-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useWebSocketAdapter(new SocketIoAdapter(app));

  // 전역 유효성 검사 파이프 정의
  app.useGlobalPipes(new ValidationPipe());

  // JSON 페이로드로 들어오는 요청을 구문 분석하도록 미들웨어 설정
  app.use(json({ limit: '50mb' }));

  // URL 인코딩 페이로드로 들어오는 요청을 구문 분석하도록 미들웨어 설정
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  if (process.env.NODE_ENV === 'production') {
    app.enableCors({
      origin: ['https://live-connect.prod.kro.kr'],
      credentials: true,
    });
  } else {
    app.enableCors({
      origin: true,
      credentials: true,
    });
  }

  const config = new DocumentBuilder()
    .setTitle('live-connect API')
    .setDescription('live-connect API description')
    .setVersion('1.0')
    .addTag('live-connect')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  try {
    await app.listen(process.env.PORT, '0.0.0.0', () =>
      console.log(
        `Running on Port ${process.env.PORT} ${process.env.NODE_ENV}`,
      ),
    );
  } catch (error) {
    console.log(error);
  }
}
bootstrap();
