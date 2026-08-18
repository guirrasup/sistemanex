// src/services/contabil/FluxoCaixa.ts

import { store } from '../store';
import { FluxoCaixa } from '../../types/contabil';
import { FinancialDocument, Installment, Settlement, BankAccount } from '../../types';

export interface OpcoesFluxoCaixa {
  companyId: string;
  dataInicio: string;
  dataFim: string;
  incluirProjecao?: boolean;
  diasProjecao?: number;
}

export class FluxoCaixaService {
  private companyId: string;
  private dataInicio: string;
  private dataFim: string;
  private incluirProjecao: boolean;
  private diasProjecao: number;

  constructor(opcoes: OpcoesFluxoCaixa) {
    this.companyId = opcoes.companyId;
    this.dataInicio = opcoes.dataInicio;
    this.dataFim = opcoes.dataFim;
    this.incluirProjecao = opcoes.incluirProjecao || false;
    this.diasProjecao = opcoes.diasProjecao || 30;
  }

  /**
   * Calcula o Fluxo de Caixa do período
   */
  calcularFluxoCaixa(): FluxoCaixa {
    const docs = store.financialDocuments.filter(d =>
      d.company_id === this.companyId &&
      d.issue_date >= this.dataInicio &&
      d.issue_date <= this.dataFim
    );

    const installments = store.installments || [];
    const settlements = store.settlements || [];
    const bankAccounts = store.bankAccounts.filter(b => b.company_id === this.companyId);

    // ===== SALDO INICIAL =====
    const saldoInicial = bankAccounts.reduce((acc, b) => acc + b.balance, 0);

    // ===== ATIVIDADES OPERACIONAIS =====

    // Recebimentos de Clientes (considerando parcelas pagas)
    const recebimentosClientes = settlements
      .filter(s => {
        const inst = installments.find(i => i.id === s.installment_id);
        if (!inst) return false;
        const doc = docs.find(d => d.id === inst.financial_document_id);
        return doc && doc.direction === 'receivable' && 
               s.paid_date >= this.dataInicio && 
               s.paid_date <= this.dataFim;
      })
      .reduce((acc, s) => acc + s.paid_amount, 0);

    // Pagamentos a Fornecedores (considerando parcelas pagas)
    const pagamentosFornecedores = settlements
      .filter(s => {
        const inst = installments.find(i => i.id === s.installment_id);
        if (!inst) return false;
        const doc = docs.find(d => d.id === inst.financial_document_id);
        return doc && doc.direction === 'payable' &&
               s.paid_date >= this.dataInicio && 
               s.paid_date <= this.dataFim;
      })
      .reduce((acc, s) => acc + s.paid_amount, 0);

    // Pagamentos de Funcionários (estimativa)
    const pagamentosFuncionarios = docs
      .filter(d => d.direction === 'payable' && d.category_id === 'rh')
      .reduce((acc, d) => acc + d.total_amount, 0) * 0.3;

    // Pagamentos de Impostos
    const fiscalDocs = store.fiscalDocuments.filter(d =>
      d.company_id === this.companyId &&
      d.issue_date >= this.dataInicio &&
      d.issue_date <= this.dataFim &&
      d.status === 'authorized'
    );

    const pagamentosImpostos = fiscalDocs.reduce((acc, d) =>
      acc + (d.icms_value || 0) + (d.pis_value || 0) + (d.cofins_value || 0) +
      (d.cbs_value || 0) + (d.ibs_value || 0), 0) * 0.5;

    // Outros Recebimentos
    const outrosRecebimentos = docs
      .filter(d => d.direction === 'receivable' && d.category_id === 'outras_receitas')
      .reduce((acc, d) => acc + d.total_amount, 0);

    // Outros Pagamentos
    const outrosPagamentos = docs
      .filter(d => d.direction === 'payable' && 
        !['rh', 'compras', 'impostos'].includes(d.category_id || ''))
      .reduce((acc, d) => acc + d.total_amount, 0);

    const caixaLiquidoOperacional = recebimentosClientes - pagamentosFornecedores -
      pagamentosFuncionarios - pagamentosImpostos + outrosRecebimentos - outrosPagamentos;

    // ===== ATIVIDADES DE INVESTIMENTO =====

    const compraImobilizado = docs
      .filter(d => d.direction === 'payable' && d.category_id === 'investimento')
      .reduce((acc, d) => acc + d.total_amount, 0);

    const vendaImobilizado = docs
      .filter(d => d.direction === 'receivable' && d.category_id === 'venda_imobilizado')
      .reduce((acc, d) => acc + d.total_amount, 0);

    const investimentos = docs
      .filter(d => d.direction === 'payable' && d.category_id === 'aplicacoes')
      .reduce((acc, d) => acc + d.total_amount, 0);

    const caixaLiquidoInvestimento = -(compraImobilizado + investimentos) + vendaImobilizado;

    // ===== ATIVIDADES DE FINANCIAMENTO =====

    const emprestimosRecebidos = docs
      .filter(d => d.direction === 'receivable' && d.category_id === 'emprestimo')
      .reduce((acc, d) => acc + d.total_amount, 0);

    const pagamentoEmprestimos = docs
      .filter(d => d.direction === 'payable' && d.category_id === 'amortizacao')
      .reduce((acc, d) => acc + d.total_amount, 0);

    const integralizacaoCapital = docs
      .filter(d => d.direction === 'receivable' && d.category_id === 'capital')
      .reduce((acc, d) => acc + d.total_amount, 0);

    const distribuicaoLucros = docs
      .filter(d => d.direction === 'payable' && d.category_id === 'dividendos')
      .reduce((acc, d) => acc + d.total_amount, 0);

    const caixaLiquidoFinanciamento = emprestimosRecebidos + integralizacaoCapital -
      pagamentoEmprestimos - distribuicaoLucros;

    // ===== VARIAÇÃO DE CAIXA =====

    const variacaoCaixa = caixaLiquidoOperacional + caixaLiquidoInvestimento + caixaLiquidoFinanciamento;
    const saldoFinal = saldoInicial + variacaoCaixa;

    return {
      periodo: {
        data_inicio: this.dataInicio,
        data_fim: this.dataFim,
      },
      operacionais: {
        recebimentos_clientes: recebimentosClientes,
        pagamentos_fornecedores: pagamentosFornecedores,
        pagamentos_funcionarios: pagamentosFuncionarios,
        pagamentos_impostos: pagamentosImpostos,
        outros_recebimentos: outrosRecebimentos,
        outros_pagamentos: outrosPagamentos,
        caixa_liquido_operacional: caixaLiquidoOperacional,
      },
      investimento: {
        compra_imobilizado: compraImobilizado,
        venda_imobilizado: vendaImobilizado,
        investimentos: investimentos,
        caixa_liquido_investimento: caixaLiquidoInvestimento,
      },
      financiamento: {
        emprestimos_recebidos: emprestimosRecebidos,
        pagamento_emprestimos: pagamentoEmprestimos,
        integralizacao_capital: integralizacaoCapital,
        distribuicao_lucros: distribuicaoLucros,
        caixa_liquido_financiamento: caixaLiquidoFinanciamento,
      },
      variacao_caixa: variacaoCaixa,
      saldo_inicial: saldoInicial,
      saldo_final: saldoFinal,
    };
  }

  /**
   * Calcula projeção de Fluxo de Caixa para os próximos dias
   */
  calcularProjecaoFluxoCaixa(): Array<{
    data: string;
    entradas: number;
    saidas: number;
    saldo: number;
    saldo_acumulado: number;
  }> {
    const hoje = new Date();
    const projecao: Array<{
      data: string;
      entradas: number;
      saidas: number;
      saldo: number;
      saldo_acumulado: number;
    }> = [];

    // Buscar títulos a receber/pagar futuros
    const installments = store.installments || [];
    const docs = store.financialDocuments || [];

    // Filtrar parcelas pendentes
    const parcelasPendentes = installments.filter(i =>
      i.status === 'pending' || i.status === 'overdue'
    );

    let saldoAcumulado = 0;

    for (let i = 0; i < this.diasProjecao; i++) {
      const data = new Date(hoje);
      data.setDate(data.getDate() + i);
      const dataStr = data.toISOString().split('T')[0];

      // Entradas do dia
      const entradas = parcelasPendentes
        .filter(p => {
          const doc = docs.find(d => d.id === p.financial_document_id);
          return doc && doc.direction === 'receivable' && p.due_date === dataStr;
        })
        .reduce((acc, p) => acc + p.current_amount, 0);

      // Saídas do dia
      const saidas = parcelasPendentes
        .filter(p => {
          const doc = docs.find(d => d.id === p.financial_document_id);
          return doc && doc.direction === 'payable' && p.due_date === dataStr;
        })
        .reduce((acc, p) => acc + p.current_amount, 0);

      // Saldo do dia (entradas - saídas)
      const saldoDia = entradas - saidas;
      saldoAcumulado += saldoDia;

      projecao.push({
        data: dataStr,
        entradas: entradas,
        saidas: saidas,
        saldo: saldoDia,
        saldo_acumulado: saldoAcumulado,
      });
    }

    return projecao;
  }

  /**
   * Gera relatório detalhado de Fluxo de Caixa
   */
  gerarRelatorioDetalhado(): {
    fluxo: FluxoCaixa;
    projecao?: Array<{
      data: string;
      entradas: number;
      saidas: number;
      saldo: number;
      saldo_acumulado: number;
    }>;
    resumo_mensal: Array<{
      mes: string;
      entradas: number;
      saidas: number;
      saldo: number;
    }>;
  } {
    const fluxo = this.calcularFluxoCaixa();
    const projecao = this.incluirProjecao ? this.calcularProjecaoFluxoCaixa() : undefined;

    // Resumo mensal
    const docs = store.financialDocuments.filter(d =>
      d.company_id === this.companyId &&
      d.issue_date >= this.dataInicio &&
      d.issue_date <= this.dataFim
    );

    const settlements = store.settlements || [];
    const installments = store.installments || [];

    const resumoMensal: Array<{
      mes: string;
      entradas: number;
      saidas: number;
      saldo: number;
    }> = [];

    const meses = new Set<string>();

    // Identificar meses no período
    let dataAtual = new Date(this.dataInicio);
    const dataFim = new Date(this.dataFim);

    while (dataAtual <= dataFim) {
      const mesAno = `${dataAtual.getFullYear()}-${String(dataAtual.getMonth() + 1).padStart(2, '0')}`;
      meses.add(mesAno);
      dataAtual.setMonth(dataAtual.getMonth() + 1);
    }

    for (const mesAno of meses) {
      const [ano, mes] = mesAno.split('-').map(Number);
      const mesInicio = `${ano}-${String(mes).padStart(2, '0')}-01`;
      const mesFim = `${ano}-${String(mes).padStart(2, '0')}-${new Date(ano, mes, 0).getDate()}`;

      // Entradas do mês
      const entradas = settlements
        .filter(s => {
          const inst = installments.find(i => i.id === s.installment_id);
          if (!inst) return false;
          const doc = docs.find(d => d.id === inst.financial_document_id);
          return doc && doc.direction === 'receivable' &&
                 s.paid_date >= mesInicio && s.paid_date <= mesFim;
        })
        .reduce((acc, s) => acc + s.paid_amount, 0);

      // Saídas do mês
      const saidas = settlements
        .filter(s => {
          const inst = installments.find(i => i.id === s.installment_id);
          if (!inst) return false;
          const doc = docs.find(d => d.id === inst.financial_document_id);
          return doc && doc.direction === 'payable' &&
                 s.paid_date >= mesInicio && s.paid_date <= mesFim;
        })
        .reduce((acc, s) => acc + s.paid_amount, 0);

      resumoMensal.push({
        mes: `${String(mes).padStart(2, '0')}/${ano}`,
        entradas: entradas,
        saidas: saidas,
        saldo: entradas - saidas,
      });
    }

    return {
      fluxo: fluxo,
      projecao: projecao,
      resumo_mensal: resumoMensal,
    };
  }

  /**
   * Exporta Fluxo de Caixa para CSV
   */
  exportarFluxoCaixaCSV(fluxo: FluxoCaixa): string {
    const cabecalho = ['Categoria', 'Valor'];
    const linhas: string[] = [cabecalho.join(';')];

    // Atividades Operacionais
    linhas.push(['ATIVIDADES OPERACIONAIS', ''].join(';'));
    linhas.push(['Recebimentos de Clientes', fluxo.operacionais.recebimentos_clientes.toFixed(2)].join(';'));
    linhas.push(['Pagamentos a Fornecedores', (-fluxo.operacionais.pagamentos_fornecedores).toFixed(2)].join(';'));
    linhas.push(['Pagamentos de Funcionários', (-fluxo.operacionais.pagamentos_funcionarios).toFixed(2)].join(';'));
    linhas.push(['Pagamentos de Impostos', (-fluxo.operacionais.pagamentos_impostos).toFixed(2)].join(';'));
    linhas.push(['Outros Recebimentos', fluxo.operacionais.outros_recebimentos.toFixed(2)].join(';'));
    linhas.push(['Outros Pagamentos', (-fluxo.operacionais.outros_pagamentos).toFixed(2)].join(';'));
    linhas.push(['Caixa Líquido Operacional', fluxo.operacionais.caixa_liquido_operacional.toFixed(2)].join(';'));

    // Atividades de Investimento
    linhas.push(['', ''].join(';'));
    linhas.push(['ATIVIDADES DE INVESTIMENTO', ''].join(';'));
    linhas.push(['Compra de Imobilizado', (-fluxo.investimento.compra_imobilizado).toFixed(2)].join(';'));
    linhas.push(['Venda de Imobilizado', fluxo.investimento.venda_imobilizado.toFixed(2)].join(';'));
    linhas.push(['Investimentos', (-fluxo.investimento.investimentos).toFixed(2)].join(';'));
    linhas.push(['Caixa Líquido Investimento', fluxo.investimento.caixa_liquido_investimento.toFixed(2)].join(';'));

    // Atividades de Financiamento
    linhas.push(['', ''].join(';'));
    linhas.push(['ATIVIDADES DE FINANCIAMENTO', ''].join(';'));
    linhas.push(['Empréstimos Recebidos', fluxo.financiamento.emprestimos_recebidos.toFixed(2)].join(';'));
    linhas.push(['Pagamento de Empréstimos', (-fluxo.financiamento.pagamento_emprestimos).toFixed(2)].join(';'));
    linhas.push(['Integralização de Capital', fluxo.financiamento.integralizacao_capital.toFixed(2)].join(';'));
    linhas.push(['Distribuição de Lucros', (-fluxo.financiamento.distribuicao_lucros).toFixed(2)].join(';'));
    linhas.push(['Caixa Líquido Financiamento', fluxo.financiamento.caixa_liquido_financiamento.toFixed(2)].join(';'));

    // Totais
    linhas.push(['', ''].join(';'));
    linhas.push(['VARIAÇÃO DE CAIXA', fluxo.variacao_caixa.toFixed(2)].join(';'));
    linhas.push(['Saldo Inicial', fluxo.saldo_inicial.toFixed(2)].join(';'));
    linhas.push(['Saldo Final', fluxo.saldo_final.toFixed(2)].join(';'));

    return linhas.join('\n');
  }

  /**
   * Exporta Projeção para CSV
   */
  exportarProjecaoCSV(projecao: Array<{
    data: string;
    entradas: number;
    saidas: number;
    saldo: number;
    saldo_acumulado: number;
  }>): string {
    const cabecalho = ['Data', 'Entradas', 'Saídas', 'Saldo Dia', 'Saldo Acumulado'];
    const linhas: string[] = [cabecalho.join(';')];

    for (const item of projecao) {
      linhas.push([
        item.data,
        item.entradas.toFixed(2),
        item.saidas.toFixed(2),
        item.saldo.toFixed(2),
        item.saldo_acumulado.toFixed(2),
      ].join(';'));
    }

    return linhas.join('\n');
  }

  /**
   * Baixa o arquivo no navegador
   */
  downloadArquivo(conteudo: string, nomeArquivo: string): void {
    const blob = new Blob([conteudo], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nomeArquivo}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Gera e baixa Fluxo de Caixa
   */
  gerarEDownloadFluxoCaixa(): void {
    const fluxo = this.calcularFluxoCaixa();
    const conteudo = this.exportarFluxoCaixaCSV(fluxo);
    this.downloadArquivo(conteudo, `fluxo_caixa_${this.dataInicio}_${this.dataFim}`);
  }

  /**
   * Gera e baixa Projeção de Fluxo de Caixa
   */
  gerarEDownloadProjecao(): void {
    const projecao = this.calcularProjecaoFluxoCaixa();
    const conteudo = this.exportarProjecaoCSV(projecao);
    this.downloadArquivo(conteudo, `projecao_fluxo_caixa_${this.diasProjecao}dias`);
  }
}

// ===== FUNÇÕES DE UTILIDADE =====

export function calcularFluxoCaixa(
  companyId: string,
  dataInicio: string,
  dataFim: string
): FluxoCaixa {
  const service = new FluxoCaixaService({
    companyId,
    dataInicio,
    dataFim,
  });
  return service.calcularFluxoCaixa();
}

export function calcularProjecaoFluxoCaixa(
  companyId: string,
  dias: number = 30
): Array<{
  data: string;
  entradas: number;
  saidas: number;
  saldo: number;
  saldo_acumulado: number;
}> {
  const hoje = new Date().toISOString().split('T')[0];
  const dataFim = new Date();
  dataFim.setDate(dataFim.getDate() + dias);

  const service = new FluxoCaixaService({
    companyId,
    dataInicio: hoje,
    dataFim: dataFim.toISOString().split('T')[0],
    incluirProjecao: true,
    diasProjecao: dias,
  });
  return service.calcularProjecaoFluxoCaixa();
}

export function gerarRelatorioFluxoCaixaDetalhado(
  companyId: string,
  dataInicio: string,
  dataFim: string,
  incluirProjecao: boolean = true,
  diasProjecao: number = 30
): {
  fluxo: FluxoCaixa;
  projecao?: Array<{
    data: string;
    entradas: number;
    saidas: number;
    saldo: number;
    saldo_acumulado: number;
  }>;
  resumo_mensal: Array<{
    mes: string;
    entradas: number;
    saidas: number;
    saldo: number;
  }>;
} {
  const service = new FluxoCaixaService({
    companyId,
    dataInicio,
    dataFim,
    incluirProjecao,
    diasProjecao,
  });
  return service.gerarRelatorioDetalhado();
}

export function downloadFluxoCaixa(
  companyId: string,
  dataInicio: string,
  dataFim: string
): void {
  const service = new FluxoCaixaService({
    companyId,
    dataInicio,
    dataFim,
  });
  service.gerarEDownloadFluxoCaixa();
}

export function downloadProjecaoFluxoCaixa(
  companyId: string,
  dias: number = 30
): void {
  const hoje = new Date().toISOString().split('T')[0];
  const dataFim = new Date();
  dataFim.setDate(dataFim.getDate() + dias);

  const service = new FluxoCaixaService({
    companyId,
    dataInicio: hoje,
    dataFim: dataFim.toISOString().split('T')[0],
    incluirProjecao: true,
    diasProjecao: dias,
  });
  service.gerarEDownloadProjecao();
}