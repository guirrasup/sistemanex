// src/services/fiscal/RelatoriosFiscais.ts

import { store } from '../store';
import { FiscalDocument, FiscalDocumentItem, Person } from '../../types';

export interface RelatorioNotasEmitidas {
  periodo: {
    data_inicio: string;
    data_fim: string;
  };
  notas: Array<{
    numero: string;
    serie: string;
    data: string;
    cliente: string;
    cnpj_cpf: string;
    valor_total: number;
    base_icms: number;
    valor_icms: number;
    valor_pis: number;
    valor_cofins: number;
    valor_cbs: number;
    valor_ibs: number;
    status: string;
    chave_acesso?: string;
    protocolo?: string;
  }>;
  totais: {
    quantidade: number;
    valor_total: number;
    total_icms: number;
    total_pis: number;
    total_cofins: number;
    total_cbs: number;
    total_ibs: number;
    total_impostos: number;
  };
}

export interface RelatorioNotasRecebidas {
  periodo: {
    data_inicio: string;
    data_fim: string;
  };
  notas: Array<{
    numero: string;
    serie: string;
    data: string;
    fornecedor: string;
    cnpj_cpf: string;
    valor_total: number;
    base_icms: number;
    valor_icms: number;
    valor_pis: number;
    valor_cofins: number;
    valor_cbs: number;
    valor_ibs: number;
    status: string;
    chave_acesso?: string;
  }>;
  totais: {
    quantidade: number;
    valor_total: number;
    total_icms: number;
    total_pis: number;
    total_cofins: number;
    total_cbs: number;
    total_ibs: number;
    total_impostos: number;
  };
}

export interface RelatorioApuraçãoImpostosMensal {
  mes: number;
  ano: number;
  regime_tributario: string;
  receita_bruta: number;
  impostos: {
    icms: { debito: number; credito: number; saldo: number; status: 'pago' | 'pendente' | 'a_recolher' };
    pis: { debito: number; credito: number; saldo: number; status: 'pago' | 'pendente' | 'a_recolher' };
    cofins: { debito: number; credito: number; saldo: number; status: 'pago' | 'pendente' | 'a_recolher' };
    cbs: { debito: number; credito: number; saldo: number; status: 'pago' | 'pendente' | 'a_recolher' };
    ibs: { debito: number; credito: number; saldo: number; status: 'pago' | 'pendente' | 'a_recolher' };
  };
  total_impostos: number;
  carga_tributaria: number;
}

export interface RelatorioResumoFiscal {
  periodo: {
    data_inicio: string;
    data_fim: string;
  };
  resumo: {
    total_notas_emitidas: number;
    total_notas_recebidas: number;
    total_valor_emitido: number;
    total_valor_recebido: number;
    total_icms_emitido: number;
    total_icms_recebido: number;
    total_cbs_emitido: number;
    total_ibs_emitido: number;
  };
  por_status: {
    autorizadas: number;
    canceladas: number;
    pendentes: number;
  };
}

export class RelatoriosFiscais {
  private companyId: string;

  constructor(companyId: string) {
    this.companyId = companyId;
  }

  /**
   * Relatório de Notas Fiscais Emitidas (Saídas)
   */
  gerarRelatorioNotasEmitidas(dataInicio: string, dataFim: string): RelatorioNotasEmitidas {
    const docs = store.fiscalDocuments.filter(d =>
      d.company_id === this.companyId &&
      d.issue_date >= dataInicio &&
      d.issue_date <= dataFim &&
      d.operation_type === 'sales'
    );

    const people = store.people.filter(p => p.company_id === this.companyId);
    const items = store.fiscalDocumentItems || [];

    const notas = docs.map(doc => {
      const person = people.find(p => p.id === doc.person_id);
      const docItems = items.filter(i => i.fiscal_document_id === doc.id);

      return {
        numero: doc.document_number || 'N/A',
        serie: doc.series || '1',
        data: doc.issue_date,
        cliente: person?.legal_name || person?.trade_name || 'NÃO IDENTIFICADO',
        cnpj_cpf: person?.tax_id || '',
        valor_total: doc.total_value || 0,
        base_icms: doc.base_calc_icms || 0,
        valor_icms: doc.icms_value || 0,
        valor_pis: doc.pis_value || 0,
        valor_cofins: doc.cofins_value || 0,
        valor_cbs: doc.cbs_value || 0,
        valor_ibs: doc.ibs_value || 0,
        status: doc.status,
        chave_acesso: doc.access_key,
        protocolo: doc.protocol,
      };
    });

    const totais = {
      quantidade: notas.length,
      valor_total: notas.reduce((acc, n) => acc + n.valor_total, 0),
      total_icms: notas.reduce((acc, n) => acc + n.valor_icms, 0),
      total_pis: notas.reduce((acc, n) => acc + n.valor_pis, 0),
      total_cofins: notas.reduce((acc, n) => acc + n.valor_cofins, 0),
      total_cbs: notas.reduce((acc, n) => acc + n.valor_cbs, 0),
      total_ibs: notas.reduce((acc, n) => acc + n.valor_ibs, 0),
      total_impostos: 0,
    };

    totais.total_impostos = totais.total_icms + totais.total_pis + totais.total_cofins +
      totais.total_cbs + totais.total_ibs;

    return {
      periodo: { data_inicio: dataInicio, data_fim: dataFim },
      notas: notas,
      totais: totais,
    };
  }

  /**
   * Relatório de Notas Fiscais Recebidas (Entradas)
   */
  gerarRelatorioNotasRecebidas(dataInicio: string, dataFim: string): RelatorioNotasRecebidas {
    const docs = store.fiscalDocuments.filter(d =>
      d.company_id === this.companyId &&
      d.issue_date >= dataInicio &&
      d.issue_date <= dataFim &&
      d.operation_type === 'purchase'
    );

    const people = store.people.filter(p => p.company_id === this.companyId);

    const notas = docs.map(doc => {
      const person = people.find(p => p.id === doc.person_id);

      return {
        numero: doc.document_number || 'N/A',
        serie: doc.series || '1',
        data: doc.issue_date,
        fornecedor: person?.legal_name || person?.trade_name || 'NÃO IDENTIFICADO',
        cnpj_cpf: person?.tax_id || '',
        valor_total: doc.total_value || 0,
        base_icms: doc.base_calc_icms || 0,
        valor_icms: doc.icms_value || 0,
        valor_pis: doc.pis_value || 0,
        valor_cofins: doc.cofins_value || 0,
        valor_cbs: doc.cbs_value || 0,
        valor_ibs: doc.ibs_value || 0,
        status: doc.status,
        chave_acesso: doc.access_key,
      };
    });

    const totais = {
      quantidade: notas.length,
      valor_total: notas.reduce((acc, n) => acc + n.valor_total, 0),
      total_icms: notas.reduce((acc, n) => acc + n.valor_icms, 0),
      total_pis: notas.reduce((acc, n) => acc + n.valor_pis, 0),
      total_cofins: notas.reduce((acc, n) => acc + n.valor_cofins, 0),
      total_cbs: notas.reduce((acc, n) => acc + n.valor_cbs, 0),
      total_ibs: notas.reduce((acc, n) => acc + n.valor_ibs, 0),
      total_impostos: 0,
    };

    totais.total_impostos = totais.total_icms + totais.total_pis + totais.total_cofins +
      totais.total_cbs + totais.total_ibs;

    return {
      periodo: { data_inicio: dataInicio, data_fim: dataFim },
      notas: notas,
      totais: totais,
    };
  }

  /**
   * Relatório de Apuração de Impostos Mensal
   */
  gerarRelatorioApuraçãoMensal(mes: number, ano: number): RelatorioApuraçãoImpostosMensal {
    const dataInicio = `${ano}-${String(mes).padStart(2, '0')}-01`;
    const dataFim = `${ano}-${String(mes).padStart(2, '0')}-${new Date(ano, mes, 0).getDate()}`;

    const docs = store.financialDocuments.filter(d =>
      d.company_id === this.companyId &&
      d.issue_date >= dataInicio &&
      d.issue_date <= dataFim
    );

    const fiscalDocs = store.fiscalDocuments.filter(d =>
      d.company_id === this.companyId &&
      d.issue_date >= dataInicio &&
      d.issue_date <= dataFim &&
      d.status === 'authorized'
    );

    const receitaBruta = docs
      .filter(d => d.direction === 'receivable')
      .reduce((acc, d) => acc + d.total_amount, 0);

    const company = store.companies.find(c => c.id === this.companyId);

    const debitoICMS = fiscalDocs.reduce((acc, d) => acc + (d.icms_value || 0), 0);
    const debitoPIS = fiscalDocs.reduce((acc, d) => acc + (d.pis_value || 0), 0);
    const debitoCOFINS = fiscalDocs.reduce((acc, d) => acc + (d.cofins_value || 0), 0);
    const debitoCBS = fiscalDocs.reduce((acc, d) => acc + (d.cbs_value || 0), 0);
    const debitoIBS = fiscalDocs.reduce((acc, d) => acc + (d.ibs_value || 0), 0);

    // Créditos (estimados)
    const creditoICMS = debitoICMS * 0.3;
    const creditoPIS = debitoPIS * 0.2;
    const creditoCOFINS = debitoCOFINS * 0.2;
    const creditoCBS = debitoCBS * 0.1;
    const creditoIBS = debitoIBS * 0.1;

    const totalImpostos = debitoICMS + debitoPIS + debitoCOFINS + debitoCBS + debitoIBS;
    const cargaTributaria = receitaBruta > 0 ? (totalImpostos / receitaBruta) * 100 : 0;

    return {
      mes,
      ano,
      regime_tributario: company?.tax_regime || 'actual_profit',
      receita_bruta: receitaBruta,
      impostos: {
        icms: {
          debito: debitoICMS,
          credito: creditoICMS,
          saldo: debitoICMS - creditoICMS,
          status: debitoICMS > creditoICMS ? 'a_recolher' : 'pendente',
        },
        pis: {
          debito: debitoPIS,
          credito: creditoPIS,
          saldo: debitoPIS - creditoPIS,
          status: debitoPIS > creditoPIS ? 'a_recolher' : 'pendente',
        },
        cofins: {
          debito: debitoCOFINS,
          credito: creditoCOFINS,
          saldo: debitoCOFINS - creditoCOFINS,
          status: debitoCOFINS > creditoCOFINS ? 'a_recolher' : 'pendente',
        },
        cbs: {
          debito: debitoCBS,
          credito: creditoCBS,
          saldo: debitoCBS - creditoCBS,
          status: debitoCBS > creditoCBS ? 'a_recolher' : 'pendente',
        },
        ibs: {
          debito: debitoIBS,
          credito: creditoIBS,
          saldo: debitoIBS - creditoIBS,
          status: debitoIBS > creditoIBS ? 'a_recolher' : 'pendente',
        },
      },
      total_impostos: totalImpostos,
      carga_tributaria: cargaTributaria,
    };
  }

  /**
   * Relatório Resumo Fiscal
   */
  gerarRelatorioResumoFiscal(dataInicio: string, dataFim: string): RelatorioResumoFiscal {
    const docs = store.fiscalDocuments.filter(d =>
      d.company_id === this.companyId &&
      d.issue_date >= dataInicio &&
      d.issue_date <= dataFim
    );

    const emitidas = docs.filter(d => d.operation_type === 'sales');
    const recebidas = docs.filter(d => d.operation_type === 'purchase');

    const autorizadas = docs.filter(d => d.status === 'authorized');
    const canceladas = docs.filter(d => d.status === 'canceled');
    const pendentes = docs.filter(d => d.status === 'draft' || d.status === 'contingency');

    return {
      periodo: { data_inicio: dataInicio, data_fim: dataFim },
      resumo: {
        total_notas_emitidas: emitidas.length,
        total_notas_recebidas: recebidas.length,
        total_valor_emitido: emitidas.reduce((acc, d) => acc + d.total_value, 0),
        total_valor_recebido: recebidas.reduce((acc, d) => acc + d.total_value, 0),
        total_icms_emitido: emitidas.reduce((acc, d) => acc + (d.icms_value || 0), 0),
        total_icms_recebido: recebidas.reduce((acc, d) => acc + (d.icms_value || 0), 0),
        total_cbs_emitido: emitidas.reduce((acc, d) => acc + (d.cbs_value || 0), 0),
        total_ibs_emitido: emitidas.reduce((acc, d) => acc + (d.ibs_value || 0), 0),
      },
      por_status: {
        autorizadas: autorizadas.length,
        canceladas: canceladas.length,
        pendentes: pendentes.length,
      },
    };
  }

  /**
   * Exporta relatório para CSV
   */
  exportarCSV(relatorio: any, tipo: string): string {
    let cabecalho: string[] = [];
    let dados: any[] = [];

    if (tipo === 'notas_emitidas' || tipo === 'notas_recebidas') {
      const notas = tipo === 'notas_emitidas' ? relatorio.notas : relatorio.notas;
      cabecalho = ['Número', 'Série', 'Data', 'Cliente/Fornecedor', 'CNPJ/CPF', 'Valor Total', 'ICMS', 'PIS', 'COFINS', 'CBS', 'IBS', 'Status'];
      dados = notas.map((n: any) => [
        n.numero,
        n.serie,
        n.data,
        n.cliente || n.fornecedor,
        n.cnpj_cpf,
        n.valor_total.toFixed(2),
        n.valor_icms.toFixed(2),
        n.valor_pis.toFixed(2),
        n.valor_cofins.toFixed(2),
        n.valor_cbs.toFixed(2),
        n.valor_ibs.toFixed(2),
        n.status,
      ]);
    } else if (tipo === 'apuracao') {
      cabecalho = ['Imposto', 'Débito', 'Crédito', 'Saldo', 'Status'];
      const imp = relatorio.impostos;
      dados = [
        ['ICMS', imp.icms.debito.toFixed(2), imp.icms.credito.toFixed(2), imp.icms.saldo.toFixed(2), imp.icms.status],
        ['PIS', imp.pis.debito.toFixed(2), imp.pis.credito.toFixed(2), imp.pis.saldo.toFixed(2), imp.pis.status],
        ['COFINS', imp.cofins.debito.toFixed(2), imp.cofins.credito.toFixed(2), imp.cofins.saldo.toFixed(2), imp.cofins.status],
        ['CBS', imp.cbs.debito.toFixed(2), imp.cbs.credito.toFixed(2), imp.cbs.saldo.toFixed(2), imp.cbs.status],
        ['IBS', imp.ibs.debito.toFixed(2), imp.ibs.credito.toFixed(2), imp.ibs.saldo.toFixed(2), imp.ibs.status],
      ];
    } else if (tipo === 'resumo') {
      cabecalho = ['Métrica', 'Valor'];
      const r = relatorio.resumo;
      dados = [
        ['Total Notas Emitidas', r.total_notas_emitidas],
        ['Total Notas Recebidas', r.total_notas_recebidas],
        ['Total Valor Emitido', r.total_valor_emitido.toFixed(2)],
        ['Total Valor Recebido', r.total_valor_recebido.toFixed(2)],
        ['Total ICMS Emitido', r.total_icms_emitido.toFixed(2)],
        ['Total ICMS Recebido', r.total_icms_recebido.toFixed(2)],
        ['Total CBS Emitido', r.total_cbs_emitido.toFixed(2)],
        ['Total IBS Emitido', r.total_ibs_emitido.toFixed(2)],
      ];
    }

    const linhas: string[] = [];
    linhas.push(cabecalho.join(';'));

    for (const linha of dados) {
      linhas.push(linha.join(';'));
    }

    return linhas.join('\n');
  }

  /**
   * Baixa o relatório no navegador
   */
  downloadRelatorio(relatorio: any, tipo: string, nomeArquivo: string): void {
    const conteudo = this.exportarCSV(relatorio, tipo);
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
}

// ===== FUNÇÕES DE UTILIDADE =====

export function gerarRelatorioNotasEmitidas(
  companyId: string,
  dataInicio: string,
  dataFim: string
): RelatorioNotasEmitidas {
  const service = new RelatoriosFiscais(companyId);
  return service.gerarRelatorioNotasEmitidas(dataInicio, dataFim);
}

export function gerarRelatorioNotasRecebidas(
  companyId: string,
  dataInicio: string,
  dataFim: string
): RelatorioNotasRecebidas {
  const service = new RelatoriosFiscais(companyId);
  return service.gerarRelatorioNotasRecebidas(dataInicio, dataFim);
}

export function gerarRelatorioApuraçãoMensal(
  companyId: string,
  mes: number,
  ano: number
): RelatorioApuraçãoImpostosMensal {
  const service = new RelatoriosFiscais(companyId);
  return service.gerarRelatorioApuraçãoMensal(mes, ano);
}

export function gerarRelatorioResumoFiscal(
  companyId: string,
  dataInicio: string,
  dataFim: string
): RelatorioResumoFiscal {
  const service = new RelatoriosFiscais(companyId);
  return service.gerarRelatorioResumoFiscal(dataInicio, dataFim);
}