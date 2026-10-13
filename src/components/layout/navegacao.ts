// src/components/layout/navegacao.ts
// Fonte única da navegação do app: usada pela Sidebar, pelo breadcrumb do Header e
// pela paleta de comandos (Ctrl/⌘ K). Permissões são aplicadas por quem consome.
import {
  Briefcase,
  Building,
  FileArchive,
  FileBadge2,
  FileText,
  Files,
  Landmark,
  LayoutDashboard,
  Lock,
  Package,
  Receipt,
  Search,
  ShoppingBag,
  Truck,
  UserCheck,
  UserPlus,
  type LucideIcon,
} from 'lucide-react';
import { VIEW_ADMIN } from '../../utils/permissoes';

export interface ContadoresNav {
  nfseCount?: number;
  nfeCount?: number;
  nfceCount?: number;
  cteCount?: number;
  nfaeCount?: number;
  mdfeCount?: number;
  produtosCount?: number;
  clientesCount?: number;
  fornecedoresCount?: number;
  servicosCount?: number;
  titulosPendentesCount?: number;
  transportadorasCount?: number;
}

export interface ItemNav {
  id: string;
  label: string;
  /** Complemento curto exibido em cinza (ex.: "Produtos" para NF-e). */
  detalhe?: string;
  icon: LucideIcon;
  contador?: keyof ContadoresNav | 'totalNotas';
  /** Termos extras para a busca da paleta de comandos. */
  palavras?: string;
}

export interface GrupoNav {
  id: string;
  titulo: string | null;
  itens: ItemNav[];
}

export const EMISSORES: ItemNav[] = [
  { id: 'nfe-emissor', label: 'NF-e', detalhe: 'Produtos', icon: Receipt, contador: 'nfeCount', palavras: 'nota fiscal eletronica modelo 55 danfe venda' },
  { id: 'nfse-emissor', label: 'NFS-e', detalhe: 'Serviços', icon: FileText, contador: 'nfseCount', palavras: 'nota servico danfse iss padrao nacional' },
  { id: 'nfce-emissor', label: 'NFC-e', detalhe: 'Consumidor', icon: ShoppingBag, contador: 'nfceCount', palavras: 'cupom consumidor final modelo 65 danfce varejo' },
  { id: 'cte-emissor', label: 'CT-e', detalhe: 'Transporte', icon: Truck, contador: 'cteCount', palavras: 'conhecimento transporte frete dacte modelo 57' },
  { id: 'nfae-emissor', label: 'NFA-e', detalhe: 'Avulsa', icon: FileBadge2, contador: 'nfaeCount', palavras: 'nota avulsa produtor rural dae' },
  { id: 'mdfe-emissor', label: 'MDF-e', detalhe: 'Manifesto', icon: FileArchive, contador: 'mdfeCount', palavras: 'manifesto carga viagem damdfe modelo 58' },
];

export function gruposNavegacao(isAdmin: boolean): GrupoNav[] {
  return [
    {
      id: 'inicio',
      titulo: null,
      itens: [
        { id: 'dashboard', label: 'Painel', icon: LayoutDashboard, palavras: 'dashboard inicio resumo graficos' },
        { id: 'documentos-fiscais', label: 'Documentos emitidos', icon: Files, contador: 'totalNotas', palavras: 'notas xml chave acesso cancelar consultar' },
      ],
    },
    { id: 'emitir', titulo: 'Emitir', itens: EMISSORES },
    {
      id: 'cadastros',
      titulo: 'Cadastros',
      itens: [
        { id: 'produtos', label: 'Produtos e estoque', icon: Package, contador: 'produtosCount', palavras: 'ncm gtin estoque mercadoria' },
        { id: 'servicos', label: 'Serviços', icon: Briefcase, contador: 'servicosCount', palavras: 'codigo tributacao' },
        { id: 'clientes', label: 'Clientes', icon: UserPlus, contador: 'clientesCount', palavras: 'destinatario tomador' },
        { id: 'fornecedores', label: 'Fornecedores', icon: UserCheck, contador: 'fornecedoresCount' },
        { id: 'transportadoras', label: 'Transportadoras', icon: Truck, contador: 'transportadorasCount', palavras: 'rntrc frete' },
      ],
    },
    {
      id: 'financeiro',
      titulo: 'Financeiro',
      itens: [
        { id: 'financeiro', label: 'Contas e cobranças', icon: Landmark, contador: 'titulosPendentesCount', palavras: 'financeiro titulos pix cobranca boleto liquidar' },
      ],
    },
    {
      id: 'empresa',
      titulo: 'Empresa',
      itens: [
        { id: 'configuracoes', label: 'Dados e certificado A1', icon: Building, palavras: 'configuracoes empresa certificado digital a1 cnpj' },
        { id: 'consulta-cnpj', label: 'Consulta CNPJ', icon: Search, palavras: 'receita federal cadastro publico' },
        ...(isAdmin ? [{ id: VIEW_ADMIN, label: 'Usuários e permissões', icon: Lock, palavras: 'perfis acesso admin' }] : []),
      ],
    },
  ];
}

// Telas que não estão no menu mas pertencem a um item dele.
const ALIAS_VIEW: Record<string, string> = {
  'contas-receber': 'financeiro',
  'contas-pagar': 'financeiro',
};

/** Localiza grupo e item da tela atual (para breadcrumb e item ativo). */
export function localizarView(view: string, isAdmin = true): { grupo: GrupoNav; item: ItemNav } | null {
  const alvo = ALIAS_VIEW[view] ?? view;
  for (const grupo of gruposNavegacao(isAdmin)) {
    const item = grupo.itens.find((i) => i.id === alvo);
    if (item) return { grupo, item };
  }
  return null;
}

export function viewAtiva(view: string): string {
  return ALIAS_VIEW[view] ?? view;
}

export function valorContador(contador: ItemNav['contador'], contadores: ContadoresNav): number | undefined {
  if (!contador) return undefined;
  if (contador === 'totalNotas') {
    return (
      (contadores.nfeCount || 0) +
      (contadores.nfseCount || 0) +
      (contadores.nfceCount || 0) +
      (contadores.cteCount || 0) +
      (contadores.nfaeCount || 0) +
      (contadores.mdfeCount || 0)
    );
  }
  return contadores[contador];
}

export const ehMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
export const TECLA_MOD = ehMac ? '⌘' : 'Ctrl';
