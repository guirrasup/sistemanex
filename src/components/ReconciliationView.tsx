import React, { useState, useEffect } from "react";
import { store } from "../services/store";
import { BankTransaction, Settlement, ReconciliationMatch } from "../types";
import {
  ArrowLeftRight, Sparkles, CheckCircle2, AlertTriangle, Cpu, Link,
  Check, RefreshCw, ShieldCheck, Filter, ArrowUpRight, ArrowDownRight
} from "lucide-react";

export const ReconciliationView: React.FC = () => {
  const [selectedBankId, setSelectedBankId] = useState<string>(store.bankAccounts[0]?.id || "");
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [selectedSettleId, setSelectedSettleId] = useState<string | null>(null);

  const [isAiSuggesting, setIsAiSuggesting] = useState(false);
  const [aiReasoning, setAiReasoning] = useState<string | null>(null);
  const [matchError, setMatchError] = useState<string | null>(null);

  const [, setTick] = useState(0);
  useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

  const bankAccounts = store.bankAccounts || [];
  const currentBank = (bankAccounts || []).find(b => b.id === selectedBankId) || bankAccounts[0];

  const transactions = (store.bankTransactions || []).filter(t => t.bank_account_id === selectedBankId);
  const settlements = store.settlements || [];
  const installments = store.installments || [];
  const matches = store.reconciliationMatches || [];

  const unmatchedTxs = transactions.filter(t => t.status === "unmatched");
  const matchedTxs = transactions.filter(t => t.status === "reconciled");

  // AI Auto Match Suggestion
  const handleTriggerAiSuggest = async () => {
    if (unmatchedTxs.length === 0) return;
    setIsAiSuggesting(true);
    setAiReasoning(null);
    setMatchError(null);

    const targetTx = unmatchedTxs[0];

    try {
      const resp = await fetch("/api/ai/reconcile-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transaction: targetTx,
          candidates: settlements.map(s => ({
            id: s.id,
            paid_amount: s.paid_amount,
            paid_date: s.paid_date,
            payment_method: s.payment_method
          }))
        })
      });
      const data = await resp.json();

      if (data.matchedSettlementId) {
        setSelectedTxId(targetTx.id);
        setSelectedSettleId(data.matchedSettlementId);
        setAiReasoning(`IA NEX: ${data.reasoning || "Correspondência identificada com " + Math.round((data.confidenceScore || 0.9) * 100) + "% de confiança."}`);
      } else {
        setAiReasoning("Nenhum match com alta confiança encontrado automaticamente.");
      }
    } catch (err: any) {
      // Offline rule fallback
      const candidate = (settlements || []).find(s => Math.abs(s.paid_amount) === Math.abs(targetTx.amount));
      if (candidate) {
        setSelectedTxId(targetTx.id);
        setSelectedSettleId(candidate.id);
        setAiReasoning("Regra de Tolerância: Correspondência exata de valor R$ " + Math.abs(targetTx.amount) + " encontrada.");
      } else {
        setAiReasoning("Nenhuma sugestão automatizada disponível.");
      }
    } finally {
      setIsAiSuggesting(false);
    }
  };

  const handleExecuteMatch = () => {
    if (!selectedTxId || !selectedSettleId) return;
    setMatchError(null);

    const tx = (store.bankTransactions || []).find(t => t.id === selectedTxId);
    const settle = (store.settlements || []).find(s => s.id === selectedSettleId);
    if (!tx || !settle) return;

    try {
      store.matchReconciliation(tx.id, settle.id, Math.abs(tx.amount), "fuzzy");
      setSelectedTxId(null);
      setSelectedSettleId(null);
      setAiReasoning(null);
    } catch (err: any) {
      setMatchError(err.message || "Erro ao conciliar transação");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/30 border border-white/5 backdrop-blur-md p-5 rounded-2xl shadow-2xl">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-cyan-400" />
            Conciliação Bancária N:N com Motor de IA
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cruzamento de extrato bancário com liquidações do financeiro. Suporta vínculo 1:1, 1:N e N:N com validação de limites.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono">
          <select
            value={selectedBankId}
            onChange={e => setSelectedBankId(e.target.value)}
            className="bg-slate-950 text-slate-200 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer"
          >
            {bankAccounts.map(b => (
              <option key={b.id} value={b.id}>
                {b.account_name} (Saldo: R$ {b.balance.toLocaleString('pt-BR')})
              </option>
            ))}
          </select>

          <button
            onClick={handleTriggerAiSuggest}
            disabled={isAiSuggesting || unmatchedTxs.length === 0}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 uppercase tracking-wider rounded-xl text-xs font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            {isAiSuggesting ? "Analisando..." : "Auto-Match IA"}
          </button>
        </div>
      </div>

      {/* AI Reasoning / Alert Banner */}
      {aiReasoning && (
        <div className="bg-cyan-500/10 border border-cyan-500/30 backdrop-blur-md p-4 rounded-2xl text-xs text-cyan-200 flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{aiReasoning}</span>
          </div>
          {selectedTxId && selectedSettleId && (
            <button
              onClick={handleExecuteMatch}
              className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold uppercase rounded-xl cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.3)]"
            >
              Confirmar Vínculo Sugerido
            </button>
          )}
        </div>
      )}

      {matchError && (
        <div className="bg-rose-500/10 border border-rose-500/30 backdrop-blur-md p-3 rounded-2xl text-xs text-rose-300 flex items-center gap-2 font-mono">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{matchError}</span>
        </div>
      )}

      {/* Main Reconciliation Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN: Extrato Bancário */}
        <div className="bg-slate-950/30 border border-white/5 backdrop-blur-md rounded-2xl p-5 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Extrato Bancário — {currentBank?.account_name}</span>
              </h2>
              <p className="text-[11px] text-slate-400">{unmatchedTxs.length} lançamento(s) pendentes de conciliação</p>
            </div>
            <span className="text-[10px] font-mono bg-slate-950 text-slate-300 border border-white/5 px-2 py-0.5 rounded-full uppercase">
              Total: {transactions.length}
            </span>
          </div>

          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {transactions.map(tx => {
              const isSelected = selectedTxId === tx.id;
              const isReconciled = tx.status === "reconciled";

              return (
                <div
                  key={tx.id}
                  onClick={() => !isReconciled && setSelectedTxId(tx.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isReconciled
                      ? "bg-slate-950/40 border-white/5 opacity-50 cursor-default"
                      : isSelected
                      ? "bg-cyan-500/10 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)] ring-1 ring-cyan-500/50"
                      : "bg-slate-950/60 border-white/5 hover:border-cyan-500/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                        tx.amount > 0 ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      }`}>
                        {tx.amount > 0 ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">{tx.description}</span>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-mono">
                          <span>{tx.transaction_date}</span>
                          {tx.category_suggested && (
                            <span className="bg-slate-900 text-slate-300 px-1.5 py-0.2 rounded font-sans border border-white/5">
                              {tx.category_suggested}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 font-mono">
                      <span className={`text-xs font-bold block ${tx.amount > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {tx.amount > 0 ? "+" : ""} R$ {Math.abs(tx.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      {isReconciled ? (
                        <span className="text-[9px] uppercase font-bold text-cyan-400 flex items-center gap-0.5 justify-end mt-1">
                          <CheckCircle2 className="w-3 h-3" /> Conciliado
                        </span>
                      ) : (
                        <span className="text-[9px] uppercase font-bold text-amber-400 block mt-1">Pendente</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Liquidações / Títulos do Financeiro */}
        <div className="bg-slate-950/30 border border-white/5 backdrop-blur-md rounded-2xl p-5 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Liquidações / Títulos Pendentes</span>
              </h2>
              <p className="text-[11px] text-slate-400">Selecione para vincular ao extrato</p>
            </div>
            {selectedTxId && selectedSettleId && (
              <button
                onClick={handleExecuteMatch}
                className="px-3.5 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider font-mono shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
              >
                Vincular N:N
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {(settlements || []).map(settle => {
              const inst = (installments || []).find(i => i.id === settle.installment_id);
              const isSelected = selectedSettleId === settle.id;

              return (
                <div
                  key={settle.id}
                  onClick={() => setSelectedSettleId(settle.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-cyan-500/10 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)] ring-1 ring-cyan-500/50"
                      : "bg-slate-950/60 border-white/5 hover:border-cyan-500/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white font-mono">Liquidação #{settle.id}</span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-300 border border-white/5">
                          {settle.payment_method}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 font-mono">
                        Pago em: {settle.paid_date} • Parcela #{inst?.installment_number || 1}
                      </div>
                    </div>

                    <div className="text-right shrink-0 font-mono">
                      <span className="text-xs font-bold text-cyan-400 block">
                        R$ {settle.paid_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[9px] text-slate-500 block mt-0.5">{settle.authorization_code}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* History of Matches */}
      <div className="bg-slate-950/30 border border-white/5 backdrop-blur-md rounded-2xl p-5 space-y-3 shadow-2xl">
        <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider font-mono">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          Histórico de Vínculos de Conciliação Registrados (reconciliation_match)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] border-b border-white/5 tracking-wider font-bold">
              <tr>
                <th className="py-2.5 px-3">ID Match</th>
                <th className="py-2.5 px-3">ID Transação Extrato</th>
                <th className="py-2.5 px-3">ID Liquidação</th>
                <th className="py-2.5 px-3 text-right">Valor Conciliado</th>
                <th className="py-2.5 px-3">Método</th>
                <th className="py-2.5 px-3">Score Confiança</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {matches.map(m => (
                <tr key={m.id} className="hover:bg-white/5">
                  <td className="py-2.5 px-3 text-cyan-400 font-bold">{m.id}</td>
                  <td className="py-2.5 px-3">{m.bank_transaction_id}</td>
                  <td className="py-2.5 px-3">{m.settlement_id}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-cyan-400">
                    R$ {m.matched_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 uppercase text-[10px]">{m.match_method}</td>
                  <td className="py-2.5 px-3 font-bold text-cyan-300">
                    {Math.round((m.confidence_score || 0.95) * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
