// src/services/contabil/PlanoContasReferencial.ts

export interface ContaReferencial {
  codigo: string;
  descricao: string;
  nivel: number;
  tipo: 'S' | 'A'; // Sintética | Analítica
  natureza: 'D' | 'C'; // Débito | Crédito
  codigo_pai?: string;
}

export const PLANO_REFERENCIAL_SPED: ContaReferencial[] = [
  // ===== ATIVO =====
  { codigo: '1', descricao: 'ATIVO', nivel: 1, tipo: 'S', natureza: 'D' },
  { codigo: '1.1', descricao: 'ATIVO CIRCULANTE', nivel: 2, tipo: 'S', natureza: 'D', codigo_pai: '1' },
  { codigo: '1.1.01', descricao: 'Caixa Geral', nivel: 3, tipo: 'A', natureza: 'D', codigo_pai: '1.1' },
  { codigo: '1.1.02', descricao: 'Bancos Conta Movimento', nivel: 3, tipo: 'A', natureza: 'D', codigo_pai: '1.1' },
  { codigo: '1.1.03', descricao: 'Aplicações Financeiras', nivel: 3, tipo: 'A', natureza: 'D', codigo_pai: '1.1' },
  { codigo: '1.1.04', descricao: 'Clientes - Contas a Receber', nivel: 3, tipo: 'A', natureza: 'D', codigo_pai: '1.1' },
  { codigo: '1.1.05', descricao: 'Estoques de Mercadorias', nivel: 3, tipo: 'A', natureza: 'D', codigo_pai: '1.1' },
  { codigo: '1.1.06', descricao: 'Despesas Antecipadas', nivel: 3, tipo: 'A', natureza: 'D', codigo_pai: '1.1' },
  { codigo: '1.2', descricao: 'ATIVO NÃO CIRCULANTE', nivel: 2, tipo: 'S', natureza: 'D', codigo_pai: '1' },
  { codigo: '1.2.01', descricao: 'Investimentos', nivel: 3, tipo: 'A', natureza: 'D', codigo_pai: '1.2' },
  { codigo: '1.2.02', descricao: 'Imobilizado', nivel: 3, tipo: 'A', natureza: 'D', codigo_pai: '1.2' },
  { codigo: '1.2.03', descricao: 'Intangível', nivel: 3, tipo: 'A', natureza: 'D', codigo_pai: '1.2' },
  { codigo: '1.3', descricao: '(-) DEPRECIAÇÃO/AMORTIZAÇÃO', nivel: 2, tipo: 'S', natureza: 'C', codigo_pai: '1' },

  // ===== PASSIVO =====
  { codigo: '2', descricao: 'PASSIVO', nivel: 1, tipo: 'S', natureza: 'C' },
  { codigo: '2.1', descricao: 'PASSIVO CIRCULANTE', nivel: 2, tipo: 'S', natureza: 'C', codigo_pai: '2' },
  { codigo: '2.1.01', descricao: 'Fornecedores Nacionais', nivel: 3, tipo: 'A', natureza: 'C', codigo_pai: '2.1' },
  { codigo: '2.1.02', descricao: 'Fornecedores Estrangeiros', nivel: 3, tipo: 'A', natureza: 'C', codigo_pai: '2.1' },
  { codigo: '2.1.03', descricao: 'Obrigações Fiscais - ICMS', nivel: 3, tipo: 'A', natureza: 'C', codigo_pai: '2.1' },
  { codigo: '2.1.04', descricao: 'Obrigações Fiscais - PIS/COFINS', nivel: 3, tipo: 'A', natureza: 'C', codigo_pai: '2.1' },
  { codigo: '2.1.05', descricao: 'Obrigações Fiscais - CBS/IBS', nivel: 3, tipo: 'A', natureza: 'C', codigo_pai: '2.1' },
  { codigo: '2.1.06', descricao: 'Obrigações Trabalhistas', nivel: 3, tipo: 'A', natureza: 'C', codigo_pai: '2.1' },
  { codigo: '2.1.07', descricao: 'Empréstimos e Financiamentos', nivel: 3, tipo: 'A', natureza: 'C', codigo_pai: '2.1' },
  { codigo: '2.2', descricao: 'PASSIVO NÃO CIRCULANTE', nivel: 2, tipo: 'S', natureza: 'C', codigo_pai: '2' },
  { codigo: '2.2.01', descricao: 'Financiamentos de Longo Prazo', nivel: 3, tipo: 'A', natureza: 'C', codigo_pai: '2.2' },
  { codigo: '2.3', descricao: 'PATRIMÔNIO LÍQUIDO', nivel: 2, tipo: 'S', natureza: 'C', codigo_pai: '2' },
  { codigo: '2.3.01', descricao: 'Capital Social', nivel: 3, tipo: 'A', natureza: 'C', codigo_pai: '2.3' },
  { codigo: '2.3.02', descricao: 'Reservas de Capital', nivel: 3, tipo: 'A', natureza: 'C', codigo_pai: '2.3' },
  { codigo: '2.3.03', descricao: 'Reservas de Lucros', nivel: 3, tipo: 'A', natureza: 'C', codigo_pai: '2.3' },
  { codigo: '2.3.04', descricao: 'Lucros/Prejuízos Acumulados', nivel: 3, tipo: 'A', natureza: 'C', codigo_pai: '2.3' },

  // ===== RECEITAS =====
  { codigo: '3', descricao: 'RECEITAS', nivel: 1, tipo: 'S', natureza: 'C' },
  { codigo: '3.1', descricao: 'RECEITA BRUTA - VENDAS', nivel: 2, tipo: 'S', natureza: 'C', codigo_pai: '3' },
  { codigo: '3.1.01', descricao: 'Vendas de Mercadorias', nivel: 3, tipo: 'A', natureza: 'C', codigo_pai: '3.1' },
  { codigo: '3.1.02', descricao: 'Vendas de Serviços', nivel: 3, tipo: 'A', natureza: 'C', codigo_pai: '3.1' },
  { codigo: '3.2', descricao: 'DEDUÇÕES DA RECEITA', nivel: 2, tipo: 'S', natureza: 'D', codigo_pai: '3' },
  { codigo: '3.2.01', descricao: 'ICMS sobre Vendas', nivel: 3, tipo: 'A', natureza: 'D', codigo_pai: '3.2' },
  { codigo: '3.2.02', descricao: 'PIS sobre Vendas', nivel: 3, tipo: 'A', natureza: 'D', codigo_pai: '3.2' },
  { codigo: '3.2.03', descricao: 'COFINS sobre Vendas', nivel: 3, tipo: 'A', natureza: 'D', codigo_pai: '3.2' },
  { codigo: '3.2.04', descricao: 'CBS sobre Vendas', nivel: 3, tipo: 'A', natureza: 'D', codigo_pai: '3.2' },
  { codigo: '3.2.05', descricao: 'IBS sobre Vendas', nivel: 3, tipo: 'A', natureza: 'D', codigo_pai: '3.2' },

  // ===== DESPESAS =====
  { codigo: '4', descricao: 'DESPESAS', nivel: 1, tipo: 'S', natureza: 'D' },
  { codigo: '4.1', descricao: 'CUSTO DOS PRODUTOS VENDIDOS', nivel: 2, tipo: 'S', natureza: 'D', codigo_pai: '4' },
  { codigo: '4.1.01', descricao: 'CMV - Mercadorias', nivel: 3, tipo: 'A', natureza: 'D', codigo_pai: '4.1' },
  { codigo: '4.2', descricao: 'DESPESAS ADMINISTRATIVAS', nivel: 2, tipo: 'S', natureza: 'D', codigo_pai: '4' },
  { codigo: '4.2.01', descricao: 'Salários e Encargos Adm', nivel: 3, tipo: 'A', natureza: 'D', codigo_pai: '4.2' },
  { codigo: '4.2.02', descricao: 'Aluguel e Condomínio', nivel: 3, tipo: 'A', natureza: 'D', codigo_pai: '4.2' },
  { codigo: '4.2.03', descricao: 'Serviços Terceirizados', nivel: 3, tipo: 'A', natureza: 'D', codigo_pai: '4.2' },
  { codigo: '4.2.04', descricao: 'Materiais de Consumo', nivel: 3, tipo: 'A', natureza: 'D', codigo_pai: '4.2' },
  { codigo: '4.3', descricao: 'DESPESAS COMERCIAIS', nivel: 2, tipo: 'S', natureza: 'D', codigo_pai: '4' },
  { codigo: '4.3.01', descricao: 'Comissões sobre Vendas', nivel: 3, tipo: 'A', natureza: 'D', codigo_pai: '4.3' },
  { codigo: '4.4', descricao: 'DESPESAS FINANCEIRAS', nivel: 2, tipo: 'S', natureza: 'D', codigo_pai: '4' },
  { codigo: '4.4.01', descricao: 'Juros Passivos', nivel: 3, tipo: 'A', natureza: 'D', codigo_pai: '4.4' },
  { codigo: '4.4.02', descricao: 'Tarifas e Taxas Bancárias', nivel: 3, tipo: 'A', natureza: 'D', codigo_pai: '4.4' },
  { codigo: '4.5', descricao: 'DESPESAS TRIBUTÁRIAS', nivel: 2, tipo: 'S', natureza: 'D', codigo_pai: '4' },
  { codigo: '4.5.01', descricao: 'ICMS a Recolher', nivel: 3, tipo: 'A', natureza: 'D', codigo_pai: '4.5' },
  { codigo: '4.5.02', descricao: 'PIS a Recolher', nivel: 3, tipo: 'A', natureza: 'D', codigo_pai: '4.5' },
  { codigo: '4.5.03', descricao: 'COFINS a Recolher', nivel: 3, tipo: 'A', natureza: 'D', codigo_pai: '4.5' },
  { codigo: '4.5.04', descricao: 'CBS a Recolher', nivel: 3, tipo: 'A', natureza: 'D', codigo_pai: '4.5' },
  { codigo: '4.5.05', descricao: 'IBS a Recolher', nivel: 3, tipo: 'A', natureza: 'D', codigo_pai: '4.5' },
];

export function mapearContaParaReferencial(
  contaInterna: string,
  planoPersonalizado?: Record<string, string>
): string {
  // Se houver mapeamento personalizado, usar primeiro
  if (planoPersonalizado && planoPersonalizado[contaInterna]) {
    return planoPersonalizado[contaInterna];
  }

  // Busca no plano referencial pelo código
  const encontrada = PLANO_REFERENCIAL_SPED.find(c => c.codigo === contaInterna);
  if (encontrada) {
    return encontrada.codigo;
  }

  // Fallback: conta genérica de análise
  return '1.1.99.999';
}

export function getContaReferencial(codigo: string): ContaReferencial | undefined {
  return PLANO_REFERENCIAL_SPED.find(c => c.codigo === codigo);
}

export function getContasByNivel(nivel: number): ContaReferencial[] {
  return PLANO_REFERENCIAL_SPED.filter(c => c.nivel === nivel);
}