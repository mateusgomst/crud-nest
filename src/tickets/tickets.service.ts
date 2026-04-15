import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../enums/role.enum';
import { TicketType } from '../enums/ticket-type.enum';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

type RequestUser = {
  id: string;
  profile?: {
    name?: string;
  };
};

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  private isAdmin(user: RequestUser) {
    return user.profile?.name?.toUpperCase() === Role.ADMIN;
  }

  private calculatePaidValue(type: string, baseValue: number) {
    return type === TicketType.HALF ? baseValue / 2 : baseValue;
  }

  async create(dto: CreateTicketDto, user: RequestUser) {
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
          buyerId: user.id,
          type: dto.type,
          paidValue,
          isPaid: false,
        },
        include: {
          session: {
            include: {
              movie: true,
              room: true,
            },
          },
          buyer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    });
  }

  findAll(user: RequestUser) {
    const where = this.isAdmin(user) ? {} : { buyerId: user.id };

    return this.prisma.ticket.findMany({
      where,
      include: {
        session: {
          include: {
            movie: true,
            room: true,
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number, user: RequestUser) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        session: true,
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    if (!ticket) {
      throw new NotFoundException('Ticket not found.');
    }

    if (!this.isAdmin(user) && ticket.buyerId !== user.id) {
      throw new ForbiddenException('Voce nao pode acessar este ticket.');
    }

    return ticket;
  }

  async pay(id: number, user: RequestUser) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    if (!ticket) {
      throw new NotFoundException('Ticket not found.');
    }

    if (ticket.buyerId !== user.id && !this.isAdmin(user)) {
      throw new ForbiddenException('Voce nao pode pagar este ticket.');
    }

    if (ticket.isPaid) {
      return this.findOne(id, user);
    }

    await this.prisma.ticket.update({
      where: { id },
      data: {
        isPaid: true,
        paidAt: new Date(),
      },
    });

    return this.findOne(id, user);
  }

  async update(id: number, dto: UpdateTicketDto, user: RequestUser) {
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

  async remove(id: number, user: RequestUser) {
    await this.findOne(id, user);
    return this.prisma.ticket.delete({ where: { id } });
  }
}
