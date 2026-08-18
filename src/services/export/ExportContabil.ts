// src/services/export/ExportContabil.ts

import { store } from '../store';
import { FinancialDocument, Installment, Settlement, BankAccount } from '../../types';
import { DRE, BalancoPatrimonial, FluxoCaixa, ApuracaoImpostosDetalhada } from '../../types/contabil';
import { calcularDRE } from '../contabil/DRE';
import { calcularBalancoPatrimonial } from '../contabil/BalancoPatrimonial';
import { calcularFluxoCaixa } from '../contabil/FluxoCaixa';
import { apurarImpostos } from '../contabil/ApuracaoImpostos';

export interface ExportacaoContabil {
  formato: 'csv' | 'xlsx' | 'txt' | 'json';
  tipo: 'lancamentos' | 'saldos' | 'dre' | 'balanco' | 'fluxo' | 'impostos' | 'completo';
  dados: any[];
  cabecalho: string[];
  separador: string;
  nomeArquivo: string;
}

export interface OpcoesExportacao {
  companyId: string;
  dataInicio: string;
  dataFim: string;
  formato?: 'csv' | 'xlsx' | 'txt' | 'json';
  separador?: string;
}

export class ExportadorContabil {
  private companyId: string;
  private dataInicio: string;
  private dataFim: string;
  private formato: 'csv' | 'xlsx' | 'txt' | 'json';
  private separador: string;

  constructor(opcoes: OpcoesExportacao) {
    this.companyId = opcoes.companyId;
    this.dataInicio = opcoes.dataInicio;
    this.dataFim = opcoes.dataFim;
    this.formato = opcoes.formato || 'csv';
    this.separador = opcoes.separador || ';';
  }

  // ===== MÉTODOS DE EXPORTAÇÃO =====

  /**
   * Exporta lançamentos contábeis do período
   */
  exportarLancamentos(): ExportacaoContabil {
    const docs = store.financialDocuments.filter(d =>
      d.company_id === this.companyId &&
      d.issue_date >= this.dataInicio &&
      d.issue_date <= this.dataFim
    );

    const pessoas = store.people.filter(p => p.company_id === this.companyId);
    const installments = store.installments || [];
    const settlements = store.settlements || [];

    const dados = docs.map(doc => {
      const person = pessoas.find(p => p.id === doc.person_id);
      const insts = installments.filter(i => i.financial_document_id === doc.id);
      const totalPago = insts
        .filter(i => i.status === 'paid')
        .reduce((acc, i) => acc + i.original_amount, 0);
      const totalPendente = insts
        .filter(i => i.status === 'pending' || i.status === 'overdue')
        .reduce((acc, i) => acc + i.current_amount, 0);

      return {
        data: doc.issue_date,
        documento: doc.document_number || '',
        descricao: doc.description || '',
        tipo: doc.direction === 'receivable' ? 'ENTRADA' : 'SAÍDA',
        pessoa: person?.legal_name || person?.trade_name || 'NÃO IDENTIFICADO',
        cnpj_cpf: person?.tax_id || '',
        valor_total: doc.total_amount,
        total_pago: totalPago,
        total_pendente: totalPendente,
        quantidade_parcelas: insts.length,
        categoria: doc.category_id || '',
        status: insts.every(i => i.status === 'paid') ? 'QUITADO' :
                insts.some(i => i.status === 'overdue') ? 'VENCIDO' : 'PENDENTE',
      };
    });

    const cabecalho = [
      'Data',
      'Documento',
      'Descrição',
      'Tipo',
      'Pessoa',
      'CNPJ/CPF',
      'Valor Total',
      'Total Pago',
      'Total Pendente',
      'Qtd Parcelas',
      'Categoria',
      'Status'
    ];

    return {
      formato: this.formato,
      tipo: 'lancamentos',
      dados: dados,
      cabecalho: cabecalho,
      separador: this.separador,
      nomeArquivo: `lancamentos_${this.dataInicio}_${this.dataFim}`,
    };
  }

  /**
   * Exporta saldos contábeis
   */
  exportarSaldos(dataReferencia?: string): ExportacaoContabil {
    const data = dataReferencia || this.dataFim;

    const accounts = store.financialAccounts.filter(a => a.company_id === this.companyId);
    const docs = store.financialDocuments.filter(d =>
      d.company_id === this.companyId &&
      d.issue_date <= data
    );

    const dados = accounts.map(conta => {
      const totalDebito = docs
        .filter(d => d.financial_account_id === conta.id && d.direction === 'payable')
        .reduce((acc, d) => acc + d.total_amount, 0);

      const totalCredito = docs
        .filter(d => d.financial_account_id === conta.id && d.direction === 'receivable')
        .reduce((acc, d) => acc + d.total_amount, 0);

      const saldo = totalCredito - totalDebito;

      return {
        codigo: conta.code,
        nome: conta.name,
        tipo: conta.account_type,
        total_debito: totalDebito,
        total_credito: totalCredito,
        saldo: saldo,
        natureza: saldo >= 0 ? 'DEVEDORA' : 'CREDORA',
      };
    });

    const cabecalho = [
      'Código',
      'Nome',
      'Tipo',
      'Total Débito',
      'Total Crédito',
      'Saldo',
      'Natureza'
    ];

    return {
      formato: this.formato,
      tipo: 'saldos',
      dados: dados,
      cabecalho: cabecalho,
      separador: this.separador,
      nomeArquivo: `saldos_${data}`,
    };
  }

  /**
   * Exporta DRE
   */
  exportarDRE(): ExportacaoContabil {
    const dre = calcularDRE(this.companyId, this.dataInicio, this.dataFim);

    const dados = [
      { conta: 'RECEITA BRUTA', valor: dre.receita_bruta.total, tipo: 'Receita' },
      { conta: '  (-) Vendas de Mercadorias', valor: dre.receita_bruta.vendas_mercadorias, tipo: 'Receita' },
      { conta: '  (-) Vendas de Serviços', valor: dre.receita_bruta.vendas_servicos, tipo: 'Receita' },
      { conta: '  (-) Outras Receitas', valor: dre.receita_bruta.outras_receitas, tipo: 'Receita' },
      { conta: 'DEDUÇÕES DA RECEITA', valor: -dre.deducoes.total, tipo: 'Dedução' },
      { conta: '  (-) ICMS', valor: -dre.deducoes.icms, tipo: 'Dedução' },
      { conta: '  (-) PIS', valor: -dre.deducoes.pis, tipo: 'Dedução' },
      { conta: '  (-) COFINS', valor: -dre.deducoes.cofins, tipo: 'Dedução' },
      { conta: '  (-) CBS', valor: -dre.deducoes.cbs, tipo: 'Dedução' },
      { conta: '  (-) IBS', valor: -dre.deducoes.ibs, tipo: 'Dedução' },
      { conta: 'RECEITA LÍQUIDA', valor: dre.receita_liquida, tipo: 'Receita' },
      { conta: '(-) CMV', valor: -dre.cmv.total, tipo: 'Custo' },
      { conta: 'LUCRO BRUTO', valor: dre.lucro_bruto, tipo: 'Resultado' },
      { conta: '(-) DESPESAS OPERACIONAIS', valor: -dre.despesas_operacionais.total, tipo: 'Despesa' },
      { conta: '  (-) Administrativas', valor: -dre.despesas_operacionais.administrativas, tipo: 'Despesa' },
      { conta: '  (-) Comerciais', valor: -dre.despesas_operacionais.comerciais, tipo: 'Despesa' },
      { conta: '  (-) Financeiras', valor: -dre.despesas_operacionais.financeiras, tipo: 'Despesa' },
      { conta: '  (-) Tributárias', valor: -dre.despesas_operacionais.tributarias, tipo: 'Despesa' },
      { conta: 'LUCRO OPERACIONAL', valor: dre.lucro_operacional, tipo: 'Resultado' },
      { conta: 'RESULTADO FINANCEIRO', valor: dre.resultado_financeiro.total, tipo: 'Resultado' },
      { conta: '  (+) Receitas Financeiras', valor: dre.resultado_financeiro.receitas, tipo: 'Receita' },
      { conta: '  (-) Despesas Financeiras', valor: -dre.resultado_financeiro.despesas, tipo: 'Despesa' },
      { conta: 'LUCRO ANTES DO IR/CSLL', valor: dre.lucro_antes_ir, tipo: 'Resultado' },
      { conta: '(-) IRPJ', valor: -dre.impostos.irpj, tipo: 'Imposto' },
      { conta: '(-) CSLL', valor: -dre.impostos.csll, tipo: 'Imposto' },
      { conta: 'LUCRO LÍQUIDO', valor: dre.lucro_liquido, tipo: 'Resultado' },
    ];

    const cabecalho = ['Conta', 'Valor', 'Tipo'];

    // Adicionar indicadores no final
    dados.push(
      { conta: '--- INDICADORES ---', valor: 0, tipo: '' },
      { conta: 'Margem Bruta', valor: dre.indicadores.margem_bruta, tipo: 'Indicador' },
      { conta: 'Margem Operacional', valor: dre.indicadores.margem_operacional, tipo: 'Indicador' },
      { conta: 'Margem Líquida', valor: dre.indicadores.margem_liquida, tipo: 'Indicador' },
      { conta: 'EBITDA', valor: dre.indicadores.ebitda, tipo: 'Indicador' },
    );

    return {
      formato: this.formato,
      tipo: 'dre',
      dados: dados,
      cabecalho: cabecalho,
      separador: this.separador,
      nomeArquivo: `dre_${this.dataInicio}_${this.dataFim}`,
    };
  }

  /**
   * Exporta Balanço Patrimonial
   */
  exportarBalanco(): ExportacaoContabil {
    const balanco = calcularBalancoPatrimonial(this.companyId, this.dataFim);

    const dados = [
      // ATIVO
      { conta: 'ATIVO', valor: 0, grupo: 'Ativo', nivel: 1 },
      { conta: '  CIRCULANTE', valor: balanco.ativo.circulante.total, grupo: 'Ativo', nivel: 2 },
      { conta: '    Disponível', valor: balanco.ativo.circulante.disponivel, grupo: 'Ativo', nivel: 3 },
      { conta: '    Clientes', valor: balanco.ativo.circulante.clientes, grupo: 'Ativo', nivel: 3 },
      { conta: '    Estoques', valor: balanco.ativo.circulante.estoques, grupo: 'Ativo', nivel: 3 },
      { conta: '    Despesas Antecipadas', valor: balanco.ativo.circulante.despesas_antecipadas, grupo: 'Ativo', nivel: 3 },
      { conta: '  NÃO CIRCULANTE', valor: balanco.ativo.nao_circulante.total, grupo: 'Ativo', nivel: 2 },
      { conta: '    Imobilizado', valor: balanco.ativo.nao_circulante.imobilizado, grupo: 'Ativo', nivel: 3 },
      { conta: '  TOTAL DO ATIVO', valor: balanco.ativo.total, grupo: 'Ativo', nivel: 1 },

      // PASSIVO
      { conta: 'PASSIVO', valor: 0, grupo: 'Passivo', nivel: 1 },
      { conta: '  CIRCULANTE', valor: balanco.passivo.circulante.total, grupo: 'Passivo', nivel: 2 },
      { conta: '    Fornecedores', valor: balanco.passivo.circulante.fornecedores, grupo: 'Passivo', nivel: 3 },
      { conta: '    Obrigações Fiscais', valor: balanco.passivo.circulante.obrigacoes_fiscais, grupo: 'Passivo', nivel: 3 },
      { conta: '  PATRIMÔNIO LÍQUIDO', valor: balanco.passivo.patrimonio_liquido.total, grupo: 'Passivo', nivel: 2 },
      { conta: '    Capital Social', valor: balanco.passivo.patrimonio_liquido.capital_social, grupo: 'Passivo', nivel: 3 },
      { conta: '    Lucros Acumulados', valor: balanco.passivo.patrimonio_liquido.lucros_acumulados, grupo: 'Passivo', nivel: 3 },
      { conta: '  TOTAL DO PASSIVO', valor: balanco.passivo.total, grupo: 'Passivo', nivel: 1 },
    ];

    const cabecalho = ['Conta', 'Valor', 'Grupo', 'Nível'];

    // Adicionar indicadores
    dados.push(
      { conta: '--- INDICADORES ---', valor: 0, grupo: '', nivel: 0 },
      { conta: 'Liquidez Corrente', valor: balanco.indicadores.liquidez_corrente, grupo: 'Indicador', nivel: 0 },
      { conta: 'Liquidez Seca', valor: balanco.indicadores.liquidez_seca, grupo: 'Indicador', nivel: 0 },
      { conta: 'Liquidez Imediata', valor: balanco.indicadores.liquidez_imediata, grupo: 'Indicador', nivel: 0 },
      { conta: 'Endividamento', valor: balanco.indicadores.endividamento, grupo: 'Indicador', nivel: 0 },
    );

    return {
      formato: this.formato,
      tipo: 'balanco',
      dados: dados,
      cabecalho: cabecalho,
      separador: this.separador,
      nomeArquivo: `balanco_${this.dataFim}`,
    };
  }

  /**
   * Exporta Fluxo de Caixa
   */
  exportarFluxoCaixa(): ExportacaoContabil {
    const fluxo = calcularFluxoCaixa(this.companyId, this.dataInicio, this.dataFim);

    const dados = [
      { conta: 'ATIVIDADES OPERACIONAIS', valor: 0, tipo: 'Operacional' },
      { conta: '  (+) Recebimentos de Clientes', valor: fluxo.operacionais.recebimentos_clientes, tipo: 'Operacional' },
      { conta: '  (-) Pagamentos a Fornecedores', valor: -fluxo.operacionais.pagamentos_fornecedores, tipo: 'Operacional' },
      { conta: '  (-) Pagamentos de Funcionários', valor: -fluxo.operacionais.pagamentos_funcionarios, tipo: 'Operacional' },
      { conta: '  (-) Pagamentos de Impostos', valor: -fluxo.operacionais.pagamentos_impostos, tipo: 'Operacional' },
      { conta: '  (+) Outros Recebimentos', valor: fluxo.operacionais.outros_recebimentos, tipo: 'Operacional' },
      { conta: '  (-) Outros Pagamentos', valor: -fluxo.operacionais.outros_pagamentos, tipo: 'Operacional' },
      { conta: '  = CAIXA LÍQUIDO OPERACIONAL', valor: fluxo.operacionais.caixa_liquido_operacional, tipo: 'Operacional' },
      { conta: '', valor: 0, tipo: '' },
      { conta: 'ATIVIDADES DE INVESTIMENTO', valor: 0, tipo: 'Investimento' },
      { conta: '  (-) Compra de Imobilizado', valor: -fluxo.investimento.compra_imobilizado, tipo: 'Investimento' },
      { conta: '  (+) Venda de Imobilizado', valor: fluxo.investimento.venda_imobilizado, tipo: 'Investimento' },
      { conta: '  = CAIXA LÍQUIDO INVESTIMENTO', valor: fluxo.investimento.caixa_liquido_investimento, tipo: 'Investimento' },
      { conta: '', valor: 0, tipo: '' },
      { conta: 'ATIVIDADES DE FINANCIAMENTO', valor: 0, tipo: 'Financiamento' },
      { conta: '  (+) Empréstimos Recebidos', valor: fluxo.financiamento.emprestimos_recebidos, tipo: 'Financiamento' },
      { conta: '  (-) Pagamento de Empréstimos', valor: -fluxo.financiamento.pagamento_emprestimos, tipo: 'Financiamento' },
      { conta: '  (-) Distribuição de Lucros', valor: -fluxo.financiamento.distribuicao_lucros, tipo: 'Financiamento' },
      { conta: '  = CAIXA LÍQUIDO FINANCIAMENTO', valor: fluxo.financiamento.caixa_liquido_financiamento, tipo: 'Financiamento' },
      { conta: '', valor: 0, tipo: '' },
      { conta: 'VARIAÇÃO DE CAIXA', valor: fluxo.variacao_caixa, tipo: 'Total' },
      { conta: 'Saldo Inicial', valor: fluxo.saldo_inicial, tipo: 'Total' },
      { conta: 'Saldo Final', valor: fluxo.saldo_final, tipo: 'Total' },
    ];

    const cabecalho = ['Conta', 'Valor', 'Tipo'];

    return {
      formato: this.formato,
      tipo: 'fluxo',
      dados: dados,
      cabecalho: cabecalho,
      separador: this.separador,
      nomeArquivo: `fluxo_caixa_${this.dataInicio}_${this.dataFim}`,
    };
  }

  /**
   * Exporta Apuração de Impostos
   */
  exportarImpostos(): ExportacaoContabil {
    const apuracao = apurarImpostos(this.companyId, this.dataInicio, this.dataFim);

    const dados = [
      // ICMS
      { imposto: 'ICMS', descricao: 'Base de Cálculo', valor: apuracao.icms.base_calculo },
      { imposto: 'ICMS', descricao: 'Alíquota', valor: apuracao.icms.aliquota },
      { imposto: 'ICMS', descricao: 'Débito', valor: apuracao.icms.debito },
      { imposto: 'ICMS', descricao: 'Crédito', valor: apuracao.icms.credito },
      { imposto: 'ICMS', descricao: 'Saldo Anterior', valor: apuracao.icms.saldo_anterior },
      { imposto: 'ICMS', descricao: 'A Recolher', valor: apuracao.icms.a_recolher },

      // PIS
      { imposto: 'PIS', descricao: 'Base de Cálculo', valor: apuracao.pis.base_calculo },
      { imposto: 'PIS', descricao: 'Alíquota', valor: apuracao.pis.aliquota },
      { imposto: 'PIS', descricao: 'Débito', valor: apuracao.pis.debito },
      { imposto: 'PIS', descricao: 'Crédito', valor: apuracao.pis.credito },
      { imposto: 'PIS', descricao: 'A Recolher', valor: apuracao.pis.a_recolher },

      // COFINS
      { imposto: 'COFINS', descricao: 'Base de Cálculo', valor: apuracao.cofins.base_calculo },
      { imposto: 'COFINS', descricao: 'Alíquota', valor: apuracao.cofins.aliquota },
      { imposto: 'COFINS', descricao: 'Débito', valor: apuracao.cofins.debito },
      { imposto: 'COFINS', descricao: 'Crédito', valor: apuracao.cofins.credito },
      { imposto: 'COFINS', descricao: 'A Recolher', valor: apuracao.cofins.a_recolher },

      // CBS
      { imposto: 'CBS', descricao: 'Base de Cálculo', valor: apuracao.cbs.base_calculo },
      { imposto: 'CBS', descricao: 'Alíquota', valor: apuracao.cbs.aliquota },
      { imposto: 'CBS', descricao: 'Débito', valor: apuracao.cbs.debito },
      { imposto: 'CBS', descricao: 'Crédito', valor: apuracao.cbs.credito },
      { imposto: 'CBS', descricao: 'A Recolher', valor: apuracao.cbs.a_recolher },

      // IBS
      { imposto: 'IBS', descricao: 'Base de Cálculo', valor: apuracao.ibs.base_calculo },
      { imposto: 'IBS', descricao: 'Alíquota', valor: apuracao.ibs.aliquota },
      { imposto: 'IBS', descricao: 'Débito', valor: apuracao.ibs.debito },
      { imposto: 'IBS', descricao: 'Crédito', valor: apuracao.ibs.credito },
      { imposto: 'IBS', descricao: 'A Recolher', valor: apuracao.ibs.a_recolher },

      // RESUMO
      { imposto: 'RESUMO', descricao: 'Total Débitos', valor: apuracao.resumo.total_impostos_debitos },
      { imposto: 'RESUMO', descricao: 'Total Créditos', valor: apuracao.resumo.total_impostos_creditos },
      { imposto: 'RESUMO', descricao: 'Total a Recolher', valor: apuracao.resumo.total_a_recolher },
      { imposto: 'RESUMO', descricao: 'Carga Tributária (%)', valor: apuracao.resumo.carga_tributaria },
    ];

    const cabecalho = ['Imposto', 'Descrição', 'Valor'];

    return {
      formato: this.formato,
      tipo: 'impostos',
      dados: dados,
      cabecalho: cabecalho,
      separador: this.separador,
      nomeArquivo: `apuracao_impostos_${this.dataInicio}_${this.dataFim}`,
    };
  }

  /**
   * Exporta todos os relatórios em um único arquivo
   */
  exportarCompleto(): ExportacaoContabil {
    const lancamentos = this.exportarLancamentos();
    const saldos = this.exportarSaldos();
    const dre = this.exportarDRE();
    const balanco = this.exportarBalanco();
    const fluxo = this.exportarFluxoCaixa();
    const impostos = this.exportarImpostos();

    const dados = [
      { secao: '=== LANÇAMENTOS ===', ...lancamentos.dados[0] },
      ...lancamentos.dados.map(d => ({ secao: 'LANÇAMENTOS', ...d })),
      { secao: '', ...{} },
      { secao: '=== SALDOS ===', ...saldos.dados[0] },
      ...saldos.dados.map(d => ({ secao: 'SALDOS', ...d })),
      { secao: '', ...{} },
      { secao: '=== DRE ===', ...dre.dados[0] },
      ...dre.dados.map(d => ({ secao: 'DRE', ...d })),
      { secao: '', ...{} },
      { secao: '=== BALANÇO ===', ...balanco.dados[0] },
      ...balanco.dados.map(d => ({ secao: 'BALANÇO', ...d })),
      { secao: '', ...{} },
      { secao: '=== FLUXO DE CAIXA ===', ...fluxo.dados[0] },
      ...fluxo.dados.map(d => ({ secao: 'FLUXO', ...d })),
      { secao: '', ...{} },
      { secao: '=== APURAÇÃO DE IMPOSTOS ===', ...impostos.dados[0] },
      ...impostos.dados.map(d => ({ secao: 'IMPOSTOS', ...d })),
    ];

    const cabecalho = ['Seção', ...Object.keys(dados[0] || {})].filter(k => k !== 'secao');

    return {
      formato: this.formato,
      tipo: 'completo',
      dados: dados,
      cabecalho: cabecalho,
      separador: this.separador,
      nomeArquivo: `relatorio_completo_${this.dataInicio}_${this.dataFim}`,
    };
  }

  // ===== MÉTODOS DE FORMATAÇÃO =====

  /**
   * Gera o conteúdo no formato solicitado
   */
  gerarConteudo(exportacao: ExportacaoContabil): string {
    switch (this.formato) {
      case 'csv':
        return this.gerarCSV(exportacao);
      case 'txt':
        return this.gerarTXT(exportacao);
      case 'json':
        return this.gerarJSON(exportacao);
      case 'xlsx':
        return this.gerarCSV(exportacao); // Fallback para CSV
      default:
        return this.gerarCSV(exportacao);
    }
  }

  private gerarCSV(exportacao: ExportacaoContabil): string {
    const linhas: string[] = [];

    // Cabeçalho
    const cabecalho = exportacao.cabecalho.join(this.separador);
    linhas.push(cabecalho);

    // Dados
    for (const item of exportacao.dados) {
      const linha = exportacao.cabecalho
        .map(campo => {
          const valor = item[campo];
          if (valor === undefined || valor === null) return '';
          if (typeof valor === 'string' && valor.includes(this.separador)) {
            return `"${valor}"`;
          }
          return String(valor);
        })
        .join(this.separador);
      linhas.push(linha);
    }

    return linhas.join('\n');
  }

  private gerarTXT(exportacao: ExportacaoContabil): string {
    const linhas: string[] = [];

    const separador = ' | ';
    const titulo = `RELATÓRIO ${exportacao.tipo.toUpperCase()}`;
    const data = new Date().toLocaleString('pt-BR');

    linhas.push('='.repeat(80));
    linhas.push(titulo);
    linhas.push(`Gerado em: ${data}`);
    linhas.push('='.repeat(80));
    linhas.push('');

    // Cabeçalho
    const cabecalho = exportacao.cabecalho.join(separador);
    linhas.push(cabecalho);
    linhas.push('-'.repeat(80));

    // Dados
    for (const item of exportacao.dados) {
      const linha = exportacao.cabecalho
        .map(campo => {
          const valor = item[campo];
          if (valor === undefined || valor === null) return '';
          if (typeof valor === 'number') {
            return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
          }
          return String(valor);
        })
        .join(separador);
      linhas.push(linha);
    }

    linhas.push('');
    linhas.push('='.repeat(80));
    linhas.push(`Total de registros: ${exportacao.dados.length}`);
    linhas.push('='.repeat(80));

    return linhas.join('\n');
  }

  private gerarJSON(exportacao: ExportacaoContabil): string {
    return JSON.stringify({
      metadata: {
        tipo: exportacao.tipo,
        formato: exportacao.formato,
        data_geracao: new Date().toISOString(),
        total_registros: exportacao.dados.length,
        cabecalho: exportacao.cabecalho,
      },
      dados: exportacao.dados,
    }, null, 2);
  }

  /**
   * Baixa o arquivo no navegador
   */
  download(exportacao: ExportacaoContabil): void {
    const conteudo = this.gerarConteudo(exportacao);
    const extensoes: Record<string, string> = {
      csv: 'csv',
      txt: 'txt',
      json: 'json',
      xlsx: 'xlsx',
    };

    const extensao = extensoes[this.formato] || 'csv';
    const blob = new Blob([conteudo], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exportacao.nomeArquivo}.${extensao}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// ===== FUNÇÃO DE UTILIDADE =====

export function exportarDadosContabeis(
  companyId: string,
  dataInicio: string,
  dataFim: string,
  tipo: 'lancamentos' | 'saldos' | 'dre' | 'balanco' | 'fluxo' | 'impostos' | 'completo',
  formato: 'csv' | 'xlsx' | 'txt' | 'json' = 'csv'
): void {
  const exportador = new ExportadorContabil({
    companyId,
    dataInicio,
    dataFim,
    formato,
  });

  let exportacao: ExportacaoContabil;

  switch (tipo) {
    case 'lancamentos':
      exportacao = exportador.exportarLancamentos();
      break;
    case 'saldos':
      exportacao = exportador.exportarSaldos();
      break;
    case 'dre':
      exportacao = exportador.exportarDRE();
      break;
    case 'balanco':
      exportacao = exportador.exportarBalanco();
      break;
    case 'fluxo':
      exportacao = exportador.exportarFluxoCaixa();
      break;
    case 'impostos':
      exportacao = exportador.exportarImpostos();
      break;
    case 'completo':
      exportacao = exportador.exportarCompleto();
      break;
    default:
      throw new Error(`Tipo de exportação inválido: ${tipo}`);
  }

  exportador.download(exportacao);
}