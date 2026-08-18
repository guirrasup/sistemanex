// src/components/ContabilDashboardView.tsx

import React from 'react';
import { useContabil } from '../hooks/useContabil';
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, RefreshCw, Download } from 'lucide-react';

export const ContabilDashboardView: React.FC = () => {
  const { loading, error, dre, balanco, fluxoCaixa, apuracao, recarregar } = useContabil();

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
          onClick={recarregar}
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-cyan-400" />
              Dashboard Contábil
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              DRE, Balanço Patrimonial e Indicadores Financeiros
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={recarregar}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </button>
            <button className="px-3 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5">
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl">
          <span className="text-xs text-slate-400">Receita Líquida</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            R$ {dre?.receita_liquida?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
          </div>
        </div>

        <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl">
          <span className="text-xs text-slate-400">Lucro Bruto</span>
          <div className="text-2xl font-bold text-cyan-400 font-mono">
            R$ {dre?.lucro_bruto?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
          </div>
        </div>

        <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl">
          <span className="text-xs text-slate-400">Lucro Líquido</span>
          <div className={`text-2xl font-bold font-mono ${(dre?.lucro_liquido || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            R$ {dre?.lucro_liquido?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
          </div>
        </div>

        <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl">
          <span className="text-xs text-slate-400">Margem Líquida</span>
          <div className="text-2xl font-bold text-cyan-400 font-mono">
            {dre?.indicadores?.margem_liquida?.toFixed(1) || '0'}%
          </div>
        </div>
      </div>

      {/* DRE Resumido */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            DRE - Demonstração do Resultado
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">Receita Bruta</span>
              <span className="text-white font-mono font-bold">
                R$ {dre?.receita_bruta?.total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5 pl-4">
              <span className="text-slate-400">(-) Deduções</span>
              <span className="text-rose-400 font-mono">
                - R$ {dre?.deducoes?.total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5 font-bold">
              <span className="text-cyan-400">Receita Líquida</span>
              <span className="text-cyan-400 font-mono">
                R$ {dre?.receita_liquida?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5 pl-4">
              <span className="text-slate-400">(-) CMV</span>
              <span className="text-rose-400 font-mono">
                - R$ {dre?.cmv?.total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5 font-bold">
              <span className="text-emerald-400">Lucro Bruto</span>
              <span className="text-emerald-400 font-mono">
                R$ {dre?.lucro_bruto?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5 pl-4">
              <span className="text-slate-400">(-) Despesas Operacionais</span>
              <span className="text-rose-400 font-mono">
                - R$ {dre?.despesas_operacionais?.total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5 font-bold">
              <span className="text-emerald-400">Lucro Operacional</span>
              <span className="text-emerald-400 font-mono">
                R$ {dre?.lucro_operacional?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">Resultado Financeiro</span>
              <span className={`font-mono ${(dre?.resultado_financeiro?.total || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {dre?.resultado_financeiro?.total?.toLocaleString('pt-BR', { minimumFractionDigits: 2, signDisplay: 'always' }) || 'R$ 0,00'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">(-) IRPJ/CSLL</span>
              <span className="text-rose-400 font-mono">
                - R$ {dre?.impostos?.total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
              </span>
            </div>
            <div className="flex justify-between py-1 font-bold text-base">
              <span className="text-white">Lucro Líquido</span>
              <span className={dre?.lucro_liquido && dre.lucro_liquido >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                R$ {dre?.lucro_liquido?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
              </span>
            </div>
          </div>
        </div>

        {/* Indicadores e Balanço Resumido */}
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              Indicadores Financeiros
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950/60 p-3 rounded-xl">
                <span className="text-slate-400 block">Margem Bruta</span>
                <span className="text-lg font-bold text-cyan-400 font-mono">
                  {dre?.indicadores?.margem_bruta?.toFixed(1) || '0'}%
                </span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl">
                <span className="text-slate-400 block">Margem Operacional</span>
                <span className="text-lg font-bold text-cyan-400 font-mono">
                  {dre?.indicadores?.margem_operacional?.toFixed(1) || '0'}%
                </span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl">
                <span className="text-slate-400 block">Margem Líquida</span>
                <span className="text-lg font-bold text-cyan-400 font-mono">
                  {dre?.indicadores?.margem_liquida?.toFixed(1) || '0'}%
                </span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl">
                <span className="text-slate-400 block">EBITDA</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">
                  R$ {dre?.indicadores?.ebitda?.toLocaleString('pt-BR', { minimumFractionDigits: 0 }) || '0'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-cyan-400" />
              Liquidez
            </h3>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-slate-950/60 p-3 rounded-xl text-center">
                <span className="text-slate-400 block text-[10px]">Corrente</span>
                <span className="text-lg font-bold text-white font-mono">
                  {balanco?.indicadores?.liquidez_corrente?.toFixed(2) || '0.00'}
                </span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl text-center">
                <span className="text-slate-400 block text-[10px]">Seca</span>
                <span className="text-lg font-bold text-white font-mono">
                  {balanco?.indicadores?.liquidez_seca?.toFixed(2) || '0.00'}
                </span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl text-center">
                <span className="text-slate-400 block text-[10px]">Imediata</span>
                <span className="text-lg font-bold text-white font-mono">
                  {balanco?.indicadores?.liquidez_imediata?.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apuração de Impostos Resumida */}
      <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-amber-400" />
          Apuração de Impostos
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <div className="bg-slate-950/60 p-3 rounded-xl text-center">
            <span className="text-slate-400 block">ICMS</span>
            <span className="text-lg font-bold text-amber-400 font-mono">
              R$ {apuracao?.icms?.a_recolher?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl text-center">
            <span className="text-slate-400 block">PIS</span>
            <span className="text-lg font-bold text-amber-400 font-mono">
              R$ {apuracao?.pis?.a_recolher?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl text-center">
            <span className="text-slate-400 block">COFINS</span>
            <span className="text-lg font-bold text-amber-400 font-mono">
              R$ {apuracao?.cofins?.a_recolher?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl text-center border border-cyan-500/20">
            <span className="text-cyan-400 block font-bold">CBS (8.8%)</span>
            <span className="text-lg font-bold text-cyan-400 font-mono">
              R$ {apuracao?.cbs?.a_recolher?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl text-center border border-indigo-500/20">
            <span className="text-indigo-400 block font-bold">IBS (17.7%)</span>
            <span className="text-lg font-bold text-indigo-400 font-mono">
              R$ {apuracao?.ibs?.a_recolher?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/5 flex justify-between text-xs">
          <span className="text-slate-400">Carga Tributária</span>
          <span className="text-white font-bold font-mono">
            {apuracao?.resumo?.carga_tributaria?.toFixed(1) || '0'}% da receita
          </span>
          <span className="text-slate-400">Total a Recolher</span>
          <span className="text-rose-400 font-bold font-mono">
            R$ {apuracao?.resumo?.total_a_recolher?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
          </span>
        </div>
      </div>
    </div>
  );
};