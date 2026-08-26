// C:\emissornfe\backend\src\services\emissao.service.ts

import { NfeService } from './nfe.service';
import { NfseService } from './nfse.service';
import { NfceService } from './nfce.service';
import { CteService } from './cte.service';
import { NfaeService } from './nfae.service';
import { EstoqueService } from './estoque.service';
import { FinanceiroService } from './financeiro.service';

export class EmissaoService {
  private nfeService: NfeService;
  private nfseService: NfseService;
  private nfceService: NfceService;
  private cteService: CteService;
  private nfaeService: NfaeService;
  private estoqueService: EstoqueService;
  private financeiroService: FinanceiroService;

  constructor() {
    this.nfeService = new NfeService();
    this.nfseService = new NfseService();
    this.nfceService = new NfceService();
    this.cteService = new CteService();
    this.nfaeService = new NfaeService();
    this.estoqueService = new EstoqueService();
    this.financeiroService = new FinanceiroService();
  }

  async emitirDocumento(tipo: 'NFE' | 'NFSE' | 'NFCE' | 'CTE' | 'NFAE', data: any) {
    let resultado;

    switch (tipo) {
      case 'NFE':
        resultado = await this.nfeService.emitirNfe(data);
        break;
      case 'NFSE':
        resultado = await this.nfseService.emitirNfse(data);
        break;
      case 'NFCE':
        resultado = await this.nfceService.emitirNfce(data);
        break;
      case 'CTE':
        resultado = await this.cteService.emitirCte(data);
        break;
      case 'NFAE':
        resultado = await this.nfaeService.emitirNfae(data);
        break;
      default:
        throw new Error('Tipo de documento fiscal inválido');
    }

    return resultado;
  }

  async cancelarDocumento(tipo: 'NFE' | 'NFSE' | 'NFCE' | 'CTE' | 'NFAE', id: string, motivo: string, empresaId: string) {
    let resultado;

    switch (tipo) {
      case 'NFE':
        resultado = await this.nfeService.cancelarNfe(id, motivo, empresaId);
        break;
      case 'NFSE':
        resultado = await this.nfseService.cancelarNfse(id, motivo, empresaId);
        break;
      case 'NFCE':
        resultado = await this.nfceService.cancelarNfce(id, motivo, empresaId);
        break;
      case 'CTE':
        resultado = await this.cteService.cancelarCte(id, motivo, empresaId);
        break;
      case 'NFAE':
        resultado = await this.nfaeService.cancelarNfae(id, motivo, empresaId);
        break;
      default:
        throw new Error('Tipo de documento fiscal inválido');
    }

    return resultado;
  }
}