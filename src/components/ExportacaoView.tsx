// src/components/ExportacaoView.tsx

import React, { useState } from "react";
import { store } from "../services/store";
import { exportarDadosContabeis } from "../services/export/ExportContabil";
import { FileDown, Calendar, Download, Printer, RefreshCw, FileText, FileSpreadsheet } from "lucide-react";

export const ExportacaoView: React.FC = () => {
  const [, setTick] = useState(0);
  React.useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

  const [dataInicio, setDataInicio] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]
  );
  const [dataFim, setDataFim] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split("T")[0]
  );
  const [tipo, setTipo] = useState<"lancamentos" | "saldos" | "dre" | "balanco" | "fluxo" | "impostos" | "completo">("completo");
  const [formato, setFormato] = useState<"csv" | "txt" | "json">("csv");
  const [loading, setLoading] = useState(false);

  const companyId = store.activeCompanyId;

  const handleExportar = () => {
    setLoading(true);
    try {
      exportarDadosContabeis(companyId, dataInicio, dataFim, tipo, formato);
    } catch (err: any) {
      alert("Erro ao exportar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImprimir = () => {
    window.print();
  };

  const tiposOptions = [
    { value: "lancamentos", label: "Lançamentos Contábeis" },
    { value: "saldos", label: "Saldos das Contas" },
    { value: "dre", label: "DRE - Demonstração do Resultado" },
    { value: "balanco", label: "Balanço Patrimonial" },
    { value: "fluxo", label: "Fluxo de Caixa" },
    { value: "impostos", label: "Apuração de Impostos" },
    { value: "completo", label: "📦 Relatório Completo" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileDown className="w-5 h-5 text-cyan-400" />
              Exportação Contábil
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Exporte dados contábeis para CSV, TXT ou JSON
            </p>
          </div>

          <div className="flex items-center gap-2">
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

      {/* Formulário */}
      <div className="bg-slate-900/60 border border-white/5 p-6 rounded-2xl shadow-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Período */}
          <div>
            <label className="text-xs text-slate-400 block mb-1 font-semibold flex items-center gap-1">
              <Calendar className="w-4 h-4" /> Período
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white text-sm outline-none w-full focus:border-cyan-500"
              />
              <span className="text-slate-400">a</span>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white text-sm outline-none w-full focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Tipo */}
          <div>
            <label className="text-xs text-slate-400 block mb-1 font-semibold flex items-center gap-1">
              <FileText className="w-4 h-4" /> Tipo de Relatório
            </label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as any)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white text-sm outline-none cursor-pointer focus:border-cyan-500"
            >
              {tiposOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Formato */}
        <div>
          <label className="text-xs text-slate-400 block mb-1 font-semibold flex items-center gap-1">
            <FileSpreadsheet className="w-4 h-4" /> Formato de Exportação
          </label>
          <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-white/10 w-fit">
            <button
              onClick={() => setFormato("csv")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                formato === "csv" ? "bg-cyan-500 text-slate-950" : "text-slate-400 hover:text-white"
              }`}
            >
              CSV
            </button>
            <button
              onClick={() => setFormato("txt")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                formato === "txt" ? "bg-cyan-500 text-slate-950" : "text-slate-400 hover:text-white"
              }`}
            >
              TXT
            </button>
            <button
              onClick={() => setFormato("json")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                formato === "json" ? "bg-cyan-500 text-slate-950" : "text-slate-400 hover:text-white"
              }`}
            >
              JSON
            </button>
          </div>
        </div>

        {/* Botão Exportar */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between flex-wrap gap-2">
          <div className="text-[10px] text-slate-500 font-mono">
            Empresa: {store.companies.find(c => c.id === companyId)?.trade_name || companyId}
          </div>
          <button
            onClick={handleExportar}
            disabled={loading}
            className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-sm flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Exportar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Informações */}
      <div className="bg-slate-950/60 border border-white/5 p-4 rounded-xl text-xs text-slate-400 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <span className="block text-slate-500 font-semibold">📋 O que será exportado</span>
          <span>{tiposOptions.find(o => o.value === tipo)?.label}</span>
        </div>
        <div>
          <span className="block text-slate-500 font-semibold">📅 Período</span>
          <span>{dataInicio} a {dataFim}</span>
        </div>
        <div>
          <span className="block text-slate-500 font-semibold">📁 Formato</span>
          <span className="uppercase font-mono text-cyan-400">{formato}</span>
        </div>
      </div>
    </div>
  );
};