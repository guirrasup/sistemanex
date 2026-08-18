// src/components/Sidebar.tsx

import React, { useState, useMemo, useCallback, memo, useEffect } from "react";
import {
  LayoutDashboard,
  DollarSign,
  FileCheck,
  Users,
  Truck,
  Landmark,
  Package,
  ArrowLeftRight,
  Sparkles,
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
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Calculator,
  ClipboardCheck,
  Wrench,
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

// ===== ITEM DO MENU =====
interface MenuItemProps {
  item: any;
  isActive: boolean;
  collapsed: boolean;
  onSelect: (id: NavTab) => void;
}

const MenuItem = memo(({ item, isActive, collapsed, onSelect }: MenuItemProps) => {
  const Icon = item.icon;

  const handleClick = useCallback(() => {
    onSelect(item.id);
  }, [onSelect, item.id]);

  return (
    <button
      onClick={handleClick}
      className={`w-full group relative transition-colors duration-100 rounded-lg flex items-center gap-2.5 ${
        collapsed ? "px-1.5 py-2 justify-center" : "px-2.5 py-1.5"
      } ${isActive ? "bg-cyan-500/10 border border-cyan-500/20" : "hover:bg-white/5"}`}
      title={collapsed ? item.label : undefined}
    >
      {/* REMOVIDA A BARRA LATERAL CIANO */}

      <div
        className={`relative rounded-lg transition-colors duration-100 ${
          collapsed ? "p-2" : "p-1.5"
        } ${
          isActive
            ? "bg-cyan-500/20 text-cyan-400"
            : "text-slate-500 group-hover:text-slate-300"
        }`}
      >
        <Icon
          className={`${collapsed ? "w-5 h-5" : "w-4 h-4"}`}
          strokeWidth={isActive ? 2.5 : 1.8}
        />
      </div>

      {!collapsed && (
        <div className="flex-1 min-w-0 text-left">
          <div
            className={`text-xs font-medium truncate ${
              isActive ? "text-white" : "text-slate-400 group-hover:text-white"
            }`}
          >
            {item.label}
          </div>
          <div
            className={`text-[9px] truncate ${
              isActive ? "text-cyan-400/70" : "text-slate-500"
            }`}
          >
            {item.description}
          </div>
        </div>
      )}

      {collapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 border border-white/10 rounded-md text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-100 z-50 shadow-xl">
          {item.label}
          <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-1 bg-slate-900 border-l border-b border-white/10 rotate-45"></div>
        </div>
      )}
    </button>
  );
});

MenuItem.displayName = "MenuItem";

// ===== SIDEBAR PRINCIPAL =====
export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [localActiveTab, setLocalActiveTab] = useState<NavTab>(activeTab);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    visao: true,
    financeiro: true,
    fiscal: true,
    contabil: true,
    obrigacoes: true,
    cadastros: true,
    configuracoes: true,
  });

  useEffect(() => {
    setLocalActiveTab(activeTab);
  }, [activeTab]);

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  }, []);

  const menuItems = useMemo(() => [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Visão executiva", section: "visao" },
    { id: "financial", label: "Financeiro", icon: DollarSign, description: "Contas Pagar/Receber", section: "financeiro" },
    { id: "fiscal", label: "Notas Fiscais", icon: FileCheck, description: "NF-e / NFC-e / NFS-e", section: "fiscal" },
    { id: "reconciliation", label: "Conciliação", icon: ArrowLeftRight, description: "Auto-Match com IA", section: "fiscal" },
    { id: "ocr", label: "Leitor de Notas", icon: Sparkles, description: "OCR com Gemini", section: "fiscal" },
    { id: "contabil-dashboard", label: "Dashboard Contábil", icon: PieChart, description: "DRE, Balanço, Ind.", section: "contabil" },
    { id: "livro-diario", label: "Livro Diário", icon: BookOpen, description: "Registro cronológico", section: "contabil" },
    { id: "livro-razao", label: "Livro Razão", icon: BookMarked, description: "Mov. por conta", section: "contabil" },
    { id: "apuracao-impostos", label: "Apuração Impostos", icon: Receipt, description: "ICMS, PIS, COFINS", section: "contabil" },
    { id: "relatorios-contabeis", label: "Relatórios Contábeis", icon: FileSearch, description: "DRE, Balanço, Fluxo", section: "contabil" },
    { id: "relatorios-fiscais", label: "Relatórios Fiscais", icon: FileBarChart, description: "Notas emitidas/rec.", section: "contabil" },
    { id: "sped", label: "SPED ECD/ECF", icon: FileArchive, description: "Gerador de Arquivos RFB", section: "obrigacoes" },
    { id: "sped-validator", label: "Validador SPED", icon: ClipboardCheck, description: "Validação de arquivos", section: "obrigacoes" },
    { id: "exportacao", label: "Exportação", icon: FileDown, description: "CSV, TXT, JSON", section: "obrigacoes" },
    { id: "customers", label: "Clientes", icon: Users, description: "Cadastro e gestão", section: "cadastros" },
    { id: "suppliers", label: "Fornecedores", icon: Truck, description: "Cadastro e gestão", section: "cadastros" },
    { id: "banks", label: "Contas Bancárias", icon: Landmark, description: "Saldos e extratos", section: "cadastros" },
    { id: "inventory", label: "Estoque", icon: Package, description: "Catálogo e mov.", section: "cadastros" },
    { id: "configuracoes", label: "Configurações", icon: Settings, description: "Parâmetros do sistema", section: "configuracoes" },
    { id: "audit", label: "Auditoria", icon: ShieldCheck, description: "Trilha de auditoria", section: "configuracoes" },
  ], []);

  const sections = useMemo(() => [
    { id: "visao", label: "VISÃO GERAL", color: "from-emerald-400 to-emerald-600", text: "text-emerald-400" },
    { id: "financeiro", label: "FINANCEIRO", color: "from-cyan-400 to-cyan-600", text: "text-cyan-400" },
    { id: "fiscal", label: "FISCAL", color: "from-indigo-400 to-indigo-600", text: "text-indigo-400" },
    { id: "contabil", label: "CONTÁBIL", color: "from-blue-400 to-blue-600", text: "text-blue-400" },
    { id: "obrigacoes", label: "OBRIGAÇÕES FISCAIS", color: "from-amber-400 to-amber-600", text: "text-amber-400" },
    { id: "cadastros", label: "FERRAMENTAS", color: "from-purple-400 to-purple-600", text: "text-purple-400" },
    { id: "configuracoes", label: "CONFIGURAÇÕES", color: "from-slate-400 to-slate-600", text: "text-slate-400" },
  ], []);

  const getSectionItems = useCallback((sectionId: string) => {
    return menuItems.filter((item) => item.section === sectionId);
  }, [menuItems]);

  const handleSelect = useCallback((id: NavTab) => {
    setLocalActiveTab(id);
    onTabChange(id);
  }, [onTabChange]);

  const toggleCollapse = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  return (
    <div className="relative h-full flex">
      <aside
        className={`h-full bg-slate-950 border-r border-white/5 flex flex-col select-none transition-all duration-300 ease-in-out overflow-hidden ${
          collapsed ? "w-14" : "w-60"
        }`}
      >
        <div className="h-1 shrink-0"></div>

        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-2 py-3 custom-scrollbar">
          {sections.map((section) => {
            const items = getSectionItems(section.id);
            if (items.length === 0) return null;

            const isExpanded = expandedSections[section.id] !== false;

            return (
              <div key={section.id} className="mb-4">
                {/* Título da Seção - COM BARRA LATERAL (única) */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors ${
                    collapsed ? "justify-center" : ""
                  }`}
                  title={collapsed ? section.label : undefined}
                >
                  {!collapsed && (
                    <>
                      <div className={`w-1 h-5 rounded-full bg-gradient-to-b ${section.color}`}></div>
                      <span className={`text-[9px] font-mono font-bold tracking-[0.15em] uppercase flex-1 text-left ${section.text}`}>
                        {section.label}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </>
                  )}
                  {collapsed && (
                    <div className={`w-1 h-5 rounded-full bg-gradient-to-b ${section.color}`}></div>
                  )}
                </button>

                {/* Itens da Seção */}
                {(isExpanded || collapsed) && (
                  <div className="space-y-0.5 mt-0.5">
                    {items.map((item) => (
                      <MenuItem
                        key={item.id}
                        item={item}
                        isActive={localActiveTab === item.id}
                        collapsed={collapsed}
                        onSelect={handleSelect}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-2 border-t border-white/5 shrink-0">
          <button
            onClick={toggleCollapse}
            className={`w-full rounded-lg transition-all duration-300 hover:bg-white/5 flex items-center ${
              collapsed ? "justify-center px-2 py-2" : "justify-between px-3 py-1.5"
            }`}
          >
            {!collapsed ? (
              <>
                <span className="text-[10px] text-slate-500 font-mono">v2.5.0</span>
                <ChevronLeft className="w-4 h-4 text-slate-500" />
              </>
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>
      </aside>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.4);
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(6, 182, 212, 0.2) transparent;
        }
      `}</style>
    </div>
  );
};