// src/components/Header.tsx

import React, { useState, useEffect, useRef } from "react";
import { 
  DollarSign, 
  Bell, 
  User, 
  LogOut,
  ChevronDown,
  Circle,
  Clock,
  Settings,
  ShieldCheck,
  Award,
  Sparkles,
  Zap,
  ArrowUpRight,
} from "lucide-react";
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
  onLogout?: () => void;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  onNavigate?: (tab: string) => void;
  onSearch?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onLogout, 
  onNavigate,
  onSearch,
  userName = "Admin NEX",
  userEmail = "admin@nex.com.br",
  userRole = "Administrador"
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem("nex_jwt_token");
      localStorage.removeItem("nex_user");
      window.location.href = "/login";
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const notifications = [
    { id: 1, title: "NF-e Autorizada", description: "Nota #9021 autorizada pela SEFAZ", time: "Agora", read: false },
    { id: 2, title: "Conciliação Pendente", description: "3 transações aguardam conciliação", time: "1h atrás", read: false },
    { id: 3, title: "SPED ECD Gerado", description: "Arquivo do período gerado com sucesso", time: "3h atrás", read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className={`h-20 border-b px-8 flex items-center justify-between sticky top-0 z-50 shadow-lg shrink-0 relative transition-colors duration-300 ${
      isDark ? 'bg-slate-950 border-white/5' : 'bg-white border-slate-200'
    }`}>
      
      {/* ESQUERDA: NEX Gestão Financeira Completa */}
      <div className="flex items-center gap-5">
        {/* Logo */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
          <DollarSign className="w-6 h-6 text-slate-950 stroke-[3]" />
        </div>
        
        <div>
          <h1 className={`text-2xl font-extrabold tracking-tight leading-none flex items-center gap-3 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            NEX
            <span className="text-lg font-light text-cyan-400">Gestão Financeira Completa</span>
          </h1>
          
          <div className="flex items-center gap-3 mt-1">
            <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>v2.5.0</span>
            <span className={`w-px h-3 ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`}></span>
            <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
              <Circle className="w-1.5 h-1.5 fill-emerald-400 text-emerald-400" />
              Online
            </span>
            <span className={`w-px h-3 ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`}></span>
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${
              isDark 
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                : 'bg-amber-100 text-amber-700 border-amber-200'
            }`}>
              <Sparkles className="w-3 h-3" />
              IA Ativa
            </span>
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${
              isDark 
                ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' 
                : 'bg-indigo-100 text-indigo-700 border-indigo-200'
            }`}>
              <Zap className="w-3 h-3" />
              SEFAZ
            </span>
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${
              isDark 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-emerald-100 text-emerald-700 border-emerald-200'
            }`}>
              <ShieldCheck className="w-3 h-3" />
              Gestão
            </span>
          </div>
        </div>
      </div>

      {/* CENTRO: Busca + Tags do Sistema */}
      <div className="hidden xl:flex items-center gap-4 flex-1 max-w-xl mx-4">
        {/* Barra de Busca Global */}
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Buscar clientes, produtos, notas..."
            value={searchQuery}
            onChange={handleSearchChange}
            className={`w-full rounded-xl border px-4 py-1.5 text-xs outline-none focus:ring-1 focus:ring-cyan-500 transition-all ${
              isDark 
                ? 'bg-slate-900/50 border-white/10 text-slate-200 placeholder-slate-500' 
                : 'bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400'
            }`}
          />
          <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-mono px-1.5 py-0.5 rounded border ${
            isDark 
              ? 'text-slate-500 bg-slate-800 border-white/5' 
              : 'text-slate-400 bg-slate-200 border-slate-300'
          }`}>
            ⌘K
          </span>
        </div>

        <div className={`flex items-center gap-3 px-3 py-1 rounded-full border ${
          isDark ? 'bg-slate-900/50 border-white/5' : 'bg-slate-100 border-slate-200'
        }`}>
          <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Ambiente:</span>
          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
            <Circle className="w-1.5 h-1.5 fill-emerald-400 text-emerald-400" />
            Produção
          </span>
          <span className={`w-px h-4 ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`}></span>
          <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>SEFAZ:</span>
          <span className="text-[10px] font-bold text-cyan-400">Homologação</span>
          <span className={`w-px h-4 ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`}></span>
          <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Certificado:</span>
          <span className="text-[10px] font-bold text-emerald-400">✅ Válido</span>
        </div>
      </div>

      {/* DIREITA: Tema + Notificações + Usuário */}
      <div className="flex items-center gap-2">
        
        {/* BOTÃO DE TEMA */}
        <ThemeToggle />

        <div className={`w-px h-8 ${isDark ? 'bg-white/5' : 'bg-slate-200'}`}></div>

        {/* NOTIFICAÇÕES */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 rounded-lg transition-all relative ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}
          >
            <Bell className={`w-5 h-5 transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-theme-primary">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className={`absolute right-0 top-full mt-2 w-80 rounded-xl shadow-2xl overflow-hidden z-[99999] border ${
              isDark 
                ? 'bg-slate-900 border-white/10' 
                : 'bg-white border-slate-200 shadow-lg'
            }`}>
              <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'} flex items-center gap-2`}>
                  <Bell className="w-4 h-4 text-cyan-400" />
                  Notificações
                </span>
                <span className="text-[10px] text-cyan-400 cursor-pointer hover:underline font-medium">Ver todas</span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className={`p-4 border-b transition-all cursor-pointer ${isDark ? 'border-white/5 hover:bg-white/5' : 'border-slate-100 hover:bg-slate-50'} ${!n.read ? (isDark ? 'bg-cyan-500/5' : 'bg-cyan-50') : ''}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.read ? 'bg-cyan-400' : (isDark ? 'bg-slate-600' : 'bg-slate-300')}`}></div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!n.read ? (isDark ? 'text-white font-semibold' : 'text-slate-900 font-semibold') : (isDark ? 'text-slate-400' : 'text-slate-500')}`}>{n.title}</p>
                        <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{n.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className={`w-3 h-3 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                          <span className={`text-[10px] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>{n.time}</span>
                        </div>
                      </div>
                      {!n.read && <ArrowUpRight className="w-4 h-4 text-cyan-400 opacity-50" />}
                    </div>
                  </div>
                ))}
              </div>
              <div className={`p-3 border-t text-center ${isDark ? 'bg-slate-950/50 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                <span className={`text-[9px] font-mono tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>NEX GESTÃO FINANCEIRA COMPLETA • v2.5.0</span>
              </div>
            </div>
          )}
        </div>

        <div className={`w-px h-8 ${isDark ? 'bg-white/5' : 'bg-slate-200'}`}></div>

        {/* USUÁRIO */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`flex items-center gap-3 p-1 pr-3 rounded-lg transition-all ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20">
              {userName.charAt(0).toUpperCase()}
            </div>
            
            <div className="hidden md:block text-left">
              <div className={`text-sm font-semibold leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>{userName}</div>
              <div className={`text-[10px] font-mono flex items-center gap-1.5 mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                {userRole}
              </div>
            </div>
            
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDark ? 'text-slate-500' : 'text-slate-400'} ${showUserMenu ? "rotate-180" : ""}`} />
          </button>

          {showUserMenu && (
            <div className={`absolute right-0 top-full mt-2 w-64 rounded-xl shadow-2xl overflow-hidden z-[99999] border ${
              isDark 
                ? 'bg-slate-900 border-white/10' 
                : 'bg-white border-slate-200 shadow-lg'
            }`}>
              <div className={`p-4 border-b ${isDark ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-base font-bold text-slate-950">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{userName}</p>
                    <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{userEmail}</p>
                    <span className={`text-[8px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mt-0.5 inline-block`}>
                      {userRole}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="py-1">
                <button 
                  className={`w-full px-4 py-2.5 text-sm transition-all flex items-center gap-3 text-left ${
                    isDark 
                      ? 'hover:bg-white/5 text-slate-300' 
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                  onClick={() => {
                    setShowUserMenu(false);
                    alert(`👤 Usuário: ${userName}\n📧 E-mail: ${userEmail}\n🔒 Perfil: ${userRole}`);
                  }}
                >
                  <User className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  <span>Meus Dados</span>
                </button>
                <button 
                  className={`w-full px-4 py-2.5 text-sm transition-all flex items-center gap-3 text-left ${
                    isDark 
                      ? 'hover:bg-white/5 text-slate-300' 
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                  onClick={() => {
                    setShowUserMenu(false);
                    if (onNavigate) onNavigate("configuracoes");
                    else alert("⚙️ Configurações");
                  }}
                >
                  <Settings className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  <span>Configurações</span>
                </button>
                <button 
                  className={`w-full px-4 py-2.5 text-sm transition-all flex items-center gap-3 text-left ${
                    isDark 
                      ? 'hover:bg-white/5 text-slate-300' 
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                  onClick={() => {
                    setShowUserMenu(false);
                    alert("🏆 NEX Enterprise v2.5.0\n© 2026 Todos os direitos reservados.");
                  }}
                >
                  <Award className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  <span>Sobre o NEX</span>
                </button>
                <div className={`border-t my-1 mx-4 ${isDark ? 'border-white/5' : 'border-slate-200'}`}></div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    handleLogout();
                  }}
                  className="w-full px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 transition-all flex items-center gap-3 text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Sair do Sistema</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay para fechar dropdowns */}
      {(showUserMenu || showNotifications) && (
        <div 
          className="fixed inset-0 z-[99998]" 
          onClick={() => {
            setShowUserMenu(false);
            setShowNotifications(false);
          }}
        ></div>
      )}
    </header>
  );
};