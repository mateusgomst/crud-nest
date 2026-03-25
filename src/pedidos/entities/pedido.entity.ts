import { PedidoItemTipo } from '../../enums/pedido-item-tipo.enum';

export class PedidoItemEntity {
  id: number;
  pedidoId: number;
  tipo: PedidoItemTipo;
  referenciaId: number;
  valor: number;
}

export class PedidoEntity {
  id: number;
  dataHora: Date;
  valorTotal: number;
  itens: PedidoItemEntity[];
}
