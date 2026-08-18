// src/components/LivroRazaoView.tsx

import React, { useState, useEffect } from "react";
import { store } from "../services/store";
import { LivrosContabeis } from "../services/contabil/LivroDiario";
import { LivroRazao } from "../types/contabil";
import { BookMarked, Calendar, Download, Printer, RefreshCw, Search, Filter } from "lucide-react";

export const LivroRazaoView: React.FC = () => {
  const [, setTick] = useState(0);
  useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

  const [loading, setLoading] = useState(false);
  const [razoes, setRazoes] = useState<LivroRazao[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [contaSelecionada, setContaSelecionada] = useState<string>("");

  const [dataInicio, setDataInicio] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]
  );
  const [dataFim, setDataFim] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split("T")[0]
  );

  const companyId = store.activeCompanyId;

  const accounts = store.financialAccounts.filter(a => a.company_id === companyId);

  const carregarDados = async () => {
    setLoading(true);
    setError(null);

    try {
      const service = new LivrosContabeis({
        companyId,
        dataInicio,
        dataFim,
        incluirHistoricoCompleto: true,
      });

      let resultados: LivroRazao[] = [];

      if (contaSelecionada) {
        const razao = service.gerarLivroRazao(contaSelecionada);
        resultados = [razao];
      } else {
        resultados = service.gerarLivroRazaoCompleto();
      }

      setRazoes(resultados);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar Livro Razão");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [dataInicio, dataFim, companyId, contaSelecionada]);

  const handleRecarregar = () => {
    carregarDados();
  };

  const handleExportar = () => {
    if (razoes.length === 0) return;
    try {
      const service = new LivrosContabeis({
        companyId,
        dataInicio,
        dataFim,
      });
      const conteudo = razoes.map(r => service.exportarLivroRazaoCSV(r)).join("\n\n");
      const blob = new Blob([conteudo], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `livro_razao_${dataInicio}_${dataFim}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert("Erro ao exportar: " + err.message);
    }
  };

  const handleImprimir = () => {
    window.print();
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
              <BookMarked className="w-5 h-5 text-cyan-400" />
              Livro Razão
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Movimentação detalhada por conta contábil
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

            <div className="flex items-center gap-2 bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={contaSelecionada}
                onChange={(e) => setContaSelecionada(e.target.value)}
                className="bg-transparent text-white text-xs outline-none cursor-pointer min-w-[150px]"
              >
                <option value="">Todas as Contas</option>
                {accounts.map(conta => (
                  <option key={conta.id} value={conta.code}>
                    {conta.code} - {conta.name}
                  </option>
                ))}
              </select>
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

      {/* Razões */}
      {razoes.length === 0 ? (
        <div className="bg-slate-900/60 border border-white/5 p-12 rounded-2xl text-center text-slate-400">
          <BookMarked className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p>Nenhuma movimentação encontrada para o período selecionado.</p>
        </div>
      ) : (
        razoes.map((razao, idx) => (
          <div key={idx} className="bg-slate-900/60 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
            <div className="bg-slate-950/80 px-4 py-3 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Conta: {razao.conta} - {razao.descricao}
                </h3>
                <p className="text-[10px] text-slate-400 font-mono">
                  Saldo Inicial: R$ {razao.saldo_inicial.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} |
                  Saldo Final: R$ {razao.saldo_final.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="flex gap-3 text-xs text-slate-400">
                <span>Débitos: R$ {razao.total_debitos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                <span>Créditos: R$ {razao.total_creditos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-bold border-b border-white/5 text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2 px-4">Data</th>
                    <th className="py-2 px-4">Histórico</th>
                    <th className="py-2 px-4 text-right">Débito</th>
                    <th className="py-2 px-4 text-right">Crédito</th>
                    <th className="py-2 px-4 text-right">Saldo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-200">
                  {razao.lancamentos.map((l, idx2) => (
                    <tr key={idx2} className="hover:bg-white/5 transition-colors">
                      <td className="py-2 px-4 font-mono text-cyan-300">{l.data}</td>
                      <td className="py-2 px-4">{l.historico}</td>
                      <td className="py-2 px-4 text-right font-mono text-rose-400">
                        {l.debito > 0 ? `R$ ${l.debito.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "-"}
                      </td>
                      <td className="py-2 px-4 text-right font-mono text-emerald-400">
                        {l.credito > 0 ? `R$ ${l.credito.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "-"}
                      </td>
                      <td className={`py-2 px-4 text-right font-mono font-bold ${l.saldo >= 0 ? 'text-cyan-400' : 'text-amber-400'}`}>
                        R$ {l.saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
};