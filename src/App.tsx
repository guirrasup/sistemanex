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

export default function App() {
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
    <div className="min-h-screen bg-[#020617] text-slate-300 flex flex-col font-sans antialiased relative overflow-x-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Top Header */}
      <Header
        onSearch={setSearchQuery}
        onOpenNewDoc={handleOpenNewDoc}
        onOpenOcr={handleOpenOcr}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden z-10">
        {/* Navigation Sidebar */}
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-transparent">
          <div className="max-w-7xl mx-auto space-y-6">
            {activeTab === "dashboard" && (
              <DashboardView
                onNavigateTab={setActiveTab}
                onOpenNewDoc={handleOpenNewDoc}
              />
            )}

            {activeTab === "financial" && (
              <FinancialView initialOpenModal={openNewDocModal} />
            )}

            {activeTab === "fiscal" && (
              <FiscalView />
            )}

            {activeTab === "customers" && (
              <PeopleView mode="customer" />
            )}

            {activeTab === "suppliers" && (
              <PeopleView mode="supplier" />
            )}

            {activeTab === "banks" && (
              <BankAccountsView />
            )}

            {activeTab === "inventory" && (
              <InventoryView />
            )}

            {activeTab === "reconciliation" && (
              <ReconciliationView />
            )}

            {activeTab === "ocr" && (
              <AiCenterView />
            )}

            {activeTab === "audit" && (
              <OutboxAuditView />
            )}
          </div>
        </main>
      </div>

      {/* Simple Status Bar */}
      <footer className="h-8 bg-slate-950/80 border-t border-white/5 flex items-center px-6 justify-between text-[11px] text-slate-500 z-10 shrink-0 font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Sistema NEXS Enterprise Core Ativo — API Rest, Audit & Fiscal SEFAZ</span>
        </div>
        <div>
          Uma Verdade Só • ERP Gestão Financeira Completa
        </div>
      </footer>
    </div>
  );
}
