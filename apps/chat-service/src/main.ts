import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || '3001';
  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';

  app.enableCors({ origin: frontendUrl });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.enableShutdownHooks();

  await app.listen(port);
  Logger.log(`Listening on port ${port} — CORS origin: ${frontendUrl}`, 'Bootstrap');
}

bootstrap();
