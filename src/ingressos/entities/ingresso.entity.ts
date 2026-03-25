import { IngressoTipo } from '../../enums/ingresso-tipo.enum';

export class IngressoEntity {
  id: number;
  sessaoId: number;
  tipo: IngressoTipo;
  valorPago: number;
}
