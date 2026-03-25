import { PartialType } from '@nestjs/mapped-types';
import { CreatePedidoDto } from './create-pedido.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class UpdatePedidoDto extends PartialType(CreatePedidoDto) {
  @ApiProperty({
    example: 1,
    description: 'ID do usuario',
  })
  @IsInt()
  userId: number;

  @ApiProperty({
    example: 'Pedido atualizado',
    description: 'Nome do pedido',
  })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({
    example: 1,
    description: 'ID do produto',
  })
  @IsInt()
  produtoId: number;

}
