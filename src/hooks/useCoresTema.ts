// src/hooks/useCoresTema.ts
// Cores literais do tema atual (recharts e SVG precisam de hex, não de classe),
// atualizadas quando o tema muda em Configurações → Aparência.
import { useEffect, useState } from 'react';
import { EVENTO_TEMA, corDoTema } from '../utils/tema';

function ler() {
  return {
    brand700: corDoTema('--color-brand-700', '#0B4F45'),
    brand500: corDoTema('--color-brand-500', '#1C7A69'),
    brand200: corDoTema('--color-brand-200', '#A8D3C6'),
    ink900: corDoTema('--color-ink-900', '#141D1A'),
    ink400: corDoTema('--color-ink-400', '#969D98'),
    ink300: corDoTema('--color-ink-300', '#CFCBC1'),
    ink100: corDoTema('--color-ink-100', '#F1EFEA'),
  };
}

export type CoresTema = ReturnType<typeof ler>;

export function useCoresTema(): CoresTema {
  const [cores, setCores] = useState(ler);
  useEffect(() => {
    const atualizar = () => setCores(ler());
    window.addEventListener(EVENTO_TEMA, atualizar);
    return () => window.removeEventListener(EVENTO_TEMA, atualizar);
  }, []);
  return cores;
}
