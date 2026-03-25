import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: dto.profileId },
    });
    if (!profile) {
      throw new NotFoundException('Profile nao encontrado.');
    }
    try {
      return await this.prisma.user.create({
        data: dto,
        include: { profile: true, address: true },
      });
    } catch {
      throw new ConflictException('Ja existe um usuario com esse email.');
    }
  }

  findAll() {
    return this.prisma.user.findMany({
      orderBy: { name: 'asc' },
      include: { profile: true, address: true },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { profile: true, address: true },
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
    try {
      return await this.prisma.user.update({
        where: { id },
        data: dto,
        include: { profile: true, address: true },
      });
    } catch {
      throw new ConflictException('Ja existe um usuario com esse email.');
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.user.delete({ where: { id } });
  }
}
