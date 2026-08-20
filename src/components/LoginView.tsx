import { useState, FormEvent } from "react";
import { useTheme } from "../contexts/ThemeContext";

interface LoginViewProps {
  onLogin: (email: string, password: string) => Promise<unknown>;
  loading: boolean;
  error: string | null;
}

export function LoginView({ onLogin, loading, error }: LoginViewProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await onLogin(email, password);
    } catch {
      // erro já é exposto via prop "error"
    }
  };

  return (
    <div
      className={`h-screen w-screen flex items-center justify-center font-sans antialiased ${
        isDark ? "bg-[#020617] text-slate-300" : "bg-[#f1f5f9] text-slate-700"
      }`}
    >
      <form
        onSubmit={handleSubmit}
        className={`w-full max-w-sm rounded-2xl border p-8 shadow-xl ${
          isDark ? "bg-slate-900/80 border-white/10" : "bg-white border-slate-200"
        }`}
      >
        <h1 className={`text-xl font-semibold mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>
          NEX Enterprise ERP
        </h1>
        <p className="text-sm mb-6 opacity-70">Entre com sua conta para continuar</p>

        <label className="block text-xs font-medium mb-1 opacity-80">E-mail</label>
        <input
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`w-full mb-4 px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-cyan-500 ${
            isDark ? "bg-slate-800 border-white/10 text-white" : "bg-slate-50 border-slate-300"
          }`}
          placeholder="voce@empresa.com.br"
        />

        <label className="block text-xs font-medium mb-1 opacity-80">Senha</label>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`w-full mb-5 px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-cyan-500 ${
            isDark ? "bg-slate-800 border-white/10 text-white" : "bg-slate-50 border-slate-300"
          }`}
          placeholder="••••••••"
        />

        {error && (
          <div className="mb-4 text-sm rounded-lg px-3 py-2 bg-red-500/10 text-red-500 border border-red-500/20">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-400 transition-colors disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
