// src/components/admin/UsuarioModal.tsx
import React, { useMemo, useState } from 'react';
import { X, AlertCircle, Loader2, UserCog, ShieldCheck, Eye, EyeOff, RefreshCw, Crown } from 'lucide-react';
import { PerfilUsuario } from '../../types/erp';
import {
  adminService,
  CatalogoPermissoes,
  PerfilAcesso,
  UsuarioAdmin,
  UsuarioPayload,
} from '../../services/admin.service';
import { getApiErrorMessage } from '../../utils/apiError';
import { MatrizPermissoes } from './MatrizPermissoes';
import { classeCorPerfil, gerarSenha } from './adminUtils';

interface Props {
  usuario: UsuarioAdmin | null; // null = novo
  catalogo: CatalogoPermissoes;
  perfis: PerfilAcesso[];
  usuarioLogadoId: string;
  onClose: () => void;
  onSalvo: (usuario: UsuarioAdmin) => void;
}

const NIVEIS: { id: PerfilUsuario; titulo: string; descricao: string }[] = [
  { id: 'ADMIN', titulo: 'Administrador', descricao: 'Acesso total, inclusive à gestão de usuários' },
  { id: 'FISCAL', titulo: 'Fiscal', descricao: 'Padrão: opera todo o módulo fiscal e cadastros' },
  { id: 'OPERADOR', titulo: 'Operador', descricao: 'Padrão: emite e consulta, sem cancelar/excluir' },
];

const input = 'w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500';

export const UsuarioModal: React.FC<Props> = ({ usuario, catalogo, perfis, usuarioLogadoId, onClose, onSalvo }) => {
  const editando = !!usuario;
  const proprio = usuario?.id === usuarioLogadoId;

  const [aba, setAba] = useState<'dados' | 'permissoes'>('dados');
  const [nome, setNome] = useState(usuario?.nome ?? '');
  const [email, setEmail] = useState(usuario?.email ?? '');
  const [cargo, setCargo] = useState(usuario?.cargo ?? '');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [nivel, setNivel] = useState<PerfilUsuario>(usuario?.perfil ?? 'OPERADOR');
  const [ativo, setAtivo] = useState(usuario?.ativo ?? true);
  const [perfilAcessoId, setPerfilAcessoId] = useState<string | null>(usuario?.perfilAcessoId ?? null);
  const [concedidas, setConcedidas] = useState(new Set(usuario?.permissoesConcedidas ?? []));
  const [negadas, setNegadas] = useState(new Set(usuario?.permissoesNegadas ?? []));
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const isAdmin = nivel === 'ADMIN';
  const perfilSelecionado = perfis.find((p) => p.id === perfilAcessoId) ?? null;
  const totalPermissoes = catalogo.modulos.reduce((n, m) => n + m.permissoes.length, 0);

  const herdadas = useMemo(
    () => new Set(perfilSelecionado ? perfilSelecionado.permissoes : nivel === 'ADMIN' ? [] : catalogo.padraoPorNivel[nivel]),
    [perfilSelecionado, nivel, catalogo]
  );

  const efetivas = useMemo(() => {
    if (isAdmin) return totalPermissoes;
    const set = new Set([...herdadas, ...concedidas]);
    negadas.forEach((c) => set.delete(c));
    return set.size;
  }, [isAdmin, herdadas, concedidas, negadas, totalPermissoes]);

  const origem = perfilSelecionado ? `perfil "${perfilSelecionado.nome}"` : `padrão do nível ${NIVEIS.find((n) => n.id === nivel)?.titulo}`;

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    if (!editando && senha.length < 6) {
      setErro('A senha inicial deve ter pelo menos 6 caracteres.');
      setAba('dados');
      return;
    }
    const payload: UsuarioPayload = {
      nome: nome.trim(),
      email: email.trim(),
      cargo: cargo.trim() || null,
      perfil: nivel,
      ativo,
      perfilAcessoId,
      permissoesConcedidas: [...concedidas],
      permissoesNegadas: [...negadas],
      ...(editando ? {} : { senha }),
    };
    setSalvando(true);
    try {
      const salvo = editando
        ? await adminService.atualizarUsuario(usuario!.id, payload)
        : await adminService.criarUsuario(payload);
      onSalvo(salvo);
    } catch (err) {
      setErro(getApiErrorMessage(err, 'Não foi possível salvar o usuário.'));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <form onSubmit={salvar} className="bg-white rounded-xl max-w-4xl w-full max-h-[92vh] shadow-xl flex flex-col text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm">
              <UserCog className="w-3.5 h-3.5" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900">{editando ? `Editar usuário — ${usuario!.nome}` : 'Novo usuário'}</h2>
              <p className="text-[10px] text-slate-500">
                {isAdmin ? 'Acesso total' : `${efetivas} de ${totalPermissoes} permissões liberadas`}
                {!isAdmin && (concedidas.size + negadas.size) > 0 && ` · ${concedidas.size + negadas.size} exceção(ões)`}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-1 px-5 pt-3 border-b border-slate-100">
          {([['dados', 'Dados e nível'], ['permissoes', 'Permissões']] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setAba(id)}
              className={`px-3 py-2 font-semibold border-b-2 -mb-px transition-colors cursor-pointer ${
                aba === id ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {erro && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{erro}</span>
            </div>
          )}

          {aba === 'dados' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Nome *</label>
                  <input className={input} value={nome} onChange={(e) => setNome(e.target.value)} required maxLength={120} />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">E-mail (login) *</label>
                  <input className={input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={160} />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Cargo</label>
                  <input className={input} value={cargo} onChange={(e) => setCargo(e.target.value)} maxLength={80} placeholder="Ex.: Faturista, Caixa" />
                </div>
                {!editando ? (
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Senha inicial *</label>
                    <div className="flex gap-1">
                      <div className="relative flex-1">
                        <input
                          className={`${input} pr-8 font-mono`}
                          type={mostrarSenha ? 'text' : 'password'}
                          value={senha}
                          onChange={(e) => setSenha(e.target.value)}
                          minLength={6}
                          required
                          autoComplete="new-password"
                        />
                        <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer" title={mostrarSenha ? 'Ocultar' : 'Mostrar'}>
                          {mostrarSenha ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <button type="button" onClick={() => { setSenha(gerarSenha()); setMostrarSenha(true); }} className="px-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer" title="Gerar senha forte">
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Status</label>
                    <label className={`flex items-center gap-2 p-2 border rounded-lg ${proprio ? 'opacity-60' : 'cursor-pointer'} ${ativo ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                      <input type="checkbox" checked={ativo} disabled={proprio} onChange={(e) => setAtivo(e.target.checked)} />
                      <span className="font-medium">{ativo ? 'Ativo — pode fazer login' : 'Inativo — login bloqueado'}</span>
                    </label>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">Nível de acesso *</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {NIVEIS.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      disabled={proprio}
                      onClick={() => setNivel(n.id)}
                      className={`text-left p-2.5 rounded-lg border transition-colors cursor-pointer disabled:cursor-not-allowed ${
                        nivel === n.id ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' : 'border-slate-200 hover:border-slate-300'
                      } ${proprio && nivel !== n.id ? 'opacity-50' : ''}`}
                    >
                      <div className="font-bold text-slate-900 flex items-center gap-1">
                        {n.id === 'ADMIN' && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                        {n.titulo}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{n.descricao}</div>
                    </button>
                  ))}
                </div>
                {proprio && <p className="text-[10px] text-slate-400 mt-1">Você não pode alterar o seu próprio nível nem se desativar.</p>}
              </div>

              {!isAdmin && (
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Perfil de acesso</label>
                  <select className={input} value={perfilAcessoId ?? ''} onChange={(e) => setPerfilAcessoId(e.target.value || null)}>
                    <option value="">Usar o padrão do nível ({NIVEIS.find((n) => n.id === nivel)?.titulo})</option>
                    {perfis.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome} — {p.permissoes.length} permissões
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1">
                    O perfil define a base de permissões. Ajustes só para este usuário ficam na aba <strong>Permissões</strong>.
                  </p>
                </div>
              )}
            </>
          )}

          {aba === 'permissoes' && (
            isAdmin ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-amber-900">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Administradores têm acesso total a todas as telas, emissões e relatórios, além da gestão de usuários. Para restringir, escolha outro nível.</span>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-slate-600">
                    Base herdada do{' '}
                    {perfilSelecionado ? (
                      <span className={`inline-block px-1.5 py-0.5 rounded border font-semibold ${classeCorPerfil(perfilSelecionado.cor)}`}>{perfilSelecionado.nome}</span>
                    ) : (
                      <strong>{origem}</strong>
                    )}
                    . Clique numa permissão para alternar: herdada → permitir → negar.
                  </span>
                  {(concedidas.size + negadas.size) > 0 && (
                    <button type="button" onClick={() => { setConcedidas(new Set()); setNegadas(new Set()); }} className="text-indigo-700 font-semibold hover:underline shrink-0 cursor-pointer">
                      Remover exceções
                    </button>
                  )}
                </div>
                <MatrizPermissoes
                  modo="usuario"
                  modulos={catalogo.modulos}
                  herdadas={herdadas}
                  concedidas={concedidas}
                  negadas={negadas}
                  onChange={({ concedidas: c, negadas: n }) => { setConcedidas(c); setNegadas(n); }}
                />
              </>
            )
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 cursor-pointer">
            Cancelar
          </button>
          <button type="submit" disabled={salvando} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center gap-1.5 disabled:opacity-50 cursor-pointer">
            {salvando && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {editando ? 'Salvar alterações' : 'Criar usuário'}
          </button>
        </div>
      </form>
    </div>
  );
};
