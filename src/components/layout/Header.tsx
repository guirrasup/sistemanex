// C:\emissornfe\src\components\layout\Header.tsx

import React from 'react';
import { 
  LayoutDashboard,
  User,
  LogOut,
  Download,
  FileText,
  Receipt,
  ShoppingBag,
  Truck,
  FileBadge2,
  Package,
  Users,
  Briefcase,
  DollarSign,
  Settings,
  Search,
  FolderOpen,
  UserPlus,
  UserCheck,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';
import { ConfiguracaoEmpresa, UsuarioAuth } from '../../types/erp';
import { AlertasSistema } from '../ui/AlertasSistema';

interface HeaderProps {
  empresa: ConfiguracaoEmpresa;
  usuario?: UsuarioAuth | null;
  currentView?: string;
  onNavigate?: (view: string) => void;
  onExportarBackup?: () => void;
  onLogout?: () => void;
  onMenuClick?: () => void;
  mobileMenuOpen?: boolean;
}

interface FerramentaProps {
  id: string;
  label: string;
  icon: React.ElementType;
  ativo?: boolean;
  onClick: () => void;
  mostrarLabel?: boolean;
  badge?: string;
  cor?: string;
  corAtiva?: string;
  corHover?: string;
}

// 🔥 CORES POR ÍCONE (MESMAS DO SIDEBAR)
const coresPorItem: Record<string, { cor: string; corAtiva: string; corHover: string }> = {
  dashboard: { cor: 'text-blue-500', corAtiva: 'text-blue-600', corHover: 'hover:text-blue-600' },
  'documentos-fiscais': { cor: 'text-indigo-500', corAtiva: 'text-indigo-600', corHover: 'hover:text-indigo-600' },
  'nfe-emissor': { cor: 'text-emerald-500', corAtiva: 'text-emerald-600', corHover: 'hover:text-emerald-600' },
  'nfse-emissor': { cor: 'text-blue-500', corAtiva: 'text-blue-600', corHover: 'hover:text-blue-600' },
  'nfce-emissor': { cor: 'text-purple-500', corAtiva: 'text-purple-600', corHover: 'hover:text-purple-600' },
  'cte-emissor': { cor: 'text-cyan-500', corAtiva: 'text-cyan-600', corHover: 'hover:text-cyan-600' },
  'nfae-emissor': { cor: 'text-amber-500', corAtiva: 'text-amber-600', corHover: 'hover:text-amber-600' },
  produtos: { cor: 'text-green-500', corAtiva: 'text-green-600', corHover: 'hover:text-green-600' },
  servicos: { cor: 'text-pink-500', corAtiva: 'text-pink-600', corHover: 'hover:text-pink-600' },
  clientes: { cor: 'text-sky-500', corAtiva: 'text-sky-600', corHover: 'hover:text-sky-600' },
  fornecedores: { cor: 'text-violet-500', corAtiva: 'text-violet-600', corHover: 'hover:text-violet-600' },
  // 🔥 ADICIONAR TRANSPORTADORAS - COR CIANO
  transportadoras: { cor: 'text-cyan-500', corAtiva: 'text-cyan-600', corHover: 'hover:text-cyan-600' },
  financeiro: { cor: 'text-yellow-500', corAtiva: 'text-yellow-600', corHover: 'hover:text-yellow-600' },
  configuracoes: { cor: 'text-slate-500', corAtiva: 'text-slate-600', corHover: 'hover:text-slate-600' },
  'consulta-cnpj': { cor: 'text-rose-500', corAtiva: 'text-rose-600', corHover: 'hover:text-rose-600' },
};

const FerramentaItem: React.FC<FerramentaProps> = ({ 
  id, 
  label, 
  icon: Icon, 
  ativo, 
  onClick,
  mostrarLabel = true,
  badge,
  cor = 'text-slate-500',
  corAtiva = 'text-slate-700',
  corHover = 'hover:text-slate-700',
}) => {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap min-w-[50px] ${
        ativo ? 'bg-white/80 shadow-sm' : 'hover:bg-white/50'
      }`}
      title={label}
    >
      <Icon className={`w-5 h-5 ${ativo ? corAtiva : cor} ${corHover}`} />
      {mostrarLabel && (
        <span className={`text-[11px] font-medium mt-0.5 ${ativo ? corAtiva : 'text-slate-500'} ${corHover}`}>
          {label}
        </span>
      )}
      
      {badge && (
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}
      
      {ativo && (
        <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 ${corAtiva} rounded-full`}></span>
      )}
    </button>
  );
};

export const Header: React.FC<HeaderProps> = ({
  empresa,
  usuario,
  currentView = 'dashboard',
  onNavigate = (_view: string) => {},
  onExportarBackup = () => {},
  onLogout,
  onMenuClick,
  mobileMenuOpen = false,
}) => {
  const primeiroNome = usuario?.nome?.split(' ')[0] || 'Usuário';

  const [dataHora, setDataHora] = React.useState(new Date());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setDataHora(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const dataFormatada = dataHora.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const horaFormatada = dataHora.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // 🔥 MESMA ORDEM DO SIDEBAR - COM FORNECEDORES E TRANSPORTADORAS
  const ferramentas = [
    // GERAL
    { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
    
    // MÓDULO FISCAL
    { id: 'nfe-emissor', label: 'NF-e', icon: Receipt },
    { id: 'nfse-emissor', label: 'NFS-e', icon: FileText },
    { id: 'nfce-emissor', label: 'NFC-e', icon: ShoppingBag },
    { id: 'cte-emissor', label: 'CT-e', icon: Truck },
    { id: 'nfae-emissor', label: 'NFA-e', icon: FileBadge2 },
    { id: 'documentos-fiscais', label: 'Docs', icon: FolderOpen },
    
    // CADASTROS
    { id: 'produtos', label: 'Produtos', icon: Package },
    { id: 'servicos', label: 'Serviços', icon: Briefcase },
    { id: 'clientes', label: 'Clientes', icon: UserPlus },
    { id: 'fornecedores', label: 'Fornecedores', icon: UserCheck },
    // 🔥 ADICIONAR TRANSPORTADORAS NO ARRAY FERRAMENTAS
    { id: 'transportadoras', label: 'Transportadoras', icon: Truck },
    
    // FINANCEIRO & CONFIG
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
    { id: 'configuracoes', label: 'Config', icon: Settings },
    
    // FERRAMENTAS
    { id: 'consulta-cnpj', label: 'CNPJ', icon: Search },
  ];

  return (
    <header className="w-full bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="w-full px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div 
              className="flex items-center gap-3 cursor-pointer select-none group" 
              onClick={() => onNavigate('dashboard')}
              title="Ir para a Página Principal"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm group-hover:shadow-md transition-all flex-shrink-0">
                <span className="text-lg">S</span>
              </div>
              <div className="hidden md:block">
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold tracking-tight text-slate-900 group-hover:text-slate-700 transition-colors">
                    SUP TECNOLOGIA
                  </span>
                  <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-slate-200">
                    Emissor Fiscal
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate max-w-[200px] leading-tight font-medium">
                  {empresa.nomeFantasia || empresa.razaoSocial || 'Sistema de Gestão Fiscal'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center gap-0.5 overflow-x-auto min-w-0 px-3 py-1">
            {ferramentas.map((item) => {
              const cores = coresPorItem[item.id] || coresPorItem.dashboard;
              return (
                <div key={item.id} className="flex-shrink-0">
                  <FerramentaItem
                    id={item.id}
                    label={item.label}
                    icon={item.icon}
                    ativo={currentView === item.id}
                    onClick={() => onNavigate(item.id)}
                    mostrarLabel={true}
                    badge={item.badge}
                    cor={cores.cor}
                    corAtiva={cores.corAtiva}
                    corHover={cores.corHover}
                  />
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden xl:flex flex-col items-end mr-1 text-[11px] leading-tight">
              <span className="font-semibold text-slate-700">{dataFormatada}</span>
              <span className="text-slate-400 font-mono text-[10px]">{horaFormatada}</span>
            </div>

            <button
              onClick={onExportarBackup}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Backup"
            >
              <Download className="w-4 h-4" />
            </button>

            <AlertasSistema />

            <div className="w-px h-8 bg-slate-200 mx-0.5"></div>

            {usuario && (
              <div className="flex items-center gap-2 pl-1">
                <div className="hidden md:block text-right leading-tight">
                  <div className="text-sm font-semibold text-slate-900 truncate max-w-[100px]">
                    {primeiroNome}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    {usuario.perfil}
                  </div>
                </div>

                <div className="relative group">
                  <div className="w-9 h-9 bg-gradient-to-br from-slate-600 to-slate-800 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm ring-2 ring-slate-200 group-hover:ring-slate-300 transition-all">
                    {primeiroNome.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute right-0 top-full mt-1 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    {usuario.email}
                  </div>
                </div>

                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Sair"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};