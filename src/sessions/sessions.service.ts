import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

function addMinutes(baseDate: Date, minutes: number): Date {
  return new Date(baseDate.getTime() + minutes * 60_000);
}

function subMinutes(baseDate: Date, minutes: number): Date {
  return new Date(baseDate.getTime() - minutes * 60_000);
}

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureNoOverlap(
    roomId: number,
    start: Date,
    movieDuration: number,
    ignoreSessionId?: number,
  ): Promise<void> {
    const end = addMinutes(start, movieDuration);
    const maxDuration = await this.prisma.movie.aggregate({ _max: { duration: true } });
    const windowStart = subMinutes(start, maxDuration._max.duration ?? 0);

    const roomSessions = await this.prisma.session.findMany({
      where: {
        roomId,
        id: ignoreSessionId ? { not: ignoreSessionId } : undefined,
        dateTime: {
          gt: windowStart,
          lt: end,
        },
      },
      include: {
        movie: { select: { duration: true } },
      },
    });

    const hasConflict = roomSessions.some((session) => {
      const existingStart = session.dateTime;
      const existingEnd = addMinutes(existingStart, session.movie.duration);
      return start < existingEnd && end > existingStart;
    });

    if (hasConflict) {
      throw new BadRequestException('There is already an overlapping session for this room.');
    }
  }

  async create(dto: CreateSessionDto) {
    const [movie, room] = await Promise.all([
      this.prisma.movie.findUnique({ where: { id: dto.movieId } }),
      this.prisma.room.findUnique({ where: { id: dto.roomId } }),
    ]);

    if (!movie) {
      throw new NotFoundException('Movie not found.');
    }
    if (!room) {
      throw new NotFoundException('Room not found.');
    }

    const start = new Date(dto.dateTime);
    await this.ensureNoOverlap(dto.roomId, start, movie.duration);

    return this.prisma.session.create({
      data: {
        movieId: dto.movieId,
        roomId: dto.roomId,
        dateTime: start,
        ticketPrice: dto.ticketPrice,
      },
    });
  }

  findAll() {
    return this.prisma.session.findMany({
      include: {
        movie: { include: { genre: true } },
        room: true,
      },
      orderBy: { dateTime: 'asc' },
    });
  }

  async findOne(id: number) {
    const session = await this.prisma.session.findUnique({
      where: { id },
      include: {
        movie: { include: { genre: true } },
        room: true,
        _count: { select: { tickets: true } },
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found.');
    }

    return session;
  }

  async update(id: number, dto: UpdateSessionDto) {
    const current = await this.prisma.session.findUnique({
      where: { id },
      include: { movie: true, room: true },
    });
    if (!current) {
      throw new NotFoundException('Session not found.');
    }

    const movieId = dto.movieId ?? current.movieId;
    const roomId = dto.roomId ?? current.roomId;
    const start = dto.dateTime ? new Date(dto.dateTime) : current.dateTime;

    const [movie, room] = await Promise.all([
      this.prisma.movie.findUnique({ where: { id: movieId } }),
      this.prisma.room.findUnique({ where: { id: roomId } }),
    ]);

    if (!movie) {
      throw new NotFoundException('Movie not found.');
    }
    if (!room) {
      throw new NotFoundException('Room not found.');
    }

    await this.ensureNoOverlap(roomId, start, movie.duration, id);

    return this.prisma.session.update({
      where: { id },
      data: {
        movieId,
        roomId,
        dateTime: start,
        ticketPrice: dto.ticketPrice ?? current.ticketPrice,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    const linkedTickets = await this.prisma.ticket.count({
      where: { sessionId: id },
    });

    if (linkedTickets > 0) {
      throw new BadRequestException(
        'Nao e possivel excluir esta sessao porque ela possui ingressos vinculados.',
      );
    }

    return this.prisma.session.delete({ where: { id } });
  }
}
