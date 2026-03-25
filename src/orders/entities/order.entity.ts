import { OrderItemType } from '../../enums/order-item-type.enum';

export class OrderItemEntity {
  id: number;
  orderId: number;
  type: OrderItemType;
  referenceId: number;
  value: number;
}

export class OrderEntity {
  id: number;
  dateTime: Date;
  totalValue: number;
  items: OrderItemEntity[];
}
