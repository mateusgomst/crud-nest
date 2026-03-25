import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SnackCombosController } from './snack-combos.controller';
import { SnackCombosService } from './snack-combos.service';

@Module({
  imports: [PrismaModule],
  controllers: [SnackCombosController],
  providers: [SnackCombosService],
})
export class SnackCombosModule {}
