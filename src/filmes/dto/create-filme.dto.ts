import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreateFilmeDto {
  @ApiProperty({ example: 'Interstellar' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  titulo: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  generoId: number;

  @ApiProperty({ example: 169, description: 'Duracao em minutos' })
  @IsInt()
  @IsPositive()
  duracao: number;

  @ApiProperty({ example: '14 anos' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  classificacaoEtaria: string;
}
