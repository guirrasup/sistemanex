// src/services/sped/SpedRegistros.ts

/**
 * Registros obrigatórios por tipo de SPED
 */
export const REGISTROS_OBRIGATORIOS_ECD = [
  '0000', '0001', '0007', '0020', '0150', '0180',
  'I010', 'I012', 'I015', 'I020', 'I030', 'I050',
  'I075', 'I100', 'I150', 'I157', 'I200', 'I250',
  'I300', 'I310', 'I350', 'I355', 'I500', 'I510',
  'I550', 'I555', 'J005', 'J015', 'J020', 'J050',
  'J051', 'J100', 'J150', 'J210', 'J215', 'J930',
  'J935', '9990', '9999'
];

export const REGISTROS_OBRIGATORIOS_ECF = [
  '0000', 'C001', 'C010', 'C040', 'C100', 'C200',
  'C300', 'C400', 'C500', 'E001', 'E010', 'E100',
  'M001', 'M100', 'M200', 'M300', 'M350',
  'P001', 'P010', 'P100', 'P150',
  '9990', '9999'
];

/**
 * Campos obrigatórios por registro
 */
export const CAMPOS_REGISTRO_0000 = [
  'tipo', 'codigo_versao', 'tipo_escrituracao',
  'indicador_situacao', 'nivel', 'cnpj', 'razao_social',
  'nome_fantasia', 'uf', 'municipio', 'cep',
  'codigo_pais', 'codigo_ibge', 'inscricao_estadual',
  'inscricao_municipal', 'data_inicio', 'data_fim',
  'finalidade', 'codigo_qualificacao', 'indice_remessa'
];

export const CAMPOS_REGISTRO_I020 = [
  'tipo', 'codigo_conta', 'descricao_conta', 'tipo_conta',
  'natureza_conta', 'nivel_conta', 'codigo_conta_superior',
  'data_inicio', 'data_fim', 'codigo_plano_referencial'
];

export const CAMPOS_REGISTRO_J930 = [
  'tipo', 'assinante_nome', 'assinante_cpf',
  'assinante_qualificacao', 'codigo_assinatura', 'data_assinatura'
];

export const CAMPOS_REGISTRO_J935 = [
  'tipo', 'nome_contador', 'cpf_contador', 'crc_contador',
  'cnpj_contador', 'cep_contador', 'endereco_contador',
  'numero_contador', 'complemento_contador', 'bairro_contador',
  'cidade_contador', 'estado_contador', 'fone_contador',
  'email_contador', 'codigo_qualificacao_contador'
];

/**
 * Registros por bloco
 */
export function getRegistrosPorBloco(bloco: string): string[] {
  const mapa: Record<string, string[]> = {
    '0': ['0000', '0001', '0007', '0020', '0150', '0180'],
    'I': ['I010', 'I012', 'I015', 'I020', 'I030', 'I050', 'I075', 'I100', 'I150', 'I157', 'I200', 'I250', 'I300', 'I310', 'I350', 'I355', 'I500', 'I510', 'I550', 'I555'],
    'J': ['J005', 'J015', 'J020', 'J050', 'J051', 'J100', 'J150', 'J210', 'J215', 'J930', 'J935'],
  };
  return mapa[bloco] || [];
}

/**
 * Verifica se um registro é obrigatório
 */
export function isRegistroObrigatorio(registro: string, tipo: 'ecd' | 'ecf'): boolean {
  const obrigatorios = tipo === 'ecd' ? REGISTROS_OBRIGATORIOS_ECD : REGISTROS_OBRIGATORIOS_ECF;
  return obrigatorios.includes(registro);
}

/**
 * Retorna a descrição de um registro
 */
export function getDescricaoRegistro(registro: string): string {
  const descricoes: Record<string, string> = {
    '0000': 'Abertura do Arquivo Digital',
    '0001': 'Abertura do Bloco 0',
    '0007': 'Dados da Empresa',
    '0020': 'Dados Complementares',
    '0150': 'Tabela de Participantes',
    '0180': 'Identificação do Histórico',
    'I010': 'Abertura do Bloco I',
    'I012': 'Versão do Plano de Contas',
    'I015': 'Identificação do Plano',
    'I020': 'Plano de Contas',
    'I030': 'Centro de Custos',
    'I050': 'Saldo Inicial',
    'I075': 'Lançamentos em Contas de Resultado',
    'I100': 'Saldos Periódicos',
    'I150': 'Lançamentos',
    'I157': 'Complemento do I150',
    'I200': 'Lançamentos com Débito/Crédito',
    'I250': 'Complemento do I200',
    'I300': 'Saldos Diários',
    'I310': 'Saldos Mensais',
    'I350': 'Saldos por Centro de Custo',
    'I355': 'Complemento do I350',
    'I500': 'Apuração',
    'I510': 'Complemento do I500',
    'I550': 'Apuração Detalhada',
    'I555': 'Complemento do I550',
    'J005': 'Abertura do Bloco J',
    'J015': 'Demonstração do Resultado',
    'J020': 'Balanço Patrimonial',
    'J050': 'Demonstração',
    'J051': 'Complemento do J050',
    'J100': 'Balanço',
    'J150': 'Complemento do J100',
    'J210': 'DRE',
    'J215': 'Complemento do J210',
    'J930': 'Encerramento do Bloco J',
    'J935': 'Dados do Contador',
    '9990': 'Encerramento do Arquivo Digital',
    '9999': 'Fim do Arquivo Digital',
    // ECF
    'C001': 'Abertura do Bloco C',
    'C010': 'Identificação',
    'C040': 'Detalhamento de Receita',
    'C100': 'Apuração do IRPJ',
    'C200': 'Receita de Serviços',
    'C300': 'Ajustes',
    'C400': 'Ajustes com Conta',
    'C500': 'Compensações',
    'E001': 'Abertura do Bloco E',
    'E010': 'Identificação CSLL',
    'E100': 'Apuração CSLL',
    'M001': 'Abertura do Bloco M',
    'M100': 'Apuração Contábil',
    'M200': 'Apuração por Conta',
    'M300': 'Apuração de Despesas',
    'M350': 'Apuração por Centro',
    'P001': 'Abertura do Bloco P',
    'P010': 'Detalhamento PL',
    'P100': 'Movimentação PL',
    'P150': 'Complemento PL',
  };
  return descricoes[registro] || registro;
}

/**
 * Valida se um CPF/CNPJ é válido (wrapper)
 */
export function validarDocumento(doc: string): boolean {
  const clean = doc.replace(/\D/g, '');
  if (clean.length === 11) return validarCPF(clean);
  if (clean.length === 14) return validarCNPJ(clean);
  return false;
}

/**
 * Valida CPF
 */
function validarCPF(cpf: string): boolean {
  if (cpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf[i]) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf[i]) * (11 - i);
  }
  resto = 11 - (soma % 11);
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf[10])) return false;

  return true;
}

/**
 * Valida CNPJ
 */
function validarCNPJ(cnpj: string): boolean {
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1+$/.test(cnpj)) return false;

  let tamanho = 12;
  let soma = 0;
  let pos = 0;
  const pesos = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  for (let i = 0; i < tamanho; i++) {
    soma += parseInt(cnpj[i]) * pesos[pos];
    pos++;
  }

  let resto = soma % 11;
  let digito = resto < 2 ? 0 : 11 - resto;
  if (digito !== parseInt(cnpj[12])) return false;

  tamanho = 13;
  soma = 0;
  pos = 0;
  const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  for (let i = 0; i < tamanho; i++) {
    soma += parseInt(cnpj[i]) * pesos2[pos];
    pos++;
  }

  resto = soma % 11;
  digito = resto < 2 ? 0 : 11 - resto;
  if (digito !== parseInt(cnpj[13])) return false;

  return true;
}