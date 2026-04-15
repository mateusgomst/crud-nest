import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'senha123' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  password: string;

  @ApiProperty({ example: 'Usuario Cinema' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;
}
