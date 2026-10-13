// src/components/layout/Sidebar.tsx
// Sidebar "Livro Aberto": fica sobre o fundo tingido do app, mais apagada que a
// folha de conteúdo. Navegação monocromática, pílula ativa deslizante, seções que
// recolhem (com memória) e modo trilho (Ctrl/⌘ B). Só itens do sistema: a
// identificação da empresa e o certificado A1 ficam no Header.
import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Download, LogOut, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import { usePermissoes } from '../../hooks/usePermissoes';
import { UsuarioAuth } from '../../types/erp';
import { ContadoresNav, TECLA_MOD, gruposNavegacao, valorContador, viewAtiva } from './navegacao';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  usuario?: UsuarioAuth | null;
  contadores?: ContadoresNav;
  recolhida: boolean;
  onAlternarRecolhida: () => void;
  mobileAberta: boolean;
  onFecharMobile: () => void;
  onExportarBackup?: () => void;
  onLogout?: () => void;
}

const CHAVE_GRUPOS_FECHADOS = '@sup:nav-grupos-fechados';

function lerGruposFechados(): string[] {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_GRUPOS_FECHADOS) || '[]');
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Menu do usuário (rodapé)
// ---------------------------------------------------------------------------
const MenuUsuario: React.FC<{
  usuario: UsuarioAuth;
  recolhida: boolean;
  onExportarBackup?: () => void;
  onLogout?: () => void;
}> = ({ usuario, recolhida, onExportarBackup, onLogout }) => {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { pode } = usePermissoes();
  const perfil = usuario.perfil === 'ADMIN' ? 'Administrador' : usuario.perfilAcesso?.nome || usuario.perfil;

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setAberto(false);
    document.addEventListener('mousedown', fora);
    return () => document.removeEventListener('mousedown', fora);
  }, [aberto]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        title={usuario.nome}
        className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg p-1.5 text-left transition-colors hover:bg-white/70 ${recolhida ? 'justify-center' : ''}`}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-800 text-xs font-semibold text-white">
          {(usuario.nome || 'U').charAt(0).toUpperCase()}
        </div>
        {!recolhida && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-ink-900">{usuario.nome}</p>
            <p className="truncate text-[11px] text-ink-500">{perfil}</p>
          </div>
        )}
      </button>

      <AnimatePresence>
        {aberto && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className={`absolute bottom-full z-50 mb-2 w-60 overflow-hidden rounded-xl border border-ink-200 bg-white shadow-float ${recolhida ? 'left-0' : 'inset-x-0 w-auto'}`}
          >
            <div className="border-b border-ink-100 px-3.5 py-3">
              <p className="truncate text-sm font-semibold text-ink-950">{usuario.nome}</p>
              <p className="truncate text-xs text-ink-500">{usuario.email}</p>
            </div>
            <div className="p-1.5">
              {onExportarBackup && pode('relatorios.exportar') && (
                <button
                  onClick={() => {
                    setAberto(false);
                    onExportarBackup();
                  }}
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-ink-700 hover:bg-ink-50"
                >
                  <Download className="h-4 w-4 text-ink-400" />
                  Exportar backup
                </button>
              )}
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-ink-700 hover:bg-nf-rejeitada-bg hover:text-nf-rejeitada"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  usuario,
  contadores = {},
  recolhida: recolhidaDesktop,
  onAlternarRecolhida,
  mobileAberta,
  onFecharMobile,
  onExportarBackup,
  onLogout,
}) => {
  const { podeVerView, isAdmin } = usePermissoes();
  const [fechados, setFechados] = useState<string[]>(lerGruposFechados);
  // No mobile (gaveta) a sidebar está sempre expandida.
  const recolhida = recolhidaDesktop && !mobileAberta;
  const ativo = viewAtiva(currentView);

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE_GRUPOS_FECHADOS, JSON.stringify(fechados));
    } catch {
      /* armazenamento indisponível: só não lembra */
    }
  }, [fechados]);

  // Fecha a gaveta com Esc.
  useEffect(() => {
    if (!mobileAberta) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onFecharMobile();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileAberta, onFecharMobile]);

  const grupos = gruposNavegacao(isAdmin)
    .map((g) => ({ ...g, itens: g.itens.filter((i) => podeVerView(i.id)) }))
    .filter((g) => g.itens.length > 0);

  const navegar = (view: string) => {
    onNavigate(view);
    onFecharMobile();
  };


  return (
    <>
      <AnimatePresence>
        {mobileAberta && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onFecharMobile}
            className="fixed inset-0 z-40 bg-ink-950/40 backdrop-blur-[2px] lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex shrink-0 select-none flex-col bg-ink-100 transition-[width,transform] duration-300 ease-out lg:static lg:z-auto lg:translate-x-0 ${
          mobileAberta ? 'w-72 translate-x-0 shadow-float' : '-translate-x-full lg:shadow-none'
        } ${recolhida ? 'lg:w-[68px]' : 'lg:w-[252px]'}`}
        aria-label="Navegação principal"
      >
        {/* Marca + recolher */}
        <div className={`flex h-14 shrink-0 items-center ${recolhida ? 'justify-center px-2' : 'justify-between px-4'}`}>
          {!recolhida && (
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-700 font-display text-sm font-bold text-white">S</div>
              <span className="font-display text-[15px] font-bold tracking-tight text-ink-950">SUP Tecnologia</span>
            </div>
          )}
          <button
            onClick={mobileAberta ? onFecharMobile : onAlternarRecolhida}
            title={mobileAberta ? 'Fechar menu' : `${recolhida ? 'Expandir' : 'Recolher'} menu (${TECLA_MOD} B)`}
            className="cursor-pointer rounded-md p-1.5 text-ink-400 transition-colors hover:bg-white/70 hover:text-ink-700"
          >
            {mobileAberta ? <X className="h-4 w-4" /> : recolhida ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>

        {/* Navegação */}
        <nav className="mt-2 flex-1 overflow-y-auto overflow-x-hidden px-3 pb-3">
          {grupos.map((grupo, gi) => {
            const fechado = !recolhida && grupo.titulo !== null && fechados.includes(grupo.id);
            return (
              <div key={grupo.id} className={gi > 0 ? 'mt-4' : ''}>
                {grupo.titulo &&
                  (recolhida ? (
                    <div className="mx-auto mb-2 h-px w-6 bg-ink-200" />
                  ) : (
                    <button
                      onClick={() =>
                        setFechados((f) => (f.includes(grupo.id) ? f.filter((x) => x !== grupo.id) : [...f, grupo.id]))
                      }
                      aria-expanded={!fechado}
                      className="group mb-1 flex w-full cursor-pointer items-center justify-between rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-400 hover:text-ink-600"
                    >
                      {grupo.titulo}
                      <ChevronDown className={`h-3.5 w-3.5 opacity-0 transition-all group-hover:opacity-100 ${fechado ? '-rotate-90 opacity-100' : ''}`} />
                    </button>
                  ))}

                <AnimatePresence initial={false}>
                  {!fechado && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="space-y-px overflow-hidden"
                    >
                      {grupo.itens.map((item) => {
                        const sel = ativo === item.id;
                        const qtd = valorContador(item.contador, contadores);
                        const forte = item.contador === 'titulosPendentesCount';
                        const Icon = item.icon;
                        return (
                          <li key={item.id}>
                            <button
                              id={`menu-item-${item.id}`}
                              onClick={() => navegar(item.id)}
                              title={recolhida ? `${item.label}${item.detalhe ? ` · ${item.detalhe}` : ''}` : undefined}
                              aria-current={sel ? 'page' : undefined}
                              className={`relative flex w-full cursor-pointer items-center gap-2.5 rounded-lg text-left text-[13px] transition-colors ${
                                recolhida ? 'justify-center p-2' : 'px-2.5 py-[7px]'
                              } ${sel ? 'font-medium text-ink-950' : 'text-ink-600 hover:bg-white/50 hover:text-ink-900'}`}
                            >
                              {sel && (
                                <motion.span
                                  layoutId="sidebar-ativo"
                                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                                  className="absolute inset-0 rounded-lg border border-ink-200/80 bg-white shadow-card"
                                />
                              )}
                              {sel && !recolhida && <span className="absolute inset-y-2 left-0 z-10 w-[3px] rounded-r-full bg-brand-700" />}
                              <Icon className={`relative z-10 h-4 w-4 shrink-0 ${sel ? 'text-brand-700' : 'text-ink-400'}`} />
                              {!recolhida && (
                                <>
                                  <span className="relative z-10 flex min-w-0 flex-1 items-baseline gap-1.5 truncate">
                                    {item.label}
                                    {item.detalhe && <span className="truncate text-[11px] font-normal text-ink-400">{item.detalhe}</span>}
                                  </span>
                                  {qtd !== undefined && qtd > 0 && (
                                    <span
                                      className={`relative z-10 font-mono text-[11px] tabular-nums ${
                                        forte ? 'rounded-full bg-brand-700 px-1.5 py-px text-white' : 'text-ink-400'
                                      }`}
                                    >
                                      {qtd > 999 ? '999+' : qtd}
                                    </span>
                                  )}
                                </>
                              )}
                              {recolhida && forte && qtd !== undefined && qtd > 0 && (
                                <span className="absolute right-1.5 top-1.5 z-10 h-1.5 w-1.5 rounded-full bg-brand-600" />
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* Rodapé: selo A1 + usuário */}
        <div className="shrink-0 border-t border-ink-200/70 p-3">
          {usuario && <MenuUsuario usuario={usuario} recolhida={recolhida} onExportarBackup={onExportarBackup} onLogout={onLogout} />}
        </div>
      </aside>
    </>
  );
};
