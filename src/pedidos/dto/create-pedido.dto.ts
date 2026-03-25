import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreatePedidoDto {
  @ApiProperty({
    example: 1,
    description: 'ID do usuario',
  })
  @IsInt()
  userId: number;

  @ApiProperty({
    example: 'Pedido do Mateus',
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
