import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsPositive,
  ValidateNested,
} from 'class-validator';
import { OrderItemType } from '../../enums/order-item-type.enum';

export class CreateOrderItemDto {
  @ApiProperty({ enum: OrderItemType, example: OrderItemType.TICKET })
  @IsEnum(OrderItemType)
  type: OrderItemType;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  referenceId: number;
}

export class CreateOrderDto {
  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
