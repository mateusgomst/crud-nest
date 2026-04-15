import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly userPublicSelect = {
    id: true,
    email: true,
    name: true,
    profileId: true,
    createdAt: true,
    updatedAt: true,
  } as const;

  async create(dto: CreateProfileDto) {
    const existing = await this.prisma.profile.findFirst({
      where: {
        name: {
          equals: dto.name,
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      throw new ConflictException('Ja existe um profile com esse nome.');
    }

    return this.prisma.profile.create({ data: dto });
  }

  findAll() {
    return this.prisma.profile.findMany({
      orderBy: { name: 'asc' },
      include: { users: { select: this.userPublicSelect } },
    });
  }

  async findOne(id: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id },
      include: { users: { select: this.userPublicSelect } },
    });
    if (!profile) {
      throw new NotFoundException('Profile nao encontrado.');
    }
    return profile;
  }

  async update(id: string, dto: UpdateProfileDto) {
    await this.findOne(id);
    if (dto.name) {
      const existing = await this.prisma.profile.findFirst({
        where: {
          id: { not: id },
          name: {
            equals: dto.name,
            mode: 'insensitive',
          },
        },
      });

      if (existing) {
        throw new ConflictException('Ja existe um profile com esse nome.');
      }
    }

    return this.prisma.profile.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);

    const linkedUsers = await this.prisma.user.count({
      where: { profileId: id },
    });

    if (linkedUsers > 0) {
      throw new BadRequestException(
        'Nao e possivel excluir este profile porque ele possui usuarios vinculados.',
      );
    }

    return this.prisma.profile.delete({ where: { id } });
  }
}
