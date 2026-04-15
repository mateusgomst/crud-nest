import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../enums/role.enum';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketsService } from './tickets.service';

@ApiTags('tickets')
@Controller('tickets')
@Roles(Role.USER, Role.ADMIN)
export class TicketsController {
  constructor(private readonly service: TicketsService) {}

  @Post()
  create(
    @Body() dto: CreateTicketDto,
    @Req() req: { user: { id: string; profile?: { name?: string } } },
  ) {
    return this.service.create(dto, req.user);
  }

  @Get()
  findAll(@Req() req: { user: { id: string; profile?: { name?: string } } }) {
    return this.service.findAll(req.user);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: { id: string; profile?: { name?: string } } },
  ) {
    return this.service.findOne(id, req.user);
  }

  @Patch(':id/pay')
  pay(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: { id: string; profile?: { name?: string } } },
  ) {
    return this.service.pay(id, req.user);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTicketDto,
    @Req() req: { user: { id: string; profile?: { name?: string } } },
  ) {
    return this.service.update(id, dto, req.user);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: { id: string; profile?: { name?: string } } },
  ) {
    return this.service.remove(id, req.user);
  }
}
