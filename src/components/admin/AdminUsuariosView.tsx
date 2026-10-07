// src/components/admin/AdminUsuariosView.tsx
// Área exclusiva do ADMIN: usuários, perfis de acesso e auditoria.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Users, ShieldCheck, History, Plus, Search, Edit2, Trash2, KeyRound, LogOut, Power, Crown,
  Copy, Loader2, AlertCircle, X, RefreshCw, Eye, EyeOff, ChevronLeft, ChevronRight, Lock,
} from 'lucide-react';
import {
  adminService, CatalogoPermissoes, PerfilAcesso, UsuarioAdmin, PaginaAuditoria, RegistroAuditoria,
} from '../../services/admin.service';
import { getApiErrorMessage } from '../../utils/apiError';
import { useToast } from '../../hooks/useToast';
import { ConfirmModal, ConfirmModalType } from '../ui/ConfirmModal';
import { UsuarioModal } from './UsuarioModal';
import { PerfilModal } from './PerfilModal';
import { classeCorPerfil, classePontoCor, formatarDataHora, gerarSenha } from './adminUtils';

interface Props {
  usuarioLogadoId: string;
}

type Aba = 'usuarios' | 'perfis' | 'auditoria';

interface Confirmacao {
  titulo: string;
  mensagem: string;
  tipo: ConfirmModalType;
  textoConfirmar: string;
  acao: () => Promise<void>;
}

const ROTULO_NIVEL: Record<string, string> = { ADMIN: 'Administrador', FISCAL: 'Fiscal', OPERADOR: 'Operador' };

export const AdminUsuariosView: React.FC<Props> = ({ usuarioLogadoId }) => {
  const { showSuccess, showError } = useToast();

  const [aba, setAba] = useState<Aba>('usuarios');
  const [catalogo, setCatalogo] = useState<CatalogoPermissoes | null>(null);
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [perfis, setPerfis] = useState<PerfilAcesso[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarga, setErroCarga] = useState<string | null>(null);

  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'ativos' | 'inativos'>('todos');

  const [usuarioEmEdicao, setUsuarioEmEdicao] = useState<UsuarioAdmin | null | 'novo'>(null);
  const [perfilEmEdicao, setPerfilEmEdicao] = useState<{ perfil: PerfilAcesso | null; modelo?: PerfilAcesso } | null>(null);
  const [senhaPara, setSenhaPara] = useState<UsuarioAdmin | null>(null);
  const [confirmacao, setConfirmacao] = useState<Confirmacao | null>(null);
  const [confirmando, setConfirmando] = useState(false);

  const carregar = useCallback(async () => {
    setErroCarga(null);
    try {
      const [cat, us, pf] = await Promise.all([
        adminService.catalogo(),
        adminService.listarUsuarios(),
        adminService.listarPerfis(),
      ]);
      setCatalogo(cat);
      setUsuarios(us);
      setPerfis(pf);
    } catch (err) {
      setErroCarga(getApiErrorMessage(err, 'Não foi possível carregar a administração.'));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const totalPermissoes = catalogo?.modulos.reduce((n, m) => n + m.permissoes.length, 0) ?? 0;

  const usuariosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return usuarios.filter((u) =>
      (filtroStatus === 'todos' || (filtroStatus === 'ativos') === u.ativo) &&
      (!termo || `${u.nome} ${u.email} ${u.cargo ?? ''} ${u.perfilAcesso?.nome ?? ''}`.toLowerCase().includes(termo))
    );
  }, [usuarios, busca, filtroStatus]);

  const resumo = useMemo(() => ({
    ativos: usuarios.filter((u) => u.ativo).length,
    admins: usuarios.filter((u) => u.ativo && u.perfil === 'ADMIN').length,
  }), [usuarios]);

  const executarConfirmacao = async () => {
    if (!confirmacao) return;
    setConfirmando(true);
    try {
      await confirmacao.acao();
      setConfirmacao(null);
      await carregar();
    } catch (err) {
      showError(getApiErrorMessage(err));
    } finally {
      setConfirmando(false);
    }
  };

  const pedirAlternarStatus = (u: UsuarioAdmin) => setConfirmacao({
    titulo: u.ativo ? 'Desativar usuário' : 'Reativar usuário',
    mensagem: u.ativo
      ? `${u.nome} perderá o acesso imediatamente (as sessões abertas são encerradas).`
      : `${u.nome} poderá voltar a fazer login com a senha atual.`,
    tipo: u.ativo ? 'warning' : 'success',
    textoConfirmar: u.ativo ? 'Desativar' : 'Reativar',
    acao: async () => {
      await adminService.alterarStatus(u.id, !u.ativo);
      showSuccess(u.ativo ? 'Usuário desativado' : 'Usuário reativado');
    },
  });

  const pedirEncerrarSessoes = (u: UsuarioAdmin) => setConfirmacao({
    titulo: 'Encerrar sessões',
    mensagem: `Todas as sessões abertas de ${u.nome} serão encerradas. Ele precisará fazer login novamente.`,
    tipo: 'warning',
    textoConfirmar: 'Encerrar sessões',
    acao: async () => {
      await adminService.encerrarSessoes(u.id);
      showSuccess('Sessões encerradas');
    },
  });

  const pedirExcluirUsuario = (u: UsuarioAdmin) => setConfirmacao({
    titulo: 'Excluir usuário',
    mensagem: `Excluir permanentemente ${u.nome} (${u.email})?\n\nSe ele já realizou ações no sistema, a exclusão será recusada — desative-o nesse caso.`,
    tipo: 'danger',
    textoConfirmar: 'Excluir',
    acao: async () => {
      await adminService.excluirUsuario(u.id);
      showSuccess('Usuário excluído');
    },
  });

  const pedirExcluirPerfil = (p: PerfilAcesso) => setConfirmacao({
    titulo: 'Excluir perfil de acesso',
    mensagem: `Excluir o perfil "${p.nome}"? Esta ação não pode ser desfeita.`,
    tipo: 'danger',
    textoConfirmar: 'Excluir',
    acao: async () => {
      await adminService.excluirPerfil(p.id);
      showSuccess('Perfil excluído');
    },
  });

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500 text-sm gap-2">
        <Loader2 className="w-5 h-5 animate-spin" /> Carregando administração...
      </div>
    );
  }

  if (erroCarga || !catalogo) {
    return (
      <div className="max-w-xl mx-auto mt-12 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm flex items-start gap-2">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <div>
          <p>{erroCarga}</p>
          <button onClick={() => { setCarregando(true); carregar(); }} className="mt-2 font-semibold underline cursor-pointer">Tentar novamente</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="bg-slate-900 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-white">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shadow-sm">
              <Lock className="w-4 h-4" />
            </span>
            <h1 className="text-base font-bold">Usuários e permissões</h1>
            <span className="bg-amber-400/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
              Área do administrador
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Defina quem acessa cada tela, quais documentos pode emitir, cancelar ou baixar, e quais relatórios pode ver.
          </p>
        </div>
        <div className="flex gap-4 text-right">
          <div><div className="text-lg font-bold">{resumo.ativos}</div><div className="text-[10px] text-slate-400">usuários ativos</div></div>
          <div><div className="text-lg font-bold">{perfis.length}</div><div className="text-[10px] text-slate-400">perfis</div></div>
          <div><div className="text-lg font-bold">{resumo.admins}</div><div className="text-[10px] text-slate-400">admins</div></div>
        </div>
      </div>

      <div className="flex gap-1 border-b border-slate-200 text-xs">
        {([
          ['usuarios', 'Usuários', Users],
          ['perfis', 'Perfis de acesso', ShieldCheck],
          ['auditoria', 'Auditoria', History],
        ] as const).map(([id, label, Icone]) => (
          <button
            key={id}
            onClick={() => setAba(id)}
            className={`flex items-center gap-1.5 px-3 py-2 font-semibold border-b-2 -mb-px transition-colors cursor-pointer ${
              aba === id ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Icone className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {aba === 'usuarios' && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 flex items-center bg-white border border-slate-200 rounded-lg p-1.5 shadow-sm">
              <Search className="w-4 h-4 text-slate-400 ml-1.5" />
              <input
                type="text"
                placeholder="Buscar por nome, e-mail, cargo ou perfil..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full text-xs px-2 py-1 focus:outline-none"
              />
            </div>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value as typeof filtroStatus)}
              className="text-xs border border-slate-200 rounded-lg px-2 py-2 bg-white shadow-sm"
            >
              <option value="todos">Todos</option>
              <option value="ativos">Ativos</option>
              <option value="inativos">Inativos</option>
            </select>
            <button
              onClick={() => setUsuarioEmEdicao('novo')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" /> Novo usuário
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Usuário</th>
                    <th className="py-2.5 px-3">Nível</th>
                    <th className="py-2.5 px-3">Perfil de acesso</th>
                    <th className="py-2.5 px-3">Permissões</th>
                    <th className="py-2.5 px-3">Último acesso</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usuariosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="font-semibold text-slate-700">Nenhum usuário encontrado</p>
                      </td>
                    </tr>
                  ) : usuariosFiltrados.map((u) => {
                    const proprio = u.id === usuarioLogadoId;
                    const excecoes = u.permissoesConcedidas.length + u.permissoesNegadas.length;
                    const pct = totalPermissoes ? Math.round((u.permissoes.length / totalPermissoes) * 100) : 0;
                    return (
                      <tr key={u.id} className={`hover:bg-slate-50/80 transition-colors ${u.ativo ? '' : 'opacity-60'}`}>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            {u.nome}
                            {proprio && <span className="text-[9px] font-bold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">VOCÊ</span>}
                          </div>
                          <div className="text-[11px] text-slate-500">{u.email}{u.cargo ? ` · ${u.cargo}` : ''}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${
                            u.perfil === 'ADMIN' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}>
                            {u.perfil === 'ADMIN' && <Crown className="w-3 h-3" />}
                            {ROTULO_NIVEL[u.perfil]}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          {u.perfil === 'ADMIN' ? (
                            <span className="text-slate-400">—</span>
                          ) : u.perfilAcesso ? (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${classeCorPerfil(u.perfilAcesso.cor)}`}>{u.perfilAcesso.nome}</span>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Padrão do nível</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-[11px] font-medium text-slate-700">{u.permissoes.length}/{totalPermissoes}</span>
                          </div>
                          {excecoes > 0 && u.perfil !== 'ADMIN' && (
                            <div className="text-[10px] text-amber-600 mt-0.5">{excecoes} exceção(ões)</div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">{formatarDataHora(u.ultimoLogin)}</td>
                        <td className="py-2.5 px-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            u.ativo ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}>
                            {u.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center justify-end gap-0.5">
                            <BotaoAcao titulo="Editar dados e permissões" onClick={() => setUsuarioEmEdicao(u)} icone={Edit2} cor="indigo" />
                            <BotaoAcao titulo="Redefinir senha" onClick={() => setSenhaPara(u)} icone={KeyRound} cor="amber" />
                            {!proprio && (
                              <>
                                <BotaoAcao titulo="Encerrar sessões abertas" onClick={() => pedirEncerrarSessoes(u)} icone={LogOut} cor="amber" />
                                <BotaoAcao titulo={u.ativo ? 'Desativar' : 'Reativar'} onClick={() => pedirAlternarStatus(u)} icone={Power} cor={u.ativo ? 'rose' : 'emerald'} />
                                <BotaoAcao titulo="Excluir" onClick={() => pedirExcluirUsuario(u)} icone={Trash2} cor="rose" />
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {aba === 'perfis' && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Perfis são modelos de permissões reutilizáveis. Alterar um perfil atualiza na hora todos os usuários que o usam.
            </p>
            <button
              onClick={() => setPerfilEmEdicao({ perfil: null })}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" /> Novo perfil
            </button>
          </div>

          {perfis.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center text-xs text-slate-500">
              <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">Nenhum perfil criado</p>
              <p className="mt-1">Sem perfil, cada usuário usa o padrão do seu nível (Fiscal ou Operador). Crie perfis como "Caixa" ou "Faturista" para padronizar os acessos.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {perfis.map((p) => (
                <div key={p.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col gap-3 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${classePontoCor(p.cor)}`} />
                        <h3 className="font-bold text-slate-900 truncate">{p.nome}</h3>
                      </div>
                      <p className="text-slate-500 mt-0.5 line-clamp-2">{p.descricao || 'Sem descrição'}</p>
                    </div>
                    <div className="flex gap-0.5 shrink-0">
                      <BotaoAcao titulo="Editar" onClick={() => setPerfilEmEdicao({ perfil: p })} icone={Edit2} cor="indigo" />
                      <BotaoAcao titulo="Duplicar" onClick={() => setPerfilEmEdicao({ perfil: null, modelo: p })} icone={Copy} cor="indigo" />
                      <BotaoAcao titulo="Excluir" onClick={() => pedirExcluirPerfil(p)} icone={Trash2} cor="rose" />
                    </div>
                  </div>
                  <CoberturaModulos catalogo={catalogo} permissoes={p.permissoes} />
                  <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                    <span><strong className="text-slate-800">{p.permissoes.length}</strong>/{totalPermissoes} permissões</span>
                    <span><strong className="text-slate-800">{p._count.usuarios}</strong> usuário(s)</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {aba === 'auditoria' && <AbaAuditoria />}

      {usuarioEmEdicao && (
        <UsuarioModal
          usuario={usuarioEmEdicao === 'novo' ? null : usuarioEmEdicao}
          catalogo={catalogo}
          perfis={perfis}
          usuarioLogadoId={usuarioLogadoId}
          onClose={() => setUsuarioEmEdicao(null)}
          onSalvo={() => {
            showSuccess(usuarioEmEdicao === 'novo' ? 'Usuário criado' : 'Usuário atualizado');
            setUsuarioEmEdicao(null);
            carregar();
          }}
        />
      )}

      {perfilEmEdicao && (
        <PerfilModal
          perfil={perfilEmEdicao.perfil}
          modelo={perfilEmEdicao.modelo}
          catalogo={catalogo}
          perfis={perfis}
          onClose={() => setPerfilEmEdicao(null)}
          onSalvo={() => {
            showSuccess(perfilEmEdicao.perfil ? 'Perfil atualizado' : 'Perfil criado');
            setPerfilEmEdicao(null);
            carregar();
          }}
        />
      )}

      {senhaPara && (
        <RedefinirSenhaModal
          usuario={senhaPara}
          proprio={senhaPara.id === usuarioLogadoId}
          onClose={() => setSenhaPara(null)}
          onConcluido={() => {
            showSuccess('Senha redefinida');
            setSenhaPara(null);
          }}
        />
      )}

      <ConfirmModal
        isOpen={!!confirmacao}
        onClose={() => !confirmando && setConfirmacao(null)}
        onConfirm={executarConfirmacao}
        type={confirmacao?.tipo ?? 'warning'}
        title={confirmacao?.titulo ?? ''}
        message={confirmacao?.mensagem ?? ''}
        confirmText={confirmacao?.textoConfirmar}
        cancelText="Cancelar"
        loading={confirmando}
      />
    </div>
  );
};

// ── Componentes auxiliares ─────────────────────────────────────

const CORES_BOTAO: Record<string, string> = {
  indigo: 'hover:text-indigo-600 hover:bg-indigo-50',
  amber: 'hover:text-amber-600 hover:bg-amber-50',
  rose: 'hover:text-rose-600 hover:bg-rose-50',
  emerald: 'hover:text-emerald-600 hover:bg-emerald-50',
};

const BotaoAcao: React.FC<{ titulo: string; onClick: () => void; icone: React.ElementType; cor: string }> = ({ titulo, onClick, icone: Icone, cor }) => (
  <button
    onClick={onClick}
    title={titulo}
    aria-label={titulo}
    className={`p-1.5 text-slate-500 rounded-lg transition-colors cursor-pointer ${CORES_BOTAO[cor]}`}
  >
    <Icone className="w-3.5 h-3.5" />
  </button>
);

/** Barras por grupo mostrando quanto de cada área o perfil libera. */
const CoberturaModulos: React.FC<{ catalogo: CatalogoPermissoes; permissoes: string[] }> = ({ catalogo, permissoes }) => {
  const conjunto = new Set(permissoes);
  const grupos = new Map<string, { total: number; ativas: number }>();
  catalogo.modulos.forEach((m) => {
    const g = grupos.get(m.grupo) ?? { total: 0, ativas: 0 };
    g.total += m.permissoes.length;
    g.ativas += m.permissoes.filter((p) => conjunto.has(p.chave)).length;
    grupos.set(m.grupo, g);
  });
  return (
    <div className="space-y-1">
      {[...grupos.entries()].map(([grupo, { total, ativas }]) => (
        <div key={grupo} className="flex items-center gap-2">
          <span className="w-28 text-[10px] text-slate-500 truncate">{grupo}</span>
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full ${ativas === total ? 'bg-emerald-500' : 'bg-indigo-400'}`} style={{ width: `${(ativas / total) * 100}%` }} />
          </div>
          <span className="w-9 text-right text-[10px] text-slate-500">{ativas}/{total}</span>
        </div>
      ))}
    </div>
  );
};

const RedefinirSenhaModal: React.FC<{
  usuario: UsuarioAdmin;
  proprio: boolean;
  onClose: () => void;
  onConcluido: () => void;
}> = ({ usuario, proprio, onClose, onConcluido }) => {
  const [senha, setSenha] = useState(() => gerarSenha());
  const [mostrar, setMostrar] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setSalvando(true);
    try {
      await adminService.redefinirSenha(usuario.id, senha);
      onConcluido();
    } catch (err) {
      setErro(getApiErrorMessage(err, 'Não foi possível redefinir a senha.'));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <form onSubmit={salvar} className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2"><KeyRound className="w-4 h-4 text-amber-600" /> Redefinir senha</h2>
          <button type="button" onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
        <p className="text-slate-600">
          Nova senha para <strong>{usuario.nome}</strong> ({usuario.email}).{' '}
          {proprio
            ? 'Como é a sua conta, você será desconectado e precisará entrar com a nova senha.'
            : 'As sessões abertas dele serão encerradas. Envie a nova senha por um canal seguro.'}
        </p>
        {erro && <div className="p-2 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg">{erro}</div>}
        <div className="flex gap-1">
          <div className="relative flex-1">
            <input
              type={mostrar ? 'text' : 'password'}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              minLength={6}
              required
              autoComplete="new-password"
              className="w-full border border-slate-300 rounded-lg p-2 pr-8 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button type="button" onClick={() => setMostrar(!mostrar)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer" title={mostrar ? 'Ocultar' : 'Mostrar'}>
              {mostrar ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          <button type="button" onClick={() => setSenha(gerarSenha())} className="px-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer" title="Gerar outra">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button type="button" onClick={() => navigator.clipboard?.writeText(senha)} className="px-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer" title="Copiar">
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 cursor-pointer">Cancelar</button>
          <button type="submit" disabled={salvando} className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium flex items-center gap-1.5 disabled:opacity-50 cursor-pointer">
            {salvando && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Redefinir senha
          </button>
        </div>
      </form>
    </div>
  );
};

// ── Auditoria ──────────────────────────────────────────────────

const ROTULO_ACAO: Record<string, string> = {
  CRIAR: 'Criou',
  ALTERAR: 'Alterou',
  EXCLUIR: 'Excluiu',
  REDEFINIR_SENHA: 'Redefiniu a senha de',
  ENCERRAR_SESSOES: 'Encerrou as sessões de',
};

const ROTULO_CAMPO: Record<string, string> = {
  nome: 'nome', email: 'e-mail', cargo: 'cargo', perfil: 'nível', ativo: 'status', perfilAcesso: 'perfil de acesso',
  permissoesConcedidas: 'permissões concedidas', permissoesNegadas: 'permissões negadas', permissoes: 'permissões',
  descricao: 'descrição', cor: 'cor',
};

function lerJson(valor: string | null): Record<string, unknown> | null {
  if (!valor) return null;
  try { return JSON.parse(valor); } catch { return null; }
}

function descreverRegistro(r: RegistroAuditoria) {
  const antes = lerJson(r.dadosAntigos);
  const depois = lerJson(r.dadosNovos);
  const alvo = String((depois ?? antes)?.nome ?? (depois ?? antes)?.email ?? r.entidadeId);
  const tipo = r.entidade === 'PerfilAcesso' ? 'o perfil' : 'o usuário';
  const verbo = ROTULO_ACAO[r.acao] ?? r.acao;
  const prefixo = ['REDEFINIR_SENHA', 'ENCERRAR_SESSOES'].includes(r.acao) ? verbo : `${verbo} ${tipo}`;

  let detalhe = '';
  if (r.acao === 'ALTERAR' && antes && depois) {
    const mudancas = Object.keys(depois)
      .filter((k) => JSON.stringify(antes[k]) !== JSON.stringify(depois[k]))
      .map((k) => {
        if (Array.isArray(antes[k]) && Array.isArray(depois[k])) {
          const a = new Set(antes[k] as string[]);
          const d = new Set(depois[k] as string[]);
          const add = [...d].filter((x) => !a.has(x)).length;
          const rem = [...a].filter((x) => !d.has(x)).length;
          return `${ROTULO_CAMPO[k] ?? k} (+${add}/−${rem})`;
        }
        if (k === 'ativo') return depois[k] ? 'reativado' : 'desativado';
        return `${ROTULO_CAMPO[k] ?? k}: ${String(antes[k] ?? '—')} → ${String(depois[k] ?? '—')}`;
      });
    detalhe = mudancas.length ? mudancas.join(' · ') : 'sem mudanças';
  }
  return { texto: `${prefixo} ${alvo}`, detalhe };
}

const AbaAuditoria: React.FC = () => {
  const [pagina, setPagina] = useState(1);
  const [dados, setDados] = useState<PaginaAuditoria | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    adminService.auditoria(pagina)
      .then((d) => ativo && setDados(d))
      .catch((err) => ativo && setErro(getApiErrorMessage(err, 'Não foi possível carregar a auditoria.')));
    return () => { ativo = false; };
  }, [pagina]);

  if (erro) return <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs">{erro}</div>;
  if (!dados) return <div className="py-12 text-center text-xs text-slate-500"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></div>;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3">Quando</th>
              <th className="py-2.5 px-3">Quem</th>
              <th className="py-2.5 px-3">O quê</th>
              <th className="py-2.5 px-3">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {dados.data.length === 0 ? (
              <tr><td colSpan={4} className="py-12 text-center text-slate-500">Nenhuma alteração registrada ainda.</td></tr>
            ) : dados.data.map((r) => {
              const { texto, detalhe } = descreverRegistro(r);
              return (
                <tr key={r.id} className="hover:bg-slate-50/80">
                  <td className="py-2.5 px-3 whitespace-nowrap">{formatarDataHora(r.dataHora)}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-800">{r.usuario.nome}</td>
                  <td className="py-2.5 px-3">
                    <div className="text-slate-800">{texto}</div>
                    {detalhe && <div className="text-[10px] text-slate-500 mt-0.5">{detalhe}</div>}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400">{r.ipOrigem ?? '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {dados.totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 px-3 py-2 border-t border-slate-100">
          <span className="text-slate-500">Página {dados.page} de {dados.totalPages}</span>
          <button disabled={pagina <= 1} onClick={() => setPagina(pagina - 1)} className="p-1 rounded border border-slate-200 disabled:opacity-40 cursor-pointer" aria-label="Página anterior"><ChevronLeft className="w-3.5 h-3.5" /></button>
          <button disabled={pagina >= dados.totalPages} onClick={() => setPagina(pagina + 1)} className="p-1 rounded border border-slate-200 disabled:opacity-40 cursor-pointer" aria-label="Próxima página"><ChevronRight className="w-3.5 h-3.5" /></button>
        </div>
      )}
    </div>
  );
};
