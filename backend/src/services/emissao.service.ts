// backend/src/services/emissao.service.ts
import { NfeService } from './nfe.service.js';
import { NfseService } from './nfse.service.js';
import { NfceService } from './nfce.service.js';
import { CteService } from './cte.service.js';
import { NFAeService } from './nfae.service.js';
import { EstoqueService } from './estoque.service.js';
import { FinanceiroService } from './financeiro.service.js';

export class EmissaoService {
  private nfeService: NfeService;
  private nfseService: NfseService;
  private nfceService: NfceService;
  private cteService: CteService;
  private nfaeService: NFAeService;
  private estoqueService: EstoqueService;
  private financeiroService: FinanceiroService;

  constructor() {
    this.nfeService = new NfeService();
    this.nfseService = new NfseService();
    this.nfceService = new NfceService();
    this.cteService = new CteService();
    this.nfaeService = new NFAeService();
    this.estoqueService = new EstoqueService();
    this.financeiroService = new FinanceiroService();
  }

  async emitirDocumento(tipo: 'NFE' | 'NFSE' | 'NFCE' | 'CTE' | 'NFAE', data: unknown) {
    let resultado;

    switch (tipo) {
      case 'NFE':
        resultado = await this.nfeService.emitirNfe(data as Parameters<typeof this.nfeService.emitirNfe>[0]);
        break;
      case 'NFSE':
        resultado = await this.nfseService.emitirNfse(data as Parameters<typeof this.nfseService.emitirNfse>[0]);
        break;
      case 'NFCE':
        resultado = await this.nfceService.emitirNfce(data as Parameters<typeof this.nfceService.emitirNfce>[0]);
        break;
      case 'CTE':
        resultado = await this.cteService.emitirCte(data as Parameters<typeof this.cteService.emitirCte>[0]);
        break;
      case 'NFAE':
        resultado = await this.nfaeService.emitir(data as Parameters<typeof this.nfaeService.emitir>[0]);
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
        resultado = await this.nfaeService.cancelar(id, motivo, empresaId);
        break;
      default:
        throw new Error('Tipo de documento fiscal inválido');
    }

    return resultado;
  }
}