// src/components/ui/CabecalhoPagina.tsx
// Cabeçalho padrão das páginas internas (cadastros, empresa, ferramentas) —
// mesma linguagem do cabeçalho dos emissores: ícone na cor do tema, título,
// contagem em mono, descrição curta e ações à direita.
import React from 'react';
import type { LucideIcon } from 'lucide-react';

export const CabecalhoPagina: React.FC<{
  icone: LucideIcon;
  titulo: string;
  descricao?: React.ReactNode;
  contagem?: React.ReactNode;
  acoes?: React.ReactNode;
}> = ({ icone: Icone, titulo, descricao, contagem, acoes }) => (
  <header className="flex flex-col gap-3 rounded-xl border border-ink-200/80 bg-white px-5 py-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-700 text-white">
        <Icone className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-lg font-bold tracking-[-0.01em] text-ink-950">{titulo}</h1>
          {contagem !== undefined && contagem !== null && (
            <span className="rounded-md border border-ink-200 px-1.5 py-px font-mono text-[11px] text-ink-500">{contagem}</span>
          )}
        </div>
        {descricao && <p className="mt-0.5 text-xs text-ink-500">{descricao}</p>}
      </div>
    </div>
    {acoes && <div className="flex shrink-0 flex-wrap items-center gap-2">{acoes}</div>}
  </header>
);
