// src/components/RelatoriosFiscaisView.tsx

import React, { useState, useEffect } from "react";
import { store } from "../services/store";
import { 
  RelatoriosFiscais,
  RelatorioNotasEmitidas,
  RelatorioNotasRecebidas,
  RelatorioApuraçãoImpostosMensal,
  RelatorioResumoFiscal
} from "../services/fiscal/RelatoriosFiscais";
import { FileBarChart, Calendar, Download, Printer, RefreshCw, FileText, TrendingUp, TrendingDown } from "lucide-react";

type TipoRelatorio = "emitidas" | "recebidas" | "apuracao" | "resumo";

export const RelatoriosFiscaisView: React.FC = () => {
  const [, setTick] = useState(0);
  useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

  const [loading, setLoading] = useState(false);
  const [tipo, setTipo] = useState<TipoRelatorio>("emitidas");
  const [error, setError] = useState<string | null>(null);

  const [dataInicio, setDataInicio] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]
  );
  const [dataFim, setDataFim] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split("T")[0]
  );
  const [mesApuração, setMesApuração] = useState(new Date().getMonth() + 1);
  const [anoApuração, setAnoApuração] = useState(new Date().getFullYear());

  const [relatorioEmitidas, setRelatorioEmitidas] = useState<RelatorioNotasEmitidas | null>(null);
  const [relatorioRecebidas, setRelatorioRecebidas] = useState<RelatorioNotasRecebidas | null>(null);
  const [relatorioApuracao, setRelatorioApuracao] = useState<RelatorioApuraçãoImpostosMensal | null>(null);
  const [relatorioResumo, setRelatorioResumo] = useState<RelatorioResumoFiscal | null>(null);

  const companyId = store.activeCompanyId;

  const carregarDados = async () => {
    setLoading(true);
    setError(null);

    try {
      const service = new RelatoriosFiscais(companyId);

      switch (tipo) {
        case "emitidas":
          const emitidas = service.gerarRelatorioNotasEmitidas(dataInicio, dataFim);
          setRelatorioEmitidas(emitidas);
          break;
        case "recebidas":
          const recebidas = service.gerarRelatorioNotasRecebidas(dataInicio, dataFim);
          setRelatorioRecebidas(recebidas);
          break;
        case "apuracao":
          const apuracao = service.gerarRelatorioApuraçãoMensal(mesApuração, anoApuração);
          setRelatorioApuracao(apuracao);
          break;
        case "resumo":
          const resumo = service.gerarRelatorioResumoFiscal(dataInicio, dataFim);
          setRelatorioResumo(resumo);
          break;
      }
    } catch (err: any) {
      setError(err.message || "Erro ao carregar relatório");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [tipo, dataInicio, dataFim, mesApuração, anoApuração, companyId]);

  const handleExportar = () => {
    let relatorio: any = null;
    let nome = "";
    let tipoExport = "";

    switch (tipo) {
      case "emitidas":
        relatorio = relatorioEmitidas;
        nome = `notas_emitidas_${dataInicio}_${dataFim}`;
        tipoExport = "notas_emitidas";
        break;
      case "recebidas":
        relatorio = relatorioRecebidas;
        nome = `notas_recebidas_${dataInicio}_${dataFim}`;
        tipoExport = "notas_recebidas";
        break;
      case "apuracao":
        relatorio = relatorioApuracao;
        nome = `apuracao_${mesApuração}_${anoApuração}`;
        tipoExport = "apuracao";
        break;
      case "resumo":
        relatorio = relatorioResumo;
        nome = `resumo_fiscal_${dataInicio}_${dataFim}`;
        tipoExport = "resumo";
        break;
    }

    if (!relatorio) return;

    try {
      const service = new RelatoriosFiscais(companyId);
      const conteudo = service.exportarCSV(relatorio, tipoExport);
      const blob = new Blob([conteudo], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${nome}.csv`;
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
          onClick={carregarDados}
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
              <FileBarChart className="w-5 h-5 text-cyan-400" />
              Relatórios Fiscais
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Notas emitidas, recebidas, apuração e resumo fiscal
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-white/10 text-xs">
              <button
                onClick={() => setTipo("emitidas")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  tipo === "emitidas" ? "bg-cyan-500 text-slate-950" : "text-slate-400 hover:text-white"
                }`}
              >
                Emitidas
              </button>
              <button
                onClick={() => setTipo("recebidas")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  tipo === "recebidas" ? "bg-cyan-500 text-slate-950" : "text-slate-400 hover:text-white"
                }`}
              >
                Recebidas
              </button>
              <button
                onClick={() => setTipo("apuracao")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  tipo === "apuracao" ? "bg-cyan-500 text-slate-950" : "text-slate-400 hover:text-white"
                }`}
              >
                Apuração
              </button>
              <button
                onClick={() => setTipo("resumo")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  tipo === "resumo" ? "bg-cyan-500 text-slate-950" : "text-slate-400 hover:text-white"
                }`}
              >
                Resumo
              </button>
            </div>

            {/* Período */}
            {tipo !== "apuracao" && (
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
            )}

            {/* Mês/Ano para Apuração */}
            {tipo === "apuracao" && (
              <div className="flex items-center gap-2 bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <select
                  value={mesApuração}
                  onChange={(e) => setMesApuração(Number(e.target.value))}
                  className="bg-transparent text-white text-xs outline-none cursor-pointer"
                >
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                    <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                  ))}
                </select>
                <select
                  value={anoApuração}
                  onChange={(e) => setAnoApuração(Number(e.target.value))}
                  className="bg-transparent text-white text-xs outline-none cursor-pointer"
                >
                  {[2023, 2024, 2025, 2026, 2027].map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={carregarDados}
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

      {/* Conteúdo */}
      {tipo === "emitidas" && relatorioEmitidas && (
        <div className="bg-slate-900/60 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <div className="bg-slate-950/80 px-4 py-3 border-b border-white/5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Notas Fiscais Emitidas
              </h3>
              <p className="text-[10px] text-slate-400">
                Total: {relatorioEmitidas.totais.quantidade} notas | 
                Valor: R$ {relatorioEmitidas.totais.valor_total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="flex gap-3 text-xs text-slate-400">
              <span>ICMS: R$ {relatorioEmitidas.totais.total_icms.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
              <span>CBS: R$ {relatorioEmitidas.totais.total_cbs.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
              <span>IBS: R$ {relatorioEmitidas.totais.total_ibs.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-bold border-b border-white/5 text-[10px] tracking-wider">
                <tr>
                  <th className="py-2 px-4">Número</th>
                  <th className="py-2 px-4">Data</th>
                  <th className="py-2 px-4">Cliente</th>
                  <th className="py-2 px-4 text-right">Valor</th>
                  <th className="py-2 px-4 text-right">ICMS</th>
                  <th className="py-2 px-4 text-right">CBS</th>
                  <th className="py-2 px-4 text-right">IBS</th>
                  <th className="py-2 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {relatorioEmitidas.notas.map((n, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="py-2 px-4 font-mono font-bold text-white">{n.numero}</td>
                    <td className="py-2 px-4 font-mono text-cyan-300">{n.data}</td>
                    <td className="py-2 px-4">{n.cliente}</td>
                    <td className="py-2 px-4 text-right font-mono font-bold text-emerald-400">
                      R$ {n.valor_total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-4 text-right font-mono text-rose-400">
                      R$ {n.valor_icms.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-4 text-right font-mono text-cyan-400">
                      R$ {n.valor_cbs.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-4 text-right font-mono text-indigo-400">
                      R$ {n.valor_ibs.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        n.status === "authorized" 
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : n.status === "canceled"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}>
                        {n.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tipo === "recebidas" && relatorioRecebidas && (
        <div className="bg-slate-900/60 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <div className="bg-slate-950/80 px-4 py-3 border-b border-white/5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-rose-400" />
                Notas Fiscais Recebidas
              </h3>
              <p className="text-[10px] text-slate-400">
                Total: {relatorioRecebidas.totais.quantidade} notas | 
                Valor: R$ {relatorioRecebidas.totais.valor_total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="flex gap-3 text-xs text-slate-400">
              <span>ICMS: R$ {relatorioRecebidas.totais.total_icms.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
              <span>CBS: R$ {relatorioRecebidas.totais.total_cbs.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
              <span>IBS: R$ {relatorioRecebidas.totais.total_ibs.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-bold border-b border-white/5 text-[10px] tracking-wider">
                <tr>
                  <th className="py-2 px-4">Número</th>
                  <th className="py-2 px-4">Data</th>
                  <th className="py-2 px-4">Fornecedor</th>
                  <th className="py-2 px-4 text-right">Valor</th>
                  <th className="py-2 px-4 text-right">ICMS</th>
                  <th className="py-2 px-4 text-right">CBS</th>
                  <th className="py-2 px-4 text-right">IBS</th>
                  <th className="py-2 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {relatorioRecebidas.notas.map((n, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="py-2 px-4 font-mono font-bold text-white">{n.numero}</td>
                    <td className="py-2 px-4 font-mono text-cyan-300">{n.data}</td>
                    <td className="py-2 px-4">{n.fornecedor}</td>
                    <td className="py-2 px-4 text-right font-mono font-bold text-rose-400">
                      R$ {n.valor_total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-4 text-right font-mono text-rose-400">
                      R$ {n.valor_icms.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-4 text-right font-mono text-cyan-400">
                      R$ {n.valor_cbs.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-4 text-right font-mono text-indigo-400">
                      R$ {n.valor_ibs.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        n.status === "authorized" 
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : n.status === "canceled"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}>
                        {n.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tipo === "apuracao" && relatorioApuracao && (
        <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-4">Apuração de Impostos - {String(mesApuração).padStart(2, '0')}/{anoApuração}</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(relatorioApuracao.impostos).map(([key, value]) => {
              const cores: Record<string, string> = {
                icms: "border-rose-500/20",
                pis: "border-amber-500/20",
                cofins: "border-orange-500/20",
                cbs: "border-cyan-500/20",
                ibs: "border-indigo-500/20",
              };
              const coresText: Record<string, string> = {
                icms: "text-rose-400",
                pis: "text-amber-400",
                cofins: "text-orange-400",
                cbs: "text-cyan-400",
                ibs: "text-indigo-400",
              };
              const nome = key.toUpperCase();
              
              return (
                <div key={key} className={`bg-slate-950/60 border ${cores[key]} p-4 rounded-xl`}>
                  <h4 className={`text-xs font-bold ${coresText[key]} uppercase`}>{nome}</h4>
                  <div className="mt-2 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Débito</span>
                      <span className="text-rose-400 font-mono">R$ {value.debito.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Crédito</span>
                      <span className="text-emerald-400 font-mono">R$ {value.credito.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between border-t border-white/5 pt-1 font-bold">
                      <span className="text-amber-400">Saldo</span>
                      <span className={`font-mono ${value.saldo >= 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        R$ {value.saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Status</span>
                      <span className={`text-[10px] font-bold ${value.status === 'a_recolher' ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {value.status === 'a_recolher' ? '🔴 A Recolher' : '✅ Quitado'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-950/60 p-3 rounded-xl text-center">
              <span className="text-slate-400 block">Receita Bruta</span>
              <span className="text-lg font-bold text-white font-mono">
                R$ {relatorioApuracao.receita_bruta.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl text-center">
              <span className="text-slate-400 block">Total Impostos</span>
              <span className="text-lg font-bold text-rose-400 font-mono">
                R$ {relatorioApuracao.total_impostos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl text-center">
              <span className="text-slate-400 block">Carga Tributária</span>
              <span className="text-lg font-bold text-cyan-400 font-mono">
                {relatorioApuracao.carga_tributaria.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {tipo === "resumo" && relatorioResumo && (
        <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-4">Resumo Fiscal</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-950/60 p-4 rounded-xl">
              <span className="text-slate-400 text-xs block">Notas Emitidas</span>
              <span className="text-2xl font-bold text-emerald-400">{relatorioResumo.resumo.total_notas_emitidas}</span>
              <span className="text-[10px] text-slate-500 block">Valor: R$ {relatorioResumo.resumo.total_valor_emitido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="bg-slate-950/60 p-4 rounded-xl">
              <span className="text-slate-400 text-xs block">Notas Recebidas</span>
              <span className="text-2xl font-bold text-rose-400">{relatorioResumo.resumo.total_notas_recebidas}</span>
              <span className="text-[10px] text-slate-500 block">Valor: R$ {relatorioResumo.resumo.total_valor_recebido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="bg-slate-950/60 p-4 rounded-xl">
              <span className="text-slate-400 text-xs block">ICMS Emitido</span>
              <span className="text-2xl font-bold text-rose-400">R$ {relatorioResumo.resumo.total_icms_emitido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="bg-slate-950/60 p-4 rounded-xl">
              <span className="text-slate-400 text-xs block">CBS/IBS Emitido</span>
              <span className="text-2xl font-bold text-cyan-400">
                R$ {(relatorioResumo.resumo.total_cbs_emitido + relatorioResumo.resumo.total_ibs_emitido).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-950/60 p-3 rounded-xl text-center">
              <span className="text-slate-400 block">Autorizadas</span>
              <span className="text-lg font-bold text-emerald-400">{relatorioResumo.por_status.autorizadas}</span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl text-center">
              <span className="text-slate-400 block">Canceladas</span>
              <span className="text-lg font-bold text-rose-400">{relatorioResumo.por_status.canceladas}</span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl text-center">
              <span className="text-slate-400 block">Pendentes</span>
              <span className="text-lg font-bold text-amber-400">{relatorioResumo.por_status.pendentes}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};