import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRoomDto) {
    try {
      return await this.prisma.room.create({ data: dto });
    } catch {
      throw new ConflictException('A room with this identifier already exists.');
    }
  }

  findAll() {
    return this.prisma.room.findMany({ orderBy: { identifier: 'asc' } });
  }

  async findOne(id: number) {
    const room = await this.prisma.room.findUnique({ where: { id } });
    if (!room) {
      throw new NotFoundException('Room not found.');
    }
    return room;
  }

  async update(id: number, dto: UpdateRoomDto) {
    await this.findOne(id);
    try {
      return await this.prisma.room.update({ where: { id }, data: dto });
    } catch {
      throw new ConflictException('A room with this identifier already exists.');
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.room.delete({ where: { id } });
  }
}
