// src/utils/permissoes.ts
// Quais permissões liberam cada tela. As chaves vêm do catálogo do backend
// (backend/src/config/permissoes.ts) — o backend é quem garante o acesso;
// aqui só decidimos o que mostrar.

export const VIEW_ADMIN = 'admin-usuarios';

/** Tela → permissões que a liberam (basta uma). */
const PERMISSOES_POR_VIEW: Record<string, string[]> = {
  dashboard: ['relatorios.dashboard'],
  'nfe-emissor': ['nfe.emitir'],
  'nfse-emissor': ['nfse.emitir'],
  'nfce-emissor': ['nfce.emitir'],
  'cte-emissor': ['cte.emitir'],
  'nfae-emissor': ['nfae.emitir'],
  'mdfe-emissor': ['mdfe.emitir'],
  'documentos-fiscais': ['documentos.ver'],
  produtos: ['produtos.ver'],
  servicos: ['servicos.ver'],
  clientes: ['clientes.ver'],
  fornecedores: ['fornecedores.ver'],
  transportadoras: ['transportadoras.ver'],
  financeiro: ['financeiro.ver'],
  'contas-receber': ['financeiro.ver'],
  'contas-pagar': ['financeiro.ver'],
  configuracoes: ['empresa.ver'],
  'consulta-cnpj': ['ferramentas.consultaCnpj'],
};

/** Ordem de preferência da tela inicial (igual à do menu lateral). */
export const VIEWS_EM_ORDEM = [
  'dashboard',
  'nfe-emissor', 'nfse-emissor', 'nfce-emissor', 'cte-emissor', 'nfae-emissor', 'mdfe-emissor',
  'documentos-fiscais',
  'produtos', 'servicos', 'clientes', 'fornecedores', 'transportadoras',
  'financeiro', 'configuracoes', 'consulta-cnpj',
];

export function podeVerView(view: string, permissoes: ReadonlySet<string>, isAdmin: boolean): boolean {
  if (isAdmin) return true;
  if (view === VIEW_ADMIN) return false;
  const exigidas = PERMISSOES_POR_VIEW[view];
  // Tela sem mapeamento: nega por padrão (uma tela nova precisa entrar no mapa).
  return !!exigidas && exigidas.some((p) => permissoes.has(p));
}

export function primeiraViewPermitida(permissoes: ReadonlySet<string>, isAdmin: boolean): string | null {
  return VIEWS_EM_ORDEM.find((v) => podeVerView(v, permissoes, isAdmin)) ?? null;
}
