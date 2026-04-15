import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';

@Injectable()
export class GenresService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateGenreDto) {
    try {
      return await this.prisma.genre.create({ data: dto });
    } catch {
      throw new ConflictException('A genre with this name already exists.');
    }
  }

  findAll() {
    return this.prisma.genre.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: number) {
    const genre = await this.prisma.genre.findUnique({ where: { id } });
    if (!genre) {
      throw new NotFoundException('Genre not found.');
    }
    return genre;
  }

  async update(id: number, dto: UpdateGenreDto) {
    await this.findOne(id);
    try {
      return await this.prisma.genre.update({ where: { id }, data: dto });
    } catch {
      throw new ConflictException('A genre with this name already exists.');
    }
  }

  async remove(id: number) {
    await this.findOne(id);

    const linkedMovies = await this.prisma.movie.count({
      where: { genreId: id },
    });

    if (linkedMovies > 0) {
      throw new BadRequestException(
        'Nao e possivel excluir este genero porque ele possui filmes vinculados.',
      );
    }

    return this.prisma.genre.delete({ where: { id } });
  }
}
