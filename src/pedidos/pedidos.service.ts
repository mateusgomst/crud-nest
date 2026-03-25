import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';

@Injectable()
export class PedidosService {
  constructor(private prisma: PrismaService) {}

  async create(createPedidoDto: CreatePedidoDto) {
    return this.prisma.$transaction(async (tx) => {
      const produto = await tx.produto.findUnique({
        where: { id: createPedidoDto.produtoId },
        select: { id: true, estoque: true },
      });

      if (!produto) {
        throw new NotFoundException('Produto informado nao existe.');
      }

      if (produto.estoque <= 0) {
        throw new BadRequestException('Produto sem estoque para criar pedido.');
      }

      await tx.produto.update({
        where: { id: produto.id },
        data: { estoque: { decrement: 1 } },
      });

      return tx.pedido.create({ data: createPedidoDto });
    });
  }

  findAll() {
    return this.prisma.pedido.findMany({ include: { produto: true } });
  }

  findOne(id: number) {
    return this.prisma.pedido.findUnique({
      where: { id },
      include: { produto: true },
    });
  }

  async update(id: number, updatePedidoDto: UpdatePedidoDto) {
    if (updatePedidoDto.produtoId) {
      await this.ensureProdutoExists(updatePedidoDto.produtoId);
    }

    return this.prisma.pedido.update({
      where: { id },
      data: updatePedidoDto,
    });
  }

  remove(id: number) {
    return this.prisma.pedido.delete({ where: { id } });
  }

  private async ensureProdutoExists(produtoId: number) {
    const produto = await this.prisma.produto.findUnique({
      where: { id: produtoId },
      select: { id: true },
    });

    if (!produto) {
      throw new NotFoundException('Produto informado nao existe.');
    }
  }
}
