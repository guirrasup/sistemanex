// src/services/contabil/LivrosContabeis.ts

import { store } from '../store';
import { LivroDiario, LivroRazao } from '../../types/contabil';
import { FinancialDocument, Installment, Settlement } from '../../types';

export interface OpcoesLivro {
  companyId: string;
  dataInicio: string;
  dataFim: string;
  contaEspecifica?: string;
  incluirHistoricoCompleto?: boolean;
}

export class LivrosContabeis {
  private companyId: string;
  private dataInicio: string;
  private dataFim: string;
  private contaEspecifica?: string;
  private incluirHistoricoCompleto: boolean;

  constructor(opcoes: OpcoesLivro) {
    this.companyId = opcoes.companyId;
    this.dataInicio = opcoes.dataInicio;
    this.dataFim = opcoes.dataFim;
    this.contaEspecifica = opcoes.contaEspecifica;
    this.incluirHistoricoCompleto = opcoes.incluirHistoricoCompleto || false;
  }

  /**
   * Gera o Livro Diário - Registro cronológico de todas as movimentações
   */
  gerarLivroDiario(): LivroDiario {
    const docs = store.financialDocuments.filter(d =>
      d.company_id === this.companyId &&
      d.issue_date >= this.dataInicio &&
      d.issue_date <= this.dataFim
    );

    const accounts = store.financialAccounts.filter(a => a.company_id === this.companyId);
    const installments = store.installments || [];
    const settlements = store.settlements || [];

    const lancamentos: LivroDiario['lancamentos'] = [];
    let totalDebito = 0;
    let totalCredito = 0;

    for (const doc of docs) {
      const insts = installments.filter(i => i.financial_document_id === doc.id);
      const settleInsts = settlements.filter(s => 
        insts.some(i => i.id === s.installment_id)
      );

      // Cada documento gera um lançamento
      const isReceivable = doc.direction === 'receivable';
      const contaDebito = isReceivable ? '1.1.04' : '4.5.01'; // Clientes ou Despesas
      const contaCredito = isReceivable ? '3.1.01' : '2.1.01'; // Receita ou Fornecedores
      const valor = doc.total_amount;

      // Lançamento principal
      lancamentos.push({
        data: doc.issue_date,
        historico: doc.description || 'LANÇAMENTO CONTÁBIL',
        conta_debito: contaDebito,
        conta_credito: contaCredito,
        valor: valor,
        documento: doc.document_number,
        complemento: `Documento: ${doc.document_type} - ${doc.id}`,
      });

      totalDebito += valor;
      totalCredito += valor;

      // Se houver parcelas, registrar cada parcela como lançamento adicional
      for (const inst of insts) {
        if (inst.status === 'paid' || inst.status === 'partially_paid') {
          const settle = settlements.find(s => s.installment_id === inst.id);
          if (settle) {
            // Baixa da parcela
            lancamentos.push({
              data: settle.paid_date || inst.due_date,
              historico: `BAIXA DE PARCELA ${inst.installment_number}/${insts.length}`,
              conta_debito: isReceivable ? '1.1.01' : '2.1.01', // Caixa ou Fornecedores
              conta_credito: isReceivable ? '1.1.04' : '4.5.01', // Clientes ou Despesas
              valor: settle.paid_amount,
              documento: doc.document_number,
              complemento: `Parcela ${inst.installment_number} - ${settle.payment_method}`,
            });

            totalDebito += settle.paid_amount;
            totalCredito += settle.paid_amount;
          }
        }
      }
    }

    // Ordenar por data
    lancamentos.sort((a, b) => a.data.localeCompare(b.data));

    return {
      periodo: {
        data_inicio: this.dataInicio,
        data_fim: this.dataFim,
      },
      lancamentos: lancamentos,
      total_debito: totalDebito,
      total_credito: totalCredito,
    };
  }

  /**
   * Gera o Livro Razão - Movimentação detalhada de uma conta específica
   */
  gerarLivroRazao(contaCodigo: string): LivroRazao {
    const accounts = store.financialAccounts.filter(a => a.company_id === this.companyId);
    const conta = accounts.find(a => a.code === contaCodigo);

    if (!conta) {
      throw new Error(`Conta ${contaCodigo} não encontrada`);
    }

    const docs = store.financialDocuments.filter(d =>
      d.company_id === this.companyId &&
      d.issue_date >= this.dataInicio &&
      d.issue_date <= this.dataFim &&
      d.financial_account_id === conta.id
    );

    const installments = store.installments || [];
    const settlements = store.settlements || [];

    const lancamentos: LivroRazao['lancamentos'] = [];
    let saldoAcumulado = 0;

    // Calcular saldo inicial
    const docsAnteriores = store.financialDocuments.filter(d =>
      d.company_id === this.companyId &&
      d.issue_date < this.dataInicio &&
      d.financial_account_id === conta.id
    );

    const saldoInicial = docsAnteriores.reduce((acc, d) => {
      if (d.direction === 'receivable') {
        return acc + d.total_amount;
      } else {
        return acc - d.total_amount;
      }
    }, 0);

    saldoAcumulado = saldoInicial;

    // Processar documentos do período
    for (const doc of docs) {
      const isDebito = doc.direction === 'payable';
      const isCredito = doc.direction === 'receivable';
      const valor = doc.total_amount;

      const debito = isDebito ? valor : 0;
      const credito = isCredito ? valor : 0;

      saldoAcumulado = saldoAcumulado + credito - debito;

      lancamentos.push({
        data: doc.issue_date,
        historico: doc.description || 'LANÇAMENTO CONTÁBIL',
        debito: debito,
        credito: credito,
        saldo: saldoAcumulado,
      });
    }

    // Incluir settlements se solicitado
    if (this.incluirHistoricoCompleto) {
      const settleDocs = settlements.filter(s => {
        const inst = installments.find(i => i.id === s.installment_id);
        if (!inst) return false;
        const doc = docs.find(d => d.id === inst.financial_document_id);
        return doc && doc.financial_account_id === conta.id;
      });

      for (const settle of settleDocs) {
        const isDebito = settle.payment_method === 'pix' || settle.payment_method === 'boleto';
        const isCredito = settle.payment_method === 'credit_card' || settle.payment_method === 'transfer';
        const valor = settle.paid_amount;

        const debito = isDebito ? valor : 0;
        const credito = isCredito ? valor : 0;

        saldoAcumulado = saldoAcumulado + credito - debito;

        lancamentos.push({
          data: settle.paid_date,
          historico: `LIQUIDAÇÃO - ${settle.payment_method.toUpperCase()}`,
          debito: debito,
          credito: credito,
          saldo: saldoAcumulado,
        });
      }
    }

    // Ordenar por data
    lancamentos.sort((a, b) => a.data.localeCompare(b.data));

    const totalDebitos = lancamentos.reduce((acc, l) => acc + l.debito, 0);
    const totalCreditos = lancamentos.reduce((acc, l) => acc + l.credito, 0);

    return {
      conta: conta.code,
      descricao: conta.name,
      periodo: {
        data_inicio: this.dataInicio,
        data_fim: this.dataFim,
      },
      lancamentos: lancamentos,
      saldo_inicial: saldoInicial,
      saldo_final: saldoAcumulado,
      total_debitos: totalDebitos,
      total_creditos: totalCreditos,
    };
  }

  /**
   * Gera Livro Razão para todas as contas com movimento no período
   */
  gerarLivroRazaoCompleto(): LivroRazao[] {
    const accounts = store.financialAccounts.filter(a => a.company_id === this.companyId);
    const resultados: LivroRazao[] = [];

    for (const conta of accounts) {
      const docs = store.financialDocuments.filter(d =>
        d.company_id === this.companyId &&
        d.issue_date >= this.dataInicio &&
        d.issue_date <= this.dataFim &&
        d.financial_account_id === conta.id
      );

      if (docs.length > 0 || this.incluirHistoricoCompleto) {
        try {
          const razao = this.gerarLivroRazao(conta.code);
          resultados.push(razao);
        } catch (err) {
          // Conta sem movimento, ignorar
        }
      }
    }

    return resultados;
  }

  /**
   * Exporta Livro Diário para CSV
   */
  exportarLivroDiarioCSV(livro: LivroDiario): string {
    const cabecalho = ['Data', 'Histórico', 'Conta Débito', 'Conta Crédito', 'Valor', 'Documento', 'Complemento'];
    const linhas: string[] = [cabecalho.join(';')];

    for (const l of livro.lancamentos) {
      linhas.push([
        l.data,
        l.historico,
        l.conta_debito,
        l.conta_credito,
        l.valor.toFixed(2),
        l.documento || '',
        l.complemento || '',
      ].join(';'));
    }

    // Totais
    linhas.push('');
    linhas.push(['TOTAL DÉBITO', '', '', '', livro.total_debito.toFixed(2), '', ''].join(';'));
    linhas.push(['TOTAL CRÉDITO', '', '', '', livro.total_credito.toFixed(2), '', ''].join(';'));
    linhas.push(['SALDO', '', '', '', (livro.total_debito - livro.total_credito).toFixed(2), '', ''].join(';'));

    return linhas.join('\n');
  }

  /**
   * Exporta Livro Razão para CSV
   */
  exportarLivroRazaoCSV(razao: LivroRazao): string {
    const cabecalho = ['Data', 'Histórico', 'Débito', 'Crédito', 'Saldo'];
    const linhas: string[] = [cabecalho.join(';')];

    // Saldo inicial
    linhas.push([
      this.dataInicio,
      'SALDO INICIAL',
      '0.00',
      '0.00',
      razao.saldo_inicial.toFixed(2),
    ].join(';'));

    for (const l of razao.lancamentos) {
      linhas.push([
        l.data,
        l.historico,
        l.debito.toFixed(2),
        l.credito.toFixed(2),
        l.saldo.toFixed(2),
      ].join(';'));
    }

    // Totais
    linhas.push('');
    linhas.push(['TOTAL DÉBITOS', '', razao.total_debitos.toFixed(2), '', ''].join(';'));
    linhas.push(['TOTAL CRÉDITOS', '', '', razao.total_creditos.toFixed(2), ''].join(';'));
    linhas.push(['SALDO FINAL', '', '', '', razao.saldo_final.toFixed(2)].join(';'));

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
   * Gera e baixa Livro Diário
   */
  gerarEDownloadLivroDiario(): void {
    const livro = this.gerarLivroDiario();
    const conteudo = this.exportarLivroDiarioCSV(livro);
    this.downloadArquivo(conteudo, `livro_diario_${this.dataInicio}_${this.dataFim}`);
  }

  /**
   * Gera e baixa Livro Razão para uma conta específica
   */
  gerarEDownloadLivroRazao(contaCodigo: string): void {
    const razao = this.gerarLivroRazao(contaCodigo);
    const conteudo = this.exportarLivroRazaoCSV(razao);
    this.downloadArquivo(conteudo, `livro_razao_${contaCodigo}_${this.dataInicio}_${this.dataFim}`);
  }
}

// ===== FUNÇÕES DE UTILIDADE =====

export function gerarLivroDiario(
  companyId: string,
  dataInicio: string,
  dataFim: string
): LivroDiario {
  const service = new LivrosContabeis({
    companyId,
    dataInicio,
    dataFim,
  });
  return service.gerarLivroDiario();
}

export function gerarLivroRazao(
  companyId: string,
  dataInicio: string,
  dataFim: string,
  contaCodigo: string
): LivroRazao {
  const service = new LivrosContabeis({
    companyId,
    dataInicio,
    dataFim,
    contaEspecifica: contaCodigo,
  });
  return service.gerarLivroRazao(contaCodigo);
}

export function gerarLivroRazaoCompleto(
  companyId: string,
  dataInicio: string,
  dataFim: string
): LivroRazao[] {
  const service = new LivrosContabeis({
    companyId,
    dataInicio,
    dataFim,
    incluirHistoricoCompleto: true,
  });
  return service.gerarLivroRazaoCompleto();
}

export function downloadLivroDiario(
  companyId: string,
  dataInicio: string,
  dataFim: string
): void {
  const service = new LivrosContabeis({
    companyId,
    dataInicio,
    dataFim,
  });
  service.gerarEDownloadLivroDiario();
}

export function downloadLivroRazao(
  companyId: string,
  dataInicio: string,
  dataFim: string,
  contaCodigo: string
): void {
  const service = new LivrosContabeis({
    companyId,
    dataInicio,
    dataFim,
    contaEspecifica: contaCodigo,
  });
  service.gerarEDownloadLivroRazao(contaCodigo);
}