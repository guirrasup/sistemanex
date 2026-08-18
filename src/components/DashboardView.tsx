// src/components/DashboardView.tsx

import React, { useState, useEffect } from "react";
import { store } from "../services/store";
import { useTheme } from "../contexts/ThemeContext";
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
  Plus,
} from "lucide-react";

interface DashboardViewProps {
  onNavigateTab: (tab: any) => void;
  onOpenNewDoc: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateTab, onOpenNewDoc }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
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

  const addDays = (dateStr: string, days: number): string => {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  };

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

  // Classes dinâmicas baseadas no tema
  const themeClasses = {
    // Header premium
    headerBg: isDark 
      ? 'bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-white/5' 
      : 'bg-gradient-to-r from-slate-100 via-white to-slate-100 border-slate-200',
    headerText: isDark ? 'text-white' : 'text-slate-900',
    headerSubtext: isDark ? 'text-slate-400' : 'text-slate-500',
    headerStatus: isDark ? 'text-slate-500' : 'text-slate-400',
    
    // Cards
    cardBg: isDark ? 'bg-slate-950/60' : 'bg-white/80',
    cardBorder: isDark ? 'border-white/5' : 'border-slate-200',
    cardHover: isDark ? 'hover:border-opacity-50' : 'hover:shadow-md',
    
    // Textos
    textPrimary: isDark ? 'text-white' : 'text-slate-900',
    textSecondary: isDark ? 'text-slate-400' : 'text-slate-600',
    textMuted: isDark ? 'text-slate-500' : 'text-slate-400',
    
    // Sub-cards
    subCardBg: isDark ? 'bg-slate-900/60' : 'bg-slate-50',
    subCardBorder: isDark ? 'border-white/5' : 'border-slate-200',
    
    // Botões
    btnPrimary: isDark 
      ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20' 
      : 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-cyan-600/20',
    btnSecondary: isDark 
      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-white/5' 
      : 'bg-slate-200 hover:bg-slate-300 text-slate-700 border-slate-300',
    
    // Métricas
    metricBg: isDark ? 'bg-slate-900/60' : 'bg-white/60',
  };

  return (
    <div className="space-y-6">
      
      {/* ============================================================ */}
      {/* HEADER PREMIUM */}
      {/* ============================================================ */}
      <div className={`${themeClasses.headerBg} border p-6 rounded-2xl shadow-2xl relative overflow-hidden transition-colors duration-300`}>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl"></div>
        
        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono tracking-widest uppercase">
              <Activity className="w-4 h-4" />
              <span>NEX COMMAND CENTER</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <h1 className={`text-3xl font-black mt-1 tracking-tight ${themeClasses.textPrimary}`}>
              Visão Estratégica
            </h1>
            <p className={`text-sm mt-1 max-w-xl ${themeClasses.textSecondary}`}>
              {new Date().toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigateTab("financial")}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all ${themeClasses.btnPrimary}`}
            >
              <Zap className="w-4 h-4" />
              Ação Rápida
            </button>
            <button
              onClick={onOpenNewDoc}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${themeClasses.btnSecondary}`}
            >
              <Plus className="w-4 h-4" />
              Novo Lançamento
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className={`flex flex-wrap items-center gap-6 mt-4 pt-4 border-t relative z-10 ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
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
          <div className={`flex items-center gap-2 text-xs font-mono ml-auto ${themeClasses.textMuted}`}>
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
              className={`${themeClasses.cardBg} border ${widget.border} ${themeClasses.cardBorder} p-5 rounded-2xl shadow-xl cursor-pointer hover:shadow-lg transition-all group relative overflow-hidden`}
            >
              {widget.highlight && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 rounded-full blur-2xl"></div>
              )}
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium uppercase tracking-wider ${themeClasses.textSecondary}`}>{widget.label}</span>
                <div className={`p-2 rounded-xl ${widget.bg} ${widget.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className={`text-2xl font-black font-mono tracking-tight ${
                  isNegative && widget.value > 0 ? "text-rose-400" :
                  isPositive ? "text-emerald-400" : themeClasses.textPrimary
                }`}>
                  R$ {widget.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
                <div className={`text-[10px] mt-1 flex items-center gap-1 ${themeClasses.textMuted}`}>
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
        <div className={`${themeClasses.cardBg} border ${themeClasses.cardBorder} p-5 rounded-2xl shadow-xl transition-colors duration-300`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-sm font-bold flex items-center gap-2 ${themeClasses.textPrimary}`}>
              <Timer className="w-4 h-4 text-amber-400" />
              Aging de Parcelas
            </h3>
            <span className={`text-[10px] font-mono ${themeClasses.textMuted}`}>Vencimento</span>
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
            
            <div className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-slate-900/60 border-white/5' : 'bg-slate-50 border-slate-200'} border`}>
              <div>
                <span className={`text-xs font-bold block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Acima de 30 Dias</span>
                <span className={`text-[9px] font-mono ${themeClasses.textMuted}`}>Longo prazo</span>
              </div>
              <span className={`text-sm font-black font-mono ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                R$ 75.000,00
              </span>
            </div>
          </div>
        </div>

        {/* Indicadores Estratégicos */}
        <div className={`${themeClasses.cardBg} border ${themeClasses.cardBorder} p-5 rounded-2xl shadow-xl transition-colors duration-300`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-sm font-bold flex items-center gap-2 ${themeClasses.textPrimary}`}>
              <Target className="w-4 h-4 text-cyan-400" />
              Indicadores Estratégicos
            </h3>
            <span className={`text-[10px] font-mono ${themeClasses.textMuted}`}>Desempenho</span>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className={themeClasses.textSecondary}>Liquidez Imediata</span>
                <span className={`font-bold font-mono ${liquidityIndex > 50 ? "text-emerald-400" : "text-amber-400"}`}>
                  {liquidityIndex.toFixed(1)}%
                </span>
              </div>
              <div className={`w-full h-1.5 rounded-full mt-1 overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                <div 
                  className={`h-full rounded-full transition-all ${liquidityIndex > 50 ? "bg-emerald-400" : "bg-amber-400"}`}
                  style={{ width: `${Math.min(liquidityIndex, 100)}%` }}
                ></div>
              </div>
              <div className={`text-[9px] mt-0.5 ${themeClasses.textMuted}`}>
                {liquidityIndex > 50 ? "✅ Saudável" : "⚠️ Atenção necessária"}
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className={themeClasses.textSecondary}>Eficiência de Recebimento</span>
                <span className={`font-bold font-mono ${efficiencyIndex > 50 ? "text-emerald-400" : "text-amber-400"}`}>
                  {efficiencyIndex.toFixed(1)}%
                </span>
              </div>
              <div className={`w-full h-1.5 rounded-full mt-1 overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                <div 
                  className={`h-full rounded-full transition-all ${efficiencyIndex > 50 ? "bg-emerald-400" : "bg-amber-400"}`}
                  style={{ width: `${Math.min(efficiencyIndex, 100)}%` }}
                ></div>
              </div>
              <div className={`text-[9px] mt-0.5 ${themeClasses.textMuted}`}>
                {efficiencyIndex > 50 ? "✅ Bom desempenho" : "⚠️ Melhorar cobrança"}
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className={themeClasses.textSecondary}>Taxa de Recebimento</span>
                <span className={`font-bold font-mono ${collectionRate > 50 ? "text-emerald-400" : "text-amber-400"}`}>
                  {collectionRate.toFixed(1)}%
                </span>
              </div>
              <div className={`w-full h-1.5 rounded-full mt-1 overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                <div 
                  className={`h-full rounded-full transition-all ${collectionRate > 50 ? "bg-emerald-400" : "bg-amber-400"}`}
                  style={{ width: `${Math.min(collectionRate, 100)}%` }}
                ></div>
              </div>
              <div className={`text-[9px] mt-0.5 ${themeClasses.textMuted}`}>
                {collectionRate > 50 ? "✅ Fluxo positivo" : "⚠️ Fluxo negativo"}
              </div>
            </div>
          </div>
        </div>

        {/* Métricas Rápidas */}
        <div className={`${themeClasses.cardBg} border ${themeClasses.cardBorder} p-5 rounded-2xl shadow-xl transition-colors duration-300`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-sm font-bold flex items-center gap-2 ${themeClasses.textPrimary}`}>
              <Gauge className="w-4 h-4 text-cyan-400" />
              Métricas do Negócio
            </h3>
            <span className={`text-[10px] font-mono ${themeClasses.textMuted}`}>Snapshot</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-3 rounded-xl border ${themeClasses.subCardBg} ${themeClasses.subCardBorder}`}>
              <div className={`flex items-center gap-2 text-[10px] ${themeClasses.textSecondary}`}>
                <Users className="w-3 h-3" />
                <span>Clientes</span>
              </div>
              <span className={`text-lg font-bold ${themeClasses.textPrimary}`}>{totalCustomers}</span>
            </div>
            
            <div className={`p-3 rounded-xl border ${themeClasses.subCardBg} ${themeClasses.subCardBorder}`}>
              <div className={`flex items-center gap-2 text-[10px] ${themeClasses.textSecondary}`}>
                <Briefcase className="w-3 h-3" />
                <span>Fornecedores</span>
              </div>
              <span className={`text-lg font-bold ${themeClasses.textPrimary}`}>{totalSuppliers}</span>
            </div>
            
            <div className={`p-3 rounded-xl border ${themeClasses.subCardBg} ${themeClasses.subCardBorder}`}>
              <div className={`flex items-center gap-2 text-[10px] ${themeClasses.textSecondary}`}>
                <Package className="w-3 h-3" />
                <span>Produtos</span>
              </div>
              <span className={`text-lg font-bold ${themeClasses.textPrimary}`}>{totalProducts}</span>
            </div>
            
            <div className={`p-3 rounded-xl border ${themeClasses.subCardBg} ${themeClasses.subCardBorder}`}>
              <div className={`flex items-center gap-2 text-[10px] ${themeClasses.textSecondary}`}>
                <FileCheck className="w-3 h-3" />
                <span>Notas Fiscais</span>
              </div>
              <span className={`text-lg font-bold ${themeClasses.textPrimary}`}>{authorizedFiscalCount}</span>
            </div>
          </div>
          
          <div className={`mt-3 p-3 rounded-xl border ${themeClasses.subCardBg} ${themeClasses.subCardBorder}`}>
            <div className="flex items-center justify-between text-xs">
              <span className={themeClasses.textSecondary}>Valor Faturado (Mês)</span>
              <span className="font-bold text-emerald-400 font-mono">
                R$ {totalFiscalValue.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className={themeClasses.textSecondary}>CBS + IBS</span>
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
        <div className={`${themeClasses.cardBg} border ${themeClasses.cardBorder} p-5 rounded-2xl shadow-xl transition-colors duration-300`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-sm font-bold flex items-center gap-2 ${themeClasses.textPrimary}`}>
              <LineChart className="w-4 h-4 text-cyan-400" />
              Projeção de Fluxo de Caixa
            </h3>
            <span className={`text-[10px] font-mono ${themeClasses.textMuted}`}>Visão 90 dias</span>
          </div>
          
          <div className="space-y-3">
            {projection.map((item, idx) => {
              const maxVal = 220000;
              const inWidth = (item.inflows / maxVal) * 100;
              const outWidth = (item.outflows / maxVal) * 100;
              const isPositive = item.net >= 0;

              return (
                <div key={idx} className={`p-3 rounded-xl border ${themeClasses.subCardBg} ${themeClasses.subCardBorder}`}>
                  <div className="flex justify-between text-xs font-semibold">
                    <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{item.period}</span>
                    <span className={`font-mono ${isPositive ? "text-cyan-400" : "text-rose-400"}`}>
                      {isPositive ? "+" : ""}R$ {item.net.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="space-y-1 mt-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-emerald-400 w-14 text-right font-mono">Entrada</span>
                      <div className={`flex-1 h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                        <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${inWidth}%` }}></div>
                      </div>
                      <span className="text-[9px] text-emerald-400 font-mono w-16 text-right">
                        R$ {item.inflows.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-rose-400 w-14 text-right font-mono">Saída</span>
                      <div className={`flex-1 h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
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
        <div className={`${themeClasses.cardBg} border ${themeClasses.cardBorder} p-5 rounded-2xl shadow-xl transition-colors duration-300`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-sm font-bold flex items-center gap-2 ${themeClasses.textPrimary}`}>
              <Rocket className="w-4 h-4 text-cyan-400" />
              Ações Estratégicas
            </h3>
            <span className={`text-[10px] font-mono ${themeClasses.textMuted}`}>Atalhos</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onNavigateTab("financial")}
              className={`p-3 border rounded-xl text-left transition-all ${themeClasses.subCardBg} ${themeClasses.subCardBorder} ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-100'}`}
            >
              <DollarSign className="w-5 h-5 text-cyan-400 mb-1" />
              <div className={`text-xs font-bold ${themeClasses.textPrimary}`}>Financeiro</div>
              <div className={`text-[9px] ${themeClasses.textMuted}`}>Contas pagar/receber</div>
            </button>
            
            <button
              onClick={() => onNavigateTab("fiscal")}
              className={`p-3 border rounded-xl text-left transition-all ${themeClasses.subCardBg} ${themeClasses.subCardBorder} ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-100'}`}
            >
              <FileCheck className="w-5 h-5 text-indigo-400 mb-1" />
              <div className={`text-xs font-bold ${themeClasses.textPrimary}`}>Notas Fiscais</div>
              <div className={`text-[9px] ${themeClasses.textMuted}`}>Emissão NF-e/NFC-e</div>
            </button>
            
            <button
              onClick={() => onNavigateTab("contabil-dashboard")}
              className={`p-3 border rounded-xl text-left transition-all ${themeClasses.subCardBg} ${themeClasses.subCardBorder} ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-100'}`}
            >
              <BarChart3 className="w-5 h-5 text-emerald-400 mb-1" />
              <div className={`text-xs font-bold ${themeClasses.textPrimary}`}>Dashboard Contábil</div>
              <div className={`text-[9px] ${themeClasses.textMuted}`}>DRE, Balanço, Impostos</div>
            </button>
            
            <button
              onClick={() => onNavigateTab("reconciliation")}
              className={`p-3 border rounded-xl text-left transition-all ${themeClasses.subCardBg} ${themeClasses.subCardBorder} ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-100'}`}
            >
              <ArrowLeftRight className="w-5 h-5 text-purple-400 mb-1" />
              <div className={`text-xs font-bold ${themeClasses.textPrimary}`}>Conciliação</div>
              <div className={`text-[9px] ${themeClasses.textMuted}`}>Auto-Match com IA</div>
            </button>
            
            <button
              onClick={() => onNavigateTab("sped")}
              className={`p-3 border rounded-xl text-left transition-all ${themeClasses.subCardBg} ${themeClasses.subCardBorder} ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-100'}`}
            >
              <FileArchive className="w-5 h-5 text-amber-400 mb-1" />
              <div className={`text-xs font-bold ${themeClasses.textPrimary}`}>SPED ECD/ECF</div>
              <div className={`text-[9px] ${themeClasses.textMuted}`}>Gerador de Arquivos RFB</div>
            </button>
            
            <button
              onClick={() => onNavigateTab("audit")}
              className={`p-3 border rounded-xl text-left transition-all ${themeClasses.subCardBg} ${themeClasses.subCardBorder} ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-100'}`}
            >
              <ShieldCheck className="w-5 h-5 text-rose-400 mb-1" />
              <div className={`text-xs font-bold ${themeClasses.textPrimary}`}>Auditoria</div>
              <div className={`text-[9px] ${themeClasses.textMuted}`}>Trilha imutável</div>
            </button>
          </div>
          
          <div className={`mt-3 p-3 rounded-xl border ${themeClasses.subCardBg} ${themeClasses.subCardBorder}`}>
            <div className="flex items-center justify-between text-xs">
              <span className={`flex items-center gap-2 ${themeClasses.textSecondary}`}>
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
      <div className={`${themeClasses.cardBg} border ${themeClasses.cardBorder} p-4 rounded-2xl shadow-xl transition-colors duration-300`}>
        <div className={`flex flex-wrap items-center justify-between gap-2 text-[10px] ${themeClasses.textMuted}`}>
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