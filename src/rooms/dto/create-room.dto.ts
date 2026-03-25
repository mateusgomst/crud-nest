import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({ example: 'Room 01' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  identifier: string;

  @ApiProperty({ example: 120 })
  @IsInt()
  @IsPositive()
  capacity: number;
}
