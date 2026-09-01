// src/services/nfce.service.ts

import { Prisma, StatusDocumento } from '@prisma/client';
import { NfceRepository } from '../repositories/nfce.repository';
import { ClienteRepository } from '../repositories/cliente.repository';
import { EmpresaRepository } from '../repositories/empresa.repository';
import { ProdutoRepository } from '../repositories/produto.repository';
import { FinanceiroRepository } from '../repositories/financeiro.repository';
import { gerarChaveAcessoNFe } from '../utils/chaveAcesso';
import { calcularTotaisNfe } from '../utils/tributosEngine';
import { gerarXmlNfe400 } from '../utils/xmlNfeGenerator';

export class NfceService {
  private nfceRepo: NfceRepository;
  private clienteRepo: ClienteRepository;
  private produtoRepo: ProdutoRepository;
  private empresaRepo: EmpresaRepository;
  private financeiroRepo: FinanceiroRepository;

  constructor() {
    this.nfceRepo = new NfceRepository();
    this.clienteRepo = new ClienteRepository();
    this.produtoRepo = new ProdutoRepository();
    this.empresaRepo = new EmpresaRepository();
    this.financeiroRepo = new FinanceiroRepository();
  }

  /**
   * 📋 LISTAR NFC-e COM FILTROS
   */
  async listarNfces(
    empresaId: string,
    page: number = 1,
    limit: number = 50,
    filtros?: {
      status?: StatusDocumento | StatusDocumento[];
      dataInicio?: Date;
      dataFim?: Date;
      consumidorId?: string;
      numero?: number;
      serie?: number;
      chave?: string;
    }
  ) {
    return this.nfceRepo.findAll({
      empresaId,
      status: filtros?.status,
      dataInicio: filtros?.dataInicio,
      dataFim: filtros?.dataFim,
      consumidorId: filtros?.consumidorId,
      numero: filtros?.numero,
      serie: filtros?.serie,
      chaveAcesso: filtros?.chave,
      page,
      limit
    });
  }

  /**
   * 🔍 BUSCAR NFC-e POR ID
   */
  async buscarPorId(id: string) {
    return this.nfceRepo.findById(id);
  }

  /**
   * 🔍 BUSCAR NFC-e POR CHAVE
   */
  async buscarPorChave(chave: string) {
    return this.nfceRepo.findByChave(chave);
  }

  /**
   * 🔍 BUSCAR NFC-e POR PROTOCOLO
   */
  async buscarPorProtocolo(protocolo: string) {
    return this.nfceRepo.findByProtocolo(protocolo);
  }

  /**
   * 📝 EMITIR NFC-e
   */
  async emitirNfce(data: any) {
    const empresa = await this.empresaRepo.findById(data.empresaId);
    if (!empresa) throw new Error('Empresa não encontrada');

    // Valida certificado
    if (!empresa.certificado || empresa.certificado.status !== 'VALIDO') {
      throw new Error('Certificado digital inválido ou não configurado');
    }

    // Valida itens
    if (!data.itens || data.itens.length === 0) {
      throw new Error('NFC-e deve ter pelo menos um item');
    }

    // Valida consumidor identificado
    let consumidorId = null;
    if (data.consumidorIdentificado && data.consumidorDoc) {
      const consumidor = await this.clienteRepo.findByDocumento(data.consumidorDoc);
      if (!consumidor) {
        throw new Error('Consumidor não encontrado. Cadastre-o primeiro ou desmarque a identificação.');
      }
      consumidorId = consumidor.id;
    }

    // Gera número e série
    const numero = await this.getProximoNumero(data.empresaId);
    const serie = empresa.serieNfce || 1;

    // Gera chave de acesso
    const aamm = new Date().toISOString().slice(2, 4) +
      (new Date().getMonth() + 1).toString().padStart(2, '0');

    const { chaveCompleta } = gerarChaveAcessoNFe({
      cUF: empresa.endereco?.codigoMunicipio?.slice(0, 2) || '35',
      aamm,
      cnpj: empresa.cnpj,
      modelo: '65',
      serie,
      numero,
      tpEmis: 1
    });

    // Calcula totais com desconto e acréscimo
    const totais = calcularTotaisNfe(
      data.itens,
      0, // frete
      0, // seguro
      0, // outras despesas
      data.valorDesconto || 0
    );

    const valorTotalFinal = totais.valorTotalNota + (data.valorAcrescimo || 0);

    // Prepara dados da NFC-e
    const nfceData: Prisma.NFCeCreateInput = {
      modelo: '65',
      serie,
      numero,
      chaveAcesso: chaveCompleta,
      dataHoraEmissao: new Date(),
      naturezaOperacao: data.naturezaOperacao || 'Venda a Consumidor Final',
      ambiente: empresa.ambienteEmissao === 'PRODUCAO' ? 1 : 2,
      tipoEmissao: data.tpEmis || 1,
      status: 'PROCESSANDO',
      consumidorIdentificado: data.consumidorIdentificado || false,
      
      // Campos do leiaute 4.00
      tpNF: data.tpNF || 1,
      idDest: data.idDest || 1,
      finNFe: data.finNFe || 1,
      indFinal: data.indFinal || 1,
      indPres: data.indPres || 2,
      procEmi: data.procEmi || '0',
      verProc: data.verProc || 'SUP-TECNOLOGIA-4.00',
      tpEmis: data.tpEmis || 1,

      // Valores
      valorTotalProdutos: totais.valorTotalProdutos,
      valorTotalDesconto: data.valorDesconto || 0,
      valorTotalAcrescimo: data.valorAcrescimo || 0,
      valorTotalTributosAproximados: totais.valorTotalTributosAproximados,
      valorTotalNota: valorTotalFinal,
      
      // Pagamento
      formaPagamento: data.formaPagamento || '17',
      valorPago: data.valorPago || valorTotalFinal,
      valorTroco: data.formaPagamento === '01' ? Math.max(0, (data.valorRecebido || 0) - valorTotalFinal) : 0,
      
      // QR Code
      urlQrCode: `https://www.nfce.fazenda.gov.br/portal/qrCode/${chaveCompleta}`,
      tokenCscId: data.tokenCscId || '000001',

      // Informações adicionais
      infAdFisco: data.infAdFisco,
      infCpl: data.infCpl,

      // Relacionamentos
      empresa: { connect: { id: data.empresaId } },
      consumidor: consumidorId ? { connect: { id: consumidorId } } : undefined,
    };

    // Cria NFC-e
    const nfce = await this.nfceRepo.create(nfceData);

    // Cria itens
    if (data.itens?.length > 0) {
      for (const item of data.itens) {
        await this.createItem(nfce.id, item);
      }
    }

    // Cria pagamentos
    if (data.pagamentos?.length > 0) {
      for (const pag of data.pagamentos) {
        await this.createPagamento(nfce.id, pag);
      }
    } else {
      // Pagamento padrão
      await this.createPagamento(nfce.id, {
        tPag: data.formaPagamento || '17',
        xPag: data.xPag || this.getDescricaoPagamento(data.formaPagamento || '17'),
        vPag: data.valorPago || valorTotalFinal,
        dPag: data.dPag,
        tpIntegra: data.tpIntegra || '1',
        CNPJInstPag: data.CNPJInstPag,
        tBand: data.tBand,
        cAut: data.cAut,
        CNPJReceb: data.CNPJReceb,
        idTermPag: data.idTermPag,
      });
    }

    // Atualiza número
    await this.empresaRepo.update(data.empresaId, {
      proximoNumeroNfce: numero + 1
    });

    // Gera XML e autoriza
    const nfceCompleto = await this.nfceRepo.findById(nfce.id);
    const xml = gerarXmlNfe400(nfceCompleto as any);
    const protocolo = `1352600${Math.floor(1000000 + Math.random() * 9000000)}`;
    
    await this.nfceRepo.updateStatus(nfce.id, 'AUTORIZADA', protocolo);

    // Baixa estoque
    for (const item of data.itens) {
      const produto = await this.produtoRepo.findById(item.produtoId);
      if (produto) {
        await this.produtoRepo.update(item.produtoId, {
          estoqueAtual: Math.max(0, produto.estoqueAtual - item.quantidade)
        });
      }
    }

    // Cria título financeiro se for a prazo (não dinheiro e não PIX)
    if (data.formaPagamento !== '01' && data.formaPagamento !== '17' && data.formaPagamento !== '90') {
      await this.financeiroRepo.create({
        tipo: 'RECEBER',
        numeroDocumento: `NFCe-${numero}/01`,
        descricao: `NFC-e ${numero} - ${data.naturezaOperacao || 'Venda'}`,
        categoria: 'VENDA_PRODUTOS',
        pessoaNome: data.consumidorNome || 'Consumidor Não Identificado',
        pessoaDocumento: data.consumidorDoc || '00000000000000',
        dataEmissao: new Date(),
        dataVencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        valorOriginal: valorTotalFinal,
        status: 'PENDENTE',
        formaPagamento: data.formaPagamento || '17',
        documentoOrigemTipo: 'NFCE',
        documentoOrigemChave: chaveCompleta,
        empresaId: data.empresaId,
        clienteId: consumidorId || undefined
      });
    }

    // Busca NFC-e completa com todos os relacionamentos
    const nfceFinal = await this.nfceRepo.findById(nfce.id);

    return {
      ...nfceFinal,
      xmlAssinado: xml
    };
  }

  /**
   * 🧩 CRIA ITEM DA NFC-e
   */
  private async createItem(nfceId: string, item: any) {
    return this.prisma.itemNFCe.create({
      data: {
        codigoProduto: item.codigoProduto,
        descricao: item.descricao,
        ncm: item.ncm,
        cest: item.cest,
        cfop: item.cfop || '5102',
        unidadeMedida: item.unidadeMedida || 'UN',
        quantidade: item.quantidade,
        valorUnitario: item.valorUnitario,
        valorTotalBruto: item.valorTotalBruto || (item.quantidade * item.valorUnitario),
        cstICMS: item.cstICMS || '00',
        aliquotaICMS: item.aliquotaICMS || 18,
        baseCalculoICMS: item.baseCalculoICMS || (item.quantidade * item.valorUnitario),
        valorICMS: item.valorICMS || ((item.quantidade * item.valorUnitario) * (item.aliquotaICMS || 18) / 100),
        cstPIS: item.cstPIS || '01',
        aliquotaPIS: item.aliquotaPIS || 1.65,
        valorPIS: item.valorPIS || ((item.quantidade * item.valorUnitario) * 1.65 / 100),
        cstCOFINS: item.cstCOFINS || '01',
        aliquotaCOFINS: item.aliquotaCOFINS || 7.6,
        valorCOFINS: item.valorCOFINS || ((item.quantidade * item.valorUnitario) * 7.6 / 100),
        valorTributosAproximados: item.valorTributosAproximados || ((item.quantidade * item.valorUnitario) * 0.314),
        nfce: { connect: { id: nfceId } }
      }
    });
  }

  /**
   * 🧩 CRIA PAGAMENTO DA NFC-e
   */
  private async createPagamento(nfceId: string, pag: any) {
    return this.prisma.pagamentoNFCe.create({
      data: {
        indPag: pag.indPag || '0',
        tPag: pag.tPag || '17',
        xPag: pag.xPag || this.getDescricaoPagamento(pag.tPag || '17'),
        vPag: pag.vPag || 0,
        dPag: pag.dPag,
        tpIntegra: pag.tpIntegra || '1',
        CNPJPag: pag.CNPJPag,
        UFPag: pag.UFPag,
        CNPJInstPag: pag.CNPJInstPag,
        tBand: pag.tBand,
        cAut: pag.cAut,
        CNPJReceb: pag.CNPJReceb,
        idTermPag: pag.idTermPag,
        nfce: { connect: { id: nfceId } }
      }
    });
  }

  /**
   * 🔢 OBTÉM PRÓXIMO NÚMERO
   */
  private async getProximoNumero(empresaId: string): Promise<number> {
    const empresa = await this.empresaRepo.findById(empresaId);
    if (!empresa) throw new Error('Empresa não encontrada');
    return (empresa.proximoNumeroNfce || 1);
  }

  /**
   * 📝 OBTÉM DESCRIÇÃO DA FORMA DE PAGAMENTO
   */
  private getDescricaoPagamento(codigo: string): string {
    const descricoes: Record<string, string> = {
      '01': 'Dinheiro',
      '02': 'Cheque',
      '03': 'Cartão de Crédito',
      '04': 'Cartão de Débito',
      '05': 'Crédito Loja',
      '10': 'Vale Alimentação',
      '11': 'Vale Refeição',
      '12': 'Vale Presente',
      '13': 'Vale Combustível',
      '15': 'Boleto Bancário',
      '17': 'PIX',
      '90': 'Sem Pagamento',
      '99': 'Outros',
    };
    return descricoes[codigo] || 'Outros';
  }

  /**
   * ❌ CANCELAR NFC-e
   */
  async cancelarNfce(id: string, motivo: string, empresaId: string) {
    const nfce = await this.nfceRepo.findById(id);

    if (!nfce) {
      throw new Error('NFC-e não encontrada');
    }

    if (nfce.empresaId !== empresaId) {
      throw new Error('Acesso negado');
    }

    if (nfce.status === 'CANCELADA') {
      throw new Error('NFC-e já está cancelada');
    }

    // Valida TJust (15-255 caracteres)
    if (motivo.length < 15) {
      throw new Error('Motivo deve ter no mínimo 15 caracteres (TJust)');
    }
    if (motivo.length > 255) {
      throw new Error('Motivo deve ter no máximo 255 caracteres (TJust)');
    }

    // Cancela título financeiro se existir
    try {
      const titulos = await this.financeiroRepo.findByDocumentoOrigem(nfce.chaveAcesso);
      for (const titulo of titulos) {
        await this.financeiroRepo.cancelarTitulo(titulo.id, motivo);
      }
    } catch (error) {
      console.warn('⚠️ Erro ao cancelar título financeiro:', error);
    }

    return this.nfceRepo.cancelar(id, motivo);
  }

  /**
   * 📊 ESTATÍSTICAS DE NFC-e
   */
  async getEstatisticas(empresaId: string) {
    return this.nfceRepo.getEstatisticas(empresaId);
  }

  /**
   * 💰 TOTAL DE VENDAS POR PERÍODO
   */
  async getTotalVendas(empresaId: string, startDate?: Date, endDate?: Date) {
    return this.nfceRepo.getTotalVendas(empresaId, startDate, endDate);
  }

  /**
   * 📊 RESUMO MENSAL
   */
  async getResumoMensal(empresaId: string, ano: number, mes: number) {
    return this.nfceRepo.getResumoMensal(empresaId, ano, mes);
  }

  /**
   * 📄 BAIXAR XML DA NFC-e
   */
  async baixarXml(id: string, empresaId: string) {
    const nfce = await this.nfceRepo.findById(id);

    if (!nfce) {
      throw new Error('NFC-e não encontrada');
    }

    if (nfce.empresaId !== empresaId) {
      throw new Error('Acesso negado');
    }

    if (!nfce.xmlAssinado) {
      throw new Error('XML da NFC-e não disponível');
    }

    return nfce.xmlAssinado;
  }

  /**
   * 📄 GERAR DANFE NFC-e (Cupom)
   */
  async gerarDanfce(id: string, empresaId: string) {
    const nfce = await this.nfceRepo.findById(id);

    if (!nfce) {
      throw new Error('NFC-e não encontrada');
    }

    if (nfce.empresaId !== empresaId) {
      throw new Error('Acesso negado');
    }

    // TODO: Implementar geração do DANFE NFC-e (cupom fiscal)
    return {
      chaveAcesso: nfce.chaveAcesso,
      numero: nfce.numero,
      serie: nfce.serie,
      valorTotal: nfce.valorTotalNota,
      consumidor: nfce.consumidor?.nomeRazaoSocial || 'Consumidor Não Identificado',
      urlQrCode: nfce.urlQrCode
    };
  }

  /**
   * 📊 PRODUTOS MAIS VENDIDOS
   */
  async getProdutosMaisVendidos(empresaId: string, startDate?: Date, endDate?: Date, limit: number = 10) {
    return this.nfceRepo.getProdutosMaisVendidos(empresaId, startDate, endDate, limit);
  }
}