import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IngressoTipo } from '../enums/ingresso-tipo.enum';
import { CreateIngressoDto } from './dto/create-ingresso.dto';
import { UpdateIngressoDto } from './dto/update-ingresso.dto';

@Injectable()
export class IngressosService {
  constructor(private readonly prisma: PrismaService) {}

  private calculateValorPago(tipo: string, valorBase: number) {
    return tipo === IngressoTipo.MEIA ? valorBase / 2 : valorBase;
  }

  async create(dto: CreateIngressoDto) {
    return this.prisma.$transaction(async (tx) => {
      const sessao = await tx.sessao.findUnique({
        where: { id: dto.sessaoId },
        include: { sala: true },
      });
      if (!sessao) {
        throw new NotFoundException('Sessao informada nao existe.');
      }

      const quantidadeIngressos = await tx.ingresso.count({
        where: { sessaoId: dto.sessaoId },
      });

      if (quantidadeIngressos >= sessao.sala.capacidade) {
        throw new BadRequestException('Capacidade da sala atingida para esta sessao.');
      }

      const valorPago = dto.valorPago ?? this.calculateValorPago(dto.tipo, sessao.valorIngresso);

      return tx.ingresso.create({
        data: {
          sessaoId: dto.sessaoId,
          tipo: dto.tipo,
          valorPago,
        },
      });
    });
  }

  findAll() {
    return this.prisma.ingresso.findMany({
      include: {
        sessao: {
          include: {
            filme: true,
            sala: true,
          },
        },
      },
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    const ingresso = await this.prisma.ingresso.findUnique({
      where: { id },
      include: { sessao: true },
    });
    if (!ingresso) {
      throw new NotFoundException('Ingresso nao encontrado.');
    }
    return ingresso;
  }

  async update(id: number, dto: UpdateIngressoDto) {
    const atual = await this.prisma.ingresso.findUnique({ where: { id } });
    if (!atual) {
      throw new NotFoundException('Ingresso nao encontrado.');
    }

    return this.prisma.$transaction(async (tx) => {
      const sessaoId = dto.sessaoId ?? atual.sessaoId;
      const tipo = dto.tipo ?? atual.tipo;

      const sessao = await tx.sessao.findUnique({
        where: { id: sessaoId },
        include: { sala: true },
      });
      if (!sessao) {
        throw new NotFoundException('Sessao informada nao existe.');
      }

      if (sessaoId !== atual.sessaoId) {
        const ingressosSessaoDestino = await tx.ingresso.count({ where: { sessaoId } });
        if (ingressosSessaoDestino >= sessao.sala.capacidade) {
          throw new BadRequestException('Capacidade da sala atingida para a sessao destino.');
        }
      }

      const valorPago = dto.valorPago ?? this.calculateValorPago(tipo, sessao.valorIngresso);

      return tx.ingresso.update({
        where: { id },
        data: {
          sessaoId,
          tipo,
          valorPago,
        },
      });
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.ingresso.delete({ where: { id } });
  }
}
