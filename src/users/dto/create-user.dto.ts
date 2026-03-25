import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'danielcs@gmail.com',
    description: 'Email do usuário',
  })
  @IsEmail()
  email: string;
  @ApiProperty({
    example: 'Daniel',
    description: 'Nome do usuário',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'senha123',
    description: 'Senha do usuário',
  })
  @IsString()
  @MinLength(6)
  password: string;
}
