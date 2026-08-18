// src/config/sped.config.ts
export const SPED_CONFIG = {
  // Layouts
  ecd: {
    versao: '9.0',
    tipo_escrituracao: '0', // 0 - Contábil
    finalidade: '0', // 0 - Original
    codigo_qualificacao: '00', // 00 - Contribuinte
  },
  ecf: {
    versao: '9.0',
    tipo_escrituracao: '0', // 0 - Original
    codigo_qualificacao: '00',
  },
  // Códigos
  codigos: {
    moeda: 'R$',
    codigo_pais: '1058', // Brasil
    codigo_ibge: '3550308', // São Paulo padrão
  },
  // Mensagens
  mensagens: {
    historico_padrao: 'LANÇAMENTO CONTÁBIL - NEX ERP',
    observacao: 'Sistema NEX Enterprise - Escrituração Contábil Digital',
  }
};