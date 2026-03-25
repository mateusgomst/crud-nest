import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateProfileDto) {
    return this.prisma.profile.create({ data: dto });
  }

  findAll() {
    return this.prisma.profile.findMany({
      orderBy: { name: 'asc' },
      include: { users: true },
    });
  }

  async findOne(id: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id },
      include: { users: true },
    });
    if (!profile) {
      throw new NotFoundException('Profile nao encontrado.');
    }
    return profile;
  }

  async update(id: string, dto: UpdateProfileDto) {
    await this.findOne(id);
    return this.prisma.profile.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.profile.delete({ where: { id } });
  }
}
