import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSalaDto } from './dto/create-sala.dto';
import { UpdateSalaDto } from './dto/update-sala.dto';

@Injectable()
export class SalasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSalaDto) {
    try {
      return await this.prisma.sala.create({ data: dto });
    } catch {
      throw new ConflictException('Ja existe uma sala com essa identificacao.');
    }
  }

  findAll() {
    return this.prisma.sala.findMany({ orderBy: { identificacao: 'asc' } });
  }

  async findOne(id: number) {
    const sala = await this.prisma.sala.findUnique({ where: { id } });
    if (!sala) {
      throw new NotFoundException('Sala nao encontrada.');
    }
    return sala;
  }

  async update(id: number, dto: UpdateSalaDto) {
    await this.findOne(id);
    try {
      return await this.prisma.sala.update({ where: { id }, data: dto });
    } catch {
      throw new ConflictException('Ja existe uma sala com essa identificacao.');
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.sala.delete({ where: { id } });
  }
}
