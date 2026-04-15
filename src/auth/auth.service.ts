import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from '../enums/role.enum';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

type AuthUser = {
  id: string;
  email: string;
  name: string;
  profileId: string;
  profile: {
    id: string;
    name: string;
  };
  address: {
    id: string;
    city: string;
    state: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    return this.registerWithRole(dto, Role.USER);
  }

  async registerAdmin(dto: RegisterDto) {
    return this.registerWithRole(dto, Role.ADMIN);
  }

  private async registerWithRole(dto: RegisterDto, role: Role) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('Ja existe um usuario com esse email.');
    }

    const userProfile = await this.ensureProfile(role);
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: passwordHash,
        name: dto.name,
        profileId: userProfile.id,
      },
      include: {
        profile: true,
        address: {
          select: {
            id: true,
            city: true,
            state: true,
          },
        },
      },
    });

    const payload = {
      sub: user.id,
      email: user.email,
      profile: user.profile.name,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: this.sanitizeUser(user),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        profile: true,
        address: {
          select: {
            id: true,
            city: true,
            state: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais invalidas.');
    }

    let isPasswordValid = false;
    if (user.password.startsWith('$2')) {
      isPasswordValid = await bcrypt.compare(dto.password, user.password);
    } else {
      isPasswordValid = dto.password === user.password;
      if (isPasswordValid) {
        const passwordHash = await bcrypt.hash(dto.password, 10);
        await this.prisma.user.update({
          where: { id: user.id },
          data: { password: passwordHash },
        });
      }
    }

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais invalidas.');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      profile: user.profile.name,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: this.sanitizeUser(user),
    };
  }

  async validateUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        address: {
          select: {
            id: true,
            city: true,
            state: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario nao encontrado.');
    }

    return this.sanitizeUser(user);
  }

  private async ensureProfile(name: string) {
    const existing = await this.prisma.profile.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.profile.create({ data: { name } });
  }

  private sanitizeUser(user: {
    password: string;
    id: string;
    email: string;
    name: string;
    profileId: string;
    profile: {
      id: string;
      name: string;
    };
    address: {
      id: string;
      city: string;
      state: string;
    } | null;
    createdAt: Date;
    updatedAt: Date;
  }): AuthUser {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
