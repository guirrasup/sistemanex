// src/components/admin/adminUtils.ts

// Classes completas (o Tailwind não detecta classes montadas por concatenação).
const CLASSES_COR: Record<string, string> = {
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  amber: 'bg-amber-50 text-amber-800 border-amber-200',
  rose: 'bg-rose-50 text-rose-700 border-rose-200',
  violet: 'bg-violet-50 text-violet-700 border-violet-200',
  cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
};

const CLASSES_PONTO: Record<string, string> = {
  slate: 'bg-slate-500', blue: 'bg-blue-500', emerald: 'bg-emerald-500', amber: 'bg-amber-500',
  rose: 'bg-rose-500', violet: 'bg-violet-500', cyan: 'bg-cyan-500', orange: 'bg-orange-500',
};

export const CORES_PERFIL = Object.keys(CLASSES_COR);

export const classeCorPerfil = (cor: string) => CLASSES_COR[cor] ?? CLASSES_COR.slate;
export const classePontoCor = (cor: string) => CLASSES_PONTO[cor] ?? CLASSES_PONTO.slate;

/** Senha aleatória forte, sem caracteres ambíguos (0/O, 1/l/I). */
export function gerarSenha(tamanho = 12): string {
  const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$%';
  const bytes = crypto.getRandomValues(new Uint32Array(tamanho));
  return Array.from(bytes, (b) => alfabeto[b % alfabeto.length]).join('');
}

export function formatarDataHora(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}
