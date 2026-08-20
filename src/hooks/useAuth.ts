import { useState, useEffect } from "react";
import { ApiClient } from "../services/api.client";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "financial_manager" | "operator" | "auditor";
  companyId: string;
}

export function useAuth() {
  // Antes, o usuário começava aqui já "logado" como admin fictício, sem checar nada
  // no backend. Agora o estado inicial é "deslogado" até o token ser validado de verdade.
  const [user, setUser] = useState<User | null>(null);
  // "sessionLoading": true só durante a checagem inicial (token salvo no localStorage é válido?)
  const [sessionLoading, setSessionLoading] = useState<boolean>(true);
  // "actionLoading": true só enquanto um login está sendo enviado (usado no botão do formulário)
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkCurrentSession() {
      if (ApiClient.getToken()) {
        try {
          const response = await ApiClient.getMe();
          if (response.user) {
            setUser(response.user);
          }
        } catch (err: any) {
          console.warn("Sessão expirada ou inválida, é necessário logar novamente", err.message);
          ApiClient.setToken(null);
          setUser(null);
        }
      }
      setSessionLoading(false);
    }
    checkCurrentSession();
  }, []);

  const login = async (email: string, password?: string) => {
    setActionLoading(true);
    setError(null);
    try {
      const response = await ApiClient.login({ email, password });
      setUser(response.user);
      return response.user;
    } catch (err: any) {
      setError(err.message || "Erro de login");
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const logout = () => {
    ApiClient.setToken(null);
    setUser(null);
  };

  return {
    user,
    loading: sessionLoading,
    actionLoading,
    error,
    login,
    logout,
    isAuthenticated: !!user
  };
}
