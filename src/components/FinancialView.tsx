import React, { useState, useEffect } from "react";
import { store } from "../services/store";
import { ApiClient } from "../services/api.client";
import { Direction, Installment } from "../types";
import {
  DollarSign, ArrowUpRight, ArrowDownRight, Plus,
  CheckCircle, Clock, Trash2, Check, X, Wallet, Tag
} from "lucide-react";

interface FinancialViewProps {
  initialOpenModal?: boolean;
}

export const FinancialView: React.FC<FinancialViewProps> = ({ initialOpenModal = false }) => {
  const [, setTick] = useState(0);
  useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

  const [filterType, setFilterType] = useState<"all" | "receivable" | "payable" | "pending">("all");
  const [showModal, setShowModal] = useState(initialOpenModal);

  // New Transaction Form
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [direction, setDirection] = useState<Direction>("payable");
  const [category, setCategory] = useState("Geral");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isPaid, setIsPaid] = useState(true);

  // Calculate totals
  const bankAccounts = store.bankAccounts || [];
  const currentBalance = bankAccounts.reduce((acc, b) => acc + b.balance, 0);

  const installments = store.installments || [];
  const documents = store.financialDocuments || [];

  let totalIncomes = 0;
  let totalExpenses = 0;

  installments.forEach(inst => {
    const doc = documents.find(d => d.id === inst.financial_document_id);
    if (!doc) return;

    if (inst.status === "paid") {
      if (doc.direction === "receivable") {
        totalIncomes += inst.original_amount;
      } else {
        totalExpenses += inst.original_amount;
      }
    }
  });

  // Filter list
  const filteredInstallments = installments.filter(inst => {
    const doc = documents.find(d => d.id === inst.financial_document_id);
    if (!doc) return false;

    if (filterType === "receivable") return doc.direction === "receivable";
    if (filterType === "payable") return doc.direction === "payable";
    if (filterType === "pending") return inst.status !== "paid";
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || Number(amount) <= 0) return;

    store.addSimpleTransaction({
      description,
      amount: Number(amount),
      direction,
      category,
      date,
      isPaid
    });

    setDescription("");
    setAmount("");
    setShowModal(false);
  };

  const handleSettle = async (inst: Installment) => {
    try {
      await ApiClient.executeSettlement({
        installment_id: inst.id,
        payment_method: "pix",
        amount: inst.current_amount,
        payment_date: new Date().toISOString().split("T")[0],
        bank_account_id: bankAccounts[0]?.id || "bank-001"
      });

      // Apply settlement status to local reactive state
      store.applySettlementToStore({
        installment_id: inst.id,
        paid_amount: inst.current_amount,
        paid_date: new Date().toISOString().split("T")[0],
        bank_account_id: bankAccounts[0]?.id
      });
    } catch (err: any) {
      alert(err.message || "Erro ao dar baixa");
    }
  };

  const handleDelete = (instId: string) => {
    if (confirm("Tem certeza que deseja excluir este lançamento?")) {
      store.deleteInstallment(instId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Saldo Caixa */}
        <div className="bg-slate-900/80 border border-cyan-500/30 p-5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Wallet className="w-20 h-20 text-cyan-400" />
          </div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Wallet className="w-4 h-4" /> Saldo em Caixa
          </div>
          <div className="text-2xl font-black text-white font-mono">
            R$ {currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Disponível em contas bancárias</p>
        </div>

        {/* Total Entradas */}
        <div className="bg-slate-900/80 border border-emerald-500/30 p-5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ArrowDownRight className="w-4 h-4" /> Total de Entradas (Receitas)
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            + R$ {totalIncomes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Lançamentos recebidos</p>
        </div>

        {/* Total Saídas */}
        <div className="bg-slate-900/80 border border-rose-500/30 p-5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ArrowUpRight className="w-4 h-4" /> Total de Saídas (Despesas)
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono">
            - R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Lançamentos pagos</p>
        </div>
      </div>

      {/* Main Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-white/5 p-4 rounded-2xl">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white">Extrato & Lançamentos Financeiros</h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                filterType === "all" ? "bg-cyan-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType("receivable")}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                filterType === "receivable" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              Entradas
            </button>
            <button
              onClick={() => setFilterType("payable")}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                filterType === "payable" ? "bg-rose-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              Saídas
            </button>
            <button
              onClick={() => setFilterType("pending")}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                filterType === "pending" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              A Pagar/Receber
            </button>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Novo Lançamento
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900/60 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-bold border-b border-white/5 text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Tipo / Data</th>
                <th className="py-3.5 px-4">Descrição</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Valor</th>
                <th className="py-3.5 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {filteredInstallments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                    Nenhum lançamento encontrado para este filtro.
                  </td>
                </tr>
              ) : (
                filteredInstallments.map(inst => {
                  const doc = documents.find(d => d.id === inst.financial_document_id);
                  const isReceivable = doc?.direction === "receivable";
                  const isPaidStatus = inst.status === "paid";

                  return (
                    <tr key={inst.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4 font-mono">
                        <div className="flex items-center gap-2">
                          {isReceivable ? (
                            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              <ArrowDownRight className="w-4 h-4" />
                            </span>
                          ) : (
                            <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                              <ArrowUpRight className="w-4 h-4" />
                            </span>
                          )}
                          <div>
                            <span className="font-bold text-slate-200 block">{inst.due_date}</span>
                            <span className="text-[10px] text-slate-500 block">{isReceivable ? "Entrada (Receita)" : "Saída (Despesa)"}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-white block">{doc?.description || "Lançamento"}</span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Tag className="w-3 h-3 text-cyan-400" /> {doc?.document_number}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                          isPaidStatus
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}>
                          {isPaidStatus ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              {isReceivable ? "Recebido" : "Pago"}
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />
                              {isReceivable ? "A Receber" : "A Pagar"}
                            </>
                          )}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-sm">
                        <span className={isReceivable ? "text-emerald-400" : "text-rose-400"}>
                          {isReceivable ? "+" : "-"} R$ {inst.original_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {!isPaidStatus && (
                            <button
                              onClick={() => handleSettle(inst)}
                              className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-[11px] transition-all cursor-pointer flex items-center gap-1"
                              title="Marcar como pago/recebido"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" /> Baixar
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(inst.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                            title="Excluir lançamento"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Novo Lançamento Simples */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" /> Novo Lançamento Financeiro
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              {/* Type Selection */}
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Tipo de Movimentação</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDirection("receivable")}
                    className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer border transition-all ${
                      direction === "receivable"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md"
                        : "bg-slate-950 text-slate-400 border-white/5 hover:text-slate-200"
                    }`}
                  >
                    <ArrowDownRight className="w-4 h-4" /> Entrada (Receita)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirection("payable")}
                    className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer border transition-all ${
                      direction === "payable"
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-md"
                        : "bg-slate-950 text-slate-400 border-white/5 hover:text-slate-200"
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" /> Saída (Despesa)
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Descrição</label>
                <input
                  type="text"
                  placeholder="Ex: Pagamento de Fornecedor ou Venda de Produto"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-cyan-500"
                  required
                />
              </div>

              {/* Amount & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white font-mono font-bold outline-none focus:border-cyan-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Data</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              {/* Status Checkbox */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-medium">
                  <input
                    type="checkbox"
                    checked={isPaid}
                    onChange={e => setIsPaid(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-950 border-white/20 text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                  <span>Já está {direction === "receivable" ? "recebido" : "pago"} em dinheiro/PIX</span>
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl cursor-pointer shadow-lg shadow-cyan-500/20"
                >
                  Salvar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
