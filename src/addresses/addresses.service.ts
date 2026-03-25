import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAddressDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });
    if (!user) {
      throw new NotFoundException('Usuario nao encontrado.');
    }
    try {
      return await this.prisma.address.create({
        data: dto,
        include: { user: true },
      });
    } catch {
      throw new ConflictException('Este usuario ja possui um endereco cadastrado.');
    }
  }

  findAll() {
    return this.prisma.address.findMany({
      orderBy: { city: 'asc' },
      include: { user: true },
    });
  }

  async findOne(id: string) {
    const address = await this.prisma.address.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!address) {
      throw new NotFoundException('Endereco nao encontrado.');
    }
    return address;
  }

  async update(id: string, dto: UpdateAddressDto) {
    await this.findOne(id);
    if (dto.userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: dto.userId },
      });
      if (!user) {
        throw new NotFoundException('Usuario nao encontrado.');
      }
    }
    try {
      return await this.prisma.address.update({
        where: { id },
        data: dto,
        include: { user: true },
      });
    } catch {
      throw new ConflictException('Este usuario ja possui um endereco cadastrado.');
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.address.delete({ where: { id } });
  }
}
