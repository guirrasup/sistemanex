// src/components/Sidebar.tsx

import React, { useState } from "react";
import {
  LayoutDashboard,
  DollarSign,
  FileCheck,
  Users,
  Truck,
  Landmark,
  Package,
  ArrowLeftRight,
  FileText,
  ShieldCheck,
  Settings,
  FileArchive,
  PieChart,
  FileSearch,
  Receipt,
  BookOpen,
  BookMarked,
  FileBarChart,
  FileDown,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export type NavTab =
  | "dashboard"
  | "financial"
  | "fiscal"
  | "customers"
  | "suppliers"
  | "banks"
  | "inventory"
  | "reconciliation"
  | "ocr"
  | "audit"
  | "sped"
  | "configuracoes"
  | "contabil-dashboard"
  | "relatorios-contabeis"
  | "apuracao-impostos"
  | "sped-validator"
  | "livro-diario"
  | "livro-razao"
  | "relatorios-fiscais"
  | "exportacao";

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

interface NavItem {
  id: NavTab;
  label: string;
  description: string;
  icon: React.FC<{ className?: string }>;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "PRINCIPAL & VISÃO GERAL": true,
    "FISCAL & OPERAÇÃO": true,
    "CONTÁBIL & OBRIGAÇÕES": true,
    "CONTÁBIL & RELATÓRIOS": true,
    "CADASTROS PRINCIPAIS": true,
    "GOVERNANÇA & GOV": true,
  });

  const navSections: NavSection[] = [
    {
      title: "PRINCIPAL & VISÃO GERAL",
      items: [
        {
          id: "dashboard",
          label: "Visão Geral",
          description: "DRE, Indicadores & Fluxo",
          icon: LayoutDashboard,
        },
        {
          id: "financial",
          label: "Financeiro",
          description: "Contas Pagar/Receber",
          icon: DollarSign,
        },
      ],
    },
    {
      title: "FISCAL & OPERAÇÃO",
      items: [
        {
          id: "fiscal",
          label: "Notas Fiscais",
          description: "NF-e, NFC-e, DANFE",
          icon: FileCheck,
        },
        {
          id: "reconciliation",
          label: "Conciliação",
          description: "Auto-Match IA",
          icon: ArrowLeftRight,
        },
        {
          id: "ocr",
          label: "Leitor IA",
          description: "OCR Inteligente",
          icon: FileText,
        },
      ],
    },
    {
      title: "CONTÁBIL & OBRIGAÇÕES",
      items: [
        {
          id: "sped",
          label: "SPED ECD/ECF",
          description: "Gerador RFB",
          icon: FileArchive,
        },
        {
          id: "sped-validator",
          label: "Validador SPED",
          description: "Validação ECD/ECF",
          icon: FileCheck,
        },
        {
          id: "configuracoes",
          label: "Configurações",
          description: "Parâmetros Contábeis",
          icon: Settings,
        },
      ],
    },
    {
      title: "CONTÁBIL & RELATÓRIOS",
      items: [
        {
          id: "contabil-dashboard",
          label: "Dashboard Contábil",
          description: "DRE, Balanço, Ind.",
          icon: PieChart,
        },
        {
          id: "relatorios-contabeis",
          label: "Relatórios Contábeis",
          description: "DRE, Balanço, Fluxo",
          icon: FileSearch,
        },
        {
          id: "apuracao-impostos",
          label: "Apuração Impostos",
          description: "ICMS, PIS, COFINS",
          icon: Receipt,
        },
        {
          id: "livro-diario",
          label: "Livro Diário",
          description: "Registro Cronológico",
          icon: BookOpen,
        },
        {
          id: "livro-razao",
          label: "Livro Razão",
          description: "Mov. por Conta",
          icon: BookMarked,
        },
        {
          id: "relatorios-fiscais",
          label: "Relatórios Fiscais",
          description: "Notas Emitidas/Rec.",
          icon: FileBarChart,
        },
        {
          id: "exportacao",
          label: "Exportação",
          description: "Exportar Dados",
          icon: FileDown,
        },
      ],
    },
    {
      title: "CADASTROS PRINCIPAIS",
      items: [
        {
          id: "customers",
          label: "Clientes",
          description: "Gestão de Clientes",
          icon: Users,
        },
        {
          id: "suppliers",
          label: "Fornecedores",
          description: "Gestão de Fornecedores",
          icon: Truck,
        },
        {
          id: "banks",
          label: "Contas Bancárias",
          description: "Saldos e Extratos",
          icon: Landmark,
        },
        {
          id: "inventory",
          label: "Estoque",
          description: "Catálogo e Mov.",
          icon: Package,
        },
      ],
    },
    {
      title: "GOVERNANÇA & GOV",
      items: [
        {
          id: "audit",
          label: "Auditoria",
          description: "Trilha Imutável",
          icon: ShieldCheck,
        },
      ],
    },
  ];

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className="relative h-full flex">
      {/* Sidebar */}
      <aside
        className={`h-full bg-slate-950/70 backdrop-blur-md border-r border-white/5 flex flex-col select-none transition-all duration-300 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        {/* SCROLL EXCLUSIVO DO SIDEBAR */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3 space-y-3 custom-scrollbar">
          {navSections.map((section, idx) => {
            const isExpanded = expandedSections[section.title] !== false;

            return (
              <div key={idx} className="space-y-1">
                {/* Título da Seção */}
                <button
                  onClick={() => toggleSection(section.title)}
                  className={`w-full flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-white/5 transition-colors ${
                    collapsed ? "justify-center" : "justify-between"
                  }`}
                  title={collapsed ? section.title : undefined}
                >
                  {!collapsed && (
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest font-mono">
                      {section.title}
                    </span>
                  )}
                  {collapsed && <div className="w-1 h-1 rounded-full bg-slate-600"></div>}
                  {!collapsed && (
                    <span className="text-slate-500">
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </span>
                  )}
                </button>

                {/* Itens da Seção */}
                {(isExpanded || collapsed) && (
                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;

                      return (
                        <button
                          key={item.id}
                          onClick={() => onTabChange(item.id)}
                          title={collapsed ? item.label : undefined}
                          className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2.5 ${
                            collapsed ? "justify-center px-1.5" : ""
                          } ${
                            isActive
                              ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] font-bold"
                              : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent"
                          }`}
                        >
                          <div
                            className={`p-1.5 rounded-lg shrink-0 transition-all ${
                              isActive ? "bg-cyan-500 text-slate-950" : "bg-slate-900 text-slate-400"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>

                          {!collapsed && (
                            <div className="overflow-hidden flex-1 min-w-0">
                              <div className="text-xs font-bold truncate">{item.label}</div>
                              <div className="text-[10px] text-slate-500 font-normal truncate">
                                {item.description}
                              </div>
                            </div>
                          )}

                          {isActive && !collapsed && (
                            <div className="w-1 h-8 rounded-full bg-cyan-400 shrink-0"></div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Rodapé Fixo */}
        <div
          className={`p-3 border-t border-white/5 text-center text-[11px] text-slate-500 font-mono shrink-0 ${
            collapsed ? "text-[8px]" : ""
          }`}
        >
          {collapsed ? "NEXS" : "NEXS Enterprise v2.5.0"}
        </div>
      </aside>

      {/* DELIMITADOR - Cursor col-resize e clique para retrair */}
      <div
        onClick={toggleCollapse}
        className="relative w-1.5 h-full bg-transparent hover:bg-cyan-500/30 cursor-col-resize transition-colors flex items-center justify-center group shrink-0"
        title={collapsed ? "Clique para expandir" : "Clique para recolher"}
      >
        <div className="w-0.5 h-8 rounded-full bg-slate-600/0 group-hover:bg-cyan-400/60 transition-all"></div>
        <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-4 h-4 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
            <div className="w-0.5 h-3 rounded-full bg-cyan-400/60"></div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.5);
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(6, 182, 212, 0.3) transparent;
        }
      `}</style>
    </div>
  );
};