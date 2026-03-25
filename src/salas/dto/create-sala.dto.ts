import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreateSalaDto {
  @ApiProperty({ example: 'Sala 01' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  identificacao: string;

  @ApiProperty({ example: 120 })
  @IsInt()
  @IsPositive()
  capacidade: number;
}
