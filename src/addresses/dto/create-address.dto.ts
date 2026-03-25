import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ example: 'Rua das Flores' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  street: string;

  @ApiProperty({ example: 123 })
  @IsInt()
  @IsPositive()
  number: number;

  @ApiProperty({ example: 'São Paulo' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  city: string;

  @ApiProperty({ example: 'SP' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2)
  state: string;

  @ApiProperty({ example: '01001-000' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(9)
  zipCode: string;

  @ApiProperty({ example: 'uuid-do-usuario' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
