// src/hooks/useContabil.ts

import { useState, useEffect, useCallback } from 'react';
import { store } from '../services/store';
import { calcularDRE } from '../services/contabil/DRE';
import { calcularBalancoPatrimonial } from '../services/contabil/BalancoPatrimonial';
import { calcularFluxoCaixa } from '../services/contabil/FluxoCaixa';
import { apurarImpostos } from '../services/contabil/ApuracaoImpostos';
import { DRE, BalancoPatrimonial, FluxoCaixa, ApuracaoImpostosDetalhada } from '../types/contabil';

export function useContabil() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState(store.activeCompanyId);

  const [dre, setDre] = useState<DRE | null>(null);
  const [balanco, setBalanco] = useState<BalancoPatrimonial | null>(null);
  const [fluxoCaixa, setFluxoCaixa] = useState<FluxoCaixa | null>(null);
  const [apuracao, setApuracao] = useState<ApuracaoImpostosDetalhada | null>(null);

  const [periodo, setPeriodo] = useState({
    data_inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    data_fim: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
  });

  const carregarDados = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const dreResult = calcularDRE(companyId, periodo.data_inicio, periodo.data_fim);
      setDre(dreResult);

      const balancoResult = calcularBalancoPatrimonial(companyId, periodo.data_fim);
      setBalanco(balancoResult);

      const fluxoResult = calcularFluxoCaixa(companyId, periodo.data_inicio, periodo.data_fim);
      setFluxoCaixa(fluxoResult);

      const apuracaoResult = apurarImpostos(companyId, periodo.data_inicio, periodo.data_fim);
      setApuracao(apuracaoResult);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados contábeis');
    } finally {
      setLoading(false);
    }
  }, [companyId, periodo]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const atualizarPeriodo = (inicio: string, fim: string) => {
    setPeriodo({ data_inicio: inicio, data_fim: fim });
  };

  const atualizarEmpresa = (id: string) => {
    setCompanyId(id);
  };

  return {
    loading,
    error,
    companyId,
    periodo,
    dre,
    balanco,
    fluxoCaixa,
    apuracao,
    atualizarPeriodo,
    atualizarEmpresa,
    recarregar: carregarDados,
  };
}