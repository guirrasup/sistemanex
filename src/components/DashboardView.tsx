import React from "react";
import { store } from "../services/store";
import {
  TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight,
  ShieldAlert, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, FileCheck
} from "lucide-react";

interface DashboardViewProps {
  onNavigateTab: (tab: any) => void;
  onOpenNewDoc: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateTab, onOpenNewDoc }) => {
  const bankAccounts = store.bankAccounts || [];
  const totalBalance = bankAccounts.reduce((acc, b) => acc + b.balance, 0);

  const installments = store.installments || [];
  const docs = store.financialDocuments || [];

  // Compute Receivables & Payables
  let totalReceivableOpen = 0;
  let totalPayableOpen = 0;
  let overdueAmount = 0;
  let dueTodayAmount = 0;
  let due1to30Amount = 0;

  const todayStr = new Date().toISOString().split("T")[0];

  installments.forEach(inst => {
    if (inst.status === "pending" || inst.status === "partially_paid" || inst.status === "overdue") {
      const doc = (docs || []).find(d => d.id === inst.financial_document_id);
      const isReceivable = doc?.direction === "receivable";

      if (isReceivable) {
        totalReceivableOpen += inst.current_amount;
      } else {
        totalPayableOpen += inst.current_amount;
      }

      if (inst.due_date < todayStr) {
        overdueAmount += inst.current_amount;
      } else if (inst.due_date === todayStr) {
        dueTodayAmount += inst.current_amount;
      } else {
        due1to30Amount += inst.current_amount;
      }
    }
  });

  // Reconciliation stats (vw_daily_reconciliation simulation)
  const bankTx = store.bankTransactions;
  const reconciledTx = bankTx.filter(t => t.status === "reconciled").length;
  const totalTx = bankTx.length;
  const reconRate = totalTx > 0 ? ((reconciledTx / totalTx) * 100).toFixed(1) : "100";

  // Fiscal totals (vw_fiscal_summary simulation)
  const fiscalDocs = store.fiscalDocuments;
  const authorizedFiscalCount = fiscalDocs.filter(f => f.status === "authorized").length;
  const totalCBS = fiscalDocs.reduce((acc, f) => acc + (f.cbs_value || 0), 0);
  const totalIBS = fiscalDocs.reduce((acc, f) => acc + (f.ibs_value || 0), 0);

  // Unmatched bank transactions for AI banner
  const unmatchedTx = bankTx.filter(t => t.status === "unmatched");

  return (
    <div className="space-y-6">
      {/* Top Welcome / Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/30 border border-white/5 backdrop-blur-md p-6 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs tracking-widest uppercase font-mono">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>NEX COMMAND MATRIX</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1 tracking-tight">
            Visão Geral Executiva — {store.getActiveCompany().trade_name || store.getActiveCompany().legal_name}
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Monitoramento em tempo real do fluxo de caixa, aging de parcelas, conciliação N:N e apuração tributária (CBS/IBS).
          </p>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => onNavigateTab("reconciliation")}
            className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-2"
          >
            <ArrowUpRight className="w-4 h-4" />
            Conciliar Bank Matches ({unmatchedTx.length})
          </button>
          <button
            onClick={onOpenNewDoc}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold font-mono uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
          >
            + Lançar Título
          </button>
        </div>
      </div>

      {/* AI Smart Recommendation Alert */}
      {unmatchedTx.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-center justify-between text-amber-200 text-xs backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-amber-100">
                Atenção da IA: {unmatchedTx.length} lançamento(s) no extrato aguardando conciliação.
              </p>
              <p className="text-amber-300/80 text-[11px] mt-0.5 font-mono">
                Exemplo: "{unmatchedTx[0].description}" (R$ {Math.abs(unmatchedTx[0].amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab("reconciliation")}
            className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-xl hover:bg-amber-400 transition-all cursor-pointer flex items-center gap-1 shrink-0 font-mono text-xs uppercase"
          >
            Ver Sugestões IA <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Bank Balance */}
        <div className="bg-slate-950/30 border border-white/5 backdrop-blur-md p-5 rounded-2xl shadow-xl hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span className="font-mono text-[10px] uppercase tracking-wider">Saldo Bancário Livre</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white font-mono tracking-tight">
              R$ {totalBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" /> +12.4% vs mês anterior
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-white/5 text-[10px] text-slate-400 flex justify-between font-mono">
            <span>Itaú: R$ {bankAccounts[0]?.balance.toLocaleString('pt-BR')}</span>
            <span>Bradesco: R$ {bankAccounts[1]?.balance.toLocaleString('pt-BR')}</span>
          </div>
        </div>

        {/* Card 2: Receivables Open */}
        <div className="bg-slate-950/30 border border-white/5 backdrop-blur-md p-5 rounded-2xl shadow-xl hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span className="font-mono text-[10px] uppercase tracking-wider">A Receber (30 Dias)</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-cyan-400 font-mono tracking-tight">
              R$ {totalReceivableOpen.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-medium font-mono">
              3 parcelas em aberto
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-white/5 text-[10px] text-slate-400 flex justify-between font-mono">
            <span>Pontualidade Recebimento: 98%</span>
          </div>
        </div>

        {/* Card 3: Payables Open */}
        <div className="bg-slate-950/30 border border-white/5 backdrop-blur-md p-5 rounded-2xl shadow-xl hover:border-rose-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span className="font-mono text-[10px] uppercase tracking-wider">A Pagar (30 Dias)</span>
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-400 font-mono tracking-tight">
              R$ {totalPayableOpen.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-medium font-mono">
              <AlertTriangle className="w-3.5 h-3.5" /> R$ {overdueAmount.toLocaleString('pt-BR')} em atraso
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-white/5 text-[10px] text-slate-400 flex justify-between font-mono">
            <span>Vence Hoje: R$ {dueTodayAmount.toLocaleString('pt-BR')}</span>
          </div>
        </div>

        {/* Card 4: Reconciliation Rate */}
        <div className="bg-slate-950/30 border border-white/5 backdrop-blur-md p-5 rounded-2xl shadow-xl hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span className="font-mono text-[10px] uppercase tracking-wider">Taxa Conciliação</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-cyan-300 font-mono tracking-tight">
              {reconRate}%
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-medium font-mono">
              {reconciledTx} de {totalTx} transações
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-white/5 text-[10px] text-slate-400 flex justify-between font-mono">
            <span>Auto-Match Engine Active</span>
          </div>
        </div>
      </div>

      {/* Main Charts & Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow Projection Chart */}
        <div className="lg:col-span-2 bg-slate-950/30 border border-white/5 backdrop-blur-md p-6 rounded-2xl shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Projeção do Fluxo de Caixa (vw_cash_flow_projection)
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Visão consolidada de entradas, saídas e saldo líquido acumulado</p>
            </div>
            <span className="text-[9px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
              Materialized View
            </span>
          </div>

          {/* Custom Visual Bar Chart */}
          <div className="space-y-3 pt-2">
            {[
              { period: "Agosto 2026 (Atual)", inflows: 150000, outflows: 89250, net: 60750 },
              { period: "Setembro 2026 (Projetado)", inflows: 175000, outflows: 95000, net: 80000 },
              { period: "Outubro 2026 (Projetado)", inflows: 190000, outflows: 110000, net: 80000 },
              { period: "Novembro 2026 (Projetado)", inflows: 210000, outflows: 125000, net: 85000 }
            ].map((bar, idx) => {
              const maxVal = 220000;
              const inWidth = (bar.inflows / maxVal) * 100;
              const outWidth = (bar.outflows / maxVal) * 100;

              return (
                <div key={idx} className="bg-slate-950/60 p-3.5 rounded-xl border border-white/5 space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-200 font-mono">{bar.period}</span>
                    <span className="text-cyan-400 font-mono">Líquido: R$ {bar.net.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="space-y-1.5">
                    {/* Inflow Bar */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 w-16 text-right font-mono">Entradas</span>
                      <div className="flex-1 bg-slate-900/80 h-2.5 rounded-full overflow-hidden border border-white/5">
                        <div
                          className="bg-cyan-400 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                          style={{ width: `${inWidth}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-mono text-cyan-300 w-20 text-right">
                        R$ {bar.inflows.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    {/* Outflow Bar */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 w-16 text-right font-mono">Saídas</span>
                      <div className="flex-1 bg-slate-900/80 h-2.5 rounded-full overflow-hidden border border-white/5">
                        <div
                          className="bg-rose-500 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                          style={{ width: `${outWidth}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-mono text-rose-300 w-20 text-right">
                        R$ {bar.outflows.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Installment Aging Breakdown Card */}
        <div className="bg-slate-950/30 border border-white/5 backdrop-blur-md p-6 rounded-2xl shadow-2xl space-y-4">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Aging de Parcelas (vw_installment_aging)
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Análise de maturidade do contas a pagar e receber</p>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-rose-300 block">Vencido / Inadimplente (&lt; Hoje)</span>
                <span className="text-[10px] text-rose-400/80 font-mono">Exige cobrança imediata</span>
              </div>
              <span className="text-sm font-black text-rose-400 font-mono">
                R$ {overdueAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-300 block">Vence Hoje</span>
                <span className="text-[10px] text-amber-400/80 font-mono">Aguardando liquidação bancária</span>
              </div>
              <span className="text-sm font-black text-amber-400 font-mono">
                R$ {dueTodayAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-cyan-300 block">1 a 30 Dias</span>
                <span className="text-[10px] text-cyan-400/80 font-mono">Maturidade regular curto prazo</span>
              </div>
              <span className="text-sm font-black text-cyan-300 font-mono">
                R$ {due1to30Amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-300 block">Acima de 30 Dias</span>
                <span className="text-[10px] text-slate-400 font-mono">Planejamento de longo prazo</span>
              </div>
              <span className="text-sm font-black text-slate-200 font-mono">
                R$ 75.000,00
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Fiscal & Reforma Tributária Summary Banner */}
      <div className="bg-slate-950/30 border border-white/5 backdrop-blur-md p-6 rounded-2xl shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-cyan-400" />
              Resumo Fiscal & Apuração Tributária (CBS/IBS - Reforma Tributária)
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Snapshot acumulado de documentos fiscais autorizados (NF-e, NFC-e, NFS-e) e impostos calculados
            </p>
          </div>
          <button
            onClick={() => onNavigateTab("fiscal")}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer border border-white/10 self-start sm:self-auto"
          >
            Acessar Motor Fiscal →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase font-mono font-semibold block">Notas Emitidas (Mês)</span>
            <span className="text-lg font-bold text-white mt-1 block font-mono">{authorizedFiscalCount} autorizadas</span>
          </div>
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase font-mono font-semibold block">Valor Total Faturado</span>
            <span className="text-lg font-bold text-emerald-400 mt-1 block font-mono">
              R$ {fiscalDocs.reduce((acc, f) => acc + f.total_value, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-white/5">
            <span className="text-[10px] text-cyan-400 uppercase font-mono font-semibold block">CBS (Contribuição)</span>
            <span className="text-lg font-bold text-cyan-300 mt-1 block font-mono">
              R$ {totalCBS.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-white/5">
            <span className="text-[10px] text-indigo-400 uppercase font-mono font-semibold block">IBS (Imposto)</span>
            <span className="text-lg font-bold text-indigo-300 mt-1 block font-mono">
              R$ {totalIBS.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
