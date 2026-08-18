// src/services/contabil/ApuracaoImpostos.ts

import { store } from '../store';
import { ApuracaoImpostosDetalhada } from '../../types/contabil';

export function apurarImpostos(
  companyId: string,
  dataInicio: string,
  dataFim: string
): ApuracaoImpostosDetalhada {
  const fiscalDocs = store.fiscalDocuments.filter(d =>
    d.company_id === companyId &&
    d.issue_date >= dataInicio &&
    d.issue_date <= dataFim &&
    d.status === 'authorized'
  );

  const docs = store.financialDocuments.filter(d =>
    d.company_id === companyId &&
    d.issue_date >= dataInicio &&
    d.issue_date <= dataFim
  );

  const receitaBruta = docs
    .filter(d => d.direction === 'receivable')
    .reduce((acc, d) => acc + d.total_amount, 0);

  const baseCalculoICMS = receitaBruta * 0.6;
  const baseCalculoPIS = receitaBruta;
  const baseCalculoCOFINS = receitaBruta;
  const baseCalculoCBS = receitaBruta;
  const baseCalculoIBS = receitaBruta;

  // ICMS
  const debitoICMS = fiscalDocs.reduce((acc, d) => acc + (d.icms_value || 0), 0);
  const creditoICMS = 0;
  const saldoAnteriorICMS = 0;
  const saldoICMS = debitoICMS - creditoICMS + saldoAnteriorICMS;

  // PIS
  const debitoPIS = fiscalDocs.reduce((acc, d) => acc + (d.pis_value || 0), 0);
  const creditoPIS = 0;

  // COFINS
  const debitoCOFINS = fiscalDocs.reduce((acc, d) => acc + (d.cofins_value || 0), 0);
  const creditoCOFINS = 0;

  // CBS
  const debitoCBS = fiscalDocs.reduce((acc, d) => acc + (d.cbs_value || 0), 0);
  const creditoCBS = 0;

  // IBS
  const debitoIBS = fiscalDocs.reduce((acc, d) => acc + (d.ibs_value || 0), 0);
  const creditoIBS = 0;

  const totalDebitos = debitoICMS + debitoPIS + debitoCOFINS + debitoCBS + debitoIBS;
  const totalCreditos = creditoICMS + creditoPIS + creditoCOFINS + creditoCBS + creditoIBS;
  const totalARecolher = totalDebitos - totalCreditos;

  const cargaTributaria = receitaBruta > 0 ? (totalDebitos / receitaBruta) * 100 : 0;

  return {
    periodo: { data_inicio: dataInicio, data_fim: dataFim },
    icms: {
      base_calculo: baseCalculoICMS,
      aliquota: 18,
      debito: debitoICMS,
      credito: creditoICMS,
      saldo: saldoICMS,                    // ← ADICIONADO
      saldo_anterior: saldoAnteriorICMS,
      saldo_atual: saldoICMS,
      recolhido: 0,
      a_recolher: saldoICMS,
      historico: fiscalDocs.map(d => ({
        data: d.issue_date,
        documento: d.document_number || '',
        tipo: 'debito' as const,
        valor: d.icms_value || 0,
      })),
    },
    pis: {
      base_calculo: baseCalculoPIS,
      aliquota: 1.65,
      debito: debitoPIS,
      credito: creditoPIS,
      saldo: debitoPIS - creditoPIS,
      a_recolher: debitoPIS - creditoPIS,
    },
    cofins: {
      base_calculo: baseCalculoCOFINS,
      aliquota: 7.6,
      debito: debitoCOFINS,
      credito: creditoCOFINS,
      saldo: debitoCOFINS - creditoCOFINS,
      a_recolher: debitoCOFINS - creditoCOFINS,
    },
    cbs: {
      base_calculo: baseCalculoCBS,
      aliquota: 8.8,
      debito: debitoCBS,
      credito: creditoCBS,
      saldo: debitoCBS - creditoCBS,
      a_recolher: debitoCBS - creditoCBS,
    },
    ibs: {
      base_calculo: baseCalculoIBS,
      aliquota: 17.7,
      debito: debitoIBS,
      credito: creditoIBS,
      saldo: debitoIBS - creditoIBS,
      a_recolher: debitoIBS - creditoIBS,
    },
    resumo: {
      total_impostos_debitos: totalDebitos,
      total_impostos_creditos: totalCreditos,
      total_a_recolher: totalARecolher,
      carga_tributaria: cargaTributaria,
    },
  };
}