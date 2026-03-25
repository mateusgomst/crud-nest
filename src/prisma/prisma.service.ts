import 'dotenv/config';
import * as process from 'node:process';
import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL nao definida');
    }
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    super({ adapter });
  }
}
