import React, { useState, useEffect } from "react";
import { store } from "../services/store";
import { BankAccount } from "../types";
import { Building, Landmark, Plus, Trash2, Edit3, Wallet, X } from "lucide-react";

export const BankAccountsView: React.FC = () => {
  const [, setTick] = useState(0);
  useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBank, setEditingBank] = useState<BankAccount | null>(null);

  // Form state for bank account
  const [accountName, setAccountName] = useState("");
  const [bankCode, setBankCode] = useState("001");
  const [bankName, setBankName] = useState("Banco do Brasil");
  const [accountType, setAccountType] = useState<"checking" | "savings" | "investment">("checking");
  const [agency, setAgency] = useState("0001");
  const [agencyDigit, setAgencyDigit] = useState("0");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountDigit, setAccountDigit] = useState("1");
  const [holderName, setHolderName] = useState("Sua Empresa LTDA");
  const [holderTaxId, setHolderTaxId] = useState("12.345.678/0001-90");
  const [pixKey, setPixKey] = useState("");
  const [overdraftLimit, setOverdraftLimit] = useState<string>("5000");
  const [monthlyFee, setMonthlyFee] = useState<string>("29.90");
  const [initialBalance, setInitialBalance] = useState<string>("10000");

  const bankAccounts = store.bankAccounts || [];
  const totalBalance = bankAccounts.reduce((acc, b) => acc + b.balance, 0);

  const bankNameMap: Record<string, string> = {
    "001": "Banco do Brasil",
    "033": "Banco Santander",
    "104": "Caixa Econômica Federal",
    "237": "Banco Bradesco",
    "341": "Itaú Unibanco",
    "260": "Nubank",
    "077": "Banco Inter",
    "000": "Caixa Físico (Tesouraria)"
  };

  const handleOpenAddModal = () => {
    setEditingBank(null);
    setAccountName("");
    setBankCode("001");
    setBankName("Banco do Brasil");
    setAccountType("checking");
    setAgency("0001");
    setAgencyDigit("0");
    setAccountNumber("");
    setAccountDigit("1");
    setHolderName("Sua Empresa LTDA");
    setHolderTaxId("12.345.678/0001-90");
    setPixKey("");
    setOverdraftLimit("5000");
    setMonthlyFee("29.90");
    setInitialBalance("10000");
    setShowAddModal(true);
  };

  const handleOpenEditModal = (b: BankAccount) => {
    setEditingBank(b);
    setAccountName(b.account_name);
    setBankCode(b.bank_code);
    setBankName(b.bank_name || bankNameMap[b.bank_code] || "Banco Santander");
    setAccountType(b.account_type || "checking");
    setAgency(b.agency);
    setAgencyDigit(b.agency_digit || "0");
    setAccountNumber(b.account_number);
    setAccountDigit(b.account_digit || "0");
    setHolderName(b.holder_name || "Sua Empresa LTDA");
    setHolderTaxId(b.holder_tax_id || "12.345.678/0001-90");
    setPixKey(b.pix_key || "");
    setOverdraftLimit(String(b.overdraft_limit || 0));
    setMonthlyFee(String(b.monthly_fee || 0));
    setInitialBalance(String(b.balance));
    setShowAddModal(true);
  };

  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName || !accountNumber) return;

    const bName = bankNameMap[bankCode] || bankName || "Banco";

    const payload = {
      account_name: accountName,
      bank_code: bankCode,
      bank_name: bName,
      account_type: accountType,
      agency: agency,
      agency_digit: agencyDigit,
      account_number: accountNumber,
      account_digit: accountDigit,
      holder_name: holderName,
      holder_tax_id: holderTaxId,
      pix_key: pixKey || accountNumber,
      overdraft_limit: Number(overdraftLimit) || 0,
      monthly_fee: Number(monthlyFee) || 0,
      balance: Number(initialBalance) || 0,
      available_balance: (Number(initialBalance) || 0) + (Number(overdraftLimit) || 0)
    };

    if (editingBank) {
      store.updateBankAccount(editingBank.id, payload);
    } else {
      store.addBankAccount({
        ...payload,
        initial_balance: Number(initialBalance) || 0
      });
    }

    setShowAddModal(false);
  };

  const handleDeleteBank = (id: string) => {
    if (confirm("Tem certeza que deseja remover esta conta bancária?")) {
      store.deleteBankAccount(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900/60 border border-cyan-500/30 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-cyan-400 font-bold uppercase block tracking-wider">Saldo Geral das Contas</span>
            <span className="text-2xl font-black text-white font-mono">
              R$ {totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Wallet className="w-8 h-8" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase block tracking-wider">Contas / Caixas Cadastrados</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">{bankAccounts.length}</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Landmark className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-white/5 p-4 rounded-2xl">
        <div className="flex items-center gap-2">
          <Landmark className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white">Bancos e Contas Bancárias</h2>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.3)] shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Cadastrar Conta Bancária
        </button>
      </div>

      {/* Grid of Bank Accounts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bankAccounts.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 text-xs bg-slate-900/60 border border-white/5 rounded-2xl">
            Nenhuma conta bancária cadastrada. Clique acima para adicionar.
          </div>
        ) : (
          bankAccounts.map(b => (
            <div
              key={b.id}
              className="bg-slate-900/80 border border-white/10 hover:border-cyan-500/40 p-5 rounded-2xl shadow-xl space-y-4 transition-all relative overflow-hidden group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{b.account_name}</h3>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {b.bank_name || b.bank_code} • Ag: {b.agency}{b.agency_digit ? `-${b.agency_digit}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(b)}
                    className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all cursor-pointer"
                    title="Editar Conta"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteBank(b.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                    title="Remover Conta"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 bg-slate-950/50 p-2.5 rounded-xl border border-white/5 font-mono">
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase">Conta</span>
                  <span className="text-slate-200 font-bold">{b.account_number}{b.account_digit ? `-${b.account_digit}` : ''}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase">Chave PIX</span>
                  <span className="text-cyan-400 font-bold truncate block">{b.pix_key || "Não definida"}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-end justify-between">
                <div>
                  <span className="text-[9px] text-slate-500 block font-semibold uppercase">Cheque Especial</span>
                  <span className="text-xs font-mono text-slate-400">
                    R$ {(b.overdraft_limit || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[9px] text-slate-500 block font-semibold uppercase">Saldo Disponível</span>
                  <span className="text-base font-black font-mono text-emerald-400">
                    R$ {(b.available_balance || b.balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Nova/Editar Conta Bancária */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" />
                {editingBank ? "Editar Conta Bancária" : "Nova Conta Bancária"}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBank} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-slate-400 block mb-1 font-semibold">Nome de Identificação da Conta *</label>
                  <input
                    type="text"
                    placeholder="Ex: Conta Corrente Itaú Principal ou Tesouraria Espécie"
                    value={accountName}
                    onChange={e => setAccountName(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Tipo de Conta</label>
                  <select
                    value={accountType}
                    onChange={e => setAccountType(e.target.value as "checking" | "savings" | "investment")}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white outline-none cursor-pointer"
                  >
                    <option value="checking">Conta Corrente (CC)</option>
                    <option value="savings">Conta Poupança (CP)</option>
                    <option value="investment">Conta Investimento (CI)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-slate-400 block mb-1 font-semibold">Instituição Financeira</label>
                  <select
                    value={bankCode}
                    onChange={e => {
                      setBankCode(e.target.value);
                      if (bankNameMap[e.target.value]) setBankName(bankNameMap[e.target.value]);
                    }}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white outline-none cursor-pointer"
                  >
                    <option value="001">001 - Banco do Brasil</option>
                    <option value="033">033 - Banco Santander</option>
                    <option value="104">104 - Caixa Econômica</option>
                    <option value="237">237 - Bradesco</option>
                    <option value="341">341 - Itaú Unibanco</option>
                    <option value="260">260 - Nubank</option>
                    <option value="077">077 - Banco Inter</option>
                    <option value="000">000 - Caixa Físico (Espécie)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Agência</label>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      placeholder="0001"
                      value={agency}
                      onChange={e => setAgency(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white font-mono outline-none"
                      required
                    />
                    <input
                      type="text"
                      placeholder="0"
                      value={agencyDigit}
                      onChange={e => setAgencyDigit(e.target.value)}
                      className="w-10 bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white font-mono text-center outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Número Conta</label>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      placeholder="12345"
                      value={accountNumber}
                      onChange={e => setAccountNumber(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white font-mono outline-none"
                      required
                    />
                    <input
                      type="text"
                      placeholder="6"
                      value={accountDigit}
                      onChange={e => setAccountDigit(e.target.value)}
                      className="w-10 bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white font-mono text-center outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Titular da Conta (Razão Social / Nome)</label>
                  <input
                    type="text"
                    placeholder="Sua Empresa LTDA"
                    value={holderName}
                    onChange={e => setHolderName(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">CPF / CNPJ do Titular</label>
                  <input
                    type="text"
                    placeholder="12.345.678/0001-90"
                    value={holderTaxId}
                    onChange={e => setHolderTaxId(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white font-mono outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Saldo Atual (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="10000,00"
                    value={initialBalance}
                    onChange={e => setInitialBalance(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white font-mono outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Limite Cheque Especial (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="5000,00"
                    value={overdraftLimit}
                    onChange={e => setOverdraftLimit(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Tarifa Manutenção (R$/Mês)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="29,90"
                    value={monthlyFee}
                    onChange={e => setMonthlyFee(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white font-mono outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Chave PIX Associada</label>
                <input
                  type="text"
                  placeholder="Chave e-mail, CNPJ, telefone ou aleatória"
                  value={pixKey}
                  onChange={e => setPixKey(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white font-mono outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-between border-t border-white/10">
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  ● Conexão Open Finance ativa com conciliação automática OFX / PIX
                </span>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl cursor-pointer shadow-lg shadow-cyan-500/20"
                  >
                    {editingBank ? "Atualizar Conta" : "Salvar Conta"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
