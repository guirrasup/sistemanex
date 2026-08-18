// src/services/sped/SpedEcfGenerator.ts

import { store } from '../store';
import { 
  SpedRegistro0000_ECF,
  SpedRegistroC001,
  SpedRegistroC010,
  SpedRegistroC040,
  SpedRegistroC100,
  SpedRegistroC200,
  SpedRegistroC300,
  SpedRegistroC400,
  SpedRegistroC500,
  SpedRegistroE001,
  SpedRegistroE010,
  SpedRegistroE100,
  SpedRegistroM001,
  SpedRegistroM100,
  SpedRegistroM200,
  SpedRegistroM300,
  SpedRegistroM350,
  SpedRegistroP001,
  SpedRegistroP010,
  SpedRegistroP100,
  SpedRegistroP150,
  SpedRegistro9990,
  SpedRegistro9999,
} from '../../types/sped';

import { PeriodoConfig } from '../../config/periodo.config';
import { SPED_CONFIG } from '../../config/sped.config';
import { mapearContaParaReferencial } from '../contabil/PlanoContasReferencial';

export interface SpedEcfOptions {
  companyId: string;
  periodo: PeriodoConfig;
  ambiente?: 'homologacao' | 'producao';
  regimeTributario?: 'actual_profit' | 'presumed_profit' | 'simples';
}

export class SpedEcfGenerator {
  private companyId: string;
  private periodo: PeriodoConfig;
  private ambiente: 'homologacao' | 'producao';
  private regimeTributario: string;
  private registros: string[] = [];
  private contadorLinhas: number = 0;

  constructor(options: SpedEcfOptions) {
    this.companyId = options.companyId;
    this.periodo = options.periodo;
    this.ambiente = options.ambiente || 'homologacao';
    this.regimeTributario = options.regimeTributario || 'actual_profit';
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

  private getFinancialDocuments() {
    return store.financialDocuments.filter(d => 
      d.company_id === this.companyId && 
      d.issue_date >= this.periodo.data_inicio &&
      d.issue_date <= this.periodo.data_fim
    );
  }

  private getFiscalDocuments() {
    return store.fiscalDocuments.filter(d =>
      d.company_id === this.companyId &&
      d.issue_date >= this.periodo.data_inicio &&
      d.issue_date <= this.periodo.data_fim &&
      d.status === 'authorized'
    );
  }

  private getCodigoRegime(): string {
    const regimes: Record<string, string> = {
      'actual_profit': '3',
      'presumed_profit': '2',
      'simples': '1',
    };
    return regimes[this.regimeTributario] || '3';
  }

  // ===== BLOCO 0: ABERTURA =====

  private gerarRegistro0000(): SpedRegistro0000_ECF {
    const company = this.getCompany();
    const ano = this.periodo.ano;
    const mesInicio = String(this.periodo.mes_inicio).padStart(2, '0');
    const mesFim = String(this.periodo.mes_fim).padStart(2, '0');
    const ultimoDia = new Date(ano, this.periodo.mes_fim, 0).getDate();

    return {
      tipo: '0000',
      codigo_versao: SPED_CONFIG.ecf.versao,
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
      codigo_indicador: '0',
      data_inicio_escrituracao: `${ano}0101`,
      data_fim_escrituracao: `${ano}1231`,
      numero_ordem: '001',
      tipo_contribuinte: '1',
      codigo_regime_tributario: this.getCodigoRegime(),
    };
  }

  // ===== BLOCO C: IRPJ =====

  private gerarRegistroC001(): SpedRegistroC001 {
    const docs = this.getFinancialDocuments();
    return {
      tipo: 'C001',
      indicador_movimento: docs.length > 0 ? '0' : '1',
    };
  }

  private gerarRegistroC010(): SpedRegistroC010 {
    return {
      tipo: 'C010',
      codigo_identificacao: '1',
      descricao: 'LUCRO REAL',
    };
  }

  private gerarRegistroC040(): SpedRegistroC040 {
    const docs = this.getFinancialDocuments();
    const receitasMercadorias = docs
      .filter(d => d.direction === 'receivable' && d.category_id === 'cat-001')
      .reduce((acc, d) => acc + d.total_amount, 0);

    const receitasServicos = docs
      .filter(d => d.direction === 'receivable' && d.category_id === 'cat-002')
      .reduce((acc, d) => acc + d.total_amount, 0);

    const outrasReceitas = docs
      .filter(d => d.direction === 'receivable' && !['cat-001', 'cat-002'].includes(d.category_id || ''))
      .reduce((acc, d) => acc + d.total_amount, 0);

    return {
      tipo: 'C040',
      codigo_receita: '101',
      descricao_receita: 'RECEITA BRUTA DE VENDAS DE MERCADORIAS',
      valor: receitasMercadorias + receitasServicos + outrasReceitas,
      indicador_ajuste: '0',
    };
  }

  private gerarRegistroC100(): SpedRegistroC100 {
    const docs = this.getFinancialDocuments();
    const receitaBruta = docs
      .filter(d => d.direction === 'receivable')
      .reduce((acc, d) => acc + d.total_amount, 0);

    const fiscalDocs = this.getFiscalDocuments();
    const deducoes = fiscalDocs.reduce((acc, d) => 
      acc + (d.icms_value || 0) + (d.pis_value || 0) + (d.cofins_value || 0) +
      (d.cbs_value || 0) + (d.ibs_value || 0), 0);

    const despesas = docs
      .filter(d => d.direction === 'payable')
      .reduce((acc, d) => acc + d.total_amount, 0);

    const receitaLiquida = receitaBruta - deducoes;
    const lucroBruto = receitaLiquida - (despesas * 0.5);
    const lucroOperacional = lucroBruto - (despesas * 0.3);

    return {
      tipo: 'C100',
      codigo_receita: '101',
      valor_receita_bruta: receitaBruta,
      valor_deducao: deducoes,
      valor_receita_liquida: receitaLiquida,
      valor_custo: despesas * 0.5,
      valor_lucro_bruto: lucroBruto,
      valor_despesas_operacionais: despesas * 0.3,
      valor_resultado_operacional: lucroOperacional,
      valor_resultado_antes_ir: lucroOperacional,
    };
  }

  private gerarRegistroC200(): SpedRegistroC200 {
    const docs = this.getFinancialDocuments();
    const receitaServicos = docs
      .filter(d => d.direction === 'receivable' && d.category_id === 'cat-002')
      .reduce((acc, d) => acc + d.total_amount, 0);

    return {
      tipo: 'C200',
      codigo_receita: '102',
      valor_bruto: receitaServicos,
      valor_deducao: 0,
      valor_liquido: receitaServicos,
    };
  }

  private gerarRegistroC300(): SpedRegistroC300 {
    const fiscalDocs = this.getFiscalDocuments();
    const cbsTotal = fiscalDocs.reduce((acc, d) => acc + (d.cbs_value || 0), 0);
    const ibsTotal = fiscalDocs.reduce((acc, d) => acc + (d.ibs_value || 0), 0);

    return {
      tipo: 'C300',
      codigo_ajuste: '101',
      descricao_ajuste: 'CBS e IBS - Reforma Tributária',
      valor_ajuste: cbsTotal + ibsTotal,
      indicador_ajuste: 'D',
    };
  }

  private gerarRegistroC400(): SpedRegistroC400 {
    const fiscalDocs = this.getFiscalDocuments();
    const icmsTotal = fiscalDocs.reduce((acc, d) => acc + (d.icms_value || 0), 0);

    return {
      tipo: 'C400',
      codigo_ajuste: '102',
      descricao_ajuste: 'ICMS sobre Vendas',
      valor_ajuste: icmsTotal,
      indicador_ajuste: 'D',
      codigo_conta: '3.2.01',
    };
  }

  private gerarRegistroC500(): SpedRegistroC500 {
    const docs = this.getFinancialDocuments();
    const receitaBruta = docs
      .filter(d => d.direction === 'receivable')
      .reduce((acc, d) => acc + d.total_amount, 0);

    const lucroReal = receitaBruta * 0.32;
    const irpjDevido = lucroReal * 0.15;
    const csllDevido = lucroReal * 0.09;

    return {
      tipo: 'C500',
      codigo_receita: '101',
      valor_compensacao: 0,
      valor_irpj_devido: irpjDevido,
      valor_csll_devido: csllDevido,
    };
  }

  // ===== BLOCO E: CSLL =====

  private gerarRegistroE001(): SpedRegistroE001 {
    const docs = this.getFinancialDocuments();
    return {
      tipo: 'E001',
      indicador_movimento: docs.length > 0 ? '0' : '1',
    };
  }

  private gerarRegistroE010(): SpedRegistroE010 {
    return {
      tipo: 'E010',
      codigo_identificacao: '1',
      descricao: 'APURAÇÃO CSLL',
    };
  }

  private gerarRegistroE100(): SpedRegistroE100 {
    const docs = this.getFinancialDocuments();
    const receitaBruta = docs
      .filter(d => d.direction === 'receivable')
      .reduce((acc, d) => acc + d.total_amount, 0);

    const baseCalculo = receitaBruta * 0.32;
    const csllDevido = baseCalculo * 0.09;

    return {
      tipo: 'E100',
      valor_base_calculo: baseCalculo,
      valor_csll_devido: csllDevido,
      valor_compensacao: 0,
      valor_recolhido: csllDevido * 0.5,
    };
  }

  // ===== BLOCO M: APURAÇÃO =====

  private gerarRegistroM001(): SpedRegistroM001 {
    const docs = this.getFinancialDocuments();
    return {
      tipo: 'M001',
      indicador_movimento: docs.length > 0 ? '0' : '1',
    };
  }

  private gerarRegistroM100(): SpedRegistroM100 {
    const docs = this.getFinancialDocuments();
    const debitos = docs
      .filter(d => d.direction === 'payable')
      .reduce((acc, d) => acc + d.total_amount, 0);

    const creditos = docs
      .filter(d => d.direction === 'receivable')
      .reduce((acc, d) => acc + d.total_amount, 0);

    return {
      tipo: 'M100',
      codigo_conta: '1.1.04',
      valor_debito: debitos,
      valor_credito: creditos,
      saldo: creditos - debitos,
    };
  }

  private gerarRegistroM200(): SpedRegistroM200 {
    const docs = this.getFinancialDocuments();
    const receitas = docs
      .filter(d => d.direction === 'receivable')
      .reduce((acc, d) => acc + d.total_amount, 0);

    const fiscalDocs = this.getFiscalDocuments();
    const impostos = fiscalDocs.reduce((acc, d) => 
      acc + (d.icms_value || 0) + (d.pis_value || 0) + (d.cofins_value || 0), 0);

    return {
      tipo: 'M200',
      codigo_conta: '3.1.01',
      valor_bruto: receitas,
      valor_deducao: impostos,
      valor_liquido: receitas - impostos,
    };
  }

  private gerarRegistroM300(): SpedRegistroM300 {
    const docs = this.getFinancialDocuments();
    const despesas = docs
      .filter(d => d.direction === 'payable')
      .reduce((acc, d) => acc + d.total_amount, 0);

    return {
      tipo: 'M300',
      codigo_conta: '4.1.01',
      valor: despesas,
      indicador_valor: 'D',
    };
  }

  private gerarRegistroM350(): SpedRegistroM350 {
    const docs = this.getFinancialDocuments();
    const despesasAdm = docs
      .filter(d => d.direction === 'payable' && d.category_id === 'cat-005')
      .reduce((acc, d) => acc + d.total_amount, 0);

    return {
      tipo: 'M350',
      codigo_conta: '4.2.01',
      valor: despesasAdm,
      indicador_valor: 'D',
      codigo_centro_custo: 'CC-001',
    };
  }

  // ===== BLOCO P: PATRIMÔNIO LÍQUIDO =====

  private gerarRegistroP001(): SpedRegistroP001 {
    return {
      tipo: 'P001',
      indicador_movimento: '0',
    };
  }

  private gerarRegistroP010(): SpedRegistroP010 {
    const docs = this.getFinancialDocuments();
    const lucro = docs
      .filter(d => d.direction === 'receivable')
      .reduce((acc, d) => acc + d.total_amount, 0) -
      docs
        .filter(d => d.direction === 'payable')
        .reduce((acc, d) => acc + d.total_amount, 0);

    return {
      tipo: 'P010',
      codigo_conta: '2.3.04',
      descricao_conta: 'LUCROS/PREJUÍZOS ACUMULADOS',
      nivel_conta: 3,
      natureza_conta: 'C',
      saldo_inicial: lucro > 0 ? 0 : Math.abs(lucro),
      saldo_final: lucro > 0 ? lucro : 0,
    };
  }

  private gerarRegistroP100(): SpedRegistroP100 {
    const docs = this.getFinancialDocuments();
    const lucro = docs
      .filter(d => d.direction === 'receivable')
      .reduce((acc, d) => acc + d.total_amount, 0) -
      docs
        .filter(d => d.direction === 'payable')
        .reduce((acc, d) => acc + d.total_amount, 0);

    return {
      tipo: 'P100',
      codigo_conta: '2.3.04',
      valor: lucro > 0 ? lucro : 0,
      indicador_valor: 'C',
    };
  }

  private gerarRegistroP150(): SpedRegistroP150 {
    const docs = this.getFinancialDocuments();
    const prejuizo = docs
      .filter(d => d.direction === 'payable')
      .reduce((acc, d) => acc + d.total_amount, 0) -
      docs
        .filter(d => d.direction === 'receivable')
        .reduce((acc, d) => acc + d.total_amount, 0);

    return {
      tipo: 'P150',
      codigo_conta: '2.3.04',
      valor: prejuizo > 0 ? prejuizo : 0,
      indicador_valor: 'D',
      codigo_centro_custo: 'CC-001',
    };
  }

  // ===== REGISTROS PADRÃO QUANDO NÃO HÁ DADOS =====

  private gerarRegistroC040Padrao(): SpedRegistroC040 {
    return {
      tipo: 'C040',
      codigo_receita: '101',
      descricao_receita: 'RECEITA BRUTA DE VENDAS DE MERCADORIAS',
      valor: 0,
      indicador_ajuste: '0',
    };
  }

  private gerarRegistroC100Padrao(): SpedRegistroC100 {
    return {
      tipo: 'C100',
      codigo_receita: '101',
      valor_receita_bruta: 0,
      valor_deducao: 0,
      valor_receita_liquida: 0,
      valor_custo: 0,
      valor_lucro_bruto: 0,
      valor_despesas_operacionais: 0,
      valor_resultado_operacional: 0,
      valor_resultado_antes_ir: 0,
    };
  }

  private gerarRegistroM100Padrao(): SpedRegistroM100 {
    return {
      tipo: 'M100',
      codigo_conta: '1.1.04',
      valor_debito: 0,
      valor_credito: 0,
      saldo: 0,
    };
  }

  // ===== MÉTODO PRINCIPAL =====

  public generate(): string {
    try {
      const company = this.getCompany();
      const docs = this.getFinancialDocuments();

      if (!company) {
        throw new Error('Empresa não encontrada');
      }

      this.registros = [];
      this.contadorLinhas = 0;

      // === BLOCO 0: ABERTURA ===
      this.addRegistro(this.gerarRegistro0000());

      // === BLOCO C: IRPJ ===
      this.addRegistro(this.gerarRegistroC001());
      this.addRegistro(this.gerarRegistroC010());
      
      if (docs.length > 0) {
        this.addRegistro(this.gerarRegistroC040());
        this.addRegistro(this.gerarRegistroC100());
        this.addRegistro(this.gerarRegistroC200());
        this.addRegistro(this.gerarRegistroC300());
        this.addRegistro(this.gerarRegistroC400());
        this.addRegistro(this.gerarRegistroC500());
      } else {
        this.addRegistro(this.gerarRegistroC040Padrao());
        this.addRegistro(this.gerarRegistroC100Padrao());
        this.addRegistro(this.gerarRegistroC200());
        this.addRegistro(this.gerarRegistroC300());
        this.addRegistro(this.gerarRegistroC400());
        this.addRegistro(this.gerarRegistroC500());
      }

      // === BLOCO E: CSLL ===
      this.addRegistro(this.gerarRegistroE001());
      this.addRegistro(this.gerarRegistroE010());
      this.addRegistro(this.gerarRegistroE100());

      // === BLOCO M: APURAÇÃO ===
      this.addRegistro(this.gerarRegistroM001());
      
      if (docs.length > 0) {
        this.addRegistro(this.gerarRegistroM100());
        this.addRegistro(this.gerarRegistroM200());
        this.addRegistro(this.gerarRegistroM300());
        this.addRegistro(this.gerarRegistroM350());
      } else {
        this.addRegistro(this.gerarRegistroM100Padrao());
        this.addRegistro(this.gerarRegistroM200());
        this.addRegistro(this.gerarRegistroM300());
        this.addRegistro(this.gerarRegistroM350());
      }

      // === BLOCO P: PATRIMÔNIO LÍQUIDO ===
      this.addRegistro(this.gerarRegistroP001());
      this.addRegistro(this.gerarRegistroP010());
      this.addRegistro(this.gerarRegistroP100());
      this.addRegistro(this.gerarRegistroP150());

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
      console.error('Erro ao gerar ECF:', error);
      throw new Error(`Falha ao gerar ECF: ${error.message}`);
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