// src/config/sistema.config.ts
export const SISTEMA_CONFIG = {
  empresa: {
    regime_tributario_padrao: 'actual_profit' as const,
    uf_padrao: 'SP',
  },
  periodos: {
    ecd: {
      periodicidade: 'anual' as const, // anual, trimestral, mensal
      mes_inicio: 1,
      mes_fim: 12,
    },
    ecf: {
      periodicidade: 'anual' as const,
      mes_inicio: 1,
      mes_fim: 12,
    },
    apuracao: {
      periodicidade: 'mensal' as const,
    }
  },
  sped: {
    versao_ecd: '9.0',
    versao_ecf: '9.0',
    layout: 'txt',
    encoding: 'UTF-8',
  },
  sefaz: {
    ambiente: 'homologacao' as const, // homologacao | producao
    urls: {
      'SP': 'https://homologacao.sefaz.aguas.sp.gov.br',
      'RJ': 'https://homologacao.sefaz.rj.gov.br',
      // ... todos os estados
    }
  }
};