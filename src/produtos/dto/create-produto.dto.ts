import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateProdutoDto {
  @ApiProperty({
    example: 'Notebook',
    description: 'Nome do produto',
  })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({
    example: 3500,
    description: 'Preco do produto',
  })
  @IsNumber()
  @Min(0)
  preco: number;

  @ApiProperty({
    example: 10,
    description: 'Quantidade em estoque',
  })
  @IsInt()
  @Min(0)
  estoque: number;

}
