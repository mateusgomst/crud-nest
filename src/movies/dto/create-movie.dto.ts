import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreateMovieDto {
  @ApiProperty({ example: 'Interstellar' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  genreId: number;

  @ApiProperty({ example: 169, description: 'Duration in minutes' })
  @IsInt()
  @IsPositive()
  duration: number;

  @ApiProperty({ example: '14' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  ageRating: string;
}
