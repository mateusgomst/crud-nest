import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Injectable()
export class MoviesService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureGenreExists(genreId: number) {
    const genre = await this.prisma.genre.findUnique({ where: { id: genreId } });
    if (!genre) {
      throw new NotFoundException('Genre not found.');
    }
  }

  async create(dto: CreateMovieDto) {
    await this.ensureGenreExists(dto.genreId);
    return this.prisma.movie.create({ data: dto });
  }

  findAll() {
    return this.prisma.movie.findMany({
      include: { genre: true },
      orderBy: { title: 'asc' },
    });
  }

  async findOne(id: number) {
    const movie = await this.prisma.movie.findUnique({
      where: { id },
      include: { genre: true },
    });
    if (!movie) {
      throw new NotFoundException('Movie not found.');
    }
    return movie;
  }

  async update(id: number, dto: UpdateMovieDto) {
    await this.findOne(id);
    if (dto.genreId) {
      await this.ensureGenreExists(dto.genreId);
    }
    return this.prisma.movie.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);

    const linkedSessions = await this.prisma.session.count({
      where: { movieId: id },
    });

    if (linkedSessions > 0) {
      throw new BadRequestException(
        'Nao e possivel excluir este filme porque ele possui sessoes vinculadas.',
      );
    }

    return this.prisma.movie.delete({ where: { id } });
  }
}
