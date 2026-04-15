import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly userSelect = {
    id: true,
    email: true,
    name: true,
    profileId: true,
    createdAt: true,
    updatedAt: true,
    profile: true,
    address: {
      select: {
        id: true,
        city: true,
        state: true,
      },
    },
  } as const;

  async create(dto: CreateUserDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: dto.profileId },
    });
    if (!profile) {
      throw new NotFoundException('Profile nao encontrado.');
    }
    try {
      const passwordHash = await bcrypt.hash(dto.password, 10);
      return await this.prisma.user.create({
        data: {
          ...dto,
          password: passwordHash,
        },
        select: this.userSelect,
      });
    } catch {
      throw new ConflictException('Ja existe um usuario com esse email.');
    }
  }

  findAll() {
    return this.prisma.user.findMany({
      orderBy: { name: 'asc' },
      select: this.userSelect,
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.userSelect,
    });
    if (!user) {
      throw new NotFoundException('Usuario nao encontrado.');
    }
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);
    if (dto.profileId) {
      const profile = await this.prisma.profile.findUnique({
        where: { id: dto.profileId },
      });
      if (!profile) {
        throw new NotFoundException('Profile nao encontrado.');
      }
    }

    const data: UpdateUserDto = { ...dto };
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }

    try {
      return await this.prisma.user.update({
        where: { id },
        data,
        select: this.userSelect,
      });
    } catch {
      throw new ConflictException('Ja existe um usuario com esse email.');
    }
  }

  async remove(id: string) {
    await this.findOne(id);

    const linkedTickets = await this.prisma.ticket.count({
      where: { buyerId: id },
    });

    if (linkedTickets > 0) {
      throw new BadRequestException(
        'Nao e possivel excluir este usuario porque ele possui ingressos vinculados.',
      );
    }

    return this.prisma.user.delete({ where: { id } });
  }
}
