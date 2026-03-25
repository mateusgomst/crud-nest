import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFilmeDto } from './dto/create-filme.dto';
import { UpdateFilmeDto } from './dto/update-filme.dto';

@Injectable()
export class FilmesService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureGeneroExists(generoId: number) {
    const genero = await this.prisma.genero.findUnique({ where: { id: generoId } });
    if (!genero) {
      throw new NotFoundException('Genero informado nao existe.');
    }
  }

  async create(dto: CreateFilmeDto) {
    await this.ensureGeneroExists(dto.generoId);
    return this.prisma.filme.create({ data: dto });
  }

  findAll() {
    return this.prisma.filme.findMany({
      include: { genero: true },
      orderBy: { titulo: 'asc' },
    });
  }

  async findOne(id: number) {
    const filme = await this.prisma.filme.findUnique({
      where: { id },
      include: { genero: true },
    });
    if (!filme) {
      throw new NotFoundException('Filme nao encontrado.');
    }
    return filme;
  }

  async update(id: number, dto: UpdateFilmeDto) {
    await this.findOne(id);
    if (dto.generoId) {
      await this.ensureGeneroExists(dto.generoId);
    }
    return this.prisma.filme.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.filme.delete({ where: { id } });
  }
}
