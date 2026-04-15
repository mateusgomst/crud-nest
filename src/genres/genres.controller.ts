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
import { Role } from '../enums/role.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { GenresService } from './genres.service';

@ApiTags('genres')
@Controller('genres')
@Roles(Role.USER, Role.ADMIN)
export class GenresController {
  constructor(private readonly service: GenresService) {}

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateGenreDto) {
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
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateGenreDto) {
    return this.service.update(id, dto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
