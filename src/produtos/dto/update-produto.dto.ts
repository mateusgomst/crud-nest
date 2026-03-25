import { PartialType } from '@nestjs/mapped-types';
import { CreateProdutoDto } from './create-produto.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class UpdateProdutoDto extends PartialType(CreateProdutoDto) {
  @ApiProperty({
    example: 'Notebook gamer',
    description: 'Nome do produto',
  })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({
    example: 4200,
    description: 'Preco do produto',
  })
  @IsNumber()
  @Min(0)
  preco: number;

  @ApiProperty({
    example: 8,
    description: 'Quantidade em estoque',
  })
  @IsInt()
  @Min(0)
  estoque: number;

}
