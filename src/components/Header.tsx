import React from "react";
import { DollarSign, Search, Sparkles, UserCheck, ShieldCheck } from "lucide-react";

interface HeaderProps {
  onSearch: (query: string) => void;
  onOpenNewDoc: () => void;
  onOpenOcr: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearch, onOpenNewDoc, onOpenOcr }) => {
  return (
    <header className="h-16 bg-slate-950/80 backdrop-blur-md border-b border-white/5 text-white px-6 flex items-center justify-between sticky top-0 z-40 shadow-xl">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center font-black text-slate-950 text-base shadow-[0_0_15px_rgba(6,182,212,0.4)]">
          <DollarSign className="w-5 h-5 text-slate-950 stroke-[3]" />
        </div>
        <div>
          <h1 className="font-bold text-sm md:text-base text-white tracking-tight flex items-center gap-2">
            NEXS <span className="text-cyan-400 font-extrabold">Gestor Financeiro</span>
            <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold hidden sm:inline-block">
              v2.5 Enterprise
            </span>
          </h1>
          <p className="text-[11px] text-slate-400 hidden sm:block">Uma Verdade Só • ERP de Alta Performance & Governança</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-sm mx-6 hidden md:block">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar lançamentos, notas, clientes ou código..."
            onChange={(e) => onSearch(e.target.value)}
            className="w-full bg-slate-900/80 border border-white/10 focus:border-cyan-500 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Right Controls & User Info */}
      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-900/80 border border-white/10 rounded-xl text-xs">
          <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-bold text-white">Admin NEXS</span>
          <span className="text-[10px] text-slate-400 font-mono">(Auditor)</span>
        </div>

        <button
          onClick={onOpenNewDoc}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.3)] shrink-0"
        >
          + Novo Lançamento
        </button>

        <button
          onClick={onOpenOcr}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">OCR IA</span>
        </button>
      </div>
    </header>
  );
};
