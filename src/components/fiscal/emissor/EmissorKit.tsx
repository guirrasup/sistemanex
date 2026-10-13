// src/components/fiscal/emissor/EmissorKit.tsx
// Esqueleto comum a TODOS os emissores (NF-e, NFS-e, NFC-e, CT-e, NFA-e, MDF-e).
// As áreas ficam sempre na mesma posição, em qualquer documento:
//   1. Cabeçalho  — documento, modelo, ambiente, série/próximo número, ações rápidas
//   2. Navegação  — atalhos para as seções (com destaque da seção visível)
//   3. Coluna esquerda — seções numeradas, na ordem: participantes → identificação
//      → conteúdo (itens/serviço/carga) → logística → tributos/pagamento → complementares
//   4. Coluna direita (fixa ao rolar) — total, demais valores, pendências e ações
import React, { useEffect, useState } from 'react';
import { CheckCircle2, Eye, RefreshCw, RotateCcw, Send, TriangleAlert, type LucideIcon } from 'lucide-react';
import { formatarMoeda } from '../../../utils/cpfCnpjValidator';

export interface SecaoInfo {
  id: string;
  titulo: string;
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------
export const EmissorLayout: React.FC<{
  icone: LucideIcon;
  titulo: string;
  descricao: string;
  modelo: string;
  serie?: number | string;
  proximoNumero?: number | string;
  /** 'PRODUCAO' | 'HOMOLOGACAO' | 1 | 2 (o backend manda string, o tipo diz número). */
  ambiente?: unknown;
  acoes?: React.ReactNode;
  secoes: SecaoInfo[];
  resumo: React.ReactNode;
  children: React.ReactNode;
}> = ({ icone: Icone, titulo, descricao, modelo, serie, proximoNumero, ambiente, acoes, secoes, resumo, children }) => {
  const producao = ambiente === 'PRODUCAO' || ambiente === 1 || ambiente === '1';
  const [ativa, setAtiva] = useState(secoes[0]?.id);

  // Destaca na navegação a seção que está no topo da área visível.
  useEffect(() => {
    const els = secoes.map((s) => document.getElementById(`secao-${s.id}`)).filter((e): e is HTMLElement => !!e);
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entradas) => {
        const visiveis = entradas.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visiveis[0]) setAtiva(visiveis[0].target.id.replace('secao-', ''));
      },
      { rootMargin: '-120px 0px -60% 0px' },
    );
    els.forEach((e) => obs.observe(e));
    return () => obs.disconnect();
  }, [secoes]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      {/* 1. Cabeçalho */}
      <header className="flex flex-col gap-3 rounded-xl border border-ink-200/80 bg-white px-5 py-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-700 text-white">
            <Icone className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-lg font-bold tracking-[-0.01em] text-ink-950">{titulo}</h1>
              <span className="rounded-md border border-ink-200 px-1.5 py-px font-mono text-[11px] text-ink-500">{modelo}</span>
              {ambiente !== undefined && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    producao ? 'bg-brand-50 text-brand-800' : 'bg-nf-pendente-bg text-nf-pendente'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${producao ? 'bg-brand-600' : 'bg-amber-500'}`} />
                  {producao ? 'Produção' : 'Homologação'}
                </span>
              )}
            </div>
            <p className="mt-0.5 truncate text-xs text-ink-500">{descricao}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {(serie !== undefined || proximoNumero !== undefined) && (
            <div className="text-right">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.07em] text-ink-400">Série {serie ?? '—'}</p>
              <p className="font-mono text-sm font-medium text-ink-900">
                Nº {proximoNumero ?? '—'} <span className="font-sans text-[11px] font-normal text-ink-400">previsto</span>
              </p>
            </div>
          )}
          {acoes}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="min-w-0 space-y-4 xl:col-span-8">
          {/* 2. Navegação entre seções */}
          <nav
            className="sticky top-0 z-20 -mx-1 flex gap-1 overflow-x-auto rounded-xl border border-ink-200/80 bg-white/90 p-1 shadow-card backdrop-blur-sm"
            aria-label="Seções do formulário"
          >
            {secoes.map((s, i) => (
              <a
                key={s.id}
                href={`#secao-${s.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(`secao-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  setAtiva(s.id);
                }}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                  ativa === s.id ? 'bg-brand-50 font-medium text-brand-800' : 'text-ink-500 hover:bg-ink-50 hover:text-ink-800'
                }`}
              >
                <span className={`font-mono text-[10px] ${ativa === s.id ? 'text-brand-600' : 'text-ink-400'}`}>{i + 1}</span>
                {s.titulo}
              </a>
            ))}
          </nav>

          {/* 3. Seções */}
          {children}
        </div>

        {/* 4. Resumo e ações */}
        <aside className="xl:col-span-4">
          <div className="space-y-4 xl:sticky xl:top-0">{resumo}</div>
        </aside>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Seção numerada
// ---------------------------------------------------------------------------
export const SecaoEmissor: React.FC<{
  id: string;
  numero: number;
  titulo: string;
  descricao?: string;
  icone?: LucideIcon;
  acao?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ id, numero, titulo, descricao, icone: Icone, acao, children, className = '' }) => (
  <section id={`secao-${id}`} className={`scroll-mt-16 rounded-xl border border-ink-200/80 bg-white shadow-card ${className}`}>
    <header className="flex flex-col gap-3 border-b border-ink-100 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-ink-200 bg-ink-50 font-mono text-xs font-medium text-ink-600">
          {numero}
        </span>
        <div className="min-w-0">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-ink-950">
            {Icone && <Icone className="h-4 w-4 text-ink-400" />}
            {titulo}
          </h3>
          {descricao && <p className="truncate text-[11px] text-ink-500">{descricao}</p>}
        </div>
      </div>
      {acao && <div className="w-full shrink-0 sm:w-auto sm:min-w-[260px]">{acao}</div>}
    </header>
    <div className="p-5">{children}</div>
  </section>
);

// ---------------------------------------------------------------------------
// Resumo (coluna direita)
// ---------------------------------------------------------------------------
export interface LinhaResumo {
  rotulo: string;
  valor: number | string;
  /** 'negativo' = desconto/retenção; 'sutil' = informativo */
  tom?: 'normal' | 'negativo' | 'sutil';
}

const Dinheiro: React.FC<{ valor: number; className?: string }> = ({ valor, className = '' }) => (
  <span className={`tabular-nums ${className}`}>
    <span className="mr-[0.25em] text-[0.62em] font-medium text-ink-400">R$</span>
    {formatarMoeda(valor).replace(/^-?R\$\s?/, valor < 0 ? '−' : '')}
  </span>
);

export const ResumoEmissor: React.FC<{
  total: { rotulo: string; valor: number };
  linhas?: LinhaResumo[];
  info?: Array<{ rotulo: string; valor: React.ReactNode }>;
  pronto: boolean;
  pendencias?: string[];
  emitir: { rotulo: string; onClick: () => void; transmitindo?: boolean; desabilitado?: boolean };
  onPreview?: () => void;
  onLimpar?: () => void;
  extra?: React.ReactNode;
}> = ({ total, linhas = [], info = [], pronto, pendencias = [], emitir, onPreview, onLimpar, extra }) => (
  <>
    <section className="overflow-hidden rounded-xl border border-ink-200/80 bg-white shadow-card">
      <div className="border-b border-ink-100 px-5 pb-4 pt-4">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.07em] text-ink-500">{total.rotulo}</p>
        <p className="mt-1 font-display text-[30px] font-bold leading-none tracking-[-0.02em] text-brand-700">
          <Dinheiro valor={total.valor} />
        </p>
      </div>

      {linhas.length > 0 && (
        <dl className="space-y-1.5 px-5 py-3.5 text-[13px]">
          {linhas.map((l) => (
            <div key={l.rotulo} className="flex items-center justify-between gap-3">
              <dt className={l.tom === 'sutil' ? 'text-ink-400' : 'text-ink-600'}>{l.rotulo}</dt>
              <dd className={`font-medium ${l.tom === 'negativo' ? 'text-nf-rejeitada' : l.tom === 'sutil' ? 'text-ink-500' : 'text-ink-900'}`}>
                {typeof l.valor === 'number' ? <Dinheiro valor={l.tom === 'negativo' ? -Math.abs(l.valor) : l.valor} /> : l.valor}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {info.length > 0 && (
        <dl className="grid grid-cols-2 gap-px border-t border-ink-100 bg-ink-100">
          {info.map((i) => (
            <div key={i.rotulo} className="bg-white px-5 py-2.5">
              <dt className="text-[10.5px] text-ink-400">{i.rotulo}</dt>
              <dd className="text-[13px] font-medium text-ink-900">{i.valor}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>

    <section className="rounded-xl border border-ink-200/80 bg-white p-4 shadow-card">
      <div
        className={`mb-3 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${
          pronto ? 'bg-nf-autorizada-bg text-nf-autorizada' : 'bg-nf-pendente-bg text-nf-pendente'
        }`}
      >
        {pronto ? <CheckCircle2 className="h-4 w-4" /> : <TriangleAlert className="h-4 w-4" />}
        {pronto ? 'Pronto para emitir' : pendencias.length ? `${pendencias.length} pendência${pendencias.length > 1 ? 's' : ''} para resolver` : 'Preencha os dados obrigatórios'}
      </div>

      {pendencias.length > 0 && (
        <ul className="mb-3 max-h-40 space-y-1 overflow-y-auto rounded-lg border border-nf-rejeitada-bg bg-nf-rejeitada-bg/40 p-3 text-xs text-nf-rejeitada">
          {pendencias.map((p, i) => (
            <li key={i} className="flex gap-1.5">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-nf-rejeitada" />
              {p}
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={emitir.onClick}
        disabled={emitir.transmitindo || emitir.desabilitado}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-700 px-4 py-3 text-sm font-semibold text-white shadow-card transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {emitir.transmitindo ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {emitir.transmitindo ? 'Transmitindo para a SEFAZ…' : emitir.rotulo}
      </button>

      {(onPreview || onLimpar) && (
        <div className="mt-2 grid grid-cols-2 gap-2">
          {onPreview && (
            <button
              type="button"
              onClick={onPreview}
              className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-ink-200 bg-white py-2 text-xs font-medium text-ink-700 transition-colors hover:border-ink-300 hover:bg-ink-50"
            >
              <Eye className="h-3.5 w-3.5" />
              Pré-visualizar
            </button>
          )}
          {onLimpar && (
            <button
              type="button"
              onClick={onLimpar}
              className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-ink-200 bg-white py-2 text-xs font-medium text-ink-700 transition-colors hover:border-ink-300 hover:bg-ink-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Limpar tudo
            </button>
          )}
        </div>
      )}
      {extra}
    </section>
  </>
);

// Botão secundário padrão para o cabeçalho (ex.: "Carregar última nota").
export const BotaoCabecalho: React.FC<{ onClick: () => void; icone: LucideIcon; children: React.ReactNode; carregando?: boolean; title?: string; disabled?: boolean }> = ({
  onClick,
  icone: Icone,
  children,
  carregando,
  title,
  disabled,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled || carregando}
    title={title}
    className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-2 text-xs font-medium text-ink-700 transition-colors hover:border-ink-300 hover:bg-ink-50 disabled:opacity-60"
  >
    <Icone className={`h-3.5 w-3.5 ${carregando ? 'animate-spin' : ''}`} />
    {children}
  </button>
);
