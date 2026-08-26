// C:\emissornfe\src\components\auth\LoginView.tsx

import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  ShieldCheck, 
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Download
} from 'lucide-react';
import { UsuarioAuth, ConfiguracaoEmpresa } from '../../types/erp';
import api from '../../services/api';

interface LoginViewProps {
  empresa: ConfiguracaoEmpresa;
  onLogin: (user: UsuarioAuth) => void;
  onBackToLanding?: () => void;
}

// 🔥 ARRAY PARA ARMAZENAR TODOS OS LOGS
const logs: string[] = [];

// 🔥 FUNÇÃO PARA SALVAR LOGS
function saveLog(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}`;
  logs.push(logEntry);
  console.log(message, data || '');
  
  // 🔥 SALVA NO LOCALSTORAGE
  try {
    localStorage.setItem('__login_logs', JSON.stringify(logs));
  } catch (e) {}
}

// 🔥 FUNÇÃO PARA BAIXAR OS LOGS
function downloadLogs() {
  const allLogs = logs.join('\n');
  const blob = new Blob([allLogs], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `login_logs_${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  alert('✅ Logs baixados! Cole o conteúdo do arquivo aqui.');
}

export const LoginView: React.FC<LoginViewProps> = ({ empresa, onLogin, onBackToLanding }) => {
  const [email, setEmail] = useState('admin@suptecnologia.com.br');
  const [senha, setSenha] = useState('123456');
  const [lembrar, setLembrar] = useState(true);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // 🔥 RECUPERA LOGS ANTERIORES
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('__login_logs');
      if (saved) {
        const parsed = JSON.parse(saved);
        logs.push(...parsed);
        saveLog('📂 Logs anteriores carregados:', parsed.length);
      }
    } catch (e) {}
    
    saveLog('🚀 ===== TELA DE LOGIN CARREGADA =====');
    saveLog('📧 Email padrão:', email);
    saveLog('🔗 API URL:', import.meta.env.VITE_API_URL || 'http://localhost:3333/api');
    saveLog('📌 onLogin é função?', typeof onLogin === 'function');
  }, []);

  // ✅ LOGIN REAL VIA BACKEND
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    saveLog('🔑 ===== LOGIN SUBMIT =====');
    saveLog('📧 Email:', email);
    saveLog('🔒 Senha:', senha ? '***' : 'vazia');
    
    setErro(null);

    if (!email.trim() || !senha.trim()) {
      const msg = 'Informe o e-mail corporativo e a senha de acesso.';
      saveLog('⚠️ Campos vazios:', msg);
      setErro(msg);
      return;
    }

    saveLog('🔄 Iniciando requisição de login...');
    setLoading(true);

    try {
      const loginData = { email: email.trim(), senha: senha.trim() };
      saveLog('📤 Payload:', loginData);
      
      const response = await api.post('/auth/login', loginData);
      
      saveLog('📥 Resposta recebida:', response.status);
      saveLog('📥 Dados:', response.data);
      
      if (response.data.sucesso) {
        const { usuario, token } = response.data.dados;
        
        saveLog('✅ Login bem-sucedido!');
        saveLog('👤 Usuário:', usuario.nome);
        saveLog('📧 Email do usuário:', usuario.email);
        saveLog('🔑 Perfil:', usuario.perfil);
        saveLog('🔑 Token:', token.substring(0, 30) + '...');
        
        localStorage.setItem('@sup:token', token);
        localStorage.setItem('@sup:user', JSON.stringify(usuario));
        
        saveLog('📌 Salvou no localStorage');
        saveLog('📌 Chamando onLogin com:', usuario.email);
        
        // 🔥 VERIFICA SE onLogin EXISTE
        if (typeof onLogin === 'function') {
          saveLog('✅ onLogin é uma função, chamando...');
          onLogin(usuario);
          saveLog('✅ onLogin chamado com sucesso!');
        } else {
          saveLog('❌ onLogin NÃO é uma função!', typeof onLogin);
        }
      } else {
        saveLog('❌ Resposta sem sucesso:', response.data);
        setErro(response.data.erro || 'Credenciais inválidas');
      }
    } catch (error: any) {
      saveLog('❌ ERRO no login:');
      saveLog('   Mensagem:', error.message);
      saveLog('   Status:', error.response?.status);
      saveLog('   Dados:', error.response?.data);
      saveLog('   Config:', error.config);
      
      if (error.response?.status === 401) {
        setErro('E-mail ou senha incorretos. Tente novamente.');
      } else if (error.response?.status === 404) {
        setErro('Serviço de autenticação indisponível. Tente mais tarde.');
      } else if (error.response?.status === 500) {
        setErro('Erro interno no servidor. Tente novamente.');
      } else {
        setErro(error.response?.data?.erro || error.message || 'Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setLoading(false);
      saveLog('🔄 ===== LOGIN FINALIZADO =====');
      saveLog('📌 logs salvos:', logs.length);
    }
  };

  // ✅ LOGIN RÁPIDO
  const handleQuickLogin = async (tipo: 'admin' | 'fiscal') => {
    saveLog('⚡ ===== QUICK LOGIN =====');
    saveLog('📌 Tipo:', tipo);
    
    setLoading(true);
    setErro(null);

    try {
      const loginEmail = tipo === 'admin' 
        ? 'admin@suptecnologia.com.br' 
        : 'fiscal@suptecnologia.com.br';
      
      saveLog(`🔑 Login rápido com: ${loginEmail}`);
      
      const response = await api.post('/auth/login', { 
        email: loginEmail, 
        senha: '123456' 
      });
      
      saveLog('📥 Resposta quick login:', response.data);
      
      if (response.data.sucesso) {
        const { usuario, token } = response.data.dados;
        
        localStorage.setItem('@sup:token', token);
        localStorage.setItem('@sup:user', JSON.stringify(usuario));
        
        saveLog(`✅ Login rápido: ${usuario.nome} (${usuario.perfil})`);
        saveLog('📌 Chamando onLogin do quick login...');
        onLogin(usuario);
      } else {
        setErro(response.data.erro || 'Erro no login rápido');
      }
    } catch (error: any) {
      saveLog('❌ Erro no login rápido:', error);
      setErro(error.response?.data?.erro || 'Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative selection:bg-blue-600 selection:text-white">
      
      {/* Top Header */}
      <div className="flex items-center justify-between max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-base shadow-xs">
            S
          </div>
          <div>
            <div className="text-slate-900 font-extrabold text-sm tracking-tight">SUP TECNOLOGIA</div>
            <div className="text-slate-500 text-[11px]">Sistema ERP & Emissor Fiscal</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-medium text-slate-700">Ambiente SEFAZ / NFS-e Nacional Ativo</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="max-w-md w-full mx-auto my-auto py-6">
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 sm:p-8 space-y-6">
          
          <div>
            {onBackToLanding && (
              <button
                type="button"
                onClick={onBackToLanding}
                className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 text-xs font-medium mb-3 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar à Página Inicial</span>
              </button>
            )}
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Acesso ao Sistema
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Informe suas credenciais para gerenciar notas fiscais, cadastros e finanças.
            </p>
          </div>

          {/* 🔥 BOTÃO PARA BAIXAR LOGS */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={downloadLogs}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 border border-slate-200 hover:border-blue-400 px-2.5 py-1.5 rounded transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar Logs ({logs.length})</span>
            </button>
          </div>

          {erro && (
            <div className="flex items-center gap-2 p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            <div className="space-y-1">
              <label className="block font-medium text-slate-700">
                E-mail Corporativo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@empresa.com.br"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-slate-900 text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block font-medium text-slate-700">
                  Senha de Acesso
                </label>
                <span className="text-[11px] text-blue-600 hover:underline cursor-pointer">
                  Esqueceu a senha?
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-slate-900 text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={lembrar}
                  onChange={(e) => setLembrar(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0 w-3.5 h-3.5"
                  disabled={loading}
                />
                <span className="text-slate-600 text-[11px]">Lembrar credenciais</span>
              </label>
              <span className="text-[11px] text-slate-500 font-medium">Certificado A1 Ativo</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              id="btn-login-entrar"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded text-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <span>Entrar no Sistema</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Divisor */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-2 text-[10px] uppercase font-semibold text-slate-400">ou acesso rápido</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Botões de Acesso Rápido */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              disabled={loading}
              className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-slate-700 text-[11px] font-medium text-left transition-colors cursor-pointer disabled:opacity-50"
            >
              <div className="font-semibold text-slate-900">Admin Fiscal</div>
              <div className="text-[10px] text-slate-500 truncate">Acesso completo</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('fiscal')}
              disabled={loading}
              className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-slate-700 text-[11px] font-medium text-left transition-colors cursor-pointer disabled:opacity-50"
            >
              <div className="font-semibold text-slate-900">Operador</div>
              <div className="text-[10px] text-slate-500 truncate">Emissão & Faturamento</div>
            </button>
          </div>

          {/* Rodapé Interno do Card */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>ICP-Brasil SHA256</span>
            </div>
            <span className="text-slate-400">v2026.1</span>
          </div>

        </div>
      </div>

      {/* Bottom Footer */}
      <div className="text-center text-xs text-slate-500 max-w-5xl mx-auto w-full">
        {empresa.razaoSocial || 'SUP TECNOLOGIA'} • CNPJ: {empresa.cnpj || '29.535.022/0001-38'} • Sistema de Gestão Empresarial e Fiscal
      </div>

    </div>
  );
};