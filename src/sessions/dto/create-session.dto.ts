import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsPositive } from 'class-validator';

export class CreateSessionDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  movieId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  roomId: number;

  @ApiProperty({ example: '2026-03-26T19:30:00.000Z' })
  @IsDateString()
  dateTime: string;

  @ApiProperty({ example: 45.5 })
  @IsPositive()
  ticketPrice: number;
}
