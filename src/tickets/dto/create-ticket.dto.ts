import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumber, IsOptional, IsPositive } from 'class-validator';
import { TicketType } from '../../enums/ticket-type.enum';

export class CreateTicketDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  sessionId: number;

  @ApiProperty({ enum: TicketType, example: TicketType.FULL })
  @IsEnum(TicketType)
  type: TicketType;

  @ApiPropertyOptional({ example: 22.75, description: 'If omitted, it will be calculated automatically.' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  paidValue?: number;
}
