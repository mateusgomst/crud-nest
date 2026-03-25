import { TicketType } from '../../enums/ticket-type.enum';

export class TicketEntity {
  id: number;
  sessionId: number;
  type: TicketType;
  paidValue: number;
}
