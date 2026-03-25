import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FilmesController } from './filmes.controller';
import { FilmesService } from './filmes.service';

@Module({
  imports: [PrismaModule],
  controllers: [FilmesController],
  providers: [FilmesService],
  exports: [FilmesService],
})
export class FilmesModule {}
