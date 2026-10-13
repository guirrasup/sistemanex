// src/utils/tema.ts
// Tema visual configurável (Configurações → Aparência). Todas as cores do layout
// são variáveis CSS do @theme (index.css): trocar o tema é só redefinir essas
// variáveis no <html>. A escolha fica no localStorage deste navegador e é
// aplicada em main.tsx antes do primeiro render.

export interface Tema {
  /** Cor principal (vira o tom 700 da escala "brand"). */
  corPrincipal: string;
  /** Cor de destaque usada sobre fundos escuros (escala "accent"). */
  corDestaque: string;
  fundo: 'creme' | 'gelo' | 'neutro';
  fonteTitulos: FonteId;
  fonteTexto: FonteId;
  tamanho: 'compacto' | 'padrao' | 'confortavel';
  cantos: 'retos' | 'suaves' | 'arredondados';
}

export type FonteId = 'jakarta' | 'inter' | 'manrope' | 'dmsans' | 'sistema';

export const FONTES: Record<FonteId, { nome: string; pilha: string }> = {
  jakarta: { nome: 'Plus Jakarta Sans', pilha: '"Plus Jakarta Sans Variable", "Inter Variable", ui-sans-serif, system-ui, sans-serif' },
  inter: { nome: 'Inter', pilha: '"Inter Variable", "Inter", ui-sans-serif, system-ui, sans-serif' },
  manrope: { nome: 'Manrope', pilha: '"Manrope Variable", "Inter Variable", ui-sans-serif, system-ui, sans-serif' },
  dmsans: { nome: 'DM Sans', pilha: '"DM Sans Variable", "Inter Variable", ui-sans-serif, system-ui, sans-serif' },
  sistema: { nome: 'Fonte do sistema', pilha: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' },
};

export const CORES_PREDEFINIDAS: Array<{ nome: string; principal: string; destaque: string }> = [
  { nome: 'Verde-petróleo', principal: '#0B4F45', destaque: '#5ED9A4' },
  { nome: 'Azul-marinho', principal: '#1E3A8A', destaque: '#93C5FD' },
  { nome: 'Índigo', principal: '#3730A3', destaque: '#A5B4FC' },
  { nome: 'Grafite', principal: '#27272A', destaque: '#D4D4D8' },
  { nome: 'Vinho', principal: '#7F1D1D', destaque: '#FCA5A5' },
  { nome: 'Terracota', principal: '#9A3412', destaque: '#FDBA74' },
];

export const FUNDOS: Record<Tema['fundo'], { nome: string; descricao: string; escala: string[] }> = {
  creme: {
    nome: 'Creme',
    descricao: 'Quente, papel de livro-razão',
    escala: ['#F8F7F4', '#F1EFEA', '#E6E3DC', '#CFCBC1', '#969D98', '#5B6661', '#45504B', '#2F3935', '#1E2724', '#141D1A', '#0C1412'],
  },
  gelo: {
    nome: 'Gelo',
    descricao: 'Frio, azulado e técnico',
    escala: ['#F7F8FA', '#EEF1F5', '#DFE3EA', '#C3CAD6', '#8C98AD', '#5B6B86', '#42536F', '#2A3A55', '#1B2940', '#10203A', '#0A1628'],
  },
  neutro: {
    nome: 'Neutro',
    descricao: 'Cinza puro, sem temperatura',
    escala: ['#FAFAFA', '#F4F4F5', '#E4E4E7', '#D4D4D8', '#A1A1AA', '#71717A', '#52525B', '#3F3F46', '#27272A', '#18181B', '#09090B'],
  },
};

export const TEMA_PADRAO: Tema = {
  corPrincipal: '#0B4F45',
  corDestaque: '#5ED9A4',
  fundo: 'creme',
  fonteTitulos: 'jakarta',
  fonteTexto: 'inter',
  tamanho: 'padrao',
  cantos: 'suaves',
};

const CHAVE = '@sup:aparencia';
export const EVENTO_TEMA = 'sup:tema-alterado';
const PASSOS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];

// ---------- cor ----------
function hexParaRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbParaHex([r, g, b]: number[]): string {
  return '#' + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('').toUpperCase();
}
function misturar(a: string, b: string, t: number): string {
  const x = hexParaRgb(a);
  const y = hexParaRgb(b);
  return rgbParaHex(x.map((v, i) => v + (y[i] - v) * t));
}
export function hexValido(v: string): boolean {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v.trim());
}

/** Escala 50–950 a partir da cor principal (que vira o tom 700). */
export function escalaDaCor(base: string): Record<string, string> {
  const branco = '#FFFFFF';
  const preto = '#000000';
  const claros: Record<string, number> = { '50': 0.94, '100': 0.86, '200': 0.7, '300': 0.52, '400': 0.34, '500': 0.17, '600': 0.07 };
  const escuros: Record<string, number> = { '800': 0.2, '900': 0.42, '950': 0.62 };
  const out: Record<string, string> = { '700': base.toUpperCase() };
  for (const [p, t] of Object.entries(claros)) out[p] = misturar(base, branco, t);
  for (const [p, t] of Object.entries(escuros)) out[p] = misturar(base, preto, t);
  return out;
}

// ---------- persistência ----------
export function carregarTema(): Tema {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE) || 'null');
    return salvo ? { ...TEMA_PADRAO, ...salvo } : TEMA_PADRAO;
  } catch {
    return TEMA_PADRAO;
  }
}

export function salvarTema(tema: Tema) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(tema));
  } catch {
    /* armazenamento indisponível: o tema vale só nesta sessão */
  }
}

// ---------- aplicação ----------
export function aplicarTema(tema: Tema) {
  const raiz = document.documentElement.style;

  const brand = escalaDaCor(hexValido(tema.corPrincipal) ? tema.corPrincipal : TEMA_PADRAO.corPrincipal);
  for (const p of PASSOS) raiz.setProperty(`--color-brand-${p}`, brand[p]);

  const destaque = hexValido(tema.corDestaque) ? tema.corDestaque : TEMA_PADRAO.corDestaque;
  raiz.setProperty('--color-accent-200', misturar(destaque, '#FFFFFF', 0.6));
  raiz.setProperty('--color-accent-300', misturar(destaque, '#FFFFFF', 0.3));
  raiz.setProperty('--color-accent-400', destaque);
  raiz.setProperty('--color-accent-500', misturar(destaque, '#000000', 0.2));

  const ink = (FUNDOS[tema.fundo] ?? FUNDOS.creme).escala;
  PASSOS.forEach((p, i) => raiz.setProperty(`--color-ink-${p}`, ink[i]));

  raiz.setProperty('--font-display', (FONTES[tema.fonteTitulos] ?? FONTES.jakarta).pilha);
  raiz.setProperty('--font-sans', (FONTES[tema.fonteTexto] ?? FONTES.inter).pilha);

  // zoom escala por igual medidas em px e rem (o layout usa as duas).
  document.body.style.setProperty('zoom', tema.tamanho === 'compacto' ? '0.92' : tema.tamanho === 'confortavel' ? '1.08' : '');

  const cantos = { retos: [2, 3, 4, 6, 8], suaves: [4, 6, 8, 12, 16], arredondados: [6, 9, 12, 18, 24] }[tema.cantos] ?? [4, 6, 8, 12, 16];
  ['sm', 'md', 'lg', 'xl', '2xl'].forEach((n, i) => raiz.setProperty(`--radius-${n}`, `${cantos[i]}px`));

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', ink[10]);

  window.dispatchEvent(new CustomEvent(EVENTO_TEMA));
}

/** Lê o valor atual de uma variável de cor (para gráficos, que precisam de cor literal). */
export function corDoTema(variavel: string, reserva: string): string {
  const v = getComputedStyle(document.documentElement).getPropertyValue(variavel).trim();
  return v || reserva;
}
