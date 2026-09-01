import { Prisma, StatusDocumento } from '@prisma/client';
import { NfseRepository } from '../repositories/nfse.repository.js';
import { ClienteRepository } from '../repositories/cliente.repository.js';
import { EmpresaRepository } from '../repositories/empresa.repository.js';
import { FinanceiroRepository } from '../repositories/financeiro.repository.js';
import { ServicoRepository } from '../repositories/servico.repository.js';
import { gerarChaveAcessoNFSe } from '../utils/chaveAcesso.js';
import { calcularTributosNfse } from '../utils/tributosEngine.js';
import { gerarXmlNfseNacional } from '../utils/xmlNfseGenerator.js';

export class NfseService {
  private nfseRepo: NfseRepository;
  private clienteRepo: ClienteRepository;
  private empresaRepo: EmpresaRepository;
  private financeiroRepo: FinanceiroRepository;
  private servicoRepo: ServicoRepository;

  constructor() {
    this.nfseRepo = new NfseRepository();
    this.clienteRepo = new ClienteRepository();
    this.empresaRepo = new EmpresaRepository();
    this.financeiroRepo = new FinanceiroRepository();
    this.servicoRepo = new ServicoRepository();
  }

  /**
   * 📋 LISTAR NFS-e COM FILTROS
   */
  async listarNfses(
    empresaId: string,
    page: number = 1,
    limit: number = 50,
    filtros?: {
      status?: StatusDocumento | StatusDocumento[];
      dataInicio?: Date;
      dataFim?: Date;
      tomadorId?: string;
      numeroNfse?: number;
      serieDPS?: number;
      chave?: string;
    }
  ) {
    return this.nfseRepo.findAll({
      empresaId,
      status: filtros?.status,
      dataInicio: filtros?.dataInicio,
      dataFim: filtros?.dataFim,
      tomadorId: filtros?.tomadorId,
      numeroNfse: filtros?.numeroNfse,
      serieDPS: filtros?.serieDPS,
      chaveAcesso: filtros?.chave,
      page,
      limit
    });
  }

  /**
   * 🔍 BUSCAR NFS-e POR ID
   */
  async buscarPorId(id: string) {
    return this.nfseRepo.findById(id);
  }

  /**
   * 🔍 BUSCAR NFS-e POR CHAVE (53 dígitos)
   */
  async buscarPorChave(chave: string) {
    if (!/^[0-9]{53}$/.test(chave)) {
      throw new Error('Chave de acesso inválida: deve ter 53 dígitos');
    }
    return this.nfseRepo.findByChave(chave);
  }

  /**
   * 🔍 BUSCAR NFS-e POR PROTOCOLO
   */
  async buscarPorProtocolo(protocolo: string) {
    return this.nfseRepo.findByProtocolo(protocolo);
  }

  /**
   * 📝 EMITIR NFS-e
   */
  async emitirNfse(data: any) {
    const empresa = await this.empresaRepo.findById(data.empresaId);
    if (!empresa) throw new Error('Empresa não encontrada');

    const tomador = await this.clienteRepo.findById(data.tomadorId);
    if (!tomador) throw new Error('Tomador não encontrado');

    // Valida certificado
    if (!empresa.certificado || empresa.certificado.status !== 'VALIDO') {
      throw new Error('Certificado digital inválido ou não configurado');
    }

    // Busca serviço se fornecido
    let servico = null;
    if (data.servicoId) {
      servico = await this.servicoRepo.findById(data.servicoId);
    }

    // Dados do serviço (prioriza dados do catálogo)
    const valorServico = data.servico?.valorServico || servico?.valorUnitario || 0;
    const aliquotaISS = data.servico?.aliquotaISS || servico?.aliquotaISS || 5;
    const codigoTributacaoNacional = data.servico?.codigoTributacaoNacional || servico?.codigoTributacaoNacional || '010701';
    const codigoTributacaoMunicipal = data.servico?.codigoTributacaoMunicipal || servico?.codigoTributacaoMunicipal || '0107';
    const codigoNBS = data.servico?.codigoNBS || servico?.codigoNBS || '1.1403.21.10';
    const descricaoServico = data.servico?.descricao || servico?.descricao || 'Serviços prestados';

    const calc = calcularTributosNfse({
      valorServico: valorServico,
      descontoIncondicionado: data.servico?.descontoIncondicionado || 0,
      deducoesMateriais: data.servico?.deducoesMateriais || 0,
      aliquotaISS: aliquotaISS,
      tipoRetencaoISS: data.servico?.tipoRetencaoISS || 1,
      tributacaoISSQN: data.servico?.tributacaoISSQN || 1,
      optanteSimplesNacional: empresa.optanteSimplesNacional || false,
      formaPagamento: data.formaPagamento || '17',
      cnpjTomador: tomador.documento,
      aliquotaPIS: data.servico?.aliquotaPIS || servico?.aliquotaPIS || 0,
      retidoPIS: data.servico?.retidoPIS || false,
      aliquotaCOFINS: data.servico?.aliquotaCOFINS || servico?.aliquotaCOFINS || 0,
      retidoCOFINS: data.servico?.retidoCOFINS || false,
      aliquotaIRRF: data.servico?.aliquotaIRRF || servico?.aliquotaIRRF || 0,
      aliquotaCSLL: data.servico?.aliquotaCSLL || servico?.aliquotaCSLL || 0,
      aliquotaINSS: data.servico?.aliquotaINSS || servico?.aliquotaINSS || 0,
    });

    const numeroNfse = await this.getProximoNumero(data.empresaId);
    const serieDPS = empresa.serieNfse || 1;
    const aamm = new Date().toISOString().slice(2, 4) +
                 (new Date().getMonth() + 1).toString().padStart(2, '0');

    const { chaveCompleta, codigoVerificacao } = gerarChaveAcessoNFSe({
      codigoMunicipioIBGE: empresa.endereco?.codigoMunicipio || '3550308',
      ambienteGerador: empresa.ambienteEmissao === 'PRODUCAO' ? 1 : 2,
      tipoInscricao: 1,
      documentoEmitente: empresa.cnpj,
      numeroNfse,
      anoMesDPS: aamm,
    });

    // Prepara dados do prestador
    const prestadorData = {
      prestadorCnpj: empresa.cnpj,
      prestadorInscricaoMunicipal: empresa.inscricaoMunicipal || '',
      prestadorRazaoSocial: empresa.razaoSocial,
      prestadorNomeFantasia: empresa.nomeFantasia,
      prestadorRegimeTributario: empresa.regimeTributario === 'SIMPLES_NACIONAL' ? 1 : 3,
      prestadorOptanteSimples: empresa.optanteSimplesNacional || false,
      prestadorRegimeEspecial: '0',
      prestadorLogradouro: empresa.endereco?.logradouro || '',
      prestadorNumero: empresa.endereco?.numero || '',
      prestadorComplemento: empresa.endereco?.complemento,
      prestadorBairro: empresa.endereco?.bairro || '',
      prestadorCodigoMunicipio: empresa.endereco?.codigoMunicipio || '3550308',
      prestadorNomeMunicipio: empresa.endereco?.nomeMunicipio || 'São Paulo',
      prestadorUf: empresa.endereco?.uf || 'SP',
      prestadorCep: empresa.endereco?.cep || '',
      prestadorTelefone: empresa.endereco?.telefone,
      prestadorEmail: empresa.endereco?.email,
    };

    // Prepara dados do tomador
    const tomadorData = {
      tomadorId: tomador.id,
      tomadorTipoPessoa: tomador.tipoPessoa,
      tomadorDocumento: tomador.documento,
      tomadorRazaoSocial: tomador.razaoSocial,
      tomadorNomeFantasia: tomador.nomeFantasia,
      tomadorInscricaoMunicipal: tomador.inscricaoMunicipal,
      tomadorInscricaoEstadual: tomador.inscricaoEstadual,
      tomadorIndicadorIE: tomador.indIEDest || '9',
      tomadorEmail: tomador.email,
      tomadorTelefone: tomador.telefone,
      tomadorLogradouro: tomador.endereco?.logradouro || '',
      tomadorNumero: tomador.endereco?.numero || '',
      tomadorComplemento: tomador.endereco?.complemento,
      tomadorBairro: tomador.endereco?.bairro || '',
      tomadorCodigoMunicipio: tomador.endereco?.codigoMunicipio || '3550308',
      tomadorNomeMunicipio: tomador.endereco?.nomeMunicipio || 'São Paulo',
      tomadorUf: tomador.endereco?.uf || 'SP',
      tomadorCep: tomador.endereco?.cep || '',
      tomadorCodigoPais: tomador.endereco?.codigoPais || '1058',
      tomadorNomePais: tomador.endereco?.nomePais || 'BRASIL',
    };

    const nfseData = {
      ...prestadorData,
      ...tomadorData,
      chaveAcesso: chaveCompleta,
      numeroNfse,
      serieDPS,
      numeroDPS: numeroNfse,
      dataCompetencia: new Date(),
      dataHoraEmissao: new Date(),
      dataHoraProcessamento: new Date(),
      codigoVerificacao,
      ambiente: empresa.ambienteEmissao === 'PRODUCAO' ? 'PRODUCAO' : 'HOMOLOGACAO',
      tipoEmissao: data.tipoEmissao || '1',
      status: 'PROCESSANDO',

      // Dados do serviço
      codigoTributacaoNacional,
      codigoTributacaoMunicipal,
      descricaoServico,
      codigoNBS,
      codigoInterno: servico?.codigoInterno,
      localPrestacaoCodigoMunicipio: empresa.endereco?.codigoMunicipio || '3550308',
      localPrestacaoNomeMunicipio: empresa.endereco?.nomeMunicipio || 'São Paulo',
      localPrestacaoUf: empresa.endereco?.uf || 'SP',

      // Valores
      valorServico: calc.valorServico,
      descontoIncondicionado: calc.descontoIncondicionado,
      descontoCondicionado: calc.descontoCondicionado,
      deducoesMateriais: calc.deducoesMateriais,

      // ISSQN
      tributacaoISSQN: data.servico?.tributacaoISSQN || 1,
      aliquotaISS: calc.aliquotaISS,
      baseCalculoISS: calc.baseCalculoISS,
      valorISS: calc.valorISS,
      tipoRetencaoISS: data.servico?.tipoRetencaoISS || 1,
      valorISSRetido: calc.valorISSRetido,

      // Retenções Federais
      aliquotaPIS: calc.aliquotaPIS,
      valorPIS: calc.valorPIS,
      retidoPIS: data.servico?.retidoPIS || false,
      aliquotaCOFINS: calc.aliquotaCOFINS,
      valorCOFINS: calc.valorCOFINS,
      retidoCOFINS: data.servico?.retidoCOFINS || false,
      aliquotaIRRF: calc.aliquotaIRRF,
      valorIRRF: calc.valorIRRF,
      aliquotaCSLL: calc.aliquotaCSLL,
      valorCSLL: calc.valorCSLL,
      aliquotaINSS: calc.aliquotaINSS,
      valorINSS: calc.valorINSS,
      valorTotalRetencoesFederais: calc.totalRetencoes - calc.valorISSRetido,

      // IBS/CBS
      aliquotaIBSUF: calc.aliquotaIBSUF,
      valorIBSUF: calc.valorIBSUF,
      aliquotaIBSMun: calc.aliquotaIBSMun,
      valorIBSMun: calc.valorIBSMun,
      valorTotalIBS: calc.valorTotalIBS,
      aliquotaCBS: calc.aliquotaCBS,
      valorCBS: calc.valorCBS,

      // Totais
      valorTotalServicos: calc.valorServico,
      valorTotalDescontos: calc.descontoIncondicionado,
      valorTotalDeducoes: calc.deducoesMateriais,
      valorTotalISS: calc.valorISS,
      valorTotalISSRetido: calc.valorISSRetido,
      valorLiquidoNfse: calc.valorLiquido,
      valorTotalNotaFinal: calc.valorTotalNotaFinal,

      // Pagamento Vinculado
      pagamentoNumero: data.pagamentoNumero || 1,
      pagamentoIdTransacao: data.pagamentoIdTransacao || `TX-${Date.now().toString().slice(-8)}`,
      pagamentoTipoMeio: data.formaPagamento || '17',
      pagamentoCnpjRecebedor: empresa.cnpj,
      pagamentoCnpjBasePSP: empresa.cnpj.slice(0, 8),

      // Informações adicionais
      informacoesComplementares: data.informacoesComplementares || '',
      numeroPedido: data.numeroPedido,
      urlVisualizacaoNacional: 'https://www.nfse.gov.br/consultapublica',

      // Relacionamentos
      empresaId: data.empresaId,
      tomadorId: data.tomadorId,
      servicoId: data.servicoId,
    };

    const nfseCriada = await this.nfseRepo.create(nfseData);

    // Gera XML
    const xml = gerarXmlNfseNacional(nfseCriada as any);

    // Atualiza com XML e autoriza
    await this.nfseRepo.updateStatus(nfseCriada.id, 'AUTORIZADA', `1352600${Math.floor(1000000 + Math.random() * 9000000)}`);

    // Atualiza número
    await this.empresaRepo.update(data.empresaId, {
      proximoNumeroNfse: numeroNfse + 1
    });

    // Cria histórico de status
    await this.nfseRepo.createHistoricoStatus({
      nfseId: nfseCriada.id,
      statusAnterior: 'RASCUNHO',
      statusNovo: 'AUTORIZADA',
      usuario: data.usuario || 'SISTEMA',
      motivo: 'Emissão realizada'
    });

    // Cria título financeiro
    await this.financeiroRepo.create({
      tipo: 'RECEBER',
      numeroDocumento: `NFSE-${numeroNfse}/01`,
      descricao: `NFS-e ${numeroNfse} - ${descricaoServico.slice(0, 30)}`,
      categoria: 'PRESTACAO_SERVICOS',
      pessoaNome: tomador.razaoSocial,
      pessoaDocumento: tomador.documento,
      dataEmissao: new Date(),
      dataVencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      valorOriginal: calc.valorLiquido,
      status: 'PENDENTE',
      formaPagamento: data.formaPagamento || 'PIX / Boleto',
      documentoOrigemTipo: 'NFSE',
      documentoOrigemChave: chaveCompleta,
      empresaId: data.empresaId,
      clienteId: data.tomadorId
    });

    // Busca NFS-e completa
    const nfseFinal = await this.nfseRepo.findById(nfseCriada.id);

    return {
      ...nfseFinal,
      xmlAssinado: xml
    };
  }

  /**
   * 🔢 OBTÉM PRÓXIMO NÚMERO
   */
  async getProximoNumero(empresaId: string): Promise<number> {
    const empresa = await this.empresaRepo.findById(empresaId);
    if (!empresa) throw new Error('Empresa não encontrada');
    return (empresa.proximoNumeroNfse || 1);
  }

  /**
   * ❌ CANCELAR NFS-e
   */
  async cancelarNfse(id: string, motivo: string, empresaId: string) {
    const nfse = await this.nfseRepo.findById(id);
    if (!nfse) throw new Error('NFS-e não encontrada');
    if (nfse.empresaId !== empresaId) throw new Error('Acesso negado');
    if (nfse.status === 'CANCELADA') throw new Error('NFS-e já está cancelada');

    // Valida TJust
    if (motivo.length < 15) {
      throw new Error('Motivo deve ter no mínimo 15 caracteres');
    }
    if (motivo.length > 255) {
      throw new Error('Motivo deve ter no máximo 255 caracteres');
    }

    const nfseCancelada = await this.nfseRepo.cancelar(id, motivo);

    // Cria histórico de status
    await this.nfseRepo.createHistoricoStatus({
      nfseId: id,
      statusAnterior: nfse.status,
      statusNovo: 'CANCELADA',
      usuario: 'SISTEMA',
      motivo
    });

    // Cancela título financeiro
    try {
      const titulos = await this.financeiroRepo.findByDocumentoOrigem(nfse.chaveAcesso);
      for (const titulo of titulos) {
        await this.financeiroRepo.cancelarTitulo(titulo.id, motivo);
      }
    } catch (error) {
      console.warn('⚠️ Erro ao cancelar título financeiro:', error);
    }

    return nfseCancelada;
  }

  /**
   * 📊 ESTATÍSTICAS DE NFS-e
   */
  async getEstatisticas(empresaId: string) {
    return this.nfseRepo.getEstatisticas(empresaId);
  }

  /**
   * 💰 TOTAL FATURADO POR PERÍODO
   */
  async getTotalFaturado(empresaId: string, startDate?: Date, endDate?: Date) {
    return this.nfseRepo.getTotalFaturado(empresaId, startDate, endDate);
  }

  /**
   * 📊 RESUMO MENSAL
   */
  async getResumoMensal(empresaId: string, ano: number, mes: number) {
    return this.nfseRepo.getResumoMensal(empresaId, ano, mes);
  }

  /**
   * 📄 BAIXAR XML DA NFS-e
   */
  async baixarXml(id: string, empresaId: string) {
    const nfse = await this.nfseRepo.findById(id);

    if (!nfse) {
      throw new Error('NFS-e não encontrada');
    }

    if (nfse.empresaId !== empresaId) {
      throw new Error('Acesso negado');
    }

    if (!nfse.xmlAssinado) {
      throw new Error('XML da NFS-e não disponível');
    }

    return nfse.xmlAssinado;
  }

  /**
   * 📄 GERAR DANFSe
   */
  async gerarDanfse(id: string, empresaId: string) {
    const nfse = await this.nfseRepo.findById(id);

    if (!nfse) {
      throw new Error('NFS-e não encontrada');
    }

    if (nfse.empresaId !== empresaId) {
      throw new Error('Acesso negado');
    }

    // TODO: Implementar geração do DANFSe
    return {
      chaveAcesso: nfse.chaveAcesso,
      numeroNfse: nfse.numeroNfse,
      serieDPS: nfse.serieDPS,
      valorTotal: nfse.valorTotalServicos,
      tomador: nfse.tomador?.razaoSocial,
      codigoVerificacao: nfse.codigoVerificacao
    };
  }

  /**
   * 📊 SERVIÇOS MAIS PRESTADOS
   */
  async getServicosMaisPrestados(empresaId: string, startDate?: Date, endDate?: Date, limit: number = 10) {
    return this.nfseRepo.getServicosMaisPrestados(empresaId, startDate, endDate, limit);
  }

  /**
   * 📊 NFS-e POR TOMADOR
   */
  async findByTomador(tomadorId: string, startDate?: Date, endDate?: Date) {
    return this.nfseRepo.findByTomador(tomadorId, startDate, endDate);
  }

  /**
   * 📊 NFS-e POR SERVIÇO
   */
  async findByServico(servicoId: string, startDate?: Date, endDate?: Date) {
    return this.nfseRepo.findByServico(servicoId, startDate, endDate);
  }
}