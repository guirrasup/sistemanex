// C:\emissornfe\src\components\layout\Sidebar.tsx

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FileText,
  Receipt,
  Files,
  Package,
  DollarSign,
  Users,
  Briefcase,
  Building,
  ShoppingBag,
  Truck,
  FileBadge2,
  FileArchive, // 🔥 NOVO - MDF-e
  Search,
  UserPlus,
  UserCheck,
  X,
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onSelectView?: (view: string) => void;
  onNavigate?: (view: string) => void;
  isOpen?: boolean;
  onToggle?: () => void;
  contadores?: {
    nfseCount?: number;
    nfeCount?: number;
    nfceCount?: number;
    cteCount?: number;
    nfaeCount?: number;
    mdfeCount?: number; // 🔥 NOVO
    produtosCount?: number;
    clientesCount?: number;
    fornecedoresCount?: number;
    servicosCount?: number;
    titulosPendentesCount?: number;
    transportadorasCount?: number;
  };
  onMenuToggle?: () => void;
}

// 🔥 CORES POR ÍTEM DO MENU
const coresMenu: Record<string, { ativo: string; icone: string; badge: string; hover: string }> = {
  dashboard: { ativo: 'bg-blue-50 text-blue-700', icone: 'text-blue-500', badge: 'bg-blue-100 text-blue-700', hover: 'hover:bg-blue-50' },
  'documentos-fiscais': { ativo: 'bg-indigo-50 text-indigo-700', icone: 'text-indigo-500', badge: 'bg-indigo-100 text-indigo-700', hover: 'hover:bg-indigo-50' },
  'nfe-emissor': { ativo: 'bg-emerald-50 text-emerald-700', icone: 'text-emerald-500', badge: 'bg-emerald-100 text-emerald-700', hover: 'hover:bg-emerald-50' },
  'nfse-emissor': { ativo: 'bg-blue-50 text-blue-700', icone: 'text-blue-500', badge: 'bg-blue-100 text-blue-700', hover: 'hover:bg-blue-50' },
  'nfce-emissor': { ativo: 'bg-purple-50 text-purple-700', icone: 'text-purple-500', badge: 'bg-purple-100 text-purple-700', hover: 'hover:bg-purple-50' },
  'cte-emissor': { ativo: 'bg-cyan-50 text-cyan-700', icone: 'text-cyan-500', badge: 'bg-cyan-100 text-cyan-700', hover: 'hover:bg-cyan-50' },
  'nfae-emissor': { ativo: 'bg-amber-50 text-amber-700', icone: 'text-amber-500', badge: 'bg-amber-100 text-amber-700', hover: 'hover:bg-amber-50' },
  // 🔥 NOVO - MDF-e (COR LARANJA)
  'mdfe-emissor': { ativo: 'bg-orange-50 text-orange-700', icone: 'text-orange-500', badge: 'bg-orange-100 text-orange-700', hover: 'hover:bg-orange-50' },
  produtos: { ativo: 'bg-green-50 text-green-700', icone: 'text-green-500', badge: 'bg-green-100 text-green-700', hover: 'hover:bg-green-50' },
  servicos: { ativo: 'bg-pink-50 text-pink-700', icone: 'text-pink-500', badge: 'bg-pink-100 text-pink-700', hover: 'hover:bg-pink-50' },
  clientes: { ativo: 'bg-sky-50 text-sky-700', icone: 'text-sky-500', badge: 'bg-sky-100 text-sky-700', hover: 'hover:bg-sky-50' },
  fornecedores: { ativo: 'bg-violet-50 text-violet-700', icone: 'text-violet-500', badge: 'bg-violet-100 text-violet-700', hover: 'hover:bg-violet-50' },
  transportadoras: { ativo: 'bg-cyan-50 text-cyan-700', icone: 'text-cyan-500', badge: 'bg-cyan-100 text-cyan-700', hover: 'hover:bg-cyan-50' },
  financeiro: { ativo: 'bg-yellow-50 text-yellow-700', icone: 'text-yellow-500', badge: 'bg-yellow-100 text-yellow-700', hover: 'hover:bg-yellow-50' },
  configuracoes: { ativo: 'bg-slate-50 text-slate-700', icone: 'text-slate-500', badge: 'bg-slate-100 text-slate-700', hover: 'hover:bg-slate-50' },
  'consulta-cnpj': { ativo: 'bg-rose-50 text-rose-700', icone: 'text-rose-500', badge: 'bg-rose-100 text-rose-700', hover: 'hover:bg-rose-50' },
};

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  onNavigate,
  isOpen = true,
  onToggle,
  contadores = {},
  onMenuToggle,
}) => {
  const handleSelect = onSelectView || onNavigate || (() => {});
  
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (onMenuToggle) {
      onMenuToggle();
    }
  }, [mobileOpen, onMenuToggle]);

  const handleItemClick = (view: string) => {
    handleSelect(view);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const totalNotas = 
    (contadores.nfseCount || 0) + 
    (contadores.nfeCount || 0) + 
    (contadores.nfceCount || 0) + 
    (contadores.cteCount || 0) + 
    (contadores.nfaeCount || 0) + 
    (contadores.mdfeCount || 0); // 🔥 ADICIONAR MDF-e

  const menuGrupos = [
    {
      titulo: 'GERAL',
      itens: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      titulo: 'MÓDULO FISCAL',
      itens: [
        { id: 'nfe-emissor', label: 'NF-e (Produtos)', icon: Receipt },
        { id: 'nfse-emissor', label: 'NFS-e (Serviços)', icon: FileText },
        { id: 'nfce-emissor', label: 'NFC-e (Consumidor)', icon: ShoppingBag },
        { id: 'cte-emissor', label: 'CT-e (Transporte)', icon: Truck },
        { id: 'nfae-emissor', label: 'NFA-e (Avulsa)', icon: FileBadge2 },
        // 🔥 NOVO - MDF-e (Após NFA-e, antes de Documentos)
        { id: 'mdfe-emissor', label: 'MDF-e (Manifesto)', icon: FileArchive, badgeCount: contadores.mdfeCount || 0 },
        { id: 'documentos-fiscais', label: 'Documentos Emitidos', icon: Files, badgeCount: totalNotas },
      ],
    },
    {
      titulo: 'CADASTROS',
      itens: [
        { id: 'produtos', label: 'Produtos / Estoque', icon: Package, badgeCount: contadores.produtosCount },
        { id: 'servicos', label: 'Serviços', icon: Briefcase, badgeCount: contadores.servicosCount },
        { id: 'clientes', label: 'Clientes', icon: UserPlus, badgeCount: contadores.clientesCount },
        { id: 'fornecedores', label: 'Fornecedores', icon: UserCheck, badgeCount: contadores.fornecedoresCount },
        { id: 'transportadoras', label: 'Transportadoras', icon: Truck, badgeCount: contadores.transportadorasCount },
      ],
    },
    {
      titulo: 'FINANCEIRO & CONFIG',
      itens: [
        { id: 'financeiro', label: 'Financeiro', icon: DollarSign, badgeCount: contadores.titulosPendentesCount },
        { id: 'configuracoes', label: 'Dados da Empresa / A1', icon: Building },
      ],
    },
    {
      titulo: 'FERRAMENTAS',
      itens: [
        { id: 'consulta-cnpj', label: 'Consulta CNPJ', icon: Search },
      ],
    },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-2 space-y-4 flex-1 overflow-y-auto">
        {menuGrupos.map((grupo, gIdx) => (
          <div key={gIdx} className="space-y-0.5">
            <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {grupo.titulo}
            </div>
            <div className="space-y-0.5">
              {grupo.itens.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                const cores = coresMenu[item.id] || coresMenu.dashboard;
                
                return (
                  <button
                    key={item.id}
                    id={`menu-item-${item.id}`}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-left text-xs transition-colors cursor-pointer ${
                      isActive ? cores.ativo : `text-slate-700 ${cores.hover}`
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? cores.icone : 'text-slate-400'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badgeCount !== undefined && item.badgeCount > 0 && (
                      <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                        isActive ? cores.badge : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.badgeCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="p-2.5 border-t border-slate-200 text-[11px] text-slate-400 flex items-center justify-between">
        <span>ERP Emissor Fiscal</span>
        <span className="text-emerald-600 font-medium">● SEFAZ OK</span>
      </div>
    </div>
  );

  return (
    <>
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 select-none h-full overflow-y-auto
          transition-all duration-300 ease-in-out
          ${isMobile ? 'fixed top-0 left-0 z-40 w-72 h-full shadow-xl' : 'relative w-56'}
          ${isMobile && !mobileOpen ? '-translate-x-full' : 'translate-x-0'}
        `}
      >
        {isMobile && (
          <div className="flex items-center justify-between p-3 border-b border-slate-200 bg-white">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-slate-700 to-slate-900 rounded flex items-center justify-center text-white font-bold text-sm">
                S
              </div>
              <span className="font-bold text-sm text-slate-900">SUP Fiscal</span>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <SidebarContent />
      </aside>
    </>
  );
};