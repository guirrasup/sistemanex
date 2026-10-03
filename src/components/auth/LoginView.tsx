// src/components/auth/LoginView.tsx
import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Mail, 
  ShieldCheck, 
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff
} from 'lucide-react';
import { UsuarioAuth, ConfiguracaoEmpresa } from '../../types/erp';
import api from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/apiError';

// 🔥 IMAGEM DE FUNDO BUSINESS
const BACKGROUND_IMAGE = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80';

const SENHA_MIN_LENGTH = 6;

type ModoLogin = 'login' | 'recuperar' | 'redefinir';

interface LoginViewProps {
  empresa: ConfiguracaoEmpresa;
  onLogin: (user: UsuarioAuth) => void;
  onBackToLanding?: () => void;
  // Token recebido pelo link do e-mail de recuperação (/redefinir-senha?token=...)
  tokenRedefinicao?: string | null;
  onRedefinicaoConcluida?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  empresa,
  onLogin,
  onBackToLanding,
  tokenRedefinicao,
  onRedefinicaoConcluida,
}) => {
  const toast = useToast();

  const [modo, setModo] = useState<ModoLogin>(tokenRedefinicao ? 'redefinir' : 'login');
  const [emailRecuperacao, setEmailRecuperacao] = useState('');
  const [recuperacaoEnviada, setRecuperacaoEnviada] = useState(false);
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacaoSenha, setConfirmacaoSenha] = useState('');

  const [email, setEmail] = useState(() => {
    const saved = localStorage.getItem('@sup:login_email');
    return saved || '';
  });
  
  const [senha, setSenha] = useState(() => {
    const saved = localStorage.getItem('@sup:login_senha');
    return saved || '';
  });
  
  const [lembrar, setLembrar] = useState(() => {
    const saved = localStorage.getItem('@sup:login_lembrar');
    return saved === 'true';
  });

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  useEffect(() => {
    if (lembrar && email) {
      localStorage.setItem('@sup:login_email', email);
      if (senha) localStorage.setItem('@sup:login_senha', senha);
      localStorage.setItem('@sup:login_lembrar', 'true');
    } else {
      if (!lembrar) {
        localStorage.removeItem('@sup:login_email');
        localStorage.removeItem('@sup:login_senha');
        localStorage.setItem('@sup:login_lembrar', 'false');
      }
    }
  }, [email, senha, lembrar]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (!email.trim() || !senha.trim()) {
      toast.showWarning('⚠️ Informe e-mail e senha para acessar o sistema.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/login', { 
        email: email.trim(), 
        senha: senha.trim() 
      });
      
      if (response.data.sucesso) {
        const { usuario, token } = response.data.dados;
        
        localStorage.setItem('@sup:token', token);
        localStorage.setItem('@sup:user', JSON.stringify(usuario));
        
        if (lembrar) {
          localStorage.setItem('@sup:login_email', email.trim());
          localStorage.setItem('@sup:login_senha', senha.trim());
        }
        
        toast.showSuccess(`✅ Bem-vindo, ${usuario.nome}!`);
        onLogin(usuario);
      } else {
        setErro(response.data.erro || 'Credenciais inválidas');
        toast.showError(`❌ ${response.data.erro || 'Credenciais inválidas'}`);
      }
    } catch (error: unknown) {
      const mensagem = getApiErrorMessage(error, 'Erro ao fazer login. Tente novamente.');
      setErro(mensagem);
      toast.showError(`❌ ${mensagem}`);
    } finally {
      setLoading(false);
    }
  };

  const irPara = (novoModo: ModoLogin) => {
    setErro(null);
    setRecuperacaoEnviada(false);
    setModo(novoModo);
  };

  const handleRecuperarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (!emailRecuperacao.trim()) {
      toast.showWarning('⚠️ Informe o e-mail cadastrado.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/recuperar-senha', { email: emailRecuperacao.trim() });
      setRecuperacaoEnviada(true);
    } catch (error: unknown) {
      setErro(getApiErrorMessage(error, 'Erro ao solicitar recuperação de senha. Tente novamente.'));
    } finally {
      setLoading(false);
    }
  };

  const handleRedefinirSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (novaSenha.length < SENHA_MIN_LENGTH) {
      setErro(`A nova senha deve ter pelo menos ${SENHA_MIN_LENGTH} caracteres.`);
      return;
    }
    if (novaSenha !== confirmacaoSenha) {
      setErro('As senhas não conferem.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/redefinir-senha', { token: tokenRedefinicao, novaSenha });
      toast.showSuccess('✅ Senha redefinida! Entre com a nova senha.');
      setNovaSenha('');
      setConfirmacaoSenha('');
      setSenha('');
      onRedefinicaoConcluida?.();
      irPara('login');
    } catch (error: unknown) {
      setErro(getApiErrorMessage(error, 'Erro ao redefinir senha. Solicite um novo link.'));
    } finally {
      setLoading(false);
    }
  };

  const classeInput =
    'w-full pl-9 pr-3 py-2.5 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all';
  const classeBotaoPrimario =
    'w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <div className="min-h-screen w-full flex bg-slate-900">
      
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-start pl-96 pr-8 text-white">
        
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <span className="text-white font-black text-xl">S</span>
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight">SUP TECNOLOGIA</div>
            <div className="text-sm text-blue-300/70 font-light">Sistema ERP & Emissor Fiscal</div>
          </div>
        </div>

        <h1 className="text-4xl font-black tracking-tight mb-4">
          Gestão Fiscal<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
            Inteligente & Integrada
          </span>
        </h1>
        
        <p className="text-blue-200/70 text-base max-w-md mb-10 leading-relaxed">
          Emita notas fiscais eletrônicas, gerencie seu financeiro e mantenha 
          sua empresa em conformidade com a legislação brasileira.
        </p>

        <div className="space-y-3 w-full max-w-sm">
          <div className="flex items-center gap-3 text-blue-200/80">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <span className="text-sm">NF-e / NFS-e / NFC-e / CT-e / NFA-e</span>
          </div>
          <div className="flex items-center gap-3 text-blue-200/80">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <span className="text-sm">Certificado Digital ICP-Brasil A1</span>
          </div>
          <div className="flex items-center gap-3 text-blue-200/80">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <span className="text-sm">Gestão Financeira com Pix Integrado</span>
          </div>
          <div className="flex items-center gap-3 text-blue-200/80">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <span className="text-sm">Dashboard em Tempo Real</span>
          </div>
        </div>

        <div className="absolute bottom-8 left-12 flex items-center gap-4 text-blue-300/40 text-xs">
          <span>🔒 SSL/TLS Seguro</span>
          <span className="w-px h-4 bg-blue-300/20"></span>
          <span>ICP-Brasil</span>
          <span className="w-px h-4 bg-blue-300/20"></span>
          <span>v2026.1</span>
        </div>
      </div>

      <div className="w-full lg:w-1/2 relative flex items-center justify-center p-4 sm:p-6 lg:p-8 min-h-screen">
        
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url(${BACKGROUND_IMAGE})`,
            filter: 'brightness(0.7) saturate(1.1)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-slate-900/40 to-blue-900/30" />

        <div className="relative z-10 w-full max-w-md">
          
          <div className="lg:hidden text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-sm">S</span>
              </div>
              <span className="text-white font-bold text-sm">SUP TECNOLOGIA</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl lg:backdrop-blur-2xl rounded-2xl border border-white/15 shadow-2xl p-6 sm:p-8 space-y-5">
            
            {(modo !== 'login' || onBackToLanding) && (
              <button
                type="button"
                onClick={() => (modo !== 'login' ? irPara('login') : onBackToLanding?.())}
                className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-xs font-medium transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar</span>
              </button>
            )}

            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {modo === 'login' && 'Bem-vindo de volta'}
                {modo === 'recuperar' && 'Recuperar senha'}
                {modo === 'redefinir' && 'Definir nova senha'}
              </h2>
              <p className="text-sm text-white/50">
                {modo === 'login' && 'Acesse sua conta para gerenciar suas notas fiscais'}
                {modo === 'recuperar' && 'Informe seu e-mail para receber o link de redefinição'}
                {modo === 'redefinir' && 'Escolha uma nova senha para acessar o sistema'}
              </p>
            </div>

            {erro && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/20 backdrop-blur-sm border border-rose-500/30 text-rose-200 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{erro}</span>
              </div>
            )}

            {modo === 'recuperar' && (
              recuperacaoEnviada ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/30 text-emerald-100 text-xs">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      Se o e-mail estiver cadastrado, você receberá em instantes um link para redefinir a senha.
                      O link vale por 1 hora — confira também a caixa de spam.
                    </span>
                  </div>
                  <button type="button" onClick={() => irPara('login')} className={classeBotaoPrimario}>
                    <ArrowLeft className="w-4 h-4" />
                    <span>Voltar ao login</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRecuperarSenha} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block font-medium text-white/80 text-sm">E-mail Corporativo</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/40">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={emailRecuperacao}
                        onChange={(e) => setEmailRecuperacao(e.target.value)}
                        placeholder="seu.email@empresa.com.br"
                        className={classeInput}
                        required
                        autoFocus
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className={classeBotaoPrimario}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <span>Enviar link de redefinição</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )
            )}

            {modo === 'redefinir' && (
              <form onSubmit={handleRedefinirSenha} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block font-medium text-white/80 text-sm">Nova Senha</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/40">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={mostrarSenha ? 'text' : 'password'}
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      placeholder={`Mínimo de ${SENHA_MIN_LENGTH} caracteres`}
                      className={`${classeInput} pr-10`}
                      required
                      autoFocus
                      autoComplete="new-password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenha(!mostrarSenha)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white/70 transition-colors cursor-pointer"
                    >
                      {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block font-medium text-white/80 text-sm">Confirmar Nova Senha</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/40">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={mostrarSenha ? 'text' : 'password'}
                      value={confirmacaoSenha}
                      onChange={(e) => setConfirmacaoSenha(e.target.value)}
                      placeholder="Repita a nova senha"
                      className={classeInput}
                      required
                      autoComplete="new-password"
                      disabled={loading}
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading} className={classeBotaoPrimario}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <span>Redefinir senha</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {modo === 'login' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="block font-medium text-white/80 text-sm">E-mail Corporativo</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/40">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@empresa.com.br"
                    className="w-full pl-9 pr-3 py-2.5 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block font-medium text-white/80 text-sm">Senha de Acesso</label>
                  <button
                    type="button"
                    onClick={() => {
                      setEmailRecuperacao(email);
                      irPara('recuperar');
                    }}
                    className="text-[11px] text-blue-400 hover:text-blue-300 cursor-pointer hover:underline transition-colors"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/40">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white/70 transition-colors cursor-pointer"
                  >
                    {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    checked={lembrar}
                    onChange={(e) => setLembrar(e.target.checked)}
                    className="rounded border-white/20 bg-white/10 text-blue-500 focus:ring-2 focus:ring-blue-400/30 w-3.5 h-3.5 cursor-pointer"
                    disabled={loading}
                  />
                  <span className="text-white/60 text-xs group-hover:text-white/80 transition-colors">Lembrar-me</span>
                </label>
                <span className="text-[10px] text-white/40 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Certificado A1
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Autenticando...</span>
                  </>
                ) : (
                  <>
                    <span>Entrar no Sistema</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
            )}

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-white/30">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-white/40" />
                <span>ICP-Brasil SHA256</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-white/30" />
                <span>{empresa.razaoSocial || 'SUP TECNOLOGIA'}</span>
              </div>
            </div>

          </div>

          <div className="text-center mt-4 text-white/20 text-[10px]">
            © {new Date().getFullYear()} SUP TECNOLOGIA • Sistema ERP & Emissor Fiscal
          </div>
        </div>

      </div>

    </div>
  );
};