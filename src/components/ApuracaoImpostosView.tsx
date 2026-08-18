// src/components/ApuracaoImpostosView.tsx

import React, { useState, useEffect } from "react";
import { store } from "../services/store";
import { 
  Receipt, 
  RefreshCw, 
  TrendingDown, 
  TrendingUp, 
  Calendar, 
  Download, 
  Printer,
  FileText,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Clock
} from "lucide-react";
import { apurarImpostos } from "../services/contabil/ApuracaoImpostos";
import { ApuracaoImpostosDetalhada } from "../types/contabil";

export const ApuracaoImpostosView: React.FC = () => {
  const [, setTick] = useState(0);
  useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

  const [loading, setLoading] = useState(false);
  const [apuracao, setApuracao] = useState<ApuracaoImpostosDetalhada | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandido, setExpandido] = useState<Record<string, boolean>>({
    icms: true,
    pis: true,
    cofins: true,
    cbs: true,
    ibs: true,
    historico: false,
  });

  const [dataInicio, setDataInicio] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]
  );
  const [dataFim, setDataFim] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split("T")[0]
  );

  const companyId = store.activeCompanyId;

  const carregarDados = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = apurarImpostos(companyId, dataInicio, dataFim);
      setApuracao(result);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar apuração de impostos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [dataInicio, dataFim, companyId]);

  const handleRecarregar = () => {
    carregarDados();
  };

  const toggleExpandido = (key: string) => {
    setExpandido(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleExportarJSON = () => {
    if (!apuracao) return;
    const blob = new Blob([JSON.stringify(apuracao, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `apuracao_impostos_${dataInicio}_${dataFim}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportarCSV = () => {
    if (!apuracao) return;

    const linhas: string[] = [];
    const cabecalho = ["Imposto", "Base Cálculo", "Alíquota", "Débito", "Crédito", "Saldo", "A Recolher"];
    linhas.push(cabecalho.join(";"));

    const impostos = [
      { nome: "ICMS", dados: apuracao.icms },
      { nome: "PIS", dados: apuracao.pis },
      { nome: "COFINS", dados: apuracao.cofins },
      { nome: "CBS", dados: apuracao.cbs },
      { nome: "IBS", dados: apuracao.ibs },
    ];

    for (const imp of impostos) {
      linhas.push([
        imp.nome,
        imp.dados.base_calculo.toFixed(2),
        imp.dados.aliquota.toFixed(2),
        imp.dados.debito.toFixed(2),
        imp.dados.credito.toFixed(2),
        imp.dados.saldo.toFixed(2),
        imp.dados.a_recolher.toFixed(2),
      ].join(";"));
    }

    linhas.push("");
    linhas.push(["RESUMO", "", "", "", "", "", ""].join(";"));
    linhas.push(["Total Débitos", "", "", apuracao.resumo.total_impostos_debitos.toFixed(2), "", "", ""].join(";"));
    linhas.push(["Total Créditos", "", "", "", apuracao.resumo.total_impostos_creditos.toFixed(2), "", ""].join(";"));
    linhas.push(["Total a Recolher", "", "", "", "", "", apuracao.resumo.total_a_recolher.toFixed(2)].join(";"));
    linhas.push(["Carga Tributária", "", "", "", "", "", `${apuracao.resumo.carga_tributaria.toFixed(1)}%`].join(";"));

    const blob = new Blob([linhas.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `apuracao_impostos_${dataInicio}_${dataFim}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImprimir = () => {
    window.print();
  };

  const getStatusColor = (valor: number): string => {
    if (valor === 0) return "text-emerald-400";
    if (valor > 0) return "text-amber-400";
    return "text-emerald-400";
  };

  const getStatusIcon = (valor: number) => {
    if (valor === 0) return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    if (valor > 0) return <AlertCircle className="w-4 h-4 text-amber-400" />;
    return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-500/10 border border-rose-500/30 p-6 rounded-2xl text-rose-300">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-rose-400" />
          <p>Erro ao carregar dados: {error}</p>
        </div>
        <button
          onClick={handleRecarregar}
          className="mt-3 px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 rounded-xl text-rose-300 text-sm"
        >
          <RefreshCw className="w-4 h-4 inline mr-2" />
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-cyan-400" />
              Apuração de Impostos
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              ICMS, PIS, COFINS, CBS e IBS - Reforma Tributária
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="bg-transparent text-white text-xs outline-none w-28"
              />
              <span className="text-slate-400">a</span>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="bg-transparent text-white text-xs outline-none w-28"
              />
            </div>

            <button
              onClick={handleRecarregar}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </button>

            <button
              onClick={handleExportarCSV}
              className="px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>

            <button
              onClick={handleExportarJSON}
              className="px-3 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4" />
              JSON
            </button>

            <button
              onClick={handleImprimir}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </button>
          </div>
        </div>
      </div>

      {apuracao ? (
        <div className="space-y-6">
          {/* Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/60 border border-rose-500/20 p-5 rounded-2xl">
              <span className="text-xs text-slate-400">Total Débitos</span>
              <div className="text-2xl font-bold text-rose-400 font-mono">
                R$ {apuracao.resumo.total_impostos_debitos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Impostos gerados</div>
            </div>

            <div className="bg-slate-900/60 border border-emerald-500/20 p-5 rounded-2xl">
              <span className="text-xs text-slate-400">Total Créditos</span>
              <div className="text-2xl font-bold text-emerald-400 font-mono">
                R$ {apuracao.resumo.total_impostos_creditos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Impostos a compensar</div>
            </div>

            <div className="bg-slate-900/60 border border-amber-500/20 p-5 rounded-2xl">
              <span className="text-xs text-slate-400">Total a Recolher</span>
              <div className="text-2xl font-bold text-amber-400 font-mono">
                R$ {apuracao.resumo.total_a_recolher.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                {apuracao.resumo.total_a_recolher > 0 ? "🔴 Pendente de recolhimento" : "✅ Nada a recolher"}
              </div>
            </div>

            <div className="bg-slate-900/60 border border-cyan-500/20 p-5 rounded-2xl">
              <span className="text-xs text-slate-400">Carga Tributária</span>
              <div className="text-2xl font-bold text-cyan-400 font-mono">
                {apuracao.resumo.carga_tributaria.toFixed(1)}%
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Sobre a receita bruta</div>
            </div>
          </div>

          {/* Impostos Detalhados */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* ICMS */}
            <div className="bg-slate-900/60 border border-white/5 rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleExpandido("icms")}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {expandido.icms ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                  <h4 className="text-sm font-bold text-white">ICMS</h4>
                  <span className="text-xs text-slate-400">({apuracao.icms.aliquota}%)</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    R$ {apuracao.icms.a_recolher.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(apuracao.icms.a_recolher)}
                </div>
              </button>

              {expandido.icms && (
                <div className="p-4 pt-0 border-t border-white/5 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block">Base de Cálculo</span>
                      <span className="text-white font-mono font-bold">
                        R$ {apuracao.icms.base_calculo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Alíquota</span>
                      <span className="text-white font-mono font-bold">{apuracao.icms.aliquota}%</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Débito</span>
                      <span className="text-rose-400 font-mono font-bold">
                        R$ {apuracao.icms.debito.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Crédito</span>
                      <span className="text-emerald-400 font-mono font-bold">
                        R$ {apuracao.icms.credito.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Saldo Anterior</span>
                      <span className="text-white font-mono">
                        R$ {apuracao.icms.saldo_anterior.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Saldo Atual</span>
                      <span className="text-white font-mono font-bold">
                        R$ {apuracao.icms.saldo_atual.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/5 flex justify-between">
                    <span className="text-xs text-slate-400">Recolhido</span>
                    <span className="text-xs font-mono text-white">
                      R$ {apuracao.icms.recolhido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* PIS */}
            <div className="bg-slate-900/60 border border-white/5 rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleExpandido("pis")}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {expandido.pis ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                  <h4 className="text-sm font-bold text-white">PIS</h4>
                  <span className="text-xs text-slate-400">({apuracao.pis.aliquota}%)</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    R$ {apuracao.pis.a_recolher.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(apuracao.pis.a_recolher)}
                </div>
              </button>

              {expandido.pis && (
                <div className="p-4 pt-0 border-t border-white/5 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block">Base de Cálculo</span>
                      <span className="text-white font-mono font-bold">
                        R$ {apuracao.pis.base_calculo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Alíquota</span>
                      <span className="text-white font-mono font-bold">{apuracao.pis.aliquota}%</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Débito</span>
                      <span className="text-rose-400 font-mono font-bold">
                        R$ {apuracao.pis.debito.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Crédito</span>
                      <span className="text-emerald-400 font-mono font-bold">
                        R$ {apuracao.pis.credito.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/5 flex justify-between font-bold">
                    <span className="text-xs text-amber-400">A Recolher</span>
                    <span className="text-xs font-mono text-amber-400">
                      R$ {apuracao.pis.a_recolher.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* COFINS */}
            <div className="bg-slate-900/60 border border-white/5 rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleExpandido("cofins")}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {expandido.cofins ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                  <h4 className="text-sm font-bold text-white">COFINS</h4>
                  <span className="text-xs text-slate-400">({apuracao.cofins.aliquota}%)</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    R$ {apuracao.cofins.a_recolher.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(apuracao.cofins.a_recolher)}
                </div>
              </button>

              {expandido.cofins && (
                <div className="p-4 pt-0 border-t border-white/5 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block">Base de Cálculo</span>
                      <span className="text-white font-mono font-bold">
                        R$ {apuracao.cofins.base_calculo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Alíquota</span>
                      <span className="text-white font-mono font-bold">{apuracao.cofins.aliquota}%</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Débito</span>
                      <span className="text-rose-400 font-mono font-bold">
                        R$ {apuracao.cofins.debito.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Crédito</span>
                      <span className="text-emerald-400 font-mono font-bold">
                        R$ {apuracao.cofins.credito.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/5 flex justify-between font-bold">
                    <span className="text-xs text-amber-400">A Recolher</span>
                    <span className="text-xs font-mono text-amber-400">
                      R$ {apuracao.cofins.a_recolher.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* CBS - Reforma Tributária */}
            <div className="bg-slate-900/60 border border-cyan-500/20 rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleExpandido("cbs")}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {expandido.cbs ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                  <h4 className="text-sm font-bold text-cyan-400">CBS</h4>
                  <span className="text-xs text-cyan-400/70">({apuracao.cbs.aliquota}%)</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    R$ {apuracao.cbs.a_recolher.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(apuracao.cbs.a_recolher)}
                </div>
              </button>

              {expandido.cbs && (
                <div className="p-4 pt-0 border-t border-cyan-500/20 space-y-3">
                  <div className="text-[10px] text-cyan-400/60 font-mono mb-2">
                    Contribuição sobre Bens e Serviços - Reforma Tributária 2026
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block">Base de Cálculo</span>
                      <span className="text-white font-mono font-bold">
                        R$ {apuracao.cbs.base_calculo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Alíquota</span>
                      <span className="text-cyan-400 font-mono font-bold">{apuracao.cbs.aliquota}%</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Débito</span>
                      <span className="text-rose-400 font-mono font-bold">
                        R$ {apuracao.cbs.debito.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Crédito</span>
                      <span className="text-emerald-400 font-mono font-bold">
                        R$ {apuracao.cbs.credito.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-cyan-500/20 flex justify-between font-bold">
                    <span className="text-xs text-cyan-400">A Recolher</span>
                    <span className="text-xs font-mono text-cyan-400">
                      R$ {apuracao.cbs.a_recolher.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* IBS - Reforma Tributária (full width) */}
          <div className="bg-slate-900/60 border border-indigo-500/20 rounded-2xl overflow-hidden">
            <button
              onClick={() => toggleExpandido("ibs")}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                {expandido.ibs ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
                <h4 className="text-sm font-bold text-indigo-400">IBS</h4>
                <span className="text-xs text-indigo-400/70">({apuracao.ibs.aliquota}%)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  R$ {apuracao.ibs.a_recolher.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(apuracao.ibs.a_recolher)}
              </div>
            </button>

            {expandido.ibs && (
              <div className="p-4 pt-0 border-t border-indigo-500/20 space-y-3">
                <div className="text-[10px] text-indigo-400/60 font-mono mb-2">
                  Imposto sobre Bens e Serviços - Reforma Tributária 2026
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Base de Cálculo</span>
                    <span className="text-white font-mono font-bold">
                      R$ {apuracao.ibs.base_calculo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Alíquota</span>
                    <span className="text-indigo-400 font-mono font-bold">{apuracao.ibs.aliquota}%</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Débito</span>
                    <span className="text-rose-400 font-mono font-bold">
                      R$ {apuracao.ibs.debito.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Crédito</span>
                    <span className="text-emerald-400 font-mono font-bold">
                      R$ {apuracao.ibs.credito.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t border-indigo-500/20 flex justify-between font-bold">
                  <span className="text-xs text-indigo-400">A Recolher</span>
                  <span className="text-xs font-mono text-indigo-400">
                    R$ {apuracao.ibs.a_recolher.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Histórico ICMS */}
          {apuracao.icms.historico && apuracao.icms.historico.length > 0 && (
            <div className="bg-slate-900/60 border border-white/5 rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleExpandido("historico")}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {expandido.historico ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                  <h4 className="text-sm font-bold text-white">📋 Histórico de Apuração ICMS</h4>
                  <span className="text-xs text-slate-400">
                    ({apuracao.icms.historico.length} registros)
                  </span>
                </div>
              </button>

              {expandido.historico && (
                <div className="p-4 pt-0 border-t border-white/5 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-bold border-b border-white/5">
                      <tr>
                        <th className="py-2 px-3">Data</th>
                        <th className="py-2 px-3">Documento</th>
                        <th className="py-2 px-3">Tipo</th>
                        <th className="py-2 px-3 text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {apuracao.icms.historico.map((item: any, idx: number) => (
                        <tr key={idx} className="hover:bg-white/5">
                          <td className="py-2 px-3 font-mono">{item.data}</td>
                          <td className="py-2 px-3">{item.documento || "-"}</td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                item.tipo === "debito"
                                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              }`}
                            >
                              {item.tipo === "debito" ? "Débito" : "Crédito"}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right font-mono">
                            <span
                              className={item.tipo === "debito" ? "text-rose-400" : "text-emerald-400"}
                            >
                              R$ {item.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Período */}
          <div className="bg-slate-950/60 border border-white/5 p-4 rounded-xl text-xs text-slate-400 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Período de apuração: </span>
              <span className="text-white font-mono">
                {new Date(dataInicio).toLocaleDateString("pt-BR")} a {new Date(dataFim).toLocaleDateString("pt-BR")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>Empresa: </span>
              <span className="text-white font-bold">
                {store.companies.find(c => c.id === companyId)?.trade_name || companyId}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-white/5 p-12 rounded-2xl text-center text-slate-400">
          <Receipt className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p>Nenhum dado de apuração disponível para o período selecionado.</p>
          <p className="text-xs mt-1">Verifique se há notas fiscais autorizadas no período.</p>
        </div>
      )}
    </div>
  );
};