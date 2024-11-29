import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3001', // Allow requests from localhost:3001 (your frontend)
    methods: 'GET,POST,PUT,DELETE', // Allow specific methods (optional)
    credentials: true, // Enable cookies if necessary
    allowedHeaders: 'Content-Type, Authorization', // Specify allowed headers (optional)
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
