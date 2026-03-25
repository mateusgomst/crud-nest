import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateGeneroDto {
  @ApiProperty({ example: 'Aventura' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nome: string;
}
