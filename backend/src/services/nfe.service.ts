// backend/src/services/nfe.service.ts
import { Prisma } from '@prisma/client';
import { NfeRepository } from '../repositories/nfe.repository.js';
import { ClienteRepository } from '../repositories/cliente.repository.js';
import { ProdutoRepository } from '../repositories/produto.repository.js';
import { EmpresaRepository } from '../repositories/empresa.repository.js';
import { FinanceiroRepository } from '../repositories/financeiro.repository.js';
import { gerarChaveAcessoNFe } from '../utils/chaveAcesso.js';
import { calcularTotaisNfe } from '../utils/tributosEngine.js';
import { gerarXmlNfe400, gerarXmlCartaCorrecao, gerarXmlCancelamentoNFe } from '../utils/xmlNfeGenerator.js';
import type { ItemNfe, NFeDocumento, FormaPagamento } from '../types/fiscal.js';
import type { FiltroNFe } from '../repositories/nfe.repository.js';
import { mapEmpresaParaEmitente, mapClienteParaTomador } from '../utils/fiscalMappers.js';
import { CertificadoService } from './certificado.service.js';
import { extrairChaveECertificadoDoPfx, assinarXmlEnvelopado } from '../utils/xmlSigner.js';
import { autorizarNfe, enviarEvento } from './nfeSefazClient.js';

interface ItemNfeRequestInput {
  produtoId: string;
  quantidade?: number;
  valorUnitario?: number;
}

interface ProdutoEstoqueRef {
  id: string;
  estoqueAtual: number;
}

interface EmitirNfeInput {
  empresaId: string;
  destinatarioId: string;
  itens?: ItemNfeRequestInput[];
  naturezaOperacao?: string;
  formaPagamento?: string;
  informacoesAdicionais?: string;
  [key: string]: unknown;
}

export class NfeService {
  private nfeRepo: NfeRepository;
  private clienteRepo: ClienteRepository;
  private produtoRepo: ProdutoRepository;
  private empresaRepo: EmpresaRepository;
  private financeiroRepo: FinanceiroRepository;
  private certificadoService: CertificadoService;

  constructor() {
    this.nfeRepo = new NfeRepository();
    this.clienteRepo = new ClienteRepository();
    this.produtoRepo = new ProdutoRepository();
    this.empresaRepo = new EmpresaRepository();
    this.financeiroRepo = new FinanceiroRepository();
    this.certificadoService = new CertificadoService();
  }

  async emitirNfe(data: EmitirNfeInput) {
    const empresa = await this.empresaRepo.findById(data.empresaId);
    if (!empresa) throw new Error('Empresa não encontrada');

    const destinatario = await this.clienteRepo.findById(data.destinatarioId);
    if (!destinatario) throw new Error('Destinatário não encontrado');

    if (!empresa.certificado || empresa.certificado.status !== 'VALIDO') {
      throw new Error('Certificado digital inválido ou não configurado');
    }

    const itensCompletos: ItemNfe[] = await Promise.all(
      (data.itens || []).map(async (item, idx) => {
        const produto = await this.produtoRepo.findById(item.produtoId, data.empresaId);
        if (!produto) throw new Error(`Produto ${item.produtoId} não encontrado`);

        const quantidade = item.quantidade || 1;
        const valorUnitario = item.valorUnitario || Number(produto.precoVenda);
        const valorTotal = quantidade * valorUnitario;
        const aliquotaICMS = Number(produto.aliquotaICMS);
        const aliquotaPIS = Number(produto.aliquotaPIS);
        const aliquotaCOFINS = Number(produto.aliquotaCOFINS);

        return {
          id: produto.id || `item-${idx}`,
          codigoProduto: produto.codigo,
          descricao: produto.descricao,
          ncm: produto.ncm,
          cest: produto.cest || undefined,
          cfop: produto.cfopPadrao || '5102',
          unidadeMedida: produto.unidade,
          quantidade,
          valorUnitario,
          valorTotalBruto: valorTotal,
          origemMercadoria: Number(produto.origem ?? '0') as ItemNfe['origemMercadoria'],
          cstICMS: '00',
          aliquotaICMS,
          baseCalculoICMS: valorTotal,
          valorICMS: (valorTotal * aliquotaICMS) / 100,
          cstPIS: '01',
          aliquotaPIS,
          valorPIS: (valorTotal * aliquotaPIS) / 100,
          cstCOFINS: '01',
          aliquotaCOFINS,
          valorCOFINS: (valorTotal * aliquotaCOFINS) / 100,
          valorTributosAproximados: valorTotal * 0.314,
        };
      })
    );

    const totais = calcularTotaisNfe(itensCompletos, 0, 0, 0, 0);
    const numero = await this.getProximoNumero(data.empresaId);
    const aamm = new Date().toISOString().slice(2, 4) +
                 (new Date().getMonth() + 1).toString().padStart(2, '0');

    const ambiente: 1 | 2 = empresa.ambienteEmissao === 'PRODUCAO' ? 1 : 2;

    const { chaveCompleta } = gerarChaveAcessoNFe({
      codigoUf: empresa.codigoUF,
      anoMes: aamm,
      cnpjEmitente: empresa.cnpj,
      modelo: '55',
      serie: empresa.serieNfe,
      numero,
      tipoEmissao: 1,
    });

    const idDest: 1 | 2 | 3 =
      destinatario.tipoPessoa === 'EXTERIOR' ? 3 :
      empresa.uf === destinatario.endereco.uf ? 1 : 2;

    const emitenteFiscal = mapEmpresaParaEmitente(empresa);
    const destinatarioFiscal = mapClienteParaTomador(destinatario);

    const dataHoraEmissaoISO = new Date().toISOString();

    const nfeDocumento: NFeDocumento = {
      id: '',
      modelo: '55',
      serie: empresa.serieNfe,
      numero,
      chaveAcesso: chaveCompleta,
      dataHoraEmissao: dataHoraEmissaoISO,
      dataHoraSaida: dataHoraEmissaoISO,
      naturezaOperacao: data.naturezaOperacao || 'Venda de Mercadorias',
      ambiente,
      tipoEmissao: 1,
      tipoDocumento: 1,
      finalidade: 1,
      consumidorFinal: false,
      presencaComprador: 2,
      status: 'AUTORIZADA',
      idDest,
      tpImp: 1,
      emitente: emitenteFiscal,
      destinatario: destinatarioFiscal,
      itens: itensCompletos,
      transporte: { modalidadeFrete: 9 },
      duplicatas: [],
      valorTotalProdutos: totais.valorTotalProdutos,
      valorTotalFrete: totais.valorTotalFrete,
      valorTotalSeguro: totais.valorTotalSeguro,
      valorTotalDesconto: totais.valorTotalDesconto,
      valorTotalOutrasDespesas: totais.valorTotalOutrasDespesas,
      baseCalculoICMS: totais.baseCalculoICMS,
      valorTotalICMS: totais.valorTotalICMS,
      baseCalculoICMSST: totais.baseCalculoICMSST,
      valorTotalICMSST: totais.valorTotalICMSST,
      valorTotalIPI: totais.valorTotalIPI,
      valorTotalPIS: totais.valorTotalPIS,
      valorTotalCOFINS: totais.valorTotalCOFINS,
      valorTotalIBS: totais.valorTotalIBS,
      valorTotalCBS: totais.valorTotalCBS,
      valorTotalTributosAproximados: totais.valorTotalTributosAproximados,
      valorTotalNota: totais.valorTotalNota,
      formaPagamento: (data.formaPagamento as FormaPagamento) || '17',
      protocoloAutorizacao: '',
      dataHoraAutorizacao: dataHoraEmissaoISO,
      informacoesAdicionais: data.informacoesAdicionais || '',
      xmlAssinado: '',
    };

    const xmlSemAssinatura = gerarXmlNfe400(nfeDocumento);

    const certificado = await this.certificadoService.obterCertificadoDecriptado(data.empresaId);
    if (!certificado) {
      throw new Error('Certificado digital não configurado para esta empresa');
    }
    const chaveECertPem = extrairChaveECertificadoDoPfx(certificado.pfxBuffer, certificado.senha);
    const xml = assinarXmlEnvelopado(xmlSemAssinatura, 'infNFe', chaveECertPem);

    // Transmissão real à SEFAZ, controlada por variável de ambiente: enquanto a empresa
    // não tiver um certificado ICP-Brasil genuíno registrado na Receita Federal, deixe
    // SEFAZ_TRANSMISSAO_REAL desligado (padrão) para continuar operando em modo mock
    // durante o desenvolvimento/demonstração local.
    const transmissaoReal = process.env.SEFAZ_TRANSMISSAO_REAL === 'true';
    let statusFinal: 'AUTORIZADA' | 'REJEITADA' | 'PROCESSANDO' = 'AUTORIZADA';
    let protocoloFinal: string | null = null;
    let motivoRejeicaoFinal: string | undefined;
    let xmlRetornoFinal: string | undefined;

    if (transmissaoReal) {
      const resultado = await autorizarNfe({
        uf: empresa.uf,
        ambiente: ambiente === 1 ? 'producao' : 'homologacao',
        cUF: empresa.codigoUF,
        xmlAssinado: xml,
        mtls: { cert: chaveECertPem.certPem, key: chaveECertPem.privateKeyPem },
      });

      xmlRetornoFinal = resultado.xmlRetorno;
      if (resultado.autorizado && resultado.nProt) {
        statusFinal = 'AUTORIZADA';
        protocoloFinal = resultado.nProt;
      } else if (resultado.nRec) {
        // SEFAZ processou em lote (assíncrono) — precisa de NFeRetAutorizacao4 depois.
        statusFinal = 'PROCESSANDO';
      } else {
        statusFinal = 'REJEITADA';
        motivoRejeicaoFinal = resultado.xMotivo || 'Rejeitado pela SEFAZ sem motivo informado';
      }
    } else {
      console.warn('[NFe] SEFAZ_TRANSMISSAO_REAL não está ativo — emissão em modo mock (XML assinado, mas não transmitido).');
    }

    const nfeCreateData: Prisma.NFeUncheckedCreateInput = {
      modelo: '55',
      serie: empresa.serieNfe,
      numero,
      chaveAcesso: chaveCompleta,
      cUF: empresa.codigoUF,
      cNF: chaveCompleta.slice(35, 43),
      natOp: nfeDocumento.naturezaOperacao,
      indPag: '0',
      mod: '55',
      dhEmi: new Date(),
      dhSaiEnt: new Date(),
      tpNF: '1',
      idDest: idDest.toString(),
      cMunFG: empresa.codigoMunicipio,
      tpImp: '1',
      tpEmis: '1',
      cDV: chaveCompleta.slice(-1),
      tpAmb: ambiente.toString(),
      finNFe: '1',
      indFinal: '0',
      indPres: '2',
      procEmi: '0',
      verProc: 'SUP-TECNOLOGIA-4.00',
      status: statusFinal,
      vBC: totais.baseCalculoICMS,
      vICMS: totais.valorTotalICMS,
      vBCST: totais.baseCalculoICMSST,
      vST: totais.valorTotalICMSST,
      vProd: totais.valorTotalProdutos,
      vFrete: totais.valorTotalFrete,
      vSeg: totais.valorTotalSeguro,
      vDesc: totais.valorTotalDesconto,
      vIPI: totais.valorTotalIPI,
      vPIS: totais.valorTotalPIS,
      vCOFINS: totais.valorTotalCOFINS,
      vOutro: totais.valorTotalOutrasDespesas,
      vNF: totais.valorTotalNota,
      vTotTrib: totais.valorTotalTributosAproximados,
      vIBS: totais.valorTotalIBS,
      vCBS: totais.valorTotalCBS,
      infCpl: nfeDocumento.informacoesAdicionais,
      xmlAssinado: xml,
      xmlRetorno: xmlRetornoFinal,
      dataHoraAutorizacao: statusFinal === 'AUTORIZADA' ? new Date() : null,
      protocoloAutorizacao: protocoloFinal,
      motivoRejeicao: motivoRejeicaoFinal,
      empresaId: data.empresaId,
      destinatarioId: data.destinatarioId,
      itens: {
        create: itensCompletos.map((item) => ({
          codigoProduto: item.codigoProduto,
          descricao: item.descricao,
          ncm: item.ncm,
          cest: item.cest,
          cfop: item.cfop,
          unidadeMedida: item.unidadeMedida,
          quantidade: item.quantidade,
          valorUnitario: item.valorUnitario,
          vProd: item.valorTotalBruto,
          vDesc: item.descontoItem || 0,
          codigoEAN: item.codigoEAN,
          codigoEANTrib: item.codigoEANTrib,
          origemMercadoria: item.origemMercadoria.toString(),
          cstICMS: item.cstICMS,
          pICMS: item.aliquotaICMS,
          vBC: item.baseCalculoICMS,
          vICMS: item.valorICMS,
          cstPIS: item.cstPIS,
          pPIS: item.aliquotaPIS,
          vPIS: item.valorPIS,
          cstCOFINS: item.cstCOFINS,
          pCOFINS: item.aliquotaCOFINS,
          vCOFINS: item.valorCOFINS,
          vTotTrib: item.valorTributosAproximados,
        })),
      },
    };

    const nfeCriada = await this.nfeRepo.create(nfeCreateData);

    await this.empresaRepo.update(data.empresaId, {
      proximoNumeroNfe: numero + 1
    });

    const itensValidos = (data.itens || []).filter((i) => i.produtoId);
    if (itensValidos.length > 0) {
      const produtos = await this.produtoRepo.findByIds(itensValidos.map((i) => i.produtoId), data.empresaId) as unknown as ProdutoEstoqueRef[];
      const produtoMap = new Map(produtos.map((p) => [p.id, p]));
      for (const item of itensValidos) {
        const produto = produtoMap.get(item.produtoId);
        if (produto) {
          await this.produtoRepo.update(item.produtoId, data.empresaId, {
            estoqueAtual: Math.max(0, Number(produto.estoqueAtual) - (item.quantidade || 0))
          });
        }
      }
    }

    await this.financeiroRepo.create({
      tipo: 'RECEBER',
      numeroDocumento: `NFE-${numero}/01`,
      descricao: `NF-e ${numero}`,
      categoria: 'VENDA_PRODUTOS',
      pessoaNome: destinatario.razaoSocial,
      pessoaDocumento: destinatario.documento,
      dataEmissao: new Date(),
      dataVencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      valorOriginal: totais.valorTotalNota,
      status: 'PENDENTE',
      formaPagamento: 'PIX / Boleto',
      documentoOrigemTipo: 'NFE',
      documentoOrigemChave: chaveCompleta,
      empresaId: data.empresaId,
      clienteId: data.destinatarioId
    });

    return { ...nfeCriada, xml };
  }

  async getProximoNumero(empresaId: string): Promise<number> {
    const empresa = await this.empresaRepo.findById(empresaId);
    if (!empresa) throw new Error('Empresa não encontrada');
    return (empresa.proximoNumeroNfe || 1);
  }

  async cancelarNfe(id: string, motivo: string, empresaId: string) {
    const nfe = await this.nfeRepo.findById(id);
    if (!nfe) throw new Error('NF-e não encontrada');
    if (nfe.empresaId !== empresaId) throw new Error('Acesso negado');
    if (nfe.status === 'CANCELADA') throw new Error('NF-e já está cancelada');

    const transmissaoReal = process.env.SEFAZ_TRANSMISSAO_REAL === 'true';

    if (transmissaoReal) {
      if (nfe.status !== 'AUTORIZADA' || !nfe.protocoloAutorizacao) {
        throw new Error('Apenas NF-e autorizadas pela SEFAZ podem ser canceladas');
      }

      const empresa = await this.empresaRepo.findById(empresaId);
      if (!empresa) throw new Error('Empresa não encontrada');

      const certificado = await this.certificadoService.obterCertificadoDecriptado(empresaId);
      if (!certificado) throw new Error('Certificado digital não configurado para esta empresa');
      const chaveECertPem = extrairChaveECertificadoDoPfx(certificado.pfxBuffer, certificado.senha);

      const nSeqEvento = (await this.nfeRepo.contarEventosPorTipo(nfe.id, '110111')) + 1;
      const xmlEvento = gerarXmlCancelamentoNFe({
        chaveAcessoNFe: nfe.chaveAcesso,
        cnpjAutor: empresa.cnpj,
        sequencialEvento: nSeqEvento,
        justificativa: motivo,
        protocoloAutorizacao: nfe.protocoloAutorizacao,
      });
      const xmlEventoAssinado = assinarXmlEnvelopado(xmlEvento, 'infEvento', chaveECertPem);

      const resultado = await enviarEvento({
        uf: empresa.uf,
        ambiente: empresa.ambienteEmissao === 'PRODUCAO' ? 'producao' : 'homologacao',
        xmlEventoAssinado,
        mtls: { cert: chaveECertPem.certPem, key: chaveECertPem.privateKeyPem },
      });

      await this.nfeRepo.criarEvento({
        chaveNFe: nfe.chaveAcesso,
        tpEvento: '110111',
        nSeqEvento,
        dhEvento: new Date(),
        cStat: resultado.cStat || '000',
        xMotivo: resultado.xMotivo || '',
        xmlEvento: xmlEventoAssinado,
        xmlRetorno: resultado.xmlRetorno,
        empresaId,
        nfeId: nfe.id,
      });

      if (!resultado.sucesso) {
        throw new Error(`SEFAZ rejeitou o cancelamento: ${resultado.xMotivo || 'motivo não informado'} (cStat ${resultado.cStat})`);
      }
    }

    const nfeCancelada = await this.nfeRepo.cancelar(id, motivo);

    const titulo = await this.financeiroRepo.findByDocumentoOrigem(nfe.chaveAcesso);
    if (titulo) {
      await this.financeiroRepo.cancelarTitulo(titulo.id, motivo);
    }

    return nfeCancelada;
  }

  async listarNfes(filtros: FiltroNFe) {
    return this.nfeRepo.findAll(filtros);
  }

  async buscarPorId(id: string, empresaId?: string) {
    const nfe = await this.nfeRepo.findById(id);
    if (empresaId && nfe && nfe.empresaId !== empresaId) return null;
    return nfe;
  }

  async buscarPorChave(chave: string, empresaId?: string) {
    const nfe = await this.nfeRepo.findByChave(chave);
    if (empresaId && nfe && nfe.empresaId !== empresaId) return null;
    return nfe;
  }

  async getTotalVendas(empresaId: string, startDate?: Date, endDate?: Date) {
    return this.nfeRepo.getTotalVendas(empresaId, startDate, endDate);
  }

  async buscarPorProtocolo(protocolo: string, empresaId?: string) {
    const nfe = await this.nfeRepo.findByProtocolo(protocolo);
    if (empresaId && nfe && nfe.empresaId !== empresaId) return null;
    return nfe;
  }

  async getEstatisticas(empresaId: string) {
    return this.nfeRepo.getEstatisticas(empresaId);
  }

  async getResumoMensal(empresaId: string, ano: number, mes: number) {
    return this.nfeRepo.getResumoMensal(empresaId, ano, mes);
  }

  /**
   * Gera e registra o evento de Carta de Correção (CC-e) localmente.
   * Ainda não transmite ao SEFAZ — isso depende da integração real com o
   * webservice de recepção de eventos (RecepcaoEvento4), prevista para a
   * fase de integração SEFAZ homologação/produção.
   */
  async enviarCartaCorrecao(params: {
    empresaId: string;
    chaveAcesso: string;
    cnpjAutor: string;
    textoCorrecao: string;
  }) {
    const nfe = await this.nfeRepo.findByChave(params.chaveAcesso);
    if (!nfe) throw new Error('NF-e não encontrada');
    if (nfe.empresaId !== params.empresaId) throw new Error('Acesso negado');

    const nSeqEvento = (await this.nfeRepo.contarEventosPorTipo(nfe.id, '110110')) + 1;

    const xmlEvento = gerarXmlCartaCorrecao({
      chaveAcessoNFe: params.chaveAcesso,
      cnpjAutor: params.cnpjAutor,
      sequencialEvento: nSeqEvento,
      textoCorrecao: params.textoCorrecao,
    });

    return this.nfeRepo.criarEvento({
      chaveNFe: params.chaveAcesso,
      tpEvento: '110110',
      nSeqEvento,
      dhEvento: new Date(),
      cStat: '000',
      xMotivo: 'Evento registrado localmente - aguardando integração com o webservice de eventos da SEFAZ',
      xmlEvento,
      empresaId: params.empresaId,
      nfeId: nfe.id,
    });
  }

  /**
   * Consulta a situação da NF-e a partir dos dados já persistidos localmente.
   * Ainda não realiza consulta em tempo real ao webservice NfeConsultaProtocolo4
   * da SEFAZ — isso depende da fase de integração real com o ambiente
   * de homologação/produção.
   */
  async consultarSituacao(chave: string, empresaId: string) {
    const nfe = await this.nfeRepo.findByChave(chave);
    if (!nfe) throw new Error('NF-e não encontrada');
    if (nfe.empresaId !== empresaId) throw new Error('Acesso negado');

    return {
      chaveAcesso: nfe.chaveAcesso,
      status: nfe.status,
      protocoloAutorizacao: nfe.protocoloAutorizacao,
      dataHoraAutorizacao: nfe.dataHoraAutorizacao,
      motivoRejeicao: nfe.motivoRejeicao,
    };
  }
}
