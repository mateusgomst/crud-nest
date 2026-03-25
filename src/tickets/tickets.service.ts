import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TicketType } from '../enums/ticket-type.enum';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  private calculatePaidValue(type: string, baseValue: number) {
    return type === TicketType.HALF ? baseValue / 2 : baseValue;
  }

  async create(dto: CreateTicketDto) {
    return this.prisma.$transaction(async (tx) => {
      const session = await tx.session.findUnique({
        where: { id: dto.sessionId },
        include: { room: true },
      });
      if (!session) {
        throw new NotFoundException('Session not found.');
      }

      const ticketCount = await tx.ticket.count({
        where: { sessionId: dto.sessionId },
      });

      if (ticketCount >= session.room.capacity) {
        throw new BadRequestException('Room capacity reached for this session.');
      }

      const paidValue = dto.paidValue ?? this.calculatePaidValue(dto.type, session.ticketPrice);

      return tx.ticket.create({
        data: {
          sessionId: dto.sessionId,
          type: dto.type,
          paidValue,
        },
      });
    });
  }

  findAll() {
    return this.prisma.ticket.findMany({
      include: {
        session: {
          include: {
            movie: true,
            room: true,
          },
        },
      },
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: { session: true },
    });
    if (!ticket) {
      throw new NotFoundException('Ticket not found.');
    }
    return ticket;
  }

  async update(id: number, dto: UpdateTicketDto) {
    const current = await this.prisma.ticket.findUnique({ where: { id } });
    if (!current) {
      throw new NotFoundException('Ticket not found.');
    }

    return this.prisma.$transaction(async (tx) => {
      const sessionId = dto.sessionId ?? current.sessionId;
      const type = dto.type ?? current.type;

      const session = await tx.session.findUnique({
        where: { id: sessionId },
        include: { room: true },
      });
      if (!session) {
        throw new NotFoundException('Session not found.');
      }

      if (sessionId !== current.sessionId) {
        const ticketsInTarget = await tx.ticket.count({ where: { sessionId } });
        if (ticketsInTarget >= session.room.capacity) {
          throw new BadRequestException('Room capacity reached for the target session.');
        }
      }

      const paidValue = dto.paidValue ?? this.calculatePaidValue(type, session.ticketPrice);

      return tx.ticket.update({
        where: { id },
        data: {
          sessionId,
          type,
          paidValue,
        },
      });
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.ticket.delete({ where: { id } });
  }
}
