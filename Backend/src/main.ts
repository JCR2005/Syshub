import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import express from 'express';
import { join } from 'path';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api');
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));
  const config = new DocumentBuilder()
    .setTitle('Syshub API')
    .setDescription('Documentación del sistema')
    .setVersion('1.0')
    .addBearerAuth() // 👈 importante si usas JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
