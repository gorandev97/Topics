import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.log(process.env.FRONTEND_URL);
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    methods: 'GET,POST,PUT,DELETE,PATCH',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization',
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
