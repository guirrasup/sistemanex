// src/components/layout/CommandPalette.tsx
// Paleta de comandos (Ctrl/⌘ K): navegação e ações numa só lista, com busca sem
// acento, teclado (↑ ↓ ↵ Esc) e telas recentes. Reconhece chave de acesso (44
// dígitos) e CNPJ colados e leva direto à tela certa.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CornerDownLeft, Download, FileSearch, History, LogOut, Plus, Search, type LucideIcon } from 'lucide-react';
import { usePermissoes } from '../../hooks/usePermissoes';
import { EMISSORES, gruposNavegacao } from './navegacao';

interface CommandPaletteProps {
  aberto: boolean;
  onFechar: () => void;
  onNavigate: (view: string) => void;
  onExportarBackup?: () => void;
  onLogout?: () => void;
}

interface Comando {
  id: string;
  grupo: string;
  label: string;
  detalhe?: string;
  icon: LucideIcon;
  busca: string;
  executar: () => void;
}

const CHAVE_RECENTES = '@sup:paleta-recentes';

const normalizar = (t: string) =>
  t
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

function lerRecentes(): string[] {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_RECENTES) || '[]');
  } catch {
    return [];
  }
}

function registrarRecente(view: string) {
  try {
    const lista = [view, ...lerRecentes().filter((v) => v !== view)].slice(0, 4);
    localStorage.setItem(CHAVE_RECENTES, JSON.stringify(lista));
  } catch {
    /* sem armazenamento: só não lembra */
  }
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ aberto, onFechar, onNavigate, onExportarBackup, onLogout }) => {
  const { podeVerView, pode, isAdmin } = usePermissoes();
  const [consulta, setConsulta] = useState('');
  const [indice, setIndice] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (aberto) {
      setConsulta('');
      setIndice(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [aberto]);

  const ir = (view: string) => {
    registrarRecente(view);
    onFechar();
    onNavigate(view);
  };

  const comandos = useMemo<Comando[]>(() => {
    const lista: Comando[] = [];
    for (const g of gruposNavegacao(isAdmin)) {
      for (const item of g.itens) {
        // Emissores entram só no grupo "Emitir" (mesma tela, sem duplicar).
        if (!podeVerView(item.id) || EMISSORES.some((e) => e.id === item.id)) continue;
        lista.push({
          id: `ir:${item.id}`,
          grupo: 'Ir para',
          label: item.label,
          detalhe: g.titulo ?? undefined,
          icon: item.icon,
          busca: normalizar(`${item.label} ${item.detalhe ?? ''} ${g.titulo ?? ''} ${item.palavras ?? ''}`),
          executar: () => ir(item.id),
        });
      }
    }
    for (const e of EMISSORES) {
      if (!podeVerView(e.id)) continue;
      lista.push({
        id: `emitir:${e.id}`,
        grupo: 'Emitir',
        label: `Emitir ${e.label}`,
        detalhe: e.detalhe,
        icon: Plus,
        busca: normalizar(`emitir nova novo ${e.label} ${e.detalhe} ${e.palavras ?? ''}`),
        executar: () => ir(e.id),
      });
    }
    if (onExportarBackup && pode('relatorios.exportar')) {
      lista.push({
        id: 'acao:backup',
        grupo: 'Ações',
        label: 'Exportar backup',
        icon: Download,
        busca: normalizar('exportar backup baixar dados'),
        executar: () => {
          onFechar();
          onExportarBackup();
        },
      });
    }
    if (onLogout) {
      lista.push({
        id: 'acao:sair',
        grupo: 'Ações',
        label: 'Sair do sistema',
        icon: LogOut,
        busca: normalizar('sair logout desconectar'),
        executar: () => {
          onFechar();
          onLogout();
        },
      });
    }
    return lista;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, podeVerView, pode, onExportarBackup, onLogout]);

  const resultados = useMemo<Comando[]>(() => {
    const q = normalizar(consulta.trim());
    const digitos = consulta.replace(/\D/g, '');

    if (!q) {
      const recentes = lerRecentes()
        .map((v) => comandos.find((c) => c.id === `ir:${v}` || c.id === `emitir:${v}`))
        .filter((c): c is Comando => !!c)
        .map((c) => ({ ...c, id: `recente:${c.id}`, grupo: 'Recentes', icon: History }));
      return [...recentes, ...comandos.filter((c) => c.grupo !== 'Emitir')];
    }

    const especiais: Comando[] = [];
    if (digitos.length === 44 && podeVerView('documentos-fiscais')) {
      especiais.push({
        id: 'especial:chave',
        grupo: 'Chave de acesso',
        label: 'Localizar documento pela chave',
        detalhe: `${digitos.slice(0, 4)} … ${digitos.slice(-4)}`,
        icon: FileSearch,
        busca: '',
        executar: () => ir('documentos-fiscais'),
      });
    }
    if (digitos.length === 14 && /^[\d./-\s]+$/.test(consulta.trim()) && podeVerView('consulta-cnpj')) {
      especiais.push({
        id: 'especial:cnpj',
        grupo: 'CNPJ',
        label: 'Consultar este CNPJ na Receita',
        detalhe: consulta.trim(),
        icon: Search,
        busca: '',
        executar: () => ir('consulta-cnpj'),
      });
    }

    const termos = q.split(/\s+/);
    const achados = comandos.filter((c) => termos.every((t) => c.busca.includes(t)));
    // Quem começa com o termo vem primeiro.
    achados.sort((a, b) => Number(normalizar(b.label).startsWith(termos[0])) - Number(normalizar(a.label).startsWith(termos[0])));
    return [...especiais, ...achados];
  }, [consulta, comandos, podeVerView]);

  useEffect(() => setIndice(0), [consulta]);

  useEffect(() => {
    listaRef.current?.querySelector(`[data-indice="${indice}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [indice]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndice((i) => Math.min(i + 1, resultados.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndice((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      resultados[indice]?.executar();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onFechar();
    }
  };

  let ultimoGrupo = '';

  return (
    <AnimatePresence>
      {aberto && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[70] flex items-start justify-center bg-ink-950/30 px-4 pt-[12vh] backdrop-blur-[3px]"
          onMouseDown={onFechar}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Paleta de comandos"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={onKeyDown}
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-float"
          >
            <div className="flex items-center gap-3 border-b border-ink-100 px-4">
              <Search className="h-5 w-5 shrink-0 text-ink-400" />
              <input
                ref={inputRef}
                value={consulta}
                onChange={(e) => setConsulta(e.target.value)}
                placeholder="Buscar tela, emitir documento, colar chave de acesso ou CNPJ…"
                className="h-14 w-full bg-transparent text-[15px] text-ink-950 outline-none placeholder:text-ink-400"
                role="combobox"
                aria-expanded="true"
                aria-controls="paleta-resultados"
                aria-activedescendant={resultados[indice] ? `cmd-${indice}` : undefined}
              />
              <kbd className="hidden rounded border border-ink-200 px-1.5 py-0.5 font-mono text-[10px] text-ink-400 sm:block">Esc</kbd>
            </div>

            <div ref={listaRef} id="paleta-resultados" role="listbox" className="max-h-[min(420px,55vh)] overflow-y-auto p-2">
              {resultados.length === 0 && (
                <p className="px-3 py-10 text-center text-sm text-ink-500">Nada encontrado para “{consulta}”.</p>
              )}
              {resultados.map((c, i) => {
                const cabecalho = c.grupo !== ultimoGrupo;
                ultimoGrupo = c.grupo;
                const sel = i === indice;
                return (
                  <React.Fragment key={c.id}>
                    {cabecalho && (
                      <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-400 first:pt-1">{c.grupo}</p>
                    )}
                    <button
                      id={`cmd-${i}`}
                      data-indice={i}
                      role="option"
                      aria-selected={sel}
                      onMouseMove={() => setIndice(i)}
                      onClick={c.executar}
                      className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left ${sel ? 'bg-brand-50' : ''}`}
                    >
                      <c.icon className={`h-4 w-4 shrink-0 ${sel ? 'text-brand-700' : 'text-ink-400'}`} />
                      <span className={`flex-1 truncate text-sm ${sel ? 'font-medium text-ink-950' : 'text-ink-700'}`}>{c.label}</span>
                      {c.detalhe && <span className="truncate font-mono text-[11px] text-ink-400">{c.detalhe}</span>}
                      {sel && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-brand-600" />}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>

            <div className="flex items-center gap-4 border-t border-ink-100 bg-ink-50 px-4 py-2 text-[11px] text-ink-400">
              <span className="flex items-center gap-1">
                <kbd className="font-mono">↑↓</kbd> navegar
              </span>
              <span className="flex items-center gap-1">
                <kbd className="font-mono">↵</kbd> abrir
              </span>
              <span className="flex items-center gap-1">
                <kbd className="font-mono">esc</kbd> fechar
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
