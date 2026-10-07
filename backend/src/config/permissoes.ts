// backend/src/config/permissoes.ts
//
// Catálogo único de permissões do sistema. O backend usa as chaves para
// proteger as rotas; a tela de administração recebe o catálogo inteiro via
// GET /api/admin/permissoes e monta a matriz de acesso a partir dele.
//
// `nivel` agrupa as permissões de um módulo em degraus (ver ⊂ operar ⊂ total):
// a tela de administração usa isso para os atalhos "Sem acesso / Visualizar /
// Operar / Total" de cada módulo.

export type NivelPermissao = 'ver' | 'operar' | 'total';

export interface DefinicaoPermissao {
  chave: string;
  label: string;
  descricao: string;
  nivel: NivelPermissao;
}

export interface ModuloPermissoes {
  id: string;
  titulo: string;
  grupo: string;
  permissoes: DefinicaoPermissao[];
}

const DOCUMENTOS_FISCAIS = [
  { id: 'nfe', titulo: 'NF-e (Produtos)', doc: 'DANFE' },
  { id: 'nfse', titulo: 'NFS-e (Serviços)', doc: 'DANFSE' },
  { id: 'nfce', titulo: 'NFC-e (Consumidor)', doc: 'DANFCE' },
  { id: 'cte', titulo: 'CT-e (Transporte)', doc: 'DACTE' },
  { id: 'nfae', titulo: 'NFA-e (Avulsa)', doc: 'DANFAE' },
  { id: 'mdfe', titulo: 'MDF-e (Manifesto)', doc: 'DAMDFE' },
] as const;

const EXTRAS_FISCAIS: Record<string, DefinicaoPermissao[]> = {
  nfe: [
    { chave: 'nfe.cartaCorrecao', label: 'Carta de correção', descricao: 'Enviar CC-e para NF-e autorizada', nivel: 'total' },
    { chave: 'nfe.inutilizar', label: 'Inutilizar numeração', descricao: 'Inutilizar faixas de numeração na SEFAZ', nivel: 'total' },
  ],
  nfae: [
    { chave: 'nfae.excluir', label: 'Excluir rascunho', descricao: 'Excluir NFA-e ainda não autorizada', nivel: 'total' },
  ],
  mdfe: [
    { chave: 'mdfe.encerrar', label: 'Encerrar manifesto', descricao: 'Encerrar MDF-e na SEFAZ', nivel: 'operar' },
  ],
};

const CADASTROS = [
  { id: 'produtos', titulo: 'Produtos / Estoque' },
  { id: 'servicos', titulo: 'Serviços' },
  { id: 'clientes', titulo: 'Clientes' },
  { id: 'fornecedores', titulo: 'Fornecedores' },
  { id: 'transportadoras', titulo: 'Transportadoras' },
] as const;

export const CATALOGO_PERMISSOES: ModuloPermissoes[] = [
  ...DOCUMENTOS_FISCAIS.map((d) => ({
    id: d.id,
    titulo: d.titulo,
    grupo: 'Emissões fiscais',
    permissoes: [
      { chave: `${d.id}.ver`, label: 'Consultar', descricao: `Ver a lista e o ${d.doc} dos documentos emitidos`, nivel: 'ver' as const },
      { chave: `${d.id}.emitir`, label: 'Emitir', descricao: 'Acessar o emissor e transmitir novos documentos', nivel: 'operar' as const },
      { chave: `${d.id}.download`, label: 'Baixar XML / enviar e-mail', descricao: 'Baixar o XML autorizado e enviá-lo por e-mail', nivel: 'operar' as const },
      { chave: `${d.id}.cancelar`, label: 'Cancelar', descricao: 'Cancelar documentos autorizados na SEFAZ', nivel: 'total' as const },
      ...(EXTRAS_FISCAIS[d.id] || []),
    ],
  })),
  {
    id: 'documentos',
    titulo: 'Documentos Emitidos',
    grupo: 'Emissões fiscais',
    permissoes: [
      { chave: 'documentos.ver', label: 'Acessar a tela', descricao: 'Tela unificada de documentos (mostra só os tipos que o usuário pode consultar)', nivel: 'ver' },
    ],
  },
  ...CADASTROS.map((c) => ({
    id: c.id,
    titulo: c.titulo,
    grupo: 'Cadastros',
    permissoes: [
      { chave: `${c.id}.ver`, label: 'Visualizar', descricao: 'Acessar a tela e consultar os registros', nivel: 'ver' as const },
      { chave: `${c.id}.criar`, label: 'Incluir', descricao: 'Cadastrar novos registros', nivel: 'operar' as const },
      { chave: `${c.id}.editar`, label: 'Alterar', descricao: 'Editar registros existentes', nivel: 'operar' as const },
      { chave: `${c.id}.excluir`, label: 'Excluir', descricao: 'Remover registros', nivel: 'total' as const },
    ],
  })),
  {
    id: 'financeiro',
    titulo: 'Financeiro',
    grupo: 'Financeiro',
    permissoes: [
      { chave: 'financeiro.ver', label: 'Visualizar títulos', descricao: 'Acessar contas a pagar e a receber', nivel: 'ver' },
      { chave: 'financeiro.baixar', label: 'Baixar títulos', descricao: 'Registrar pagamento/recebimento de títulos', nivel: 'operar' },
    ],
  },
  {
    id: 'relatorios',
    titulo: 'Relatórios e indicadores',
    grupo: 'Relatórios',
    permissoes: [
      { chave: 'relatorios.dashboard', label: 'Dashboard', descricao: 'Painel inicial com gráficos e indicadores', nivel: 'ver' },
      { chave: 'relatorios.estatisticas', label: 'Estatísticas fiscais', descricao: 'Resumos mensais, totais faturados, mais vendidos', nivel: 'ver' },
      { chave: 'relatorios.financeiro', label: 'Resumo financeiro', descricao: 'Totais consolidados do financeiro', nivel: 'ver' },
      { chave: 'relatorios.exportar', label: 'Exportar planilhas', descricao: 'Exportar listagens para CSV', nivel: 'operar' },
    ],
  },
  {
    id: 'empresa',
    titulo: 'Empresa e certificado',
    grupo: 'Configurações',
    permissoes: [
      { chave: 'empresa.ver', label: 'Ver dados da empresa', descricao: 'Acessar a tela de configurações da empresa', nivel: 'ver' },
      { chave: 'empresa.editar', label: 'Alterar dados da empresa', descricao: 'Regime tributário, séries, numeração, CSC, contador', nivel: 'total' },
      { chave: 'certificado.gerenciar', label: 'Gerenciar certificado A1', descricao: 'Enviar ou renovar o certificado digital', nivel: 'total' },
    ],
  },
  {
    id: 'ferramentas',
    titulo: 'Ferramentas',
    grupo: 'Ferramentas',
    permissoes: [
      { chave: 'ferramentas.consultaCnpj', label: 'Consulta CNPJ', descricao: 'Consultar dados cadastrais na Receita', nivel: 'ver' },
    ],
  },
];

export const TODAS_PERMISSOES: string[] = CATALOGO_PERMISSOES.flatMap((m) => m.permissoes.map((p) => p.chave));

const CHAVES_VALIDAS = new Set(TODAS_PERMISSOES);

export function isPermissaoValida(chave: string): boolean {
  return CHAVES_VALIDAS.has(chave);
}

/** Remove chaves desconhecidas e duplicadas (preserva a ordem do catálogo). */
export function normalizarPermissoes(chaves: unknown): string[] {
  if (!Array.isArray(chaves)) return [];
  const recebidas = new Set(chaves.filter((c): c is string => typeof c === 'string'));
  return TODAS_PERMISSOES.filter((c) => recebidas.has(c));
}

const porPrefixo = (...prefixos: string[]) =>
  TODAS_PERMISSOES.filter((c) => prefixos.some((p) => c.startsWith(`${p}.`)));

const FISCAIS = DOCUMENTOS_FISCAIS.map((d) => d.id);
const CADASTROS_IDS = CADASTROS.map((c) => c.id);

/**
 * Permissões de quem não tem perfil de acesso atribuído, por nível base.
 * ADMIN não aparece aqui: sempre recebe todas.
 */
export const PERMISSOES_PADRAO_POR_NIVEL: Record<'FISCAL' | 'OPERADOR', string[]> = {
  // Responsável fiscal: opera tudo de documentos, cadastros e relatórios;
  // não mexe em dados da empresa nem no certificado.
  FISCAL: [
    ...porPrefixo(...FISCAIS, 'documentos', ...CADASTROS_IDS, 'financeiro', 'relatorios', 'ferramentas'),
    'empresa.ver',
  ],
  // Operador: emite e consulta, cadastra/edita, mas não cancela, não exclui,
  // não exporta e não vê o financeiro.
  OPERADOR: [
    ...FISCAIS.flatMap((d) => [`${d}.ver`, `${d}.emitir`, `${d}.download`]),
    'mdfe.encerrar',
    'documentos.ver',
    ...CADASTROS_IDS.flatMap((c) => [`${c}.ver`, `${c}.criar`, `${c}.editar`]),
    'relatorios.dashboard',
    'ferramentas.consultaCnpj',
  ],
};
