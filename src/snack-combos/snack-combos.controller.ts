import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../enums/role.enum';
import { CreateSnackComboDto } from './dto/create-snack-combo.dto';
import { UpdateSnackComboDto } from './dto/update-snack-combo.dto';
import { SnackCombosService } from './snack-combos.service';

@ApiTags('snack-combos')
@Controller('snack-combos')
@Roles(Role.USER, Role.ADMIN)
export class SnackCombosController {
  constructor(private readonly service: SnackCombosService) {}

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateSnackComboDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSnackComboDto,
  ) {
    return this.service.update(id, dto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
