import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsPositive } from 'class-validator';

export class CreateSessaoDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  filmeId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  salaId: number;

  @ApiProperty({ example: '2026-03-26T19:30:00.000Z' })
  @IsDateString()
  dataHora: string;

  @ApiProperty({ example: 45.5 })
  @IsPositive()
  valorIngresso: number;
}
