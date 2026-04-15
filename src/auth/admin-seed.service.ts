import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminSeedService implements OnModuleInit {
  private readonly logger = new Logger(AdminSeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureDefaultProfiles();
    await this.ensureDefaultAdmin();
  }

  private async ensureDefaultProfiles() {
    await this.ensureProfile('ADMIN');
    await this.ensureProfile('USER');
  }

  private async ensureProfile(name: string) {
    const existingProfile = await this.prisma.profile.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });

    if (!existingProfile) {
      await this.prisma.profile.create({ data: { name } });
      this.logger.log(`Profile padrao ${name} criado.`);
    }
  }

  private async ensureDefaultAdmin() {
    const adminEmail = 'admin@gmail.com';

    const adminProfile = await this.prisma.profile.findFirst({
      where: {
        name: {
          equals: 'ADMIN',
          mode: 'insensitive',
        },
      },
    });

    if (!adminProfile) {
      return;
    }

    const existingAdmin = await this.prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash('admin', 10);
      await this.prisma.user.create({
        data: {
          email: adminEmail,
          password: passwordHash,
          name: 'Admin Cadastrador',
          profileId: adminProfile.id,
        },
      });

      this.logger.log('Usuario admin padrao criado: admin@gmail.com');
    }
  }
}
