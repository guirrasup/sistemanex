// src/types/contabil.ts

export interface DRE {
  periodo: {
    data_inicio: string;
    data_fim: string;
  };
  receita_bruta: {
    vendas_mercadorias: number;
    vendas_servicos: number;
    outras_receitas: number;
    total: number;
  };
  deducoes: {
    icms: number;
    pis: number;
    cofins: number;
    cbs: number;
    ibs: number;
    outras: number;
    total: number;
  };
  receita_liquida: number;
  cmv: {
    estoque_inicial: number;
    compras: number;
    estoque_final: number;
    total: number;
  };
  lucro_bruto: number;
  despesas_operacionais: {
    administrativas: number;
    comerciais: number;
    financeiras: number;
    tributarias: number;
    outras: number;
    total: number;
  };
  lucro_operacional: number;
  resultado_financeiro: {
    receitas: number;
    despesas: number;
    total: number;
  };
  lucro_antes_ir: number;
  impostos: {
    irpj: number;
    csll: number;
    total: number;
  };
  lucro_liquido: number;
  indicadores: {
    margem_bruta: number;
    margem_operacional: number;
    margem_liquida: number;
    ebitda: number;
  };
}

export interface BalancoPatrimonial {
  periodo: {
    data: string;
  };
  ativo: {
    circulante: {
      disponivel: number;
      clientes: number;
      estoques: number;
      despesas_antecipadas: number;
      outros: number;
      total: number;
    };
    nao_circulante: {
      realizavel_longo_prazo: number;
      investimentos: number;
      imobilizado: number;
      intangivel: number;
      total: number;
    };
    total: number;
  };
  passivo: {
    circulante: {
      fornecedores: number;
      obrigacoes_fiscais: number;
      obrigacoes_trabalhistas: number;
      emprestimos_curto_prazo: number;
      outros: number;
      total: number;
    };
    nao_circulante: {
      emprestimos_longo_prazo: number;
      outros: number;
      total: number;
    };
    patrimonio_liquido: {
      capital_social: number;
      reservas: number;
      lucros_acumulados: number;
      total: number;
    };
    total: number;
  };
  indicadores: {
    liquidez_corrente: number;
    liquidez_seca: number;
    liquidez_imediata: number;
    endividamento: number;
    composicao_endividamento: number;
  };
}

export interface FluxoCaixa {
  periodo: {
    data_inicio: string;
    data_fim: string;
  };
  operacionais: {
    recebimentos_clientes: number;
    pagamentos_fornecedores: number;
    pagamentos_funcionarios: number;
    pagamentos_impostos: number;
    outros_recebimentos: number;
    outros_pagamentos: number;
    caixa_liquido_operacional: number;
  };
  investimento: {
    compra_imobilizado: number;
    venda_imobilizado: number;
    investimentos: number;
    caixa_liquido_investimento: number;
  };
  financiamento: {
    emprestimos_recebidos: number;
    pagamento_emprestimos: number;
    integralizacao_capital: number;
    distribuicao_lucros: number;
    caixa_liquido_financiamento: number;
  };
  variacao_caixa: number;
  saldo_inicial: number;
  saldo_final: number;
}

export interface ApuracaoImpostosDetalhada {
  periodo: {
    data_inicio: string;
    data_fim: string;
  };
  icms: {
    base_calculo: number;
    aliquota: number;
    debito: number;
    credito: number;
    saldo: number;              // ← ADICIONADO para padronizar
    saldo_anterior: number;
    saldo_atual: number;
    recolhido: number;
    a_recolher: number;
    historico: Array<{
      data: string;
      documento: string;
      tipo: 'debito' | 'credito';
      valor: number;
    }>;
  };
  pis: {
    base_calculo: number;
    aliquota: number;
    debito: number;
    credito: number;
    saldo: number;
    a_recolher: number;
  };
  cofins: {
    base_calculo: number;
    aliquota: number;
    debito: number;
    credito: number;
    saldo: number;
    a_recolher: number;
  };
  cbs: {
    base_calculo: number;
    aliquota: number;
    debito: number;
    credito: number;
    saldo: number;
    a_recolher: number;
  };
  ibs: {
    base_calculo: number;
    aliquota: number;
    debito: number;
    credito: number;
    saldo: number;
    a_recolher: number;
  };
  resumo: {
    total_impostos_debitos: number;
    total_impostos_creditos: number;
    total_a_recolher: number;
    carga_tributaria: number;
  };
}

export interface LivroDiario {
  periodo: {
    data_inicio: string;
    data_fim: string;
  };
  lancamentos: Array<{
    data: string;
    historico: string;
    conta_debito: string;
    conta_credito: string;
    valor: number;
    documento?: string;
    complemento?: string;
  }>;
  total_debito: number;
  total_credito: number;
}

export interface LivroRazao {
  conta: string;
  descricao: string;
  periodo: {
    data_inicio: string;
    data_fim: string;
  };
  lancamentos: Array<{
    data: string;
    historico: string;
    debito: number;
    credito: number;
    saldo: number;
  }>;
  saldo_inicial: number;
  saldo_final: number;
  total_debitos: number;
  total_creditos: number;
}

export interface ValidacaoSped {
  arquivo: string;
  tipo: 'ecd' | 'ecf';
  valido: boolean;
  erros: Array<{
    linha: number;
    registro: string;
    campo: string;
    erro: string;
    sugericao?: string;
  }>;
  avisos: Array<{
    linha: number;
    registro: string;
    mensagem: string;
  }>;
  estatisticas: {
    total_linhas: number;
    registros_unicos: string[];
    total_por_registro: Record<string, number>;
  };
}