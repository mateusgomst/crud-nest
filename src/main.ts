import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.FRONTEND_URL?.split(',').map((origin) => origin.trim()) ?? [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Cinema API')
    .setDescription('RESTful Cinema API with NestJS, Prisma and business rules.')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth')
    .addTag('genres')
    .addTag('movies')
    .addTag('rooms')
    .addTag('sessions')
    .addTag('tickets')
    .addTag('snack-combos')
    .addTag('orders')
    .addTag('profiles')
    .addTag('users')
    .addTag('addresses')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
