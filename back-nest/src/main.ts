import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import helmet from "helmet";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS configuration
  app.enableCors({
    origin: ['http://localhost:3000'], // ระบุ domain ของ frontend
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  });

  app.use(cookieParser());
  app.use(helmet());
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
