import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Cinema API')
    .setDescription('API RESTful de cinema com NestJS, Prisma e regras de negocio.')
    .setVersion('1.0')
    .addTag('generos')
    .addTag('filmes')
    .addTag('salas')
    .addTag('sessoes')
    .addTag('ingressos')
    .addTag('lanches-combo')
    .addTag('pedidos')
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
