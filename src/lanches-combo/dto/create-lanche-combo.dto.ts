import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreateLancheComboDto {
  @ApiProperty({ example: 'Combo Casal' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nome: string;

  @ApiProperty({ example: 'Pipoca grande + 2 refrigerantes' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  descricao: string;

  @ApiProperty({ example: 39.9 })
  @IsNumber()
  @IsPositive()
  preco: number;
}
