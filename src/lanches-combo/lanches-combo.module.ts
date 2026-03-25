import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { LanchesComboController } from './lanches-combo.controller';
import { LanchesComboService } from './lanches-combo.service';

@Module({
  imports: [PrismaModule],
  controllers: [LanchesComboController],
  providers: [LanchesComboService],
})
export class LanchesComboModule {}
