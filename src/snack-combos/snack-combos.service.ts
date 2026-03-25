import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSnackComboDto } from './dto/create-snack-combo.dto';
import { UpdateSnackComboDto } from './dto/update-snack-combo.dto';

@Injectable()
export class SnackCombosService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateSnackComboDto) {
    return this.prisma.snackCombo.create({ data: dto });
  }

  findAll() {
    return this.prisma.snackCombo.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: number) {
    const combo = await this.prisma.snackCombo.findUnique({ where: { id } });
    if (!combo) {
      throw new NotFoundException('Snack combo not found.');
    }
    return combo;
  }

  async update(id: number, dto: UpdateSnackComboDto) {
    await this.findOne(id);
    return this.prisma.snackCombo.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.snackCombo.delete({ where: { id } });
  }
}
