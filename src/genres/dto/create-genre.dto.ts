import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateGenreDto {
  @ApiProperty({ example: 'Adventure' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;
}
