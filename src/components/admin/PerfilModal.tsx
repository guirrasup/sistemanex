// src/components/admin/PerfilModal.tsx
import React, { useState } from 'react';
import { X, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { adminService, CatalogoPermissoes, PerfilAcesso } from '../../services/admin.service';
import { getApiErrorMessage } from '../../utils/apiError';
import { MatrizPermissoes } from './MatrizPermissoes';
import { CORES_PERFIL, classePontoCor } from './adminUtils';

interface Props {
  perfil: PerfilAcesso | null; // null = novo
  /** Ao duplicar: perfil novo já preenchido a partir de outro. */
  modelo?: PerfilAcesso | null;
  catalogo: CatalogoPermissoes;
  perfis: PerfilAcesso[];
  onClose: () => void;
  onSalvo: () => void;
}

const input = 'w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500';

export const PerfilModal: React.FC<Props> = ({ perfil, modelo, catalogo, perfis, onClose, onSalvo }) => {
  const base = perfil ?? modelo ?? null;
  const [nome, setNome] = useState(perfil?.nome ?? (modelo ? `${modelo.nome} (cópia)` : ''));
  const [descricao, setDescricao] = useState(base?.descricao ?? '');
  const [cor, setCor] = useState(base?.cor ?? 'blue');
  const [selecionadas, setSelecionadas] = useState(new Set(base?.permissoes ?? []));
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const total = catalogo.modulos.reduce((n, m) => n + m.permissoes.length, 0);

  const partirDe = (valor: string) => {
    if (valor === 'vazio') setSelecionadas(new Set());
    else if (valor === 'tudo') setSelecionadas(new Set(catalogo.modulos.flatMap((m) => m.permissoes.map((p) => p.chave))));
    else if (valor === 'FISCAL' || valor === 'OPERADOR') setSelecionadas(new Set(catalogo.padraoPorNivel[valor]));
    else {
      const outro = perfis.find((p) => p.id === valor);
      if (outro) setSelecionadas(new Set(outro.permissoes));
    }
  };

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setSalvando(true);
    try {
      const dados = { nome: nome.trim(), descricao: descricao.trim() || null, cor, permissoes: [...selecionadas] };
      if (perfil) await adminService.atualizarPerfil(perfil.id, dados);
      else await adminService.criarPerfil(dados);
      onSalvo();
    } catch (err) {
      setErro(getApiErrorMessage(err, 'Não foi possível salvar o perfil.'));
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
              <ShieldCheck className="w-3.5 h-3.5" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900">{perfil ? `Editar perfil — ${perfil.nome}` : 'Novo perfil de acesso'}</h2>
              <p className="text-[10px] text-slate-500">
                {selecionadas.size} de {total} permissões
                {perfil && perfil._count.usuarios > 0 && ` · alterações valem na hora para ${perfil._count.usuarios} usuário(s)`}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {erro && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{erro}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-600 mb-1">Nome *</label>
              <input className={input} value={nome} onChange={(e) => setNome(e.target.value)} required maxLength={60} placeholder="Ex.: Caixa, Faturista" />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-600 mb-1">Descrição</label>
              <input className={input} value={descricao} onChange={(e) => setDescricao(e.target.value)} maxLength={255} placeholder="Para que serve este perfil" />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Cor</label>
              <div className="flex gap-1.5 flex-wrap">
                {CORES_PERFIL.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCor(c)}
                    title={c}
                    aria-label={`Cor ${c}`}
                    className={`w-6 h-6 rounded-full ${classePontoCor(c)} cursor-pointer transition-transform ${cor === c ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : 'hover:scale-110'}`}
                  />
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-600 mb-1">Preencher a partir de</label>
              <select className={input} value="" onChange={(e) => e.target.value && partirDe(e.target.value)}>
                <option value="">Escolha um modelo para substituir as permissões atuais...</option>
                <option value="vazio">Nenhuma permissão</option>
                <option value="OPERADOR">Padrão do nível Operador</option>
                <option value="FISCAL">Padrão do nível Fiscal</option>
                <option value="tudo">Todas as permissões</option>
                {perfis.filter((p) => p.id !== perfil?.id).map((p) => (
                  <option key={p.id} value={p.id}>Perfil: {p.nome}</option>
                ))}
              </select>
            </div>
          </div>

          <MatrizPermissoes modo="perfil" modulos={catalogo.modulos} selecionadas={selecionadas} onChange={setSelecionadas} />
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 cursor-pointer">
            Cancelar
          </button>
          <button type="submit" disabled={salvando} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center gap-1.5 disabled:opacity-50 cursor-pointer">
            {salvando && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {perfil ? 'Salvar perfil' : 'Criar perfil'}
          </button>
        </div>
      </form>
    </div>
  );
};
