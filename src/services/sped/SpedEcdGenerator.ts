// src/services/sped/SpedEcdGenerator.ts

import { store } from '../store';
import { 
  SpedRegistro0000, 
  SpedRegistro0001, 
  SpedRegistro0007,
  SpedRegistro0020,
  SpedRegistro0150,
  SpedRegistro0180,
  SpedRegistroI010,
  SpedRegistroI012,
  SpedRegistroI015,
  SpedRegistroI020,
  SpedRegistroI030,
  SpedRegistroI050,
  SpedRegistroI075,
  SpedRegistroI100,
  SpedRegistroI150,
  SpedRegistroI157,
  SpedRegistroI200,
  SpedRegistroI250,
  SpedRegistroI300,
  SpedRegistroI310,
  SpedRegistroI350,
  SpedRegistroI355,
  SpedRegistroI500,
  SpedRegistroI510,
  SpedRegistroI550,
  SpedRegistroI555,
  SpedRegistroJ005,
  SpedRegistroJ015,
  SpedRegistroJ020,
  SpedRegistroJ050,
  SpedRegistroJ051,
  SpedRegistroJ100,
  SpedRegistroJ150,
  SpedRegistroJ210,
  SpedRegistroJ215,
  SpedRegistroJ930,
  SpedRegistroJ935,
  SpedRegistro9990,
  SpedRegistro9999,
} from '../../types/sped';

import { PeriodoConfig } from '../../config/periodo.config';
import { SPED_CONFIG } from '../../config/sped.config';
import { PLANO_REFERENCIAL_SPED, mapearContaParaReferencial } from '../contabil/PlanoContasReferencial';
import { CONTABIL_CONFIG_PADRAO } from '../../config/contabil.config';

export interface SpedEcdOptions {
  companyId: string;
  periodo: PeriodoConfig;
  ambiente?: 'homologacao' | 'producao';
  incluirSaldosIniciais?: boolean;
  incluirLancamentos?: boolean;
}

export class SpedEcdGenerator {
  private companyId: string;
  private periodo: PeriodoConfig;
  private ambiente: 'homologacao' | 'producao';
  private registros: string[] = [];
  private contadorLinhas: number = 0;
  private incluirSaldosIniciais: boolean;
  private incluirLancamentos: boolean;

  constructor(options: SpedEcdOptions) {
    this.companyId = options.companyId;
    this.periodo = options.periodo;
    this.ambiente = options.ambiente || 'homologacao';
    this.incluirSaldosIniciais = options.incluirSaldosIniciais ?? true;
    this.incluirLancamentos = options.incluirLancamentos ?? true;
  }

  private addRegistro(registro: any): void {
    const fields = Object.values(registro);
    const linha = fields.join('|');
    this.registros.push(linha);
    this.contadorLinhas++;
  }

  private getCompany() {
    const company = store.companies.find(c => c.id === this.companyId);
    if (!company) throw new Error(`Empresa ${this.companyId} não encontrada`);
    return company;
  }

  private getPeople() {
    return store.people.filter(p => p.company_id === this.companyId && p.is_active);
  }

  private getFinancialAccounts() {
    return store.financialAccounts.filter(fa => fa.company_id === this.companyId && fa.is_active);
  }

  private getFinancialDocuments() {
    const docs = store.financialDocuments.filter(d => 
      d.company_id === this.companyId && 
      d.issue_date >= this.periodo.data_inicio &&
      d.issue_date <= this.periodo.data_fim
    );
    return docs;
  }

  private getInstallments() {
    const docs = this.getFinancialDocuments();
    const docIds = docs.map(d => d.id);
    return store.installments.filter(i => docIds.includes(i.financial_document_id));
  }

  private getSettlements() {
    const insts = this.getInstallments();
    const instIds = insts.map(i => i.id);
    return store.settlements.filter(s => instIds.includes(s.installment_id));
  }

  private getNaturezaConta(accountType: string): 'D' | 'C' {
    const naturezas: Record<string, 'D' | 'C'> = {
      'asset': 'D',
      'liability': 'C',
      'equity': 'C',
      'revenue': 'C',
      'expense': 'D',
    };
    return naturezas[accountType] || 'D';
  }

  // ===== REGISTROS BLOCO 0 =====

  private gerarRegistro0000(): SpedRegistro0000 {
    const company = this.getCompany();
    const ano = this.periodo.ano;
    const mesInicio = String(this.periodo.mes_inicio).padStart(2, '0');
    const mesFim = String(this.periodo.mes_fim).padStart(2, '0');
    const ultimoDia = new Date(ano, this.periodo.mes_fim, 0).getDate();

    return {
      tipo: '0000',
      codigo_versao: SPED_CONFIG.ecd.versao,
      tipo_escrituracao: '0',
      indicador_situacao: '0',
      nivel: '0',
      cnpj: company.cnpj.replace(/\D/g, ''),
      razao_social: company.legal_name,
      nome_fantasia: company.trade_name,
      uf: 'SP',
      municipio: 'São Paulo',
      cep: '01310100',
      codigo_pais: '1058',
      codigo_ibge: '3550308',
      inscricao_estadual: company.state_registration?.replace(/\D/g, '') || '',
      inscricao_municipal: company.municipal_registration?.replace(/\D/g, '') || '',
      data_inicio: `${ano}${mesInicio}01`,
      data_fim: `${ano}${mesFim}${String(ultimoDia).padStart(2, '0')}`,
      finalidade: '0',
      codigo_qualificacao: '00',
      indice_remessa: '0',
    };
  }

  private gerarRegistro0001(): SpedRegistro0001 {
    const docs = this.getFinancialDocuments();
    return {
      tipo: '0001',
      indicador_movimento: docs.length > 0 ? '0' : '1',
    };
  }

  private gerarRegistro0007(): SpedRegistro0007 {
    return {
      tipo: '0007',
      codigo_empresa: '1',
    };
  }

  private gerarRegistro0020(): SpedRegistro0020 {
    const company = this.getCompany();
    return {
      tipo: '0020',
      cnpj_empresa: company.cnpj.replace(/\D/g, ''),
      codigo_identificador_empresa: '2',
      codigo_indicador_ie: company.state_registration ? '1' : '9',
    };
  }

  private gerarRegistro0150(person: any): SpedRegistro0150 {
    return {
      tipo: '0150',
      codigo_participante: person.id.replace('person-', ''),
      nome_participante: person.legal_name || person.trade_name || 'NÃO INFORMADO',
      codigo_pais: '1058',
      cnpj_cpf: person.tax_id.replace(/\D/g, ''),
      inscricao_estadual: person.state_registration?.replace(/\D/g, '') || '',
      codigo_qualificacao: person.person_type === 'company' ? '01' : '00',
      endereco: person.street || '',
      numero: person.number || '',
      complemento: person.complement || '',
      bairro: person.neighborhood || '',
      cidade: person.city || 'São Paulo',
      estado: person.state || 'SP',
      cep: person.zip_code?.replace(/\D/g, '') || '',
    };
  }

  private gerarRegistro0180(): SpedRegistro0180 {
    return {
      tipo: '0180',
      codigo_identificacao: '1',
      descricao: 'LANÇAMENTOS CONTÁBEIS NEXS ERP',
      data_inicio: this.periodo.data_inicio.replace(/-/g, ''),
      data_fim: this.periodo.data_fim.replace(/-/g, ''),
    };
  }

  // ===== REGISTROS BLOCO I =====

  private gerarRegistroI010(): SpedRegistroI010 {
    return {
      tipo: 'I010',
      indicador_plano: '0',
      codigo_plano: 'NEXS',
      descricao_plano: 'PLANO DE CONTAS NEXS EMPRESARIAL',
      data_inicio: this.periodo.data_inicio.replace(/-/g, ''),
      data_fim: this.periodo.data_fim.replace(/-/g, ''),
    };
  }

  private gerarRegistroI012(): SpedRegistroI012 {
    return {
      tipo: 'I012',
      numero_versao: SPED_CONFIG.ecd.versao,
    };
  }

  private gerarRegistroI015(): SpedRegistroI015 {
    return {
      tipo: 'I015',
      codigo_identificacao: 'NEXS001',
    };
  }

  private gerarRegistroI020(conta: any): SpedRegistroI020 {
    const ref = mapearContaParaReferencial(conta.code);
    return {
      tipo: 'I020',
      codigo_conta: conta.code,
      descricao_conta: conta.name,
      tipo_conta: conta.parent_id ? 'A' : 'S',
      natureza_conta: this.getNaturezaConta(conta.account_type),
      nivel_conta: conta.parent_id ? 3 : 2,
      codigo_conta_superior: conta.parent_id || undefined,
      data_inicio: this.periodo.data_inicio.replace(/-/g, ''),
      data_fim: this.periodo.data_fim.replace(/-/g, ''),
      codigo_plano_referencial: ref !== conta.code ? ref : undefined,
    };
  }

  private gerarRegistroI030(conta: any): SpedRegistroI030 {
    return {
      tipo: 'I030',
      codigo_conta: conta.code,
      codigo_ccus: '1',
    };
  }

  private gerarRegistroI050(conta: any): SpedRegistroI050 {
    return {
      tipo: 'I050',
      data_inicio: this.periodo.data_inicio.replace(/-/g, ''),
      codigo_conta: conta.code,
      saldo_inicial: 0,
      indicador_saldo_inicial: 'D',
    };
  }

  private gerarRegistroI075(conta: any): SpedRegistroI075 {
    const docs = this.getFinancialDocuments();
    const total = docs
      .filter(d => d.financial_account_id === conta.id)
      .reduce((acc, d) => {
        const valor = d.direction === 'receivable' ? d.total_amount : -d.total_amount;
        return acc + valor;
      }, 0);

    return {
      tipo: 'I075',
      data_inicio: this.periodo.data_inicio.replace(/-/g, ''),
      codigo_conta: conta.code,
      valor: Math.abs(total),
      indicador_valor: total >= 0 ? 'D' : 'C',
      historico: 'SALDO DO PERÍODO',
    };
  }

  private gerarRegistroI100(conta: any): SpedRegistroI100 {
    const docs = this.getFinancialDocuments();
    const total = docs
      .filter(d => d.financial_account_id === conta.id)
      .reduce((acc, d) => {
        const valor = d.direction === 'receivable' ? d.total_amount : -d.total_amount;
        return acc + valor;
      }, 0);

    return {
      tipo: 'I100',
      data_inicio: this.periodo.data_inicio.replace(/-/g, ''),
      data_fim: this.periodo.data_fim.replace(/-/g, ''),
      codigo_conta: conta.code,
      saldo_inicial: 0,
      indicador_saldo_inicial: 'D',
      saldo_final: total,
      indicador_saldo_final: total >= 0 ? 'D' : 'C',
    };
  }

  private gerarRegistroI150(doc: any): SpedRegistroI150 {
    return {
      tipo: 'I150',
      data_lancamento: doc.issue_date.replace(/-/g, ''),
      codigo_historico: '1',
      historico_complementar: doc.description || 'LANÇAMENTO CONTÁBIL',
      codigo_conta: doc.financial_account_id || '1.1.99.999',
      valor: Math.abs(doc.total_amount),
      indicador_valor: doc.direction === 'receivable' ? 'D' : 'C',
    };
  }

  private gerarRegistroI157(doc: any, conta: string, valor: number, tipo: 'D' | 'C'): SpedRegistroI157 {
    return {
      tipo: 'I157',
      codigo_conta: conta,
      valor: valor,
    };
  }

  private gerarRegistroI200(doc: any): SpedRegistroI200 {
    return {
      tipo: 'I200',
      data_lancamento: doc.issue_date.replace(/-/g, ''),
      codigo_historico: '1',
      historico_complementar: doc.description || 'LANÇAMENTO CONTÁBIL',
      valor: Math.abs(doc.total_amount),
      codigo_conta_debito: doc.direction === 'receivable' ? '1.1.04' : '4.5.01',
      codigo_conta_credito: doc.direction === 'receivable' ? '3.1.01' : '2.1.01',
    };
  }

  private gerarRegistroI250(conta: string, valor: number, tipo: 'D' | 'C'): SpedRegistroI250 {
    return {
      tipo: 'I250',
      codigo_conta: conta,
      valor: valor,
      indicador_valor: tipo,
    };
  }

  private gerarRegistroI300(data: string, conta: string, valor: number): SpedRegistroI300 {
    return {
      tipo: 'I300',
      data: data.replace(/-/g, ''),
      codigo_conta: conta,
      valor: Math.abs(valor),
      indicador_valor: valor >= 0 ? 'D' : 'C',
    };
  }

  private gerarRegistroI310(data: string, conta: string, valor: number): SpedRegistroI310 {
    return {
      tipo: 'I310',
      data: data.replace(/-/g, ''),
      codigo_conta: conta,
      valor: Math.abs(valor),
      indicador_valor: valor >= 0 ? 'D' : 'C',
    };
  }

  private gerarRegistroI350(conta: string, valor: number, tipo: 'D' | 'C'): SpedRegistroI350 {
    return {
      tipo: 'I350',
      data: this.periodo.data_fim.replace(/-/g, ''),
      codigo_conta: conta,
      valor: valor,
      indicador_valor: tipo,
    };
  }

  private gerarRegistroI355(conta: string, valor: number, tipo: 'D' | 'C'): SpedRegistroI355 {
    return {
      tipo: 'I355',
      codigo_conta: conta,
      valor: valor,
      indicador_valor: tipo,
    };
  }

  private gerarRegistroI500(conta: string, valor: number): SpedRegistroI500 {
    return {
      tipo: 'I500',
      codigo_conta: conta,
      valor: Math.abs(valor),
      indicador_valor: valor >= 0 ? 'D' : 'C',
    };
  }

  private gerarRegistroI510(conta: string, valor: number): SpedRegistroI510 {
    return {
      tipo: 'I510',
      codigo_conta: conta,
      valor: Math.abs(valor),
      indicador_valor: valor >= 0 ? 'D' : 'C',
    };
  }

  private gerarRegistroI550(conta: string, valor: number, tipo: 'D' | 'C'): SpedRegistroI550 {
    return {
      tipo: 'I550',
      codigo_conta: conta,
      valor: valor,
      indicador_valor: tipo,
      codigo_historico: '1',
    };
  }

  private gerarRegistroI555(conta: string, valor: number, tipo: 'D' | 'C'): SpedRegistroI555 {
    return {
      tipo: 'I555',
      codigo_conta: conta,
      valor: valor,
      indicador_valor: tipo,
    };
  }

  // ===== REGISTROS BLOCO J =====

  private gerarRegistroJ005(): SpedRegistroJ005 {
    return {
      tipo: 'J005',
      data_inicio: this.periodo.data_inicio.replace(/-/g, ''),
      data_fim: this.periodo.data_fim.replace(/-/g, ''),
      indicador_situacao: '0',
    };
  }

  private gerarRegistroJ015(): SpedRegistroJ015 {
    const docs = this.getFinancialDocuments();
    const totalReceitas = docs
      .filter(d => d.direction === 'receivable')
      .reduce((acc, d) => acc + d.total_amount, 0);

    return {
      tipo: 'J015',
      codigo_conta: '3.1.01',
      descricao_conta: 'RECEITA BRUTA DE VENDAS',
      nivel_conta: 3,
      natureza_conta: 'C',
      indicador_valor: 'C',
      valor: totalReceitas,
    };
  }

  private gerarRegistroJ020(): SpedRegistroJ020 {
    const docs = this.getFinancialDocuments();
    const totalDespesas = docs
      .filter(d => d.direction === 'payable')
      .reduce((acc, d) => acc + d.total_amount, 0);

    return {
      tipo: 'J020',
      codigo_conta: '4.5.01',
      descricao_conta: 'DESPESAS TRIBUTÁRIAS',
      nivel_conta: 3,
      natureza_conta: 'D',
      indicador_valor: 'D',
      valor: totalDespesas,
    };
  }

  private gerarRegistroJ050(): SpedRegistroJ050 {
    const docs = this.getFinancialDocuments();
    const total = docs.reduce((acc, d) => {
      const valor = d.direction === 'receivable' ? d.total_amount : -d.total_amount;
      return acc + valor;
    }, 0);

    return {
      tipo: 'J050',
      data: this.periodo.data_fim.replace(/-/g, ''),
      codigo_conta: '1.1.04',
      descricao_conta: 'CLIENTES',
      nivel_conta: 3,
      natureza_conta: 'D',
      indicador_valor: total >= 0 ? 'D' : 'C',
      valor: Math.abs(total),
    };
  }

  private gerarRegistroJ051(): SpedRegistroJ051 {
    return {
      tipo: 'J051',
      codigo_conta: '1.1.04',
      descricao_conta: 'CLIENTES',
      nivel_conta: 3,
      natureza_conta: 'D',
      indicador_valor: 'D',
      valor: 0,
    };
  }

  private gerarRegistroJ100(): SpedRegistroJ100 {
    const docs = this.getFinancialDocuments();
    const totalAtivo = docs
      .filter(d => d.direction === 'receivable')
      .reduce((acc, d) => acc + d.total_amount, 0);

    const totalPassivo = docs
      .filter(d => d.direction === 'payable')
      .reduce((acc, d) => acc + d.total_amount, 0);

    return {
      tipo: 'J100',
      codigo_conta: '1.1.04',
      descricao_conta: 'CLIENTES',
      nivel_conta: 3,
      natureza_conta: 'D',
      indicador_valor: 'D',
      valor: totalAtivo,
    };
  }

  private gerarRegistroJ150(): SpedRegistroJ150 {
    return {
      tipo: 'J150',
      codigo_conta: '1.1.04',
      descricao_conta: 'CLIENTES',
      nivel_conta: 3,
      natureza_conta: 'D',
      indicador_valor: 'D',
      valor: 0,
    };
  }

  private gerarRegistroJ210(): SpedRegistroJ210 {
    const docs = this.getFinancialDocuments();
    const lucroLiquido = docs
      .filter(d => d.direction === 'receivable')
      .reduce((acc, d) => acc + d.total_amount, 0) -
      docs
        .filter(d => d.direction === 'payable')
        .reduce((acc, d) => acc + d.total_amount, 0);

    return {
      tipo: 'J210',
      codigo_conta: '2.3.04',
      descricao_conta: 'LUCROS/PREJUÍZOS ACUMULADOS',
      nivel_conta: 3,
      natureza_conta: 'C',
      indicador_valor: lucroLiquido >= 0 ? 'C' : 'D',
      valor: Math.abs(lucroLiquido),
    };
  }

  private gerarRegistroJ215(): SpedRegistroJ215 {
    return {
      tipo: 'J215',
      codigo_conta: '2.3.04',
      descricao_conta: 'LUCROS/PREJUÍZOS ACUMULADOS',
      nivel_conta: 3,
      natureza_conta: 'C',
      indicador_valor: 'C',
      valor: 0,
    };
  }

  private gerarRegistroJ930(): SpedRegistroJ930 {
    // Usar import estático em vez de require
    const config = CONTABIL_CONFIG_PADRAO;
    return {
      tipo: 'J930',
      assinante_nome: config.assinante.nome || 'NEXS ENTERPRISE SISTEMAS',
      assinante_cpf: config.assinante.cpf.replace(/\D/g, '') || '12345678901',
      assinante_qualificacao: config.assinante.qualificacao || '01',
      codigo_assinatura: 'ASSINATURA_DIGITAL',
      data_assinatura: new Date().toISOString().replace(/-/g, '').slice(0, 8),
    };
  }

  private gerarRegistroJ935(): SpedRegistroJ935 {
    // Usar import estático em vez de require
    const config = CONTABIL_CONFIG_PADRAO;
    return {
      tipo: 'J935',
      nome_contador: config.empresa.nome_contador || 'CONTADOR RESPONSÁVEL',
      cpf_contador: config.empresa.cpf_contador.replace(/\D/g, '') || '98765432100',
      crc_contador: config.empresa.crc_contador || 'CRC-123456',
      cnpj_contador: config.empresa.cnpj_contador?.replace(/\D/g, '') || '',
      codigo_qualificacao_contador: '00',
    };
  }

  // ===== REGISTROS PADRÃO QUANDO NÃO HÁ DADOS =====

  private gerarRegistro0150Padrao(): SpedRegistro0150 {
    const company = this.getCompany();
    return {
      tipo: '0150',
      codigo_participante: '0001',
      nome_participante: company.legal_name || 'PARTICIPANTE PADRÃO',
      codigo_pais: '1058',
      cnpj_cpf: company.cnpj.replace(/\D/g, '') || '00000000000000',
      codigo_qualificacao: '00',
    };
  }

  private gerarRegistroI150Padrao(): SpedRegistroI150 {
    const hoje = new Date().toISOString().replace(/-/g, '').slice(0, 8);
    return {
      tipo: 'I150',
      data_lancamento: hoje,
      codigo_historico: '1',
      historico_complementar: 'LANÇAMENTO PADRÃO - NEXS ERP',
      codigo_conta: '1.1.04',
      valor: 0,
      indicador_valor: 'D',
    };
  }

  private gerarRegistroI200Padrao(): SpedRegistroI200 {
    const hoje = new Date().toISOString().replace(/-/g, '').slice(0, 8);
    return {
      tipo: 'I200',
      data_lancamento: hoje,
      codigo_historico: '1',
      historico_complementar: 'LANÇAMENTO PADRÃO - NEXS ERP',
      valor: 0,
      codigo_conta_debito: '1.1.04',
      codigo_conta_credito: '3.1.01',
    };
  }

  // ===== MÉTODO PRINCIPAL =====

  public generate(): string {
    try {
      const company = this.getCompany();
      const accounts = this.getFinancialAccounts();
      const people = this.getPeople();
      const docs = this.getFinancialDocuments();

      if (!company) {
        throw new Error('Empresa não encontrada');
      }

      if (accounts.length === 0) {
        throw new Error('Nenhuma conta contábil encontrada. Cadastre pelo menos uma conta.');
      }

      this.registros = [];
      this.contadorLinhas = 0;

      // === BLOCO 0: ABERTURA ===
      this.addRegistro(this.gerarRegistro0000());
      this.addRegistro(this.gerarRegistro0001());
      this.addRegistro(this.gerarRegistro0007());
      this.addRegistro(this.gerarRegistro0020());

      if (people.length > 0) {
        people.forEach(p => {
          this.addRegistro(this.gerarRegistro0150(p));
        });
      } else {
        this.addRegistro(this.gerarRegistro0150Padrao());
      }

      this.addRegistro(this.gerarRegistro0180());

      // === BLOCO I: PLANO DE CONTAS ===
      this.addRegistro(this.gerarRegistroI010());
      this.addRegistro(this.gerarRegistroI012());
      this.addRegistro(this.gerarRegistroI015());

      accounts.forEach(conta => {
        this.addRegistro(this.gerarRegistroI020(conta));
        this.addRegistro(this.gerarRegistroI030(conta));

        if (this.incluirSaldosIniciais) {
          this.addRegistro(this.gerarRegistroI050(conta));
          this.addRegistro(this.gerarRegistroI075(conta));
        }

        this.addRegistro(this.gerarRegistroI100(conta));
      });

      // === BLOCO I: LANÇAMENTOS ===
      if (this.incluirLancamentos && docs.length > 0) {
        docs.forEach(doc => {
          this.addRegistro(this.gerarRegistroI150(doc));
          this.addRegistro(
            this.gerarRegistroI157(
              doc,
              doc.financial_account_id || '1.1.99.999',
              Math.abs(doc.total_amount),
              doc.direction === 'receivable' ? 'D' : 'C'
            )
          );
          this.addRegistro(this.gerarRegistroI200(doc));
          this.addRegistro(
            this.gerarRegistroI250(
              doc.direction === 'receivable' ? '1.1.04' : '4.5.01',
              Math.abs(doc.total_amount),
              doc.direction === 'receivable' ? 'D' : 'C'
            )
          );
        });

        const datas = [...new Set(docs.map(d => d.issue_date))].sort();
        datas.forEach(data => {
          const docsData = docs.filter(d => d.issue_date === data);
          const totalDia = docsData.reduce((acc, d) => {
            const valor = d.direction === 'receivable' ? d.total_amount : -d.total_amount;
            return acc + valor;
          }, 0);

          accounts.forEach(conta => {
            const totalConta = docsData
              .filter(d => d.financial_account_id === conta.id)
              .reduce((acc, d) => {
                const valor = d.direction === 'receivable' ? d.total_amount : -d.total_amount;
                return acc + valor;
              }, 0);

            if (totalConta !== 0) {
              this.addRegistro(this.gerarRegistroI300(data, conta.code, totalConta));
            }
          });

          this.addRegistro(this.gerarRegistroI310(data, '1.1.04', totalDia));
        });
      } else if (this.incluirLancamentos && docs.length === 0) {
        this.addRegistro(this.gerarRegistroI150Padrao());
        this.addRegistro(this.gerarRegistroI200Padrao());
      }

      // === BLOCO J: DEMONSTRAÇÕES ===
      this.addRegistro(this.gerarRegistroJ005());
      this.addRegistro(this.gerarRegistroJ015());
      this.addRegistro(this.gerarRegistroJ020());
      this.addRegistro(this.gerarRegistroJ050());
      this.addRegistro(this.gerarRegistroJ051());
      this.addRegistro(this.gerarRegistroJ100());
      this.addRegistro(this.gerarRegistroJ150());
      this.addRegistro(this.gerarRegistroJ210());
      this.addRegistro(this.gerarRegistroJ215());
      this.addRegistro(this.gerarRegistroJ930());
      this.addRegistro(this.gerarRegistroJ935());

      // === ENCERRAMENTO ===
      const totalLinhas = this.registros.length + 1;
      this.addRegistro({
        tipo: '9990',
        quantidade_linhas: totalLinhas,
      } as SpedRegistro9990);

      this.addRegistro({
        tipo: '9999',
        quantidade_linhas: totalLinhas,
      } as SpedRegistro9999);

      return this.registros.join('\n');
    } catch (error: any) {
      console.error('Erro ao gerar ECD:', error);
      throw new Error(`Falha ao gerar ECD: ${error.message}`);
    }
  }

  public generateAndSave(filePath: string): void {
    const content = this.generate();
    if (typeof window === 'undefined') {
      const fs = require('fs');
      fs.writeFileSync(filePath, content, 'utf-8');
    }
  }

  public getRegistros(): string[] {
    return this.registros;
  }

  public getTotalLinhas(): number {
    return this.contadorLinhas;
  }
}