import { useState, useEffect, useCallback } from "react";
import { ApiClient } from "../services/api.client";

export function useFinancial() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFinancialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [docsRes, banksRes] = await Promise.all([
        ApiClient.getDocuments().catch(() => ({ documents: [] })),
        ApiClient.getBankAccounts().catch(() => ({ bankAccounts: [] }))
      ]);
      setDocuments(docsRes.documents || []);
      setBankAccounts(banksRes.bankAccounts || []);
    } catch (err: any) {
      setError(err.message || "Falha ao carregar dados financeiros");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFinancialData();
  }, [fetchFinancialData]);

  const executeSettlement = async (settlementData: any) => {
    try {
      const res = await ApiClient.executeSettlement(settlementData);
      await fetchFinancialData(); // Refresh list after settlement
      return res;
    } catch (err: any) {
      throw err;
    }
  };

  return {
    documents,
    bankAccounts,
    loading,
    error,
    refresh: fetchFinancialData,
    executeSettlement
  };
}
