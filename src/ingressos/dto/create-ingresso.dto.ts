import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumber, IsOptional, IsPositive } from 'class-validator';
import { IngressoTipo } from '../../enums/ingresso-tipo.enum';

export class CreateIngressoDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  sessaoId: number;

  @ApiProperty({ enum: IngressoTipo, example: IngressoTipo.INTEIRA })
  @IsEnum(IngressoTipo)
  tipo: IngressoTipo;

  @ApiPropertyOptional({ example: 22.75, description: 'Se omitido, sera calculado automaticamente.' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  valorPago?: number;
}
