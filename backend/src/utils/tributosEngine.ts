// C:\emissornfe\backend\src\utils\tributosEngine.ts

/**
 * Motor de Cálculo Tributário Fiscal Brasileiro
 * Em conformidade com o Manual NFS-e Nacional v1.01 (2026), Reforma Tributária (IBS/CBS) e ICMS/IPI/PIS/COFINS
 * SUP TECNOLOGIA - BACKEND
 */

import { ServicoItemNfse, InformacoesIBSCBS, ItemNfe } from '../types/fiscal.js';

export interface CalculoNfseResultado {
  valorServico: number;
  descontoIncondicionado: number;
  descontoCondicionado: number;
  deducoesMateriais: number;
  baseCalculoISS: number;
  aliquotaISS: number;
  valorISS: number;
  valorISSRetido: number;
  
  aliquotaPIS: number;
  valorPIS: number;
  aliquotaCOFINS: number;
  valorCOFINS: number;
  aliquotaIRRF: number;
  valorIRRF: number;
  aliquotaCSLL: number;
  valorCSLL: number;
  aliquotaINSS: number;
  valorINSS: number;
  totalRetencoes: number;
  
  baseCalculoIBSCBS: number;
  aliquotaIBSUF: number;
  valorIBSUF: number;
  aliquotaIBSMun: number;
  valorIBSMun: number;
  valorTotalIBS: number;
  aliquotaCBS: number;
  valorCBS: number;
  
  tributosFederais: number;
  tributosEstaduais: number;
  tributosMunicipais: number;
  percentualTotalTributos: number;
  
  valorLiquido: number;
  valorTotalNotaFinal: number;
  ibscbs: InformacoesIBSCBS;
}

/**
 * Executa o cálculo integral de tributos da NFS-e Nacional conforme Manual v1.01
 */
export function calcularTributosNfse(params: {
  valorServico: number;
  descontoIncondicionado?: number;
  descontoCondicionado?: number;
  deducoesMateriais?: number;
  aliquotaISS: number;
  tipoRetencaoISS: 1 | 2 | 3;
  tributacaoISSQN: 1 | 2 | 3 | 4;
  optanteSimplesNacional: boolean;
  aliquotaPIS?: number;
  retidoPIS?: boolean;
  aliquotaCOFINS?: number;
  retidoCOFINS?: boolean;
  aliquotaIRRF?: number;
  aliquotaCSLL?: number;
  aliquotaINSS?: number;
  formaPagamento?: string;
  cnpjTomador?: string;
}): CalculoNfseResultado {
  const vServ = Math.max(0, params.valorServico);
  const descIncond = Math.max(0, params.descontoIncondicionado || 0);
  const descCond = Math.max(0, params.descontoCondicionado || 0);
  const deducoes = Math.max(0, params.deducoesMateriais || 0);

  let baseCalculoISS = 0;
  let valorISS = 0;
  let valorISSRetido = 0;
  const aliquotaISS = params.aliquotaISS;

  if (params.tributacaoISSQN === 1) {
    baseCalculoISS = Math.max(0, vServ - descIncond - deducoes);
    valorISS = Number(((baseCalculoISS * aliquotaISS) / 100).toFixed(2));
    if (params.tipoRetencaoISS === 2 || params.tipoRetencaoISS === 3) {
      valorISSRetido = valorISS;
    }
  }

  const aliqPIS = params.aliquotaPIS !== undefined ? params.aliquotaPIS : (params.optanteSimplesNacional ? 0 : 0.65);
  const aliqCOFINS = params.aliquotaCOFINS !== undefined ? params.aliquotaCOFINS : (params.optanteSimplesNacional ? 0 : 3.00);
  const aliqIRRF = params.aliquotaIRRF || 0;
  const aliqCSLL = params.aliquotaCSLL || 0;
  const aliqINSS = params.aliquotaINSS || 0;

  const baseCalculoFed = Math.max(0, vServ - descIncond);
  const valorPIS = Number(((baseCalculoFed * aliqPIS) / 100).toFixed(2));
  const valorCOFINS = Number(((baseCalculoFed * aliqCOFINS) / 100).toFixed(2));
  const valorIRRF = Number(((baseCalculoFed * aliqIRRF) / 100).toFixed(2));
  const valorCSLL = Number(((baseCalculoFed * aliqCSLL) / 100).toFixed(2));
  const valorINSS = Number(((baseCalculoFed * aliqINSS) / 100).toFixed(2));

  let totalRetencoes = valorISSRetido + valorIRRF + valorCSLL + valorINSS;
  if (params.retidoPIS) totalRetencoes += valorPIS;
  if (params.retidoCOFINS) totalRetencoes += valorCOFINS;

  const aliqCBS = 0.90;
  const aliqIBSUF = 0.05;
  const aliqIBSMun = 0.05;

  const baseCalculoIBSCBS = Math.max(0, vServ - descIncond - deducoes - valorISS - valorPIS - valorCOFINS);
  
  const valorIBSUF = Number(((baseCalculoIBSCBS * aliqIBSUF) / 100).toFixed(2));
  const valorIBSMun = Number(((baseCalculoIBSCBS * aliqIBSMun) / 100).toFixed(2));
  const valorTotalIBS = Number((valorIBSUF + valorIBSMun).toFixed(2));
  const valorCBS = Number(((baseCalculoIBSCBS * aliqCBS) / 100).toFixed(2));

  const valorLiquido = Number(Math.max(0, vServ - descIncond - descCond - totalRetencoes).toFixed(2));
  const valorTotalNotaFinal = valorLiquido;

  const tributosFederais = Number(((vServ * 13.45) / 100).toFixed(2));
  const tributosEstaduais = 0;
  const tributosMunicipais = Number(((vServ * aliquotaISS) / 100).toFixed(2));
  const percentualTotalTributos = Number((13.45 + aliquotaISS).toFixed(2));

  const ibscbs: InformacoesIBSCBS = {
    finalidade: 0,
    indicadorUsoConsumoPessoal: 0,
    codigoIndicadorOperacao: '030101',
    indicadorDestinatario: 0,
    cstIBSCBS: '01',
    codigoClassificacaoTrib: '001',
    aliquotaIBSUF: aliqIBSUF,
    valorIBSUF,
    aliquotaIBSMun: aliqIBSMun,
    valorIBSMun,
    aliquotaCBS: aliqCBS,
    valorCBS,
    pagamentoVinculado: {
      numeroPagamento: 1,
      idTransacao: `TX-${Date.now().toString().slice(-8)}`,
      tipoMeioPagamento: params.formaPagamento || '17',
      cnpjRecebedor: params.cnpjTomador || '00000000000191',
      cnpjBasePSP: '00000000',
    },
  };

  return {
    valorServico: vServ,
    descontoIncondicionado: descIncond,
    descontoCondicionado: descCond,
    deducoesMateriais: deducoes,
    baseCalculoISS,
    aliquotaISS,
    valorISS,
    valorISSRetido,
    aliquotaPIS: aliqPIS,
    valorPIS,
    aliquotaCOFINS: aliqCOFINS,
    valorCOFINS,
    aliquotaIRRF: aliqIRRF,
    valorIRRF,
    aliquotaCSLL: aliqCSLL,
    valorCSLL,
    aliquotaINSS: aliqINSS,
    valorINSS,
    totalRetencoes,
    baseCalculoIBSCBS,
    aliquotaIBSUF: aliqIBSUF,
    valorIBSUF,
    aliquotaIBSMun: aliqIBSMun,
    valorIBSMun,
    valorTotalIBS,
    aliquotaCBS: aliqCBS,
    valorCBS,
    tributosFederais,
    tributosEstaduais,
    tributosMunicipais,
    percentualTotalTributos,
    valorLiquido,
    valorTotalNotaFinal,
    ibscbs,
  };
}

/**
 * Calcula os totais de itens e impostos de uma NF-e de Produtos
 */
export function calcularTotaisNfe(itens: ItemNfe[], frete = 0, seguro = 0, outrasDespesas = 0, descontoGeral = 0) {
  let valorTotalProdutos = 0;
  let baseCalculoICMS = 0;
  let valorTotalICMS = 0;
  let baseCalculoICMSST = 0;
  let valorTotalICMSST = 0;
  let valorTotalIPI = 0;
  let valorTotalPIS = 0;
  let valorTotalCOFINS = 0;
  let valorTotalIBS = 0;
  let valorTotalCBS = 0;
  let valorTotalTributosAproximados = 0;
  let totalDescontosItens = 0;

  itens.forEach((item) => {
    const totalBruto = item.quantidade * item.valorUnitario;
    valorTotalProdutos += totalBruto;
    totalDescontosItens += item.descontoItem || 0;

    baseCalculoICMS += item.baseCalculoICMS || 0;
    valorTotalICMS += item.valorICMS || 0;
    baseCalculoICMSST += 0;
    valorTotalICMSST += item.valorICMSST || 0;
    valorTotalIPI += item.valorIPI || 0;
    valorTotalPIS += item.valorPIS || 0;
    valorTotalCOFINS += item.valorCOFINS || 0;
    valorTotalIBS += (item.valorIBSUF || 0) + (item.valorIBSMun || 0);
    valorTotalCBS += item.valorCBS || 0;
    valorTotalTributosAproximados += item.valorTributosAproximados || 0;
  });

  const totalDesconto = totalDescontosItens + descontoGeral;
  const valorTotalNota = Number((valorTotalProdutos + frete + seguro + outrasDespesas + valorTotalIPI + valorTotalICMSST - totalDesconto).toFixed(2));

  return {
    valorTotalProdutos: Number(valorTotalProdutos.toFixed(2)),
    valorTotalFrete: Number(frete.toFixed(2)),
    valorTotalSeguro: Number(seguro.toFixed(2)),
    valorTotalDesconto: Number(totalDesconto.toFixed(2)),
    valorTotalOutrasDespesas: Number(outrasDespesas.toFixed(2)),
    baseCalculoICMS: Number(baseCalculoICMS.toFixed(2)),
    valorTotalICMS: Number(valorTotalICMS.toFixed(2)),
    baseCalculoICMSST: Number(baseCalculoICMSST.toFixed(2)),
    valorTotalICMSST: Number(valorTotalICMSST.toFixed(2)),
    valorTotalIPI: Number(valorTotalIPI.toFixed(2)),
    valorTotalPIS: Number(valorTotalPIS.toFixed(2)),
    valorTotalCOFINS: Number(valorTotalCOFINS.toFixed(2)),
    valorTotalIBS: Number(valorTotalIBS.toFixed(2)),
    valorTotalCBS: Number(valorTotalCBS.toFixed(2)),
    valorTotalTributosAproximados: Number(valorTotalTributosAproximados.toFixed(2)),
    valorTotalNota,
  };
}