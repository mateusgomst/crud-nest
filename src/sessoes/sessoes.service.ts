import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessaoDto } from './dto/create-sessao.dto';
import { UpdateSessaoDto } from './dto/update-sessao.dto';

function addMinutes(baseDate: Date, minutes: number): Date {
  return new Date(baseDate.getTime() + minutes * 60_000);
}

function subMinutes(baseDate: Date, minutes: number): Date {
  return new Date(baseDate.getTime() - minutes * 60_000);
}

@Injectable()
export class SessoesService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureNoOverlap(
    salaId: number,
    inicio: Date,
    filmeDuracao: number,
    ignoreSessaoId?: number,
  ): Promise<void> {
    const fim = addMinutes(inicio, filmeDuracao);
    const maxDuracao = await this.prisma.filme.aggregate({ _max: { duracao: true } });
    const janelaInicio = subMinutes(inicio, maxDuracao._max.duracao ?? 0);

    const sessoesDaSala = await this.prisma.sessao.findMany({
      where: {
        salaId,
        id: ignoreSessaoId ? { not: ignoreSessaoId } : undefined,
        dataHora: {
          gt: janelaInicio,
          lt: fim,
        },
      },
      include: {
        filme: { select: { duracao: true } },
      },
    });

    const existeConflito = sessoesDaSala.some((sessao) => {
      const inicioExistente = sessao.dataHora;
      const fimExistente = addMinutes(inicioExistente, sessao.filme.duracao);
      return inicio < fimExistente && fim > inicioExistente;
    });

    if (existeConflito) {
      throw new BadRequestException('Ja existe sessao sobreposta para esta sala.');
    }
  }

  async create(dto: CreateSessaoDto) {
    const [filme, sala] = await Promise.all([
      this.prisma.filme.findUnique({ where: { id: dto.filmeId } }),
      this.prisma.sala.findUnique({ where: { id: dto.salaId } }),
    ]);

    if (!filme) {
      throw new NotFoundException('Filme informado nao existe.');
    }
    if (!sala) {
      throw new NotFoundException('Sala informada nao existe.');
    }

    const inicio = new Date(dto.dataHora);
    await this.ensureNoOverlap(dto.salaId, inicio, filme.duracao);

    return this.prisma.sessao.create({
      data: {
        filmeId: dto.filmeId,
        salaId: dto.salaId,
        dataHora: inicio,
        valorIngresso: dto.valorIngresso,
      },
    });
  }

  findAll() {
    return this.prisma.sessao.findMany({
      include: {
        filme: { include: { genero: true } },
        sala: true,
      },
      orderBy: { dataHora: 'asc' },
    });
  }

  async findOne(id: number) {
    const sessao = await this.prisma.sessao.findUnique({
      where: { id },
      include: {
        filme: { include: { genero: true } },
        sala: true,
        _count: { select: { ingressos: true } },
      },
    });

    if (!sessao) {
      throw new NotFoundException('Sessao nao encontrada.');
    }

    return sessao;
  }

  async update(id: number, dto: UpdateSessaoDto) {
    const atual = await this.prisma.sessao.findUnique({
      where: { id },
      include: { filme: true, sala: true },
    });
    if (!atual) {
      throw new NotFoundException('Sessao nao encontrada.');
    }

    const filmeId = dto.filmeId ?? atual.filmeId;
    const salaId = dto.salaId ?? atual.salaId;
    const inicio = dto.dataHora ? new Date(dto.dataHora) : atual.dataHora;

    const [filme, sala] = await Promise.all([
      this.prisma.filme.findUnique({ where: { id: filmeId } }),
      this.prisma.sala.findUnique({ where: { id: salaId } }),
    ]);

    if (!filme) {
      throw new NotFoundException('Filme informado nao existe.');
    }
    if (!sala) {
      throw new NotFoundException('Sala informada nao existe.');
    }

    await this.ensureNoOverlap(salaId, inicio, filme.duracao, id);

    return this.prisma.sessao.update({
      where: { id },
      data: {
        filmeId,
        salaId,
        dataHora: inicio,
        valorIngresso: dto.valorIngresso ?? atual.valorIngresso,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.sessao.delete({ where: { id } });
  }
}
