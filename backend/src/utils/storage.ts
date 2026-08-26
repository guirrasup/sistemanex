// C:\emissornfe\backend\src\utils\storage.ts

/**
 * Armazenamento Local Persistente (Storage Engine) - BACKEND
 * SUP TECNOLOGIA - Emissor Fiscal & Gestão ERP
 * 
 * ⚠️ ESTE ARQUIVO É PARA TESTES/DESENVOLVIMENTO
 * Em produção, use o banco de dados via Prisma
 */

import { NFSeDocumento, NFeDocumento, NFCeDocumento, CTeDocumento, NFAeDocumento } from '../types/fiscal';
import { Produto, ServicoCatalogo, ClienteFornecedor, TituloFinanceiro, ConfiguracaoEmpresa, UsuarioAuth } from '../types/erp';

// 🔥 EXPORTA AS MESMAS FUNÇÕES DO FRONTEND PARA COMPATIBILIDADE
// Em produção, estas funções devem usar o banco de dados

export const StorageService = {
  // Auth
  getUsuarioLogado(): UsuarioAuth | null {
    return null;
  },
  saveUsuarioLogado(user: UsuarioAuth | null): void {
    // No backend, isso é gerenciado pelo JWT
  },

  // Empresa
  getEmpresa(): ConfiguracaoEmpresa {
    // Busca do banco de dados via Prisma
    return {} as ConfiguracaoEmpresa;
  },
  saveEmpresa(empresa: ConfiguracaoEmpresa): void {
    // Salva no banco de dados via Prisma
  },
  getConfiguracao(): ConfiguracaoEmpresa {
    return this.getEmpresa();
  },
  saveConfiguracao(empresa: ConfiguracaoEmpresa): void {
    this.saveEmpresa(empresa);
  },

  // Clientes
  getClientes(): ClienteFornecedor[] {
    return [];
  },
  saveClientes(clientes: ClienteFornecedor[]): void {},
  addCliente(cliente: ClienteFornecedor): void {},
  updateCliente(id: string, updates: Partial<ClienteFornecedor>): void {},
  deleteCliente(id: string): void {},

  // Produtos
  getProdutos(): Produto[] {
    return [];
  },
  saveProdutos(produtos: Produto[]): void {},
  addProduto(produto: Produto): void {},
  updateProduto(id: string, updates: Partial<Produto>): void {},

  // Serviços
  getServicos(): ServicoCatalogo[] {
    return [];
  },
  saveServicos(servicos: ServicoCatalogo[]): void {},
  addServico(servico: ServicoCatalogo): void {},
  updateServico(id: string, updates: Partial<ServicoCatalogo>): void {},

  // Títulos
  getTitulos(): TituloFinanceiro[] {
    return [];
  },
  saveTitulos(titulos: TituloFinanceiro[]): void {},
  addTitulo(titulo: TituloFinanceiro): void {},
  baixarTitulo(id: string): void {},

  // NFS-e
  getNfses(): NFSeDocumento[] {
    return [];
  },
  saveNfses(nfses: NFSeDocumento[]): void {},
  addNfse(nfse: NFSeDocumento): void {},

  // NF-e
  getNfes(): NFeDocumento[] {
    return [];
  },
  saveNfes(nfes: NFeDocumento[]): void {},
  addNfe(nfe: NFeDocumento): void {},

  // NFC-e
  getNfces(): NFCeDocumento[] {
    return [];
  },
  saveNfces(nfces: NFCeDocumento[]): void {},
  addNfce(nfce: NFCeDocumento): void {},

  // CT-e
  getCtes(): CTeDocumento[] {
    return [];
  },
  saveCtes(ctes: CTeDocumento[]): void {},
  addCte(cte: CTeDocumento): void {},

  // NFA-e
  getNfaes(): NFAeDocumento[] {
    return [];
  },
  saveNfaes(nfaes: NFAeDocumento[]): void {},
  addNfae(nfae: NFAeDocumento): void {},

  // Backup
  exportBackupJson(): string {
    return JSON.stringify({});
  },
  resetAllData(): void {},
};