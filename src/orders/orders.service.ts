import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderItemType } from '../enums/order-item-type.enum';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

type OrderItemData = {
  type: OrderItemType;
  referenceId: number;
  value: number;
};

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  private async mapItemsWithValue(items: CreateOrderDto['items']): Promise<OrderItemData[]> {
    const itemsWithValue = await Promise.all(
      items.map(async (item) => {
        if (item.type === OrderItemType.TICKET) {
          const ticket = await this.prisma.ticket.findUnique({
            where: { id: item.referenceId },
            select: { paidValue: true },
          });
          if (!ticket) {
            throw new NotFoundException(`Ticket ${item.referenceId} not found.`);
          }
          return {
            type: OrderItemType.TICKET,
            referenceId: item.referenceId,
            value: ticket.paidValue,
          };
        }

        const combo = await this.prisma.snackCombo.findUnique({
          where: { id: item.referenceId },
          select: { price: true },
        });
        if (!combo) {
          throw new NotFoundException(`Combo ${item.referenceId} not found.`);
        }
        return {
          type: OrderItemType.COMBO,
          referenceId: item.referenceId,
          value: combo.price,
        };
      }),
    );

    return itemsWithValue;
  }

  async create(dto: CreateOrderDto) {
    const itemsWithValue = await this.mapItemsWithValue(dto.items);
    const totalValue = itemsWithValue.reduce((acc, item) => acc + item.value, 0);

    return this.prisma.order.create({
      data: {
        totalValue,
        items: {
          create: itemsWithValue,
        },
      },
      include: { items: true },
    });
  }

  findAll() {
    return this.prisma.order.findMany({
      include: { items: true },
      orderBy: { dateTime: 'desc' },
    });
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) {
      throw new NotFoundException('Order not found.');
    }
    return order;
  }

  async update(id: number, dto: UpdateOrderDto) {
    await this.findOne(id);

    if (!dto.items) {
      return this.findOne(id);
    }

    const itemsWithValue = await this.mapItemsWithValue(dto.items);
    const totalValue = itemsWithValue.reduce((acc, item) => acc + item.value, 0);

    return this.prisma.order.update({
      where: { id },
      data: {
        totalValue,
        items: {
          deleteMany: {},
          create: itemsWithValue,
        },
      },
      include: { items: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.order.delete({ where: { id } });
  }
}
