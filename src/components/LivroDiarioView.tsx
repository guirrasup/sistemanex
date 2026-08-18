// src/components/LivroDiarioView.tsx

import React, { useState, useEffect } from "react";
import { store } from "../services/store";
import { LivrosContabeis } from "../services/contabil/LivroDiario";
import { LivroDiario } from "../types/contabil";
import { BookOpen, Calendar, Download, Printer, RefreshCw, FileText, Search } from "lucide-react";

export const LivroDiarioView: React.FC = () => {
  const [, setTick] = useState(0);
  useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

  const [loading, setLoading] = useState(false);
  const [livro, setLivro] = useState<LivroDiario | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [dataInicio, setDataInicio] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]
  );
  const [dataFim, setDataFim] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split("T")[0]
  );
  const [searchTerm, setSearchTerm] = useState("");

  const companyId = store.activeCompanyId;

  const carregarDados = async () => {
    setLoading(true);
    setError(null);

    try {
      const service = new LivrosContabeis({
        companyId,
        dataInicio,
        dataFim,
      });
      const result = service.gerarLivroDiario();
      setLivro(result);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar Livro Diário");
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

  const handleExportar = () => {
    if (!livro) return;
    try {
      const service = new LivrosContabeis({
        companyId,
        dataInicio,
        dataFim,
      });
      const conteudo = service.exportarLivroDiarioCSV(livro);
      const blob = new Blob([conteudo], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `livro_diario_${dataInicio}_${dataFim}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert("Erro ao exportar: " + err.message);
    }
  };

  const handleImprimir = () => {
    window.print();
  };

  const lancamentosFiltrados = livro?.lancamentos.filter(l =>
    l.historico.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.conta_debito.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.conta_credito.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.documento && l.documento.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

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
        <p>Erro ao carregar dados: {error}</p>
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
              <BookOpen className="w-5 h-5 text-cyan-400" />
              Livro Diário
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Registro cronológico de todas as movimentações contábeis
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
              onClick={handleExportar}
              className="px-3 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              CSV
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

      {/* Filtro */}
      <div className="bg-slate-900/60 border border-white/5 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filtrar por histórico, conta ou documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 outline-none focus:border-cyan-500"
            />
          </div>
          <span className="text-xs text-slate-400">
            {lancamentosFiltrados.length} lançamentos
          </span>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-slate-900/60 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-bold border-b border-white/5 text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4">Histórico</th>
                <th className="py-3 px-4">Conta Débito</th>
                <th className="py-3 px-4">Conta Crédito</th>
                <th className="py-3 px-4 text-right">Valor</th>
                <th className="py-3 px-4">Documento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {lancamentosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                    Nenhum lançamento encontrado para o período e filtro selecionados.
                  </td>
                </tr>
              ) : (
                lancamentosFiltrados.map((l, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="py-2 px-4 font-mono text-cyan-300">{l.data}</td>
                    <td className="py-2 px-4 font-semibold text-white">{l.historico}</td>
                    <td className="py-2 px-4 font-mono text-rose-300">{l.conta_debito}</td>
                    <td className="py-2 px-4 font-mono text-emerald-300">{l.conta_credito}</td>
                    <td className="py-2 px-4 text-right font-mono font-bold text-white">
                      R$ {l.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-4 text-slate-400">{l.documento || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totais */}
      {livro && (
        <div className="bg-slate-950/60 border border-white/5 p-4 rounded-xl text-xs text-slate-400 grid grid-cols-3 gap-4">
          <div>
            <span className="block text-slate-500">Total Débito</span>
            <span className="text-rose-400 font-mono font-bold text-sm">
              R$ {livro.total_debito.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <span className="block text-slate-500">Total Crédito</span>
            <span className="text-emerald-400 font-mono font-bold text-sm">
              R$ {livro.total_credito.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <span className="block text-slate-500">Saldo</span>
            <span className={`font-mono font-bold text-sm ${(livro.total_debito - livro.total_credito) >= 0 ? 'text-cyan-400' : 'text-amber-400'}`}>
              R$ {(livro.total_debito - livro.total_credito).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};