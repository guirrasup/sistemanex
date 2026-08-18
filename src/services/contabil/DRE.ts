// src/services/contabil/DRE.ts

import { store } from '../store';
import { DRE } from '../../types/contabil';
import { FinancialDocument } from '../../types';

export function calcularDRE(
  companyId: string,
  dataInicio: string,
  dataFim: string
): DRE {
  const docs = store.financialDocuments.filter(d =>
    d.company_id === companyId &&
    d.issue_date >= dataInicio &&
    d.issue_date <= dataFim
  );

  const produtos = store.products.filter(p => p.company_id === companyId);

  // 1. Receita Bruta
  const receitas = docs.filter(d => d.direction === 'receivable');
  const receitaVendas = receitas
    .filter(d => d.category_id === 'cat-001')
    .reduce((acc, d) => acc + d.total_amount, 0);
  const receitaServicos = receitas
    .filter(d => d.category_id === 'cat-002')
    .reduce((acc, d) => acc + d.total_amount, 0);
  const outrasReceitas = receitas
    .filter(d => !['cat-001', 'cat-002'].includes(d.category_id || ''))
    .reduce((acc, d) => acc + d.total_amount, 0);

  const receitaBruta = receitaVendas + receitaServicos + outrasReceitas;

  // 2. Deduções
  const fiscalDocs = store.fiscalDocuments.filter(d =>
    d.company_id === companyId &&
    d.issue_date >= dataInicio &&
    d.issue_date <= dataFim &&
    d.status === 'authorized'
  );

  const deducoes = {
    icms: fiscalDocs.reduce((acc, d) => acc + (d.icms_value || 0), 0),
    pis: fiscalDocs.reduce((acc, d) => acc + (d.pis_value || 0), 0),
    cofins: fiscalDocs.reduce((acc, d) => acc + (d.cofins_value || 0), 0),
    cbs: fiscalDocs.reduce((acc, d) => acc + (d.cbs_value || 0), 0),
    ibs: fiscalDocs.reduce((acc, d) => acc + (d.ibs_value || 0), 0),
    outras: 0,
  };
  const totalDeducoes = Object.values(deducoes).reduce((acc, v) => acc + v, 0);

  // 3. Receita Líquida
  const receitaLiquida = receitaBruta - totalDeducoes;

  // 4. CMV (estimado)
  const cmv = {
    estoque_inicial: produtos.reduce((acc, p) => acc + (p.stock_quantity || 0) * p.cost_price, 0) * 0.8,
    compras: docs
      .filter(d => d.direction === 'payable' && d.category_id === 'cat-003')
      .reduce((acc, d) => acc + d.total_amount, 0),
    estoque_final: produtos.reduce((acc, p) => acc + (p.stock_quantity || 0) * p.cost_price, 0) * 0.6,
    total: 0,
  };
  cmv.total = cmv.estoque_inicial + cmv.compras - cmv.estoque_final;

  // 5. Lucro Bruto
  const lucroBruto = receitaLiquida - cmv.total;

  // 6. Despesas Operacionais
  const despesas = docs.filter(d => d.direction === 'payable');
  const despesasAdm = despesas
    .filter(d => d.category_id === 'cat-005')
    .reduce((acc, d) => acc + d.total_amount, 0);
  const despesasComerciais = despesas
    .filter(d => d.category_id === 'cat-004')
    .reduce((acc, d) => acc + d.total_amount, 0);
  const despesasFinanceiras = despesas
    .filter(d => d.category_id === 'cat-003')
    .reduce((acc, d) => acc + d.total_amount, 0) * 0.1;
  const despesasTributarias = fiscalDocs.reduce((acc, d) =>
    acc + (d.icms_value || 0) + (d.pis_value || 0) + (d.cofins_value || 0) +
    (d.cbs_value || 0) + (d.ibs_value || 0), 0);
  const outrasDespesas = despesas
    .filter(d => !['cat-003', 'cat-004', 'cat-005'].includes(d.category_id || ''))
    .reduce((acc, d) => acc + d.total_amount, 0);

  const totalDespesasOperacionais = despesasAdm + despesasComerciais +
    despesasFinanceiras + despesasTributarias + outrasDespesas;

  // 7. Lucro Operacional
  const lucroOperacional = lucroBruto - totalDespesasOperacionais;

  // 8. Resultado Financeiro
  const receitasFinanceiras = receitas
    .filter(d => d.category_id === 'cat-002')
    .reduce((acc, d) => acc + d.total_amount, 0) * 0.05;
  const despesasFinanceirasTotal = despesasFinanceiras;
  const resultadoFinanceiro = receitasFinanceiras - despesasFinanceirasTotal;

  // 9. Lucro Antes do IR
  const lucroAntesIR = lucroOperacional + resultadoFinanceiro;

  // 10. Impostos
  const irpj = lucroAntesIR * 0.15;
  const csll = lucroAntesIR * 0.09;
  const totalImpostos = irpj + csll;

  // 11. Lucro Líquido
  const lucroLiquido = lucroAntesIR - totalImpostos;

  // 12. Indicadores
  const margemBruta = receitaLiquida > 0 ? (lucroBruto / receitaLiquida) * 100 : 0;
  const margemOperacional = receitaLiquida > 0 ? (lucroOperacional / receitaLiquida) * 100 : 0;
  const margemLiquida = receitaLiquida > 0 ? (lucroLiquido / receitaLiquida) * 100 : 0;
  const ebitda = lucroOperacional + (despesasAdm * 0.1);

  return {
    periodo: { data_inicio: dataInicio, data_fim: dataFim },
    receita_bruta: {
      vendas_mercadorias: receitaVendas,
      vendas_servicos: receitaServicos,
      outras_receitas: outrasReceitas,
      total: receitaBruta,
    },
    deducoes: {
      icms: deducoes.icms,
      pis: deducoes.pis,
      cofins: deducoes.cofins,
      cbs: deducoes.cbs,
      ibs: deducoes.ibs,
      outras: deducoes.outras,
      total: totalDeducoes,
    },
    receita_liquida: receitaLiquida,
    cmv: cmv,
    lucro_bruto: lucroBruto,
    despesas_operacionais: {
      administrativas: despesasAdm,
      comerciais: despesasComerciais,
      financeiras: despesasFinanceiras,
      tributarias: despesasTributarias,
      outras: outrasDespesas,
      total: totalDespesasOperacionais,
    },
    lucro_operacional: lucroOperacional,
    resultado_financeiro: {
      receitas: receitasFinanceiras,
      despesas: despesasFinanceirasTotal,
      total: resultadoFinanceiro,
    },
    lucro_antes_ir: lucroAntesIR,
    impostos: {
      irpj: irpj,
      csll: csll,
      total: totalImpostos,
    },
    lucro_liquido: lucroLiquido,
    indicadores: {
      margem_bruta: margemBruta,
      margem_operacional: margemOperacional,
      margem_liquida: margemLiquida,
      ebitda: ebitda,
    },
  };
}