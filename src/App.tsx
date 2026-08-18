// src/App.tsx

import React, { useState } from "react";
import { Header } from "./components/Header";
import { Sidebar, NavTab } from "./components/Sidebar";
import { DashboardView } from "./components/DashboardView";
import { FinancialView } from "./components/FinancialView";
import { FiscalView } from "./components/FiscalView";
import { PeopleView } from "./components/PeopleView";
import { BankAccountsView } from "./components/BankAccountsView";
import { InventoryView } from "./components/InventoryView";
import { ReconciliationView } from "./components/ReconciliationView";
import { AiCenterView } from "./components/AiCenterView";
import { OutboxAuditView } from "./components/OutboxAuditView";
import { SpedView } from "./components/SpedView";
import { ConfiguracoesView } from "./components/ConfiguracoesView";
import { ContabilDashboardView } from "./components/ContabilDashboardView";
import { RelatoriosContabeisView } from "./components/RelatoriosContabeisView";
import { ApuracaoImpostosView } from "./components/ApuracaoImpostosView";
import { SpedValidatorView } from "./components/SpedValidatorView";
import { LivroDiarioView } from "./components/LivroDiarioView";
import { LivroRazaoView } from "./components/LivroRazaoView";
import { RelatoriosFiscaisView } from "./components/RelatoriosFiscaisView";
import { ExportacaoView } from "./components/ExportacaoView";
import { useTheme } from "./contexts/ThemeContext";

export default function App() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");
  const [, setSearchQuery] = useState("");

  const [openNewDocModal, setOpenNewDocModal] = useState(false);

  const handleOpenNewDoc = () => {
    setActiveTab("financial");
    setOpenNewDocModal(true);
  };

  const handleOpenOcr = () => {
    setActiveTab("ocr");
  };

  return (
    <div className={`h-screen w-screen flex flex-col font-sans antialiased relative overflow-hidden transition-colors duration-300 ${
      isDark ? 'bg-[#020617]' : 'bg-[#f1f5f9]'
    } text-slate-300`}>
      
      {/* Background Glows - apenas no modo escuro */}
      {isDark && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px]"></div>
          <div className="absolute -bottom-[20%] -right-[10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]"></div>
        </div>
      )}

      {/* Top Header - Fixo */}
      <Header
        onSearch={setSearchQuery}
        // REMOVIDOS: onOpenNewDoc e onOpenOcr
      />

      {/* Main Workspace - Ocupa o resto, sem overflow */}
      <div className="flex-1 flex overflow-hidden z-10 min-h-0">
        
        {/* SIDEBAR - COM SCROLL PRÓPRIO E ISOLADO */}
        <div className="shrink-0 h-full overflow-hidden">
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* CONTENT AREA - COM SCROLL PRÓPRIO E ISOLADO */}
        <main className={`flex-1 h-full overflow-y-auto overflow-x-hidden p-6 md:p-8 transition-colors duration-300 ${
          isDark ? 'bg-transparent' : 'bg-[#f1f5f9]'
        }`}>
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Principal */}
            {activeTab === "dashboard" && (
              <DashboardView onNavigateTab={setActiveTab} onOpenNewDoc={handleOpenNewDoc} />
            )}

            {activeTab === "financial" && <FinancialView initialOpenModal={openNewDocModal} />}

            {/* Fiscal & Operação */}
            {activeTab === "fiscal" && <FiscalView />}
            {activeTab === "reconciliation" && <ReconciliationView />}
            {activeTab === "ocr" && <AiCenterView />}

            {/* Contábil & Obrigações */}
            {activeTab === "sped" && <SpedView />}
            {activeTab === "sped-validator" && <SpedValidatorView />}
            {activeTab === "configuracoes" && <ConfiguracoesView />}

            {/* Contábil & Relatórios */}
            {activeTab === "contabil-dashboard" && <ContabilDashboardView />}
            {activeTab === "relatorios-contabeis" && <RelatoriosContabeisView />}
            {activeTab === "apuracao-impostos" && <ApuracaoImpostosView />}
            {activeTab === "livro-diario" && <LivroDiarioView />}
            {activeTab === "livro-razao" && <LivroRazaoView />}
            {activeTab === "relatorios-fiscais" && <RelatoriosFiscaisView />}
            {activeTab === "exportacao" && <ExportacaoView />}

            {/* Cadastros */}
            {activeTab === "customers" && <PeopleView mode="customer" />}
            {activeTab === "suppliers" && <PeopleView mode="supplier" />}
            {activeTab === "banks" && <BankAccountsView />}
            {activeTab === "inventory" && <InventoryView />}

            {/* Governança */}
            {activeTab === "audit" && <OutboxAuditView />}
          </div>
        </main>
      </div>

      {/* Status Bar - Fixo */}
      <footer className={`h-8 border-t flex items-center px-6 justify-between text-[11px] shrink-0 font-mono transition-colors duration-300 ${
        isDark 
          ? 'bg-slate-950/80 border-white/5 text-slate-500' 
          : 'bg-white/80 border-slate-200 text-slate-500'
      }`}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Sistema NEX Enterprise Core Ativo — API Rest, Audit & Fiscal SEFAZ</span>
        </div>
        <div>Uma Verdade Só • ERP Gestão Financeira Completa</div>
      </footer>
    </div>
  );
}