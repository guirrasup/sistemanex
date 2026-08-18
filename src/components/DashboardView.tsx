// src/components/DashboardView.tsx

import React, { useState, useEffect } from "react";
import { store } from "../services/store";
import {
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  FileCheck,
  Activity,
  BarChart3,
  PieChart,
  Clock,
  Calendar,
  Zap,
  Eye,
  Target,
  Award,
  Gauge,
  Rocket,
  Crown,
  Timer,
  Users,
  Briefcase,
  CreditCard,
  Wallet,
  Building2,
  LineChart,
  CircleDollarSign,
  Package,
  FileArchive,
  ShieldCheck,
  ArrowLeftRight,
  Plus, // ← ADICIONADO
} from "lucide-react";

interface DashboardViewProps {
  onNavigateTab: (tab: any) => void;
  onOpenNewDoc: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateTab, onOpenNewDoc }) => {
  const [, setTick] = useState(0);
  useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

  // ===== DADOS DO SISTEMA =====
  const bankAccounts = store.bankAccounts || [];
  const totalBalance = bankAccounts.reduce((acc, b) => acc + b.balance, 0);
  const installments = store.installments || [];
  const docs = store.financialDocuments || [];
  const fiscalDocs = store.fiscalDocuments || [];
  const people = store.people || [];
  const products = store.products || [];

  // ===== CÁLCULOS FINANCEIROS =====
  let totalReceivableOpen = 0;
  let totalPayableOpen = 0;
  let overdueAmount = 0;
  let dueTodayAmount = 0;
  let due1to30Amount = 0;
  let totalPaidThisMonth = 0;
  let totalReceivedThisMonth = 0;

  const todayStr = new Date().toISOString().split("T")[0];
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];

  // Função auxiliar para adicionar dias
  const addDays = (dateStr: string, days: number): string => {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  };

  // Parcelas
  installments.forEach(inst => {
    const doc = docs.find(d => d.id === inst.financial_document_id);
    if (!doc) return;

    if (inst.status === "pending" || inst.status === "partially_paid" || inst.status === "overdue") {
      if (doc.direction === "receivable") {
        totalReceivableOpen += inst.current_amount;
      } else {
        totalPayableOpen += inst.current_amount;
      }
    }

    if (inst.due_date < todayStr && inst.status !== "paid") {
      overdueAmount += inst.current_amount;
    } else if (inst.due_date === todayStr) {
      dueTodayAmount += inst.current_amount;
    } else if (inst.due_date <= addDays(todayStr, 30)) {
      due1to30Amount += inst.current_amount;
    }

    if (inst.status === "paid" && inst.due_date >= monthStart) {
      if (doc.direction === "receivable") {
        totalReceivedThisMonth += inst.original_amount;
      } else {
        totalPaidThisMonth += inst.original_amount;
      }
    }
  });

  // ===== ESTATÍSTICAS =====
  const totalCustomers = people.filter(p => p.person_role === "customer" || p.person_role === "both").length;
  const totalSuppliers = people.filter(p => p.person_role === "supplier" || p.person_role === "both").length;
  const totalProducts = products.length;
  const authorizedFiscalCount = fiscalDocs.filter(f => f.status === "authorized").length;
  const totalFiscalValue = fiscalDocs.reduce((acc, f) => acc + f.total_value, 0);
  const totalCBS = fiscalDocs.reduce((acc, f) => acc + (f.cbs_value || 0), 0);
  const totalIBS = fiscalDocs.reduce((acc, f) => acc + (f.ibs_value || 0), 0);

  // ===== INDICADORES =====
  const liquidityIndex = totalReceivableOpen > 0 ? (totalBalance / totalReceivableOpen) * 100 : 0;
  const efficiencyIndex = totalReceivableOpen + totalPayableOpen > 0 ? 
    (totalReceivableOpen / (totalReceivableOpen + totalPayableOpen)) * 100 : 0;
  const collectionRate = totalReceivedThisMonth + totalPaidThisMonth > 0 ?
    (totalReceivedThisMonth / (totalReceivedThisMonth + totalPaidThisMonth)) * 100 : 0;

  // ===== WIDGETS =====
  const widgets = [
    { 
      id: "receivable", 
      label: "A Receber", 
      value: totalReceivableOpen, 
      icon: ArrowDownRight, 
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
      action: "financial",
    },
    { 
      id: "payable", 
      label: "A Pagar", 
      value: totalPayableOpen, 
      icon: ArrowUpRight, 
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
      action: "financial",
    },
    { 
      id: "balance", 
      label: "Saldo em Caixa", 
      value: totalBalance, 
      icon: Wallet, 
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      action: "banks",
    },
    { 
      id: "overdue", 
      label: "Em Atraso", 
      value: overdueAmount, 
      icon: AlertTriangle, 
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
      action: "financial",
      highlight: true,
    },
  ];

  // ===== PROJEÇÃO =====
  const projection = [
    { period: "Mês Atual", inflows: 150000, outflows: 89250, net: 60750 },
    { period: "Próximo Mês", inflows: 175000, outflows: 95000, net: 80000 },
    { period: "+2 Meses", inflows: 190000, outflows: 110000, net: 80000 },
    { period: "+3 Meses", inflows: 210000, outflows: 125000, net: 85000 },
  ];

  return (
    <div className="space-y-6">
      
      {/* ============================================================ */}
      {/* HEADER PREMIUM */}
      {/* ============================================================ */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-white/5 p-6 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl"></div>
        
        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono tracking-widest uppercase">
              <Activity className="w-4 h-4" />
              <span>NEX COMMAND CENTER</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <h1 className="text-3xl font-black text-white mt-1 tracking-tight">
              Visão Estratégica
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              {new Date().toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigateTab("financial")}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
            >
              <Zap className="w-4 h-4" />
              Ação Rápida
            </button>
            <button
              onClick={onOpenNewDoc}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-2 border border-white/5 transition-all"
            >
              <Plus className="w-4 h-4" />
              Novo Lançamento
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex flex-wrap items-center gap-6 mt-4 pt-4 border-t border-white/5 relative z-10">
          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Sistema Operacional</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-cyan-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Auditoria Ativa</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-amber-400">
            <Sparkles className="w-4 h-4" />
            <span>IA Ativa</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-indigo-400">
            <FileCheck className="w-4 h-4" />
            <span>{authorizedFiscalCount} Notas Autorizadas</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono ml-auto">
            <Clock className="w-3 h-3" />
            <span>Última atualização: {new Date().toLocaleTimeString("pt-BR")}</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* KPIS PRINCIPAIS */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {widgets.map((widget) => {
          const Icon = widget.icon;
          const isNegative = widget.id === "payable" || widget.id === "overdue";
          const isPositive = widget.id === "receivable" || widget.id === "balance";

          return (
            <div
              key={widget.id}
              onClick={() => widget.action && onNavigateTab(widget.action)}
              className={`bg-slate-950/60 border ${widget.border} p-5 rounded-2xl shadow-xl cursor-pointer hover:border-opacity-50 transition-all group relative overflow-hidden`}
            >
              {widget.highlight && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 rounded-full blur-2xl"></div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">{widget.label}</span>
                <div className={`p-2 rounded-xl ${widget.bg} ${widget.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className={`text-2xl font-black font-mono tracking-tight ${
                  isNegative && widget.value > 0 ? "text-rose-400" :
                  isPositive ? "text-emerald-400" : "text-white"
                }`}>
                  R$ {widget.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                  {widget.id === "overdue" && widget.value > 0 && (
                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                  )}
                  {widget.id === "balance" && widget.value > 0 && (
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                  )}
                  <span>{widget.id === "overdue" ? "⚠️ Necessita atenção" : "Atualizado"}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* LINHA 2: AGING + INDICADORES ESTRATÉGICOS */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Aging de Parcelas */}
        <div className="bg-slate-950/60 border border-white/5 p-5 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Timer className="w-4 h-4 text-amber-400" />
              Aging de Parcelas
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Vencimento</span>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl">
              <div>
                <span className="text-xs font-bold text-rose-300 block">Vencido</span>
                <span className="text-[9px] text-rose-400/70 font-mono">Prioridade máxima</span>
              </div>
              <span className="text-sm font-black text-rose-400 font-mono">
                R$ {overdueAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <div>
                <span className="text-xs font-bold text-amber-300 block">Vence Hoje</span>
                <span className="text-[9px] text-amber-400/70 font-mono">Ação imediata</span>
              </div>
              <span className="text-sm font-black text-amber-400 font-mono">
                R$ {dueTodayAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
              <div>
                <span className="text-xs font-bold text-cyan-300 block">1 a 30 Dias</span>
                <span className="text-[9px] text-cyan-400/70 font-mono">Curto prazo</span>
              </div>
              <span className="text-sm font-black text-cyan-300 font-mono">
                R$ {due1to30Amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-900/60 border border-white/5 rounded-xl">
              <div>
                <span className="text-xs font-bold text-slate-300 block">Acima de 30 Dias</span>
                <span className="text-[9px] text-slate-400 font-mono">Longo prazo</span>
              </div>
              <span className="text-sm font-black text-slate-200 font-mono">
                R$ 75.000,00
              </span>
            </div>
          </div>
        </div>

        {/* Indicadores Estratégicos */}
        <div className="bg-slate-950/60 border border-white/5 p-5 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-400" />
              Indicadores Estratégicos
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Desempenho</span>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Liquidez Imediata</span>
                <span className={`font-bold font-mono ${liquidityIndex > 50 ? "text-emerald-400" : "text-amber-400"}`}>
                  {liquidityIndex.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${liquidityIndex > 50 ? "bg-emerald-400" : "bg-amber-400"}`}
                  style={{ width: `${Math.min(liquidityIndex, 100)}%` }}
                ></div>
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5">
                {liquidityIndex > 50 ? "✅ Saudável" : "⚠️ Atenção necessária"}
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Eficiência de Recebimento</span>
                <span className={`font-bold font-mono ${efficiencyIndex > 50 ? "text-emerald-400" : "text-amber-400"}`}>
                  {efficiencyIndex.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${efficiencyIndex > 50 ? "bg-emerald-400" : "bg-amber-400"}`}
                  style={{ width: `${Math.min(efficiencyIndex, 100)}%` }}
                ></div>
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5">
                {efficiencyIndex > 50 ? "✅ Bom desempenho" : "⚠️ Melhorar cobrança"}
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Taxa de Recebimento</span>
                <span className={`font-bold font-mono ${collectionRate > 50 ? "text-emerald-400" : "text-amber-400"}`}>
                  {collectionRate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${collectionRate > 50 ? "bg-emerald-400" : "bg-amber-400"}`}
                  style={{ width: `${Math.min(collectionRate, 100)}%` }}
                ></div>
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5">
                {collectionRate > 50 ? "✅ Fluxo positivo" : "⚠️ Fluxo negativo"}
              </div>
            </div>
          </div>
        </div>

        {/* Métricas Rápidas */}
        <div className="bg-slate-950/60 border border-white/5 p-5 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Gauge className="w-4 h-4 text-cyan-400" />
              Métricas do Negócio
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Snapshot</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
              <div className="flex items-center gap-2 text-slate-400 text-[10px]">
                <Users className="w-3 h-3" />
                <span>Clientes</span>
              </div>
              <span className="text-lg font-bold text-white">{totalCustomers}</span>
            </div>
            
            <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
              <div className="flex items-center gap-2 text-slate-400 text-[10px]">
                <Briefcase className="w-3 h-3" />
                <span>Fornecedores</span>
              </div>
              <span className="text-lg font-bold text-white">{totalSuppliers}</span>
            </div>
            
            <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
              <div className="flex items-center gap-2 text-slate-400 text-[10px]">
                <Package className="w-3 h-3" />
                <span>Produtos</span>
              </div>
              <span className="text-lg font-bold text-white">{totalProducts}</span>
            </div>
            
            <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
              <div className="flex items-center gap-2 text-slate-400 text-[10px]">
                <FileCheck className="w-3 h-3" />
                <span>Notas Fiscais</span>
              </div>
              <span className="text-lg font-bold text-white">{authorizedFiscalCount}</span>
            </div>
          </div>
          
          <div className="mt-3 p-3 bg-slate-900/60 rounded-xl border border-white/5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Valor Faturado (Mês)</span>
              <span className="font-bold text-emerald-400 font-mono">
                R$ {totalFiscalValue.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-slate-400">CBS + IBS</span>
              <span className="font-bold text-cyan-400 font-mono">
                R$ {(totalCBS + totalIBS).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* LINHA 3: PROJEÇÃO DE FLUXO + AÇÕES RÁPIDAS */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Projeção de Fluxo */}
        <div className="bg-slate-950/60 border border-white/5 p-5 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <LineChart className="w-4 h-4 text-cyan-400" />
              Projeção de Fluxo de Caixa
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Visão 90 dias</span>
          </div>
          
          <div className="space-y-3">
            {projection.map((item, idx) => {
              const maxVal = 220000;
              const inWidth = (item.inflows / maxVal) * 100;
              const outWidth = (item.outflows / maxVal) * 100;
              const isPositive = item.net >= 0;

              return (
                <div key={idx} className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">{item.period}</span>
                    <span className={`font-mono ${isPositive ? "text-cyan-400" : "text-rose-400"}`}>
                      {isPositive ? "+" : ""}R$ {item.net.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="space-y-1 mt-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-emerald-400 w-14 text-right font-mono">Entrada</span>
                      <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${inWidth}%` }}></div>
                      </div>
                      <span className="text-[9px] text-emerald-400 font-mono w-16 text-right">
                        R$ {item.inflows.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-rose-400 w-14 text-right font-mono">Saída</span>
                      <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-rose-400 h-full rounded-full" style={{ width: `${outWidth}%` }}></div>
                      </div>
                      <span className="text-[9px] text-rose-400 font-mono w-16 text-right">
                        R$ {item.outflows.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="bg-slate-950/60 border border-white/5 p-5 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Rocket className="w-4 h-4 text-cyan-400" />
              Ações Estratégicas
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Atalhos</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onNavigateTab("financial")}
              className="p-3 bg-slate-900/60 border border-white/5 rounded-xl text-left hover:bg-slate-800/50 transition-all group"
            >
              <DollarSign className="w-5 h-5 text-cyan-400 mb-1" />
              <div className="text-xs font-bold text-white">Financeiro</div>
              <div className="text-[9px] text-slate-500">Contas pagar/receber</div>
            </button>
            
            <button
              onClick={() => onNavigateTab("fiscal")}
              className="p-3 bg-slate-900/60 border border-white/5 rounded-xl text-left hover:bg-slate-800/50 transition-all group"
            >
              <FileCheck className="w-5 h-5 text-indigo-400 mb-1" />
              <div className="text-xs font-bold text-white">Notas Fiscais</div>
              <div className="text-[9px] text-slate-500">Emissão NF-e/NFC-e</div>
            </button>
            
            <button
              onClick={() => onNavigateTab("contabil-dashboard")}
              className="p-3 bg-slate-900/60 border border-white/5 rounded-xl text-left hover:bg-slate-800/50 transition-all group"
            >
              <BarChart3 className="w-5 h-5 text-emerald-400 mb-1" />
              <div className="text-xs font-bold text-white">Dashboard Contábil</div>
              <div className="text-[9px] text-slate-500">DRE, Balanço, Impostos</div>
            </button>
            
            <button
              onClick={() => onNavigateTab("reconciliation")}
              className="p-3 bg-slate-900/60 border border-white/5 rounded-xl text-left hover:bg-slate-800/50 transition-all group"
            >
              <ArrowLeftRight className="w-5 h-5 text-purple-400 mb-1" />
              <div className="text-xs font-bold text-white">Conciliação</div>
              <div className="text-[9px] text-slate-500">Auto-Match com IA</div>
            </button>
            
            <button
              onClick={() => onNavigateTab("sped")}
              className="p-3 bg-slate-900/60 border border-white/5 rounded-xl text-left hover:bg-slate-800/50 transition-all group"
            >
              <FileArchive className="w-5 h-5 text-amber-400 mb-1" />
              <div className="text-xs font-bold text-white">SPED ECD/ECF</div>
              <div className="text-[9px] text-slate-500">Gerador de Arquivos RFB</div>
            </button>
            
            <button
              onClick={() => onNavigateTab("audit")}
              className="p-3 bg-slate-900/60 border border-white/5 rounded-xl text-left hover:bg-slate-800/50 transition-all group"
            >
              <ShieldCheck className="w-5 h-5 text-rose-400 mb-1" />
              <div className="text-xs font-bold text-white">Auditoria</div>
              <div className="text-[9px] text-slate-500">Trilha imutável</div>
            </button>
          </div>
          
          <div className="mt-3 p-3 bg-slate-900/60 border border-white/5 rounded-xl">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-2">
                <Crown className="w-3 h-3 text-amber-400" />
                Status do Sistema
              </span>
              <span className="text-emerald-400 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Todos os sistemas operacionais
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* RODAPÉ */}
      {/* ============================================================ */}
      <div className="bg-slate-950/60 border border-white/5 p-4 rounded-2xl shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Sistema Ativo
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              API Rest Conectada
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              IA em Modo Normal
            </span>
          </div>
          <div className="flex items-center gap-4 font-mono">
            <span>v2.5.0</span>
            <span>|</span>
            <span>NEX Enterprise</span>
            <span>|</span>
            <span>Uma Verdade Só</span>
          </div>
        </div>
      </div>

    </div>
  );
};