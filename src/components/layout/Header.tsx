// src/components/layout/Header.tsx
// Topo da folha de conteúdo: à esquerda, de quem é o sistema (empresa emissora,
// CNPJ, ambiente e selo do certificado A1) e onde estou (breadcrumb); à direita a
// busca/paleta (Ctrl/⌘ K), os alertas e a única ação primária ("Emitir").
import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronRight, Menu, Plus, Search } from 'lucide-react';
import { usePermissoes } from '../../hooks/usePermissoes';
import { AlertasSistema } from '../ui/AlertasSistema';
import { ConfiguracaoEmpresa } from '../../types/erp';
import { EmpresaAtual } from './EmpresaAtual';
import { EMISSORES, TECLA_MOD, localizarView } from './navegacao';

interface HeaderProps {
  empresa: ConfiguracaoEmpresa;
  currentView: string;
  onNavigate: (view: string) => void;
  onMenuClick: () => void;
  onAbrirBusca: () => void;
}

const BotaoEmitir: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const { podeVerView } = usePermissoes();
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const emissores = EMISSORES.filter((e) => podeVerView(e.id));

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setAberto(false);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setAberto(false);
    document.addEventListener('mousedown', fora);
    window.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', fora);
      window.removeEventListener('keydown', esc);
    };
  }, [aberto]);

  if (emissores.length === 0) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        aria-haspopup="menu"
        className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand-700 py-1.5 pl-2.5 pr-2 text-[13px] font-medium text-white shadow-card transition-colors hover:bg-brand-800"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Emitir</span>
        <ChevronDown className={`h-3.5 w-3.5 opacity-70 transition-transform ${aberto ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {aberto && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-64 origin-top-right overflow-hidden rounded-xl border border-ink-200 bg-white p-1.5 shadow-float"
          >
            <p className="px-2.5 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-400">Novo documento</p>
            {emissores.map((e) => (
              <button
                key={e.id}
                role="menuitem"
                onClick={() => {
                  setAberto(false);
                  onNavigate(e.id);
                }}
                className="group flex w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-left hover:bg-ink-50"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-ink-200 bg-white text-ink-500 transition-colors group-hover:border-brand-200 group-hover:bg-brand-50 group-hover:text-brand-700">
                  <e.icon className="h-4 w-4" />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-medium text-ink-900">{e.label}</span>
                  <span className="block text-xs text-ink-500">{e.detalhe}</span>
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Header: React.FC<HeaderProps> = ({ empresa, currentView, onNavigate, onMenuClick, onAbrirBusca }) => {
  const { isAdmin } = usePermissoes();
  const local = localizarView(currentView, isAdmin);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-ink-200/70 bg-white/80 px-3 backdrop-blur-sm sm:px-5">
      <div className="flex min-w-0 items-center gap-2">
        <button
          onClick={onMenuClick}
          className="cursor-pointer rounded-md p-1.5 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800 lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <EmpresaAtual empresa={empresa} onNavigate={onNavigate} />

        <nav aria-label="Você está em" className="ml-2 hidden min-w-0 items-center gap-1.5 border-l border-ink-200 pl-4 text-sm 2xl:flex">
          {local?.grupo.titulo && (
            <>
              <span className="text-ink-400">{local.grupo.titulo}</span>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink-300" />
            </>
          )}
          <span className="truncate font-medium text-ink-800">{local?.item.label ?? 'Painel'}</span>
        </nav>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
        <button
          onClick={onAbrirBusca}
          title={`Buscar ou ir para (${TECLA_MOD} K)`}
          aria-label="Buscar"
          className="flex cursor-pointer items-center gap-2 rounded-lg p-1.5 text-[13px] text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800 lg:w-60 lg:border lg:border-ink-200 lg:bg-white lg:px-2.5 lg:hover:border-ink-300 lg:hover:bg-white"
        >
          <Search className="h-[18px] w-[18px] shrink-0 lg:h-4 lg:w-4" />
          <span className="hidden flex-1 text-left lg:inline">Buscar ou ir para…</span>
          <kbd className="hidden rounded border border-ink-200 bg-ink-50 px-1.5 py-px font-mono text-[10px] text-ink-400 lg:inline">{TECLA_MOD} K</kbd>
        </button>
        <AlertasSistema onNavigate={onNavigate} />
        <BotaoEmitir onNavigate={onNavigate} />
      </div>
    </header>
  );
};
