import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGeneroDto } from './dto/create-genero.dto';
import { UpdateGeneroDto } from './dto/update-genero.dto';

@Injectable()
export class GenerosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateGeneroDto) {
    try {
      return await this.prisma.genero.create({ data: dto });
    } catch {
      throw new ConflictException('Ja existe um genero com esse nome.');
    }
  }

  findAll() {
    return this.prisma.genero.findMany({ orderBy: { nome: 'asc' } });
  }

  async findOne(id: number) {
    const genero = await this.prisma.genero.findUnique({ where: { id } });
    if (!genero) {
      throw new NotFoundException('Genero nao encontrado.');
    }
    return genero;
  }

  async update(id: number, dto: UpdateGeneroDto) {
    await this.findOne(id);
    try {
      return await this.prisma.genero.update({ where: { id }, data: dto });
    } catch {
      throw new ConflictException('Ja existe um genero com esse nome.');
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.genero.delete({ where: { id } });
  }
}
