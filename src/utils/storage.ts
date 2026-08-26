// C:\emissornfe\src\utils\storage.ts

/**
 * Armazenamento Local Persistente (Storage Engine) - FRONTEND
 * SUP TECNOLOGIA - Emissor Fiscal & Gestão ERP
 */

import { NFSeDocumento, NFeDocumento, NFCeDocumento, CTeDocumento, NFAeDocumento, EventoFiscal } from '../types/fiscal';
import { Produto, MovimentacaoEstoque, ServicoCatalogo, ClienteFornecedor, TituloFinanceiro, ConfiguracaoEmpresa, UsuarioAuth } from '../types/erp';
import { gerarChaveAcessoNFSe, gerarChaveAcessoNFe } from './chaveAcesso';
import { calcularTributosNfse, calcularTotaisNfe } from './tributosEngine';
import { gerarXmlNfseNacional } from './xmlNfseGenerator';
import { gerarXmlNfe400 } from './xmlNfeGenerator';

const STORAGE_KEYS = {
  AUTH_USER: 'sup_auth_user',
  EMPRESA: 'sup_empresa_config',
  CLIENTES: 'sup_clientes_fornecedores',
  PRODUTOS: 'sup_produtos',
  SERVICOS: 'sup_servicos_catalogo',
  KARDEX: 'sup_kardex_movimentacoes',
  FINANCEIRO: 'sup_titulos_financeiros',
  NFSES: 'sup_nfse_documentos',
  NFES: 'sup_nfe_documentos',
  NFCES: 'sup_nfce_documentos',
  CTES: 'sup_cte_documentos',
  NFAES: 'sup_nfae_documentos',
  EVENTOS: 'sup_eventos_fiscais',
};

export const EMPRESA_PADRAO: ConfiguracaoEmpresa = {
  razaoSocial: '',
  nomeFantasia: '',
  cnpj: '',
  inscricaoEstadual: '',
  inscricaoMunicipal: '',
  cnae: '',
  regimeTributario: 1,
  aliquotaSimplesNacional: 6.0,
  ambienteEmissao: 1,
  serieNfe: 1,
  proximoNumeroNfe: 1,
  serieNfse: 1,
  proximoNumeroNfse: 1,
  serieNfce: 1,
  proximoNumeroNfce: 1,
  endereco: {
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    codigoMunicipio: '',
    nomeMunicipio: '',
    uf: '',
    cep: '',
    telefone: '',
    email: '',
  },
  certificado: {
    instalado: false,
    tipo: 'A1',
    nomeTitular: '',
    cnpjCpf: '',
    emissora: '',
    dataValidadeInicio: '',
    dataValidadeFim: '',
    diasRestantes: 0,
    arquivoCarregadoNome: '',
    status: 'NAO_CONFIGURADO',
  },
  chavePixPadrao: '',
  bancoPadrao: '',
};

export const USUARIO_PADRAO: UsuarioAuth = {
  id: 'usr-admin-01',
  nome: 'Administrador',
  email: 'admin@empresa.com.br',
  cargo: 'Administrador',
  perfil: 'ADMIN',
  empresaCnpj: '',
  dataLogin: new Date().toISOString(),
};

export const CLIENTES_PADRAO: ClienteFornecedor[] = [];
export const PRODUTOS_PADRAO: Produto[] = [];
export const SERVICOS_PADRAO: ServicoCatalogo[] = [];
export const TITULOS_PADRAO: TituloFinanceiro[] = [];
export const KARDEX_PADRAO: MovimentacaoEstoque[] = [];

function getJson<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Erro ao ler localStorage [${key}]:`, err);
    return defaultValue;
  }
}

function setJson<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Erro ao gravar localStorage [${key}]:`, err);
  }
}

export const StorageService = {
  // Auth
  getUsuarioLogado(): UsuarioAuth | null {
    return getJson<UsuarioAuth | null>(STORAGE_KEYS.AUTH_USER, null);
  },
  saveUsuarioLogado(user: UsuarioAuth | null): void {
    if (user === null) {
      try {
        localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
      } catch (err) {
        console.error('Erro ao remover usuário logado:', err);
      }
    } else {
      setJson(STORAGE_KEYS.AUTH_USER, user);
    }
  },

  // Empresa
  getEmpresa(): ConfiguracaoEmpresa {
    return getJson(STORAGE_KEYS.EMPRESA, EMPRESA_PADRAO);
  },
  saveEmpresa(empresa: ConfiguracaoEmpresa): void {
    setJson(STORAGE_KEYS.EMPRESA, empresa);
  },
  getConfiguracao(): ConfiguracaoEmpresa {
    return this.getEmpresa();
  },
  saveConfiguracao(empresa: ConfiguracaoEmpresa): void {
    this.saveEmpresa(empresa);
  },

  // Clientes
  getClientes(): ClienteFornecedor[] {
    return getJson(STORAGE_KEYS.CLIENTES, CLIENTES_PADRAO);
  },
  saveClientes(clientes: ClienteFornecedor[]): void {
    setJson(STORAGE_KEYS.CLIENTES, clientes);
  },
  addCliente(cliente: ClienteFornecedor): void {
    const lista = this.getClientes();
    const index = lista.findIndex(c => c.id === cliente.id);
    if (index >= 0) {
      lista[index] = cliente;
    } else {
      lista.unshift(cliente);
    }
    this.saveClientes(lista);
  },
  updateCliente(id: string, updates: Partial<ClienteFornecedor>): void {
    const lista = this.getClientes();
    const index = lista.findIndex(c => c.id === id);
    if (index >= 0) {
      lista[index] = { ...lista[index], ...updates };
      this.saveClientes(lista);
    }
  },
  deleteCliente(id: string): void {
    const lista = this.getClientes().filter(c => c.id !== id);
    this.saveClientes(lista);
  },

  // Produtos
  getProdutos(): Produto[] {
    return getJson(STORAGE_KEYS.PRODUTOS, PRODUTOS_PADRAO);
  },
  saveProdutos(produtos: Produto[]): void {
    setJson(STORAGE_KEYS.PRODUTOS, produtos);
  },
  addProduto(produto: Produto): void {
    const lista = this.getProdutos();
    const index = lista.findIndex(p => p.id === produto.id);
    if (index >= 0) {
      lista[index] = produto;
    } else {
      lista.unshift(produto);
    }
    this.saveProdutos(lista);
  },
  updateProduto(id: string, updates: Partial<Produto>): void {
    const lista = this.getProdutos();
    const index = lista.findIndex(p => p.id === id);
    if (index >= 0) {
      lista[index] = { ...lista[index], ...updates };
      this.saveProdutos(lista);
    }
  },

  // Serviços
  getServicos(): ServicoCatalogo[] {
    return getJson(STORAGE_KEYS.SERVICOS, SERVICOS_PADRAO);
  },
  saveServicos(servicos: ServicoCatalogo[]): void {
    setJson(STORAGE_KEYS.SERVICOS, servicos);
  },
  addServico(servico: ServicoCatalogo): void {
    const lista = this.getServicos();
    const index = lista.findIndex(s => s.id === servico.id);
    if (index >= 0) {
      lista[index] = servico;
    } else {
      lista.unshift(servico);
    }
    this.saveServicos(lista);
  },
  updateServico(id: string, updates: Partial<ServicoCatalogo>): void {
    const lista = this.getServicos();
    const index = lista.findIndex(s => s.id === id);
    if (index >= 0) {
      lista[index] = { ...lista[index], ...updates };
      this.saveServicos(lista);
    }
  },

  // Títulos Financeiros
  getTitulos(): TituloFinanceiro[] {
    return getJson(STORAGE_KEYS.FINANCEIRO, TITULOS_PADRAO);
  },
  saveTitulos(titulos: TituloFinanceiro[]): void {
    setJson(STORAGE_KEYS.FINANCEIRO, titulos);
  },
  addTitulo(titulo: TituloFinanceiro): void {
    const lista = this.getTitulos();
    const index = lista.findIndex(t => t.id === titulo.id);
    if (index >= 0) {
      lista[index] = titulo;
    } else {
      lista.unshift(titulo);
    }
    this.saveTitulos(lista);
  },
  baixarTitulo(id: string): void {
    const titulos = this.getTitulos();
    const tit = titulos.find(t => t.id === id);
    if (tit) {
      tit.status = 'PAGO';
      tit.dataPagamento = new Date().toISOString().split('T')[0];
      tit.valorPago = tit.valorOriginal;
      this.saveTitulos(titulos);
    }
  },

  // NFS-e
  getNfses(): NFSeDocumento[] {
    return getJson(STORAGE_KEYS.NFSES, []);
  },
  saveNfses(nfses: NFSeDocumento[]): void {
    setJson(STORAGE_KEYS.NFSES, nfses);
  },
  addNfse(nfse: NFSeDocumento): void {
    const lista = this.getNfses();
    lista.unshift(nfse);
    this.saveNfses(lista);
  },

  // NF-e
  getNfes(): NFeDocumento[] {
    return getJson(STORAGE_KEYS.NFES, []);
  },
  saveNfes(nfes: NFeDocumento[]): void {
    setJson(STORAGE_KEYS.NFES, nfes);
  },
  addNfe(nfe: NFeDocumento): void {
    const lista = this.getNfes();
    lista.unshift(nfe);
    this.saveNfes(lista);
  },

  // NFC-e
  getNfces(): NFCeDocumento[] {
    return getJson(STORAGE_KEYS.NFCES, []);
  },
  saveNfces(nfces: NFCeDocumento[]): void {
    setJson(STORAGE_KEYS.NFCES, nfces);
  },
  addNfce(nfce: NFCeDocumento): void {
    const lista = this.getNfces();
    lista.unshift(nfce);
    this.saveNfces(lista);
  },

  // CT-e
  getCtes(): CTeDocumento[] {
    return getJson(STORAGE_KEYS.CTES, []);
  },
  saveCtes(ctes: CTeDocumento[]): void {
    setJson(STORAGE_KEYS.CTES, ctes);
  },
  addCte(cte: CTeDocumento): void {
    const lista = this.getCtes();
    lista.unshift(cte);
    this.saveCtes(lista);
  },

  // NFA-e
  getNfaes(): NFAeDocumento[] {
    return getJson(STORAGE_KEYS.NFAES, []);
  },
  saveNfaes(nfaes: NFAeDocumento[]): void {
    setJson(STORAGE_KEYS.NFAES, nfaes);
  },
  addNfae(nfae: NFAeDocumento): void {
    const lista = this.getNfaes();
    lista.unshift(nfae);
    this.saveNfaes(lista);
  },

  // Eventos
  getEventos(): EventoFiscal[] {
    return getJson(STORAGE_KEYS.EVENTOS, []);
  },
  saveEventos(eventos: EventoFiscal[]): void {
    setJson(STORAGE_KEYS.EVENTOS, eventos);
  },
  addEvento(evento: EventoFiscal): void {
    const lista = this.getEventos();
    lista.unshift(evento);
    this.saveEventos(lista);
  },

  // Backup
  exportBackupJson(): string {
    const backup = {
      empresa: this.getEmpresa(),
      clientes: this.getClientes(),
      produtos: this.getProdutos(),
      servicos: this.getServicos(),
      titulos: this.getTitulos(),
      nfses: this.getNfses(),
      nfes: this.getNfes(),
      nfces: this.getNfces(),
      ctes: this.getCtes(),
      nfaes: this.getNfaes(),
      eventos: this.getEventos(),
      dataExportacao: new Date().toISOString(),
      versao: 'SUP-TECNOLOGIA-ERP-2026',
    };
    return JSON.stringify(backup, null, 2);
  },

  resetAllData(): void {
    localStorage.clear();
  },
};