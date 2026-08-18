// src/types/sped.ts

export type SpedRegistro =
  | SpedRegistro0000
  | SpedRegistro0001
  | SpedRegistro0007
  | SpedRegistro0020
  | SpedRegistro0150
  | SpedRegistro0180
  | SpedRegistroI010
  | SpedRegistroI012
  | SpedRegistroI015
  | SpedRegistroI020
  | SpedRegistroI030
  | SpedRegistroI050
  | SpedRegistroI075
  | SpedRegistroI100
  | SpedRegistroI150
  | SpedRegistroI157
  | SpedRegistroI200
  | SpedRegistroI250
  | SpedRegistroI300
  | SpedRegistroI310
  | SpedRegistroI350
  | SpedRegistroI355
  | SpedRegistroI500
  | SpedRegistroI510
  | SpedRegistroI550
  | SpedRegistroI555
  | SpedRegistroJ005
  | SpedRegistroJ015
  | SpedRegistroJ020
  | SpedRegistroJ050
  | SpedRegistroJ051
  | SpedRegistroJ100
  | SpedRegistroJ150
  | SpedRegistroJ210
  | SpedRegistroJ215
  | SpedRegistroJ930
  | SpedRegistroJ935
  | SpedRegistro9999
  | SpedRegistro9990;

// ===== BLOCO 0: ABERTURA =====

export interface SpedRegistro0000 {
  tipo: '0000';
  codigo_versao: string;        // '9.0'
  tipo_escrituracao: string;    // '0' - Contábil
  indicador_situacao: string;   // '0' - Normal
  nivel: string;                // '0' - Empresa
  cnpj: string;
  razao_social: string;
  nome_fantasia?: string;
  uf: string;
  municipio: string;
  cep: string;
  codigo_pais: string;          // '1058' - Brasil
  codigo_ibge: string;
  inscricao_estadual?: string;
  inscricao_municipal?: string;
  data_inicio: string;          // AAAAMMDD
  data_fim: string;             // AAAAMMDD
  finalidade: string;           // '0' - Original
  codigo_qualificacao: string;  // '00' - Contribuinte
  indice_remessa: string;       // '0' - SPED
}

export interface SpedRegistro0001 {
  tipo: '0001';
  indicador_movimento: '0' | '1'; // 0 - Com dados, 1 - Sem dados
}

export interface SpedRegistro0007 {
  tipo: '0007';
  codigo_empresa: string;
  inscricao_suframa?: string;
}

export interface SpedRegistro0020 {
  tipo: '0020';
  cnpj_empresa?: string;
  cpf?: string;
  inscricao_estadual?: string;
  codigo_identificador_empresa: string; // 1 - IE, 2 - CNPJ, 3 - CPF
  codigo_indicador_ie: string; // 1 - Contribuinte, 2 - Isento, 9 - Não se aplica
}

export interface SpedRegistro0150 {
  tipo: '0150';
  codigo_participante: string;
  nome_participante: string;
  codigo_pais: string;
  cnpj_cpf: string;
  inscricao_estadual?: string;
  codigo_qualificacao: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

export interface SpedRegistro0180 {
  tipo: '0180';
  codigo_identificacao: string;
  descricao: string;
  data_inicio: string;
  data_fim?: string;
}

// ===== BLOCO I: PLANO DE CONTAS =====

export interface SpedRegistroI010 {
  tipo: 'I010';
  indicador_plano: '0' | '1'; // 0 - Empresarial, 1 - Simplificado
  codigo_plano: string;
  descricao_plano: string;
  data_inicio: string;
  data_fim: string;
}

export interface SpedRegistroI012 {
  tipo: 'I012';
  numero_versao: string; // '9.0'
  codigo_hash?: string;
}

export interface SpedRegistroI015 {
  tipo: 'I015';
  codigo_identificacao: string;
}

export interface SpedRegistroI020 {
  tipo: 'I020';
  codigo_conta: string;
  descricao_conta: string;
  tipo_conta: 'S' | 'A'; // S - Sintética, A - Analítica
  natureza_conta: 'D' | 'C'; // D - Débito, C - Crédito
  nivel_conta: number;
  codigo_conta_superior?: string;
  data_inicio: string;
  data_fim?: string;
  codigo_plano_referencial?: string;
}

export interface SpedRegistroI030 {
  tipo: 'I030';
  codigo_conta: string;
  codigo_ccus?: string;
  codigo_centro_custo?: string;
}

export interface SpedRegistroI050 {
  tipo: 'I050';
  data_inicio: string;
  codigo_conta: string;
  saldo_inicial: number;
  indicador_saldo_inicial: 'D' | 'C';
}

export interface SpedRegistroI075 {
  tipo: 'I075';
  data_inicio: string;
  codigo_conta: string;
  valor: number;
  indicador_valor: 'D' | 'C';
  historico: string;
}

export interface SpedRegistroI100 {
  tipo: 'I100';
  data_inicio: string;
  data_fim: string;
  codigo_conta: string;
  saldo_inicial: number;
  indicador_saldo_inicial: 'D' | 'C';
  saldo_final: number;
  indicador_saldo_final: 'D' | 'C';
}

// ===== BLOCO I: LANÇAMENTOS =====

export interface SpedRegistroI150 {
  tipo: 'I150';
  data_lancamento: string;
  codigo_historico: string;
  historico_complementar?: string;
  codigo_conta: string;
  valor: number;
  indicador_valor: 'D' | 'C';
  codigo_centro_custo?: string;
}

export interface SpedRegistroI157 {
  tipo: 'I157';
  codigo_conta: string;
  codigo_centro_custo?: string;
  valor: number;
}

export interface SpedRegistroI200 {
  tipo: 'I200';
  data_lancamento: string;
  codigo_historico: string;
  historico_complementar?: string;
  valor: number;
  codigo_conta_debito?: string;
  codigo_conta_credito?: string;
}

export interface SpedRegistroI250 {
  tipo: 'I250';
  codigo_conta: string;
  valor: number;
  indicador_valor: 'D' | 'C';
  codigo_centro_custo?: string;
}

// ===== BLOCO I: SALDOS =====

export interface SpedRegistroI300 {
  tipo: 'I300';
  data: string;
  codigo_conta: string;
  valor: number;
  indicador_valor: 'D' | 'C';
}

export interface SpedRegistroI310 {
  tipo: 'I310';
  data: string;
  codigo_conta: string;
  valor: number;
  indicador_valor: 'D' | 'C';
}

export interface SpedRegistroI350 {
  tipo: 'I350';
  data: string;
  codigo_conta: string;
  valor: number;
  indicador_valor: 'D' | 'C';
  codigo_centro_custo?: string;
}

export interface SpedRegistroI355 {
  tipo: 'I355';
  codigo_conta: string;
  valor: number;
  indicador_valor: 'D' | 'C';
  codigo_centro_custo?: string;
}

// ===== BLOCO I: APURAÇÃO =====

export interface SpedRegistroI500 {
  tipo: 'I500';
  codigo_conta: string;
  valor: number;
  indicador_valor: 'D' | 'C';
}

export interface SpedRegistroI510 {
  tipo: 'I510';
  codigo_conta: string;
  valor: number;
  indicador_valor: 'D' | 'C';
  codigo_centro_custo?: string;
}

export interface SpedRegistroI550 {
  tipo: 'I550';
  codigo_conta: string;
  valor: number;
  indicador_valor: 'D' | 'C';
  codigo_historico: string;
  historico_complementar?: string;
}

export interface SpedRegistroI555 {
  tipo: 'I555';
  codigo_conta: string;
  valor: number;
  indicador_valor: 'D' | 'C';
}

// ===== BLOCO J: DEMONSTRAÇÕES CONTÁBEIS =====

export interface SpedRegistroJ005 {
  tipo: 'J005';
  data_inicio: string;
  data_fim: string;
  indicador_situacao: '0' | '1'; // 0 - Normal, 1 - Com ajustes
}

export interface SpedRegistroJ015 {
  tipo: 'J015';
  codigo_conta: string;
  descricao_conta: string;
  nivel_conta: number;
  natureza_conta: 'D' | 'C';
  indicador_valor: 'D' | 'C';
  valor: number;
}

export interface SpedRegistroJ020 {
  tipo: 'J020';
  codigo_conta: string;
  descricao_conta: string;
  nivel_conta: number;
  natureza_conta: 'D' | 'C';
  indicador_valor: 'D' | 'C';
  valor: number;
  codigo_conta_superior?: string;
}

export interface SpedRegistroJ050 {
  tipo: 'J050';
  data: string;
  codigo_conta: string;
  descricao_conta: string;
  nivel_conta: number;
  natureza_conta: 'D' | 'C';
  indicador_valor: 'D' | 'C';
  valor: number;
}

export interface SpedRegistroJ051 {
  tipo: 'J051';
  codigo_conta: string;
  descricao_conta: string;
  nivel_conta: number;
  natureza_conta: 'D' | 'C';
  indicador_valor: 'D' | 'C';
  valor: number;
}

export interface SpedRegistroJ100 {
  tipo: 'J100';
  codigo_conta: string;
  descricao_conta: string;
  nivel_conta: number;
  natureza_conta: 'D' | 'C';
  indicador_valor: 'D' | 'C';
  valor: number;
  codigo_conta_superior?: string;
}

export interface SpedRegistroJ150 {
  tipo: 'J150';
  codigo_conta: string;
  descricao_conta: string;
  nivel_conta: number;
  natureza_conta: 'D' | 'C';
  indicador_valor: 'D' | 'C';
  valor: number;
}

export interface SpedRegistroJ210 {
  tipo: 'J210';
  codigo_conta: string;
  descricao_conta: string;
  nivel_conta: number;
  natureza_conta: 'D' | 'C';
  indicador_valor: 'D' | 'C';
  valor: number;
}

export interface SpedRegistroJ215 {
  tipo: 'J215';
  codigo_conta: string;
  descricao_conta: string;
  nivel_conta: number;
  natureza_conta: 'D' | 'C';
  indicador_valor: 'D' | 'C';
  valor: number;
}

// ===== BLOCO J: ENCERRAMENTO =====

export interface SpedRegistroJ930 {
  tipo: 'J930';
  assinante_nome: string;
  assinante_cpf: string;
  assinante_qualificacao: string;
  codigo_assinatura: string;
  data_assinatura: string;
}

export interface SpedRegistroJ935 {
  tipo: 'J935';
  nome_contador: string;
  cpf_contador: string;
  crc_contador: string;
  cnpj_contador?: string;
  cep_contador?: string;
  endereco_contador?: string;
  numero_contador?: string;
  complemento_contador?: string;
  bairro_contador?: string;
  cidade_contador?: string;
  estado_contador?: string;
  fone_contador?: string;
  email_contador?: string;
  codigo_qualificacao_contador: string;
}

// ===== ENCERRAMENTO =====

export interface SpedRegistro9990 {
  tipo: '9990';
  quantidade_linhas: number;
}

export interface SpedRegistro9999 {
  tipo: '9999';
  quantidade_linhas: number;
}

// src/types/sped.ts (adicionar)

// ===== BLOCO 0: ABERTURA (ECF) =====

export interface SpedRegistro0000_ECF {
  tipo: '0000';
  codigo_versao: string;        // '9.0'
  tipo_escrituracao: string;    // '0' - Contábil
  indicador_situacao: string;   // '0' - Normal
  nivel: string;                // '0' - Empresa
  cnpj: string;
  razao_social: string;
  nome_fantasia?: string;
  uf: string;
  municipio: string;
  cep: string;
  codigo_pais: string;
  codigo_ibge: string;
  inscricao_estadual?: string;
  inscricao_municipal?: string;
  data_inicio: string;
  data_fim: string;
  finalidade: string;
  codigo_qualificacao: string;
  indice_remessa: string;
  codigo_indicador: string;     // '0' - Original
  data_inicio_escrituracao: string;
  data_fim_escrituracao: string;
  numero_ordem: string;
  tipo_contribuinte: string;    // '1' - PJ, '2' - PF
  codigo_regime_tributario: string; // '3' - Lucro Real
}

// ===== BLOCO C: IRPJ =====

export interface SpedRegistroC001 {
  tipo: 'C001';
  indicador_movimento: '0' | '1';
}

export interface SpedRegistroC010 {
  tipo: 'C010';
  codigo_identificacao: string; // '1' - Lucro Real
  descricao: string;
}

export interface SpedRegistroC040 {
  tipo: 'C040';
  codigo_receita: string;
  descricao_receita: string;
  valor: number;
  indicador_ajuste: '0' | '1';
}

export interface SpedRegistroC100 {
  tipo: 'C100';
  codigo_receita: string;
  valor_receita_bruta: number;
  valor_deducao: number;
  valor_receita_liquida: number;
  valor_custo: number;
  valor_lucro_bruto: number;
  valor_despesas_operacionais: number;
  valor_resultado_operacional: number;
  valor_resultado_antes_ir: number;
}

export interface SpedRegistroC200 {
  tipo: 'C200';
  codigo_receita: string;
  valor_bruto: number;
  valor_deducao: number;
  valor_liquido: number;
}

export interface SpedRegistroC300 {
  tipo: 'C300';
  codigo_ajuste: string;
  descricao_ajuste: string;
  valor_ajuste: number;
  indicador_ajuste: 'A' | 'D'; // A - Adição, D - Dedução
}

export interface SpedRegistroC400 {
  tipo: 'C400';
  codigo_ajuste: string;
  descricao_ajuste: string;
  valor_ajuste: number;
  indicador_ajuste: 'A' | 'D';
  codigo_conta: string;
}

export interface SpedRegistroC500 {
  tipo: 'C500';
  codigo_receita: string;
  valor_compensacao: number;
  valor_irpj_devido: number;
  valor_csll_devido: number;
}

// ===== BLOCO E: CSLL =====

export interface SpedRegistroE001 {
  tipo: 'E001';
  indicador_movimento: '0' | '1';
}

export interface SpedRegistroE010 {
  tipo: 'E010';
  codigo_identificacao: string;
  descricao: string;
}

export interface SpedRegistroE100 {
  tipo: 'E100';
  valor_base_calculo: number;
  valor_csll_devido: number;
  valor_compensacao: number;
  valor_recolhido: number;
}

// ===== BLOCO M: APURAÇÃO =====

export interface SpedRegistroM001 {
  tipo: 'M001';
  indicador_movimento: '0' | '1';
}

export interface SpedRegistroM100 {
  tipo: 'M100';
  codigo_conta: string;
  valor_debito: number;
  valor_credito: number;
  saldo: number;
}

export interface SpedRegistroM200 {
  tipo: 'M200';
  codigo_conta: string;
  valor_bruto: number;
  valor_deducao: number;
  valor_liquido: number;
}

export interface SpedRegistroM300 {
  tipo: 'M300';
  codigo_conta: string;
  valor: number;
  indicador_valor: 'D' | 'C';
}

export interface SpedRegistroM350 {
  tipo: 'M350';
  codigo_conta: string;
  valor: number;
  indicador_valor: 'D' | 'C';
  codigo_centro_custo?: string;
}

// ===== BLOCO P: PATRIMÔNIO LÍQUIDO =====

export interface SpedRegistroP001 {
  tipo: 'P001';
  indicador_movimento: '0' | '1';
}

export interface SpedRegistroP010 {
  tipo: 'P010';
  codigo_conta: string;
  descricao_conta: string;
  nivel_conta: number;
  natureza_conta: 'D' | 'C';
  saldo_inicial: number;
  saldo_final: number;
}

export interface SpedRegistroP100 {
  tipo: 'P100';
  codigo_conta: string;
  valor: number;
  indicador_valor: 'D' | 'C';
}

export interface SpedRegistroP150 {
  tipo: 'P150';
  codigo_conta: string;
  valor: number;
  indicador_valor: 'D' | 'C';
  codigo_centro_custo?: string;
}