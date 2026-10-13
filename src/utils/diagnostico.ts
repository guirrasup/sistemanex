// src/utils/diagnostico.ts
// Guarda em memória os últimos eventos do console, erros não tratados e falhas
// de rede — anexados automaticamente ao "Reportar problema" (programa beta).
// Instalado em main.tsx antes de qualquer outra coisa rodar.

export type NivelLog = 'erro' | 'aviso' | 'info' | 'log' | 'rede';

export interface EntradaLog {
  nivel: NivelLog;
  quando: string;
  mensagem: string;
}

const LIMITE = 150;
const buffer: EntradaLog[] = [];
let instalado = false;

function serializar(v: unknown): string {
  if (v instanceof Error) return `${v.name}: ${v.message}${v.stack ? `\n${v.stack.split('\n').slice(1, 6).join('\n')}` : ''}`;
  if (typeof v === 'string') return v;
  try {
    return JSON.stringify(v, (_k, val) => (typeof val === 'string' && val.length > 500 ? val.slice(0, 500) + '…' : val));
  } catch {
    return String(v);
  }
}

// Nunca deixa dados sensíveis óbvios irem para o ticket.
function mascarar(txt: string): string {
  return txt
    .replace(/(Bearer\s+)[\w.-]+/gi, '$1***')
    .replace(/("?(senha|password|token|certificadoSenha)"?\s*[:=]\s*)"[^"]*"/gi, '$1"***"');
}

export function registrar(nivel: NivelLog, ...partes: unknown[]) {
  const mensagem = mascarar(partes.map(serializar).join(' ')).slice(0, 2000);
  buffer.push({ nivel, quando: new Date().toISOString(), mensagem });
  if (buffer.length > LIMITE) buffer.splice(0, buffer.length - LIMITE);
}

export function obterLog(): EntradaLog[] {
  return [...buffer];
}

export function instalarDiagnostico() {
  if (instalado || typeof window === 'undefined') return;
  instalado = true;

  const mapa: Array<[keyof Console, NivelLog]> = [
    ['error', 'erro'],
    ['warn', 'aviso'],
    ['info', 'info'],
    ['log', 'log'],
  ];
  for (const [metodo, nivel] of mapa) {
    const original = console[metodo] as (...a: unknown[]) => void;
    (console as unknown as Record<string, unknown>)[metodo] = (...args: unknown[]) => {
      try {
        registrar(nivel, ...args);
      } catch {
        /* o diagnóstico nunca pode quebrar o app */
      }
      original.apply(console, args);
    };
  }

  window.addEventListener('error', (e) => {
    registrar('erro', `Erro não tratado: ${e.message}`, e.filename ? `(${e.filename}:${e.lineno}:${e.colno})` : '', e.error ?? '');
  });
  window.addEventListener('unhandledrejection', (e) => {
    registrar('erro', 'Promise rejeitada sem tratamento:', e.reason);
  });
}
