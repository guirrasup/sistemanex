import React from "react";
import {
  LayoutDashboard, DollarSign, FileCheck, Users, Truck,
  Landmark, Package, ArrowLeftRight, FileText, ShieldCheck
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
  | "audit";

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const navSections = [
    {
      title: "PRINCIPAL & VISÃO GERAL",
      items: [
        {
          id: "dashboard" as NavTab,
          label: "Visão Geral Executiva",
          description: "DRE, Indicadores & Fluxo de Caixa",
          icon: LayoutDashboard,
        },
        {
          id: "financial" as NavTab,
          label: "Financeiro & Caixa",
          description: "Contas Pagar/Receber & Baixas",
          icon: DollarSign,
        },
      ],
    },
    {
      title: "FISCAL & OPERAÇÃO",
      items: [
        {
          id: "fiscal" as NavTab,
          label: "Emissor & Notas Fiscais",
          description: "NF-e, NFC-e, DANFE & SEFAZ",
          icon: FileCheck,
        },
        {
          id: "reconciliation" as NavTab,
          label: "Conciliação Bancária",
          description: "Vínculo N:N & Auto-Match IA",
          icon: ArrowLeftRight,
        },
        {
          id: "ocr" as NavTab,
          label: "Leitor de Notas IA",
          description: "OCR Inteligente Gemini",
          icon: FileText,
        },
      ],
    },
    {
      title: "CADASTROS PRINCIPAIS",
      items: [
        {
          id: "customers" as NavTab,
          label: "Clientes",
          description: "Gestão de Clientes (PF/PJ)",
          icon: Users,
        },
        {
          id: "suppliers" as NavTab,
          label: "Fornecedores",
          description: "Gestão de Fornecedores",
          icon: Truck,
        },
        {
          id: "banks" as NavTab,
          label: "Contas Bancárias",
          description: "Saldos e Extratos de Bancos",
          icon: Landmark,
        },
        {
          id: "inventory" as NavTab,
          label: "Estoque & Produtos",
          description: "Catálogo e Movimentações",
          icon: Package,
        },
      ],
    },
    {
      title: "GOVERNANÇA & GOV",
      items: [
        {
          id: "audit" as NavTab,
          label: "Trilha de Auditoria",
          description: "Quem fez o quê (Quem, Onde, Quando)",
          icon: ShieldCheck,
        },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-950/70 backdrop-blur-md border-r border-white/5 flex flex-col shrink-0 select-none overflow-y-auto">
      <div className="p-3 space-y-4 flex-1">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <h3 className="px-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest font-mono">
              {section.title}
            </h3>

            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2.5 ${
                    isActive
                      ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] font-bold"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent"
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-lg shrink-0 ${
                      isActive ? "bg-cyan-500 text-slate-950" : "bg-slate-900 text-slate-400"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold truncate">{item.label}</div>
                    <div className="text-[10px] text-slate-500 font-normal truncate">{item.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-white/5 text-center text-[11px] text-slate-500 font-mono">
        NEXS Enterprise v2.5.0
      </div>
    </aside>
  );
};
