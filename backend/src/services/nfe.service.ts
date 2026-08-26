// C:\emissornfe\backend\src\services\nfe.service.ts

import { Prisma } from '@prisma/client';
import { NfeRepository } from '../repositories/nfe.repository.js';
import { ClienteRepository } from '../repositories/cliente.repository.js';
import { ProdutoRepository } from '../repositories/produto.repository.js';
import { EmpresaRepository } from '../repositories/empresa.repository.js';
import { FinanceiroRepository } from '../repositories/financeiro.repository.js';
import { gerarChaveAcessoNFe } from '../utils/chaveAcesso.js';
import { calcularTotaisNfe } from '../utils/tributosEngine.js';
import { gerarXmlNfe400 } from '../utils/xmlNfeGenerator.js';

export class NfeService {
  private nfeRepo: NfeRepository;
  private clienteRepo: ClienteRepository;
  private produtoRepo: ProdutoRepository;
  private empresaRepo: EmpresaRepository;
  private financeiroRepo: FinanceiroRepository;

  constructor() {
    this.nfeRepo = new NfeRepository();
    this.clienteRepo = new ClienteRepository();
    this.produtoRepo = new ProdutoRepository();
    this.empresaRepo = new EmpresaRepository();
    this.financeiroRepo = new FinanceiroRepository();
  }

  async emitirNfe(data: any) {
    const empresa = await this.empresaRepo.findById(data.empresaId);
    if (!empresa) throw new Error('Empresa não encontrada');

    const destinatario = await this.clienteRepo.findById(data.destinatarioId);
    if (!destinatario) throw new Error('Destinatário não encontrado');

    if (!empresa.certificado || empresa.certificado.status !== 'VALIDO') {
      throw new Error('Certificado digital inválido ou não configurado');
    }

    const itensCompletos = await Promise.all(
      (data.itens || []).map(async (item: any) => {
        const produto = await this.produtoRepo.findById(item.produtoId);
        if (!produto) throw new Error(`Produto ${item.produtoId} não encontrado`);

        const quantidade = item.quantidade || 1;
        const valorUnitario = item.valorUnitario || produto.precoVenda;
        const valorTotal = quantidade * valorUnitario;

        return {
          codigoProduto: produto.codigo,
          descricao: produto.descricao,
          ncm: produto.ncm,
          cfop: produto.cfopPadrao || '5102',
          unidadeMedida: produto.unidade,
          quantidade,
          valorUnitario,
          valorTotalBruto: valorTotal,
          origemMercadoria: produto.origem || 0,
          cstICMS: '00',
          aliquotaICMS: produto.aliquotaICMS,
          baseCalculoICMS: valorTotal,
          valorICMS: (valorTotal * produto.aliquotaICMS) / 100,
          cstPIS: '01',
          aliquotaPIS: produto.aliquotaPIS,
          valorPIS: (valorTotal * produto.aliquotaPIS) / 100,
          cstCOFINS: '01',
          aliquotaCOFINS: produto.aliquotaCOFINS,
          valorCOFINS: (valorTotal * produto.aliquotaCOFINS) / 100,
          valorTributosAproximados: valorTotal * 0.314,
        };
      })
    );

    const totais = calcularTotaisNfe(itensCompletos, 0, 0, 0, 0);
    const numero = await this.getProximoNumero(data.empresaId);
    const aamm = new Date().toISOString().slice(2, 4) +
                 (new Date().getMonth() + 1).toString().padStart(2, '0');

    const { chaveCompleta } = gerarChaveAcessoNFe({
      codigoUf: empresa.endereco?.codigoMunicipio?.slice(0, 2) || '35',
      anoMes: aamm,
      cnpjEmitente: empresa.cnpj,
      modelo: '55',
      serie: empresa.serieNfe || 1,
      numero,
      tipoEmissao: 1,
    });

    const nfeData = {
      modelo: '55',
      serie: empresa.serieNfe || 1,
      numero,
      chaveAcesso: chaveCompleta,
      dataHoraEmissao: new Date(),
      dataHoraSaida: new Date(),
      naturezaOperacao: data.naturezaOperacao || 'Venda de Mercadorias',
      ambiente: empresa.ambienteEmissao || 1,
      tipoEmissao: 1,
      tipoDocumento: 1,
      finalidade: 1,
      consumidorFinal: false,
      presencaComprador: 2,
      status: 'AUTORIZADA',

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

      formaPagamento: data.formaPagamento || '17',
      informacoesAdicionais: data.informacoesAdicionais || '',

      empresaId: data.empresaId,
      destinatarioId: data.destinatarioId,
    };

    const nfeCriada = await this.nfeRepo.create(nfeData);
    const xml = gerarXmlNfe400(nfeCriada);

    await this.empresaRepo.update(data.empresaId, {
      proximoNumeroNfe: numero + 1
    });

    for (const item of (data.itens || [])) {
      const produto = await this.produtoRepo.findById(item.produtoId);
      if (produto) {
        await this.produtoRepo.update(item.produtoId, {
          estoqueAtual: Math.max(0, produto.estoqueAtual - item.quantidade)
        });
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

    const nfeCancelada = await this.nfeRepo.cancelar(id, motivo);

    const titulo = await this.financeiroRepo.findByDocumentoOrigem(nfe.chaveAcesso);
    if (titulo) {
      await this.financeiroRepo.cancelarTitulo(titulo.id, motivo);
    }

    return nfeCancelada;
  }

  async listarNfes(empresaId: string, page: number, limit: number) {
    return this.nfeRepo.findAll(empresaId, page, limit);
  }

  async buscarPorId(id: string) {
    return this.nfeRepo.findById(id);
  }

  async buscarPorChave(chave: string) {
    return this.nfeRepo.findByChave(chave);
  }

  async getTotalVendas(empresaId: string, startDate?: Date, endDate?: Date) {
    return this.nfeRepo.getTotalVendas(empresaId, startDate, endDate);
  }
}