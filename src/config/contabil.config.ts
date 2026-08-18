// src/config/contabil.config.ts

export interface ContabilConfig {
  empresa: {
    nome_contador: string;
    cpf_contador: string;
    crc_contador: string;
    cnpj_contador?: string;
    telefone_contador?: string;
    email_contador?: string;
  };
  assinante: {
    nome: string;
    cpf: string;
    qualificacao: string;
  };
  periodos: {
    ecd: {
      dia_inicio: number;
      dia_fim: number;
    };
    ecf: {
      dia_inicio: number;
      dia_fim: number;
    };
    apuracao: {
      dia_referencia: number;
    };
  };
  sped: {
    versao: string;
    ambiente: 'homologacao' | 'producao';
  };
}

export const CONTABIL_CONFIG_PADRAO: ContabilConfig = {
  empresa: {
    nome_contador: 'CONTADOR RESPONSÁVEL',
    cpf_contador: '000.000.000-00',
    crc_contador: 'CRC-000000',
    cnpj_contador: '00.000.000/0001-00',
    telefone_contador: '(00) 0000-0000',
    email_contador: 'contador@empresa.com.br',
  },
  assinante: {
    nome: 'NEXS ENTERPRISE SISTEMAS',
    cpf: '000.000.000-00',
    qualificacao: '01',
  },
  periodos: {
    ecd: {
      dia_inicio: 1,
      dia_fim: 31,
    },
    ecf: {
      dia_inicio: 1,
      dia_fim: 31,
    },
    apuracao: {
      dia_referencia: 1,
    },
  },
  sped: {
    versao: '9.0',
    ambiente: 'homologacao',
  },
};

export function getContabilConfig(): ContabilConfig {
  // Em produção, carregar do localStorage ou API
  return CONTABIL_CONFIG_PADRAO;
}