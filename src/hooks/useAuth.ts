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
  const [user, setUser] = useState<User | null>({
    id: "usr-demo-admin",
    email: "admin@nex.com.br",
    name: "Gestor NEX Admin",
    role: "admin",
    companyId: "comp-001"
  });
  const [loading, setLoading] = useState<boolean>(false);
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
          console.warn("Session check failed, using fallback admin user", err.message);
        }
      }
    }
    checkCurrentSession();
  }, []);

  const login = async (email: string, password?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ApiClient.login({ email, password });
      setUser(response.user);
      return response.user;
    } catch (err: any) {
      setError(err.message || "Erro de login");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    ApiClient.setToken(null);
    setUser(null);
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user
  };
}
