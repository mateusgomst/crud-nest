import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo pedido' })
  @ApiResponse({ status: 201, description: 'Pedido criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Erro ao criar pedido.' })
  create(@Body() createPedidoDto: CreatePedidoDto) {
    return this.pedidosService.create(createPedidoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os pedidos' })
  @ApiResponse({ status: 200, description: 'Lista de pedidos retornada com sucesso.' })
  findAll() {
    return this.pedidosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um pedido por ID' })
  @ApiResponse({ status: 200, description: 'Pedido encontrado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Pedido nao encontrado.' })
  findOne(@Param('id') id: string) {
    return this.pedidosService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um pedido por ID' })
  @ApiResponse({ status: 200, description: 'Pedido atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Pedido nao encontrado.' })
  update(@Param('id') id: string, @Body() updatePedidoDto: UpdatePedidoDto) {
    return this.pedidosService.update(+id, updatePedidoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um pedido por ID' })
  @ApiResponse({ status: 200, description: 'Pedido removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Pedido nao encontrado.' })
  remove(@Param('id') id: string) {
    return this.pedidosService.remove(+id);
  }
}
