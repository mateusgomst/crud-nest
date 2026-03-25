import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsPositive,
  ValidateNested,
} from 'class-validator';
import { PedidoItemTipo } from '../../enums/pedido-item-tipo.enum';

export class CreatePedidoItemDto {
  @ApiProperty({ enum: PedidoItemTipo, example: PedidoItemTipo.INGRESSO })
  @IsEnum(PedidoItemTipo)
  tipo: PedidoItemTipo;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  referenciaId: number;
}

export class CreatePedidoDto {
  @ApiProperty({ type: [CreatePedidoItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreatePedidoItemDto)
  itens: CreatePedidoItemDto[];
}
