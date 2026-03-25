import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PedidoItemTipo } from '../enums/pedido-item-tipo.enum';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';

type PedidoItemData = {
  tipo: PedidoItemTipo;
  referenciaId: number;
  valor: number;
};

@Injectable()
export class PedidosService {
  constructor(private readonly prisma: PrismaService) {}

  private async mapItensComValor(itens: CreatePedidoDto['itens']): Promise<PedidoItemData[]> {
    const itensComValor = await Promise.all(
      itens.map(async (item) => {
        if (item.tipo === PedidoItemTipo.INGRESSO) {
          const ingresso = await this.prisma.ingresso.findUnique({
            where: { id: item.referenciaId },
            select: { valorPago: true },
          });
          if (!ingresso) {
            throw new NotFoundException(`Ingresso ${item.referenciaId} nao encontrado.`);
          }
          return {
            tipo: PedidoItemTipo.INGRESSO,
            referenciaId: item.referenciaId,
            valor: ingresso.valorPago,
          };
        }

        const combo = await this.prisma.lancheCombo.findUnique({
          where: { id: item.referenciaId },
          select: { preco: true },
        });
        if (!combo) {
          throw new NotFoundException(`Combo ${item.referenciaId} nao encontrado.`);
        }
        return {
          tipo: PedidoItemTipo.COMBO,
          referenciaId: item.referenciaId,
          valor: combo.preco,
        };
      }),
    );

    return itensComValor;
  }

  async create(dto: CreatePedidoDto) {
    const itensComValor = await this.mapItensComValor(dto.itens);
    const valorTotal = itensComValor.reduce((acc, item) => acc + item.valor, 0);

    return this.prisma.pedido.create({
      data: {
        valorTotal,
        itens: {
          create: itensComValor,
        },
      },
      include: { itens: true },
    });
  }

  findAll() {
    return this.prisma.pedido.findMany({
      include: { itens: true },
      orderBy: { dataHora: 'desc' },
    });
  }

  async findOne(id: number) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id },
      include: { itens: true },
    });
    if (!pedido) {
      throw new NotFoundException('Pedido nao encontrado.');
    }
    return pedido;
  }

  async update(id: number, dto: UpdatePedidoDto) {
    await this.findOne(id);

    if (!dto.itens) {
      return this.findOne(id);
    }

    const itensComValor = await this.mapItensComValor(dto.itens);
    const valorTotal = itensComValor.reduce((acc, item) => acc + item.valor, 0);

    return this.prisma.pedido.update({
      where: { id },
      data: {
        valorTotal,
        itens: {
          deleteMany: {},
          create: itensComValor,
        },
      },
      include: { itens: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.pedido.delete({ where: { id } });
  }
}
