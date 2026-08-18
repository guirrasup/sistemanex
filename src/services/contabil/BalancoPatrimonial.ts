// src/services/contabil/BalancoPatrimonial.ts

import { store } from '../store';
import { BalancoPatrimonial } from '../../types/contabil';

export function calcularBalancoPatrimonial(
  companyId: string,
  dataReferencia: string
): BalancoPatrimonial {
  const docs = store.financialDocuments.filter(d =>
    d.company_id === companyId &&
    d.issue_date <= dataReferencia
  );

  const bankAccounts = store.bankAccounts.filter(b => b.company_id === companyId);
  const pessoas = store.people.filter(p => p.company_id === companyId);
  const produtos = store.products.filter(p => p.company_id === companyId);

  // ATIVO CIRCULANTE
  const disponivel = bankAccounts.reduce((acc, b) => acc + b.balance, 0);

  const clientes = docs
    .filter(d => d.direction === 'receivable')
    .reduce((acc, d) => acc + d.total_amount, 0);

  const estoques = produtos.reduce((acc, p) => acc + (p.stock_quantity || 0) * p.cost_price, 0);

  const despesasAntecipadas = 0;
  const outrosAtivosCirculantes = 0;

  const totalAtivoCirculante = disponivel + clientes + estoques + despesasAntecipadas + outrosAtivosCirculantes;

  // ATIVO NÃO CIRCULANTE
  const realizavelLongoPrazo = 0;
  const investimentos = 0;
  const imobilizado = produtos.reduce((acc, p) => acc + (p.stock_quantity || 0) * p.cost_price * 0.3, 0);
  const intangivel = 0;

  const totalAtivoNaoCirculante = realizavelLongoPrazo + investimentos + imobilizado + intangivel;
  const totalAtivo = totalAtivoCirculante + totalAtivoNaoCirculante;

  // PASSIVO CIRCULANTE
  const fornecedores = docs
    .filter(d => d.direction === 'payable')
    .reduce((acc, d) => acc + d.total_amount, 0);

  const fiscalDocs = store.fiscalDocuments.filter(d =>
    d.company_id === companyId &&
    d.issue_date <= dataReferencia
  );

  const obrigacoesFiscais = fiscalDocs.reduce((acc, d) =>
    acc + (d.icms_value || 0) + (d.pis_value || 0) + (d.cofins_value || 0) +
    (d.cbs_value || 0) + (d.ibs_value || 0), 0);

  const obrigacoesTrabalhistas = 0;
  const emprestimosCurtoPrazo = 0;
  const outrosPassivosCirculantes = 0;

  const totalPassivoCirculante = fornecedores + obrigacoesFiscais + obrigacoesTrabalhistas +
    emprestimosCurtoPrazo + outrosPassivosCirculantes;

  // PASSIVO NÃO CIRCULANTE
  const emprestimosLongoPrazo = 0;
  const outrosPassivosNaoCirculantes = 0;
  const totalPassivoNaoCirculante = emprestimosLongoPrazo + outrosPassivosNaoCirculantes;

  // PATRIMÔNIO LÍQUIDO
  const capitalSocial = 100000;
  const reservas = 0;
  const lucrosAcumulados = docs
    .filter(d => d.direction === 'receivable')
    .reduce((acc, d) => acc + d.total_amount, 0) -
    docs
      .filter(d => d.direction === 'payable')
      .reduce((acc, d) => acc + d.total_amount, 0);

  const totalPatrimonioLiquido = capitalSocial + reservas + lucrosAcumulados;

  const totalPassivo = totalPassivoCirculante + totalPassivoNaoCirculante + totalPatrimonioLiquido;

  // INDICADORES
  const liquidezCorrente = totalPassivoCirculante > 0 ? totalAtivoCirculante / totalPassivoCirculante : 0;
  const liquidezSeca = totalPassivoCirculante > 0 ? (totalAtivoCirculante - estoques) / totalPassivoCirculante : 0;
  const liquidezImediata = totalPassivoCirculante > 0 ? disponivel / totalPassivoCirculante : 0;
  const endividamento = totalAtivo > 0 ? (totalPassivoCirculante + totalPassivoNaoCirculante) / totalAtivo : 0;
  const composicaoEndividamento = (totalPassivoCirculante + totalPassivoNaoCirculante) > 0 ?
    totalPassivoCirculante / (totalPassivoCirculante + totalPassivoNaoCirculante) : 0;

  return {
    periodo: { data: dataReferencia },
    ativo: {
      circulante: {
        disponivel,
        clientes,
        estoques,
        despesas_antecipadas: despesasAntecipadas,
        outros: outrosAtivosCirculantes,
        total: totalAtivoCirculante,
      },
      nao_circulante: {
        realizavel_longo_prazo: realizavelLongoPrazo,
        investimentos,
        imobilizado,
        intangivel,
        total: totalAtivoNaoCirculante,
      },
      total: totalAtivo,
    },
    passivo: {
      circulante: {
        fornecedores,
        obrigacoes_fiscais: obrigacoesFiscais,
        obrigacoes_trabalhistas: obrigacoesTrabalhistas,
        emprestimos_curto_prazo: emprestimosCurtoPrazo,
        outros: outrosPassivosCirculantes,
        total: totalPassivoCirculante,
      },
      nao_circulante: {
        emprestimos_longo_prazo: emprestimosLongoPrazo,
        outros: outrosPassivosNaoCirculantes,
        total: totalPassivoNaoCirculante,
      },
      patrimonio_liquido: {
        capital_social: capitalSocial,
        reservas,
        lucros_acumulados: lucrosAcumulados,
        total: totalPatrimonioLiquido,
      },
      total: totalPassivo,
    },
    indicadores: {
      liquidez_corrente: liquidezCorrente,
      liquidez_seca: liquidezSeca,
      liquidez_imediata: liquidezImediata,
      endividamento,
      composicao_endividamento: composicaoEndividamento,
    },
  };
}