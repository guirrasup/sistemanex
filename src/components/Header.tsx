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

interface HeaderProps {
  onLogout?: () => void;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  onNavigate?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onLogout, 
  onNavigate,
  userName = "Admin NEX",
  userEmail = "admin@nex.com.br",
  userRole = "Administrador"
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

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

  const notifications = [
    { id: 1, title: "NF-e Autorizada", description: "Nota #9021 autorizada pela SEFAZ", time: "Agora", read: false },
    { id: 2, title: "Conciliação Pendente", description: "3 transações aguardam conciliação", time: "1h atrás", read: false },
    { id: 3, title: "SPED ECD Gerado", description: "Arquivo do período gerado com sucesso", time: "3h atrás", read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-20 bg-slate-950 border-b border-white/5 text-white px-8 flex items-center justify-between sticky top-0 z-50 shadow-lg shrink-0 relative">
      
      {/* ESQUERDA: NEX Gestão Financeira Completa */}
      <div className="flex items-center gap-5">
        {/* Logo */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <DollarSign className="w-6 h-6 text-slate-950 stroke-[3]" />
        </div>
        
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight leading-none flex items-center gap-3">
            NEX
            <span className="text-lg font-light text-cyan-400">Gestão Financeira Completa</span>
          </h1>
          
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-slate-500 font-mono">v2.5.0</span>
            <span className="w-px h-3 bg-slate-700"></span>
            <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
              <Circle className="w-1.5 h-1.5 fill-emerald-400 text-emerald-400" />
              Online
            </span>
            <span className="w-px h-3 bg-slate-700"></span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              IA Ativa
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              SEFAZ
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Gestão
            </span>
          </div>
        </div>
      </div>

      {/* CENTRO: Tags do Sistema */}
      <div className="hidden xl:flex items-center gap-4">
        <div className="flex items-center gap-3 px-4 py-1.5 bg-slate-900/50 rounded-full border border-white/5">
          <span className="text-[10px] text-slate-500 font-mono">Ambiente:</span>
          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
            <Circle className="w-1.5 h-1.5 fill-emerald-400 text-emerald-400" />
            Produção
          </span>
          <span className="w-px h-4 bg-slate-700"></span>
          <span className="text-[10px] text-slate-500 font-mono">SEFAZ:</span>
          <span className="text-[10px] font-bold text-cyan-400">Homologação</span>
          <span className="w-px h-4 bg-slate-700"></span>
          <span className="text-[10px] text-slate-500 font-mono">Certificado:</span>
          <span className="text-[10px] font-bold text-emerald-400">✅ Válido</span>
        </div>
      </div>

      {/* DIREITA: Notificações + Usuário */}
      <div className="flex items-center gap-2">
        
        {/* NOTIFICAÇÕES */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg hover:bg-white/5 transition-all relative"
          >
            <Bell className="w-5 h-5 text-slate-400 hover:text-white transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-slate-950">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[99999]">
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-cyan-400" />
                  Notificações
                </span>
                <span className="text-[10px] text-cyan-400 cursor-pointer hover:underline font-medium">Ver todas</span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className={`p-4 border-b border-white/5 hover:bg-white/5 transition-all cursor-pointer ${!n.read ? "bg-cyan-500/5" : ""}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.read ? "bg-cyan-400" : "bg-slate-600"}`}></div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!n.read ? "text-white font-semibold" : "text-slate-400"}`}>{n.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{n.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3 text-slate-600" />
                          <span className="text-[10px] text-slate-600">{n.time}</span>
                        </div>
                      </div>
                      {!n.read && <ArrowUpRight className="w-4 h-4 text-cyan-400 opacity-50" />}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-white/5 text-center bg-slate-950/50">
                <span className="text-[9px] text-slate-500 font-mono tracking-wider">NEX GESTÃO FINANCEIRA COMPLETA • v2.5.0</span>
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-8 bg-white/5"></div>

        {/* USUÁRIO */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 p-1 pr-3 rounded-lg hover:bg-white/5 transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20">
              {userName.charAt(0).toUpperCase()}
            </div>
            
            <div className="hidden md:block text-left">
              <div className="text-sm font-semibold text-white leading-none">{userName}</div>
              <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                {userRole}
              </div>
            </div>
            
            <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${showUserMenu ? "rotate-180" : ""}`} />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[99999]">
              <div className="p-4 border-b border-white/5 bg-slate-900">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-base font-bold text-slate-950">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{userName}</p>
                    <p className="text-[10px] text-slate-400">{userEmail}</p>
                    <span className="text-[8px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mt-0.5 inline-block">
                      {userRole}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="py-1">
                <button 
                  className="w-full px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 transition-all flex items-center gap-3 text-left"
                  onClick={() => {
                    setShowUserMenu(false);
                    alert(`👤 Usuário: ${userName}\n📧 E-mail: ${userEmail}\n🔒 Perfil: ${userRole}`);
                  }}
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Meus Dados</span>
                </button>
                <button 
                  className="w-full px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 transition-all flex items-center gap-3 text-left"
                  onClick={() => {
                    setShowUserMenu(false);
                    if (onNavigate) onNavigate("configuracoes");
                    else alert("⚙️ Configurações");
                  }}
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Configurações</span>
                </button>
                <button 
                  className="w-full px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 transition-all flex items-center gap-3 text-left"
                  onClick={() => {
                    setShowUserMenu(false);
                    alert("🏆 NEX Enterprise v2.5.0\n© 2026 Todos os direitos reservados.");
                  }}
                >
                  <Award className="w-4 h-4 text-slate-400" />
                  <span>Sobre o NEX</span>
                </button>
                <div className="border-t border-white/5 my-1 mx-4"></div>
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