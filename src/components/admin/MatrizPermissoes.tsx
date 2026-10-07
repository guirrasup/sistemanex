// src/components/admin/MatrizPermissoes.tsx
// Matriz de permissões usada em dois modos:
//  - 'perfil':  marca/desmarca permissões do perfil de acesso.
//  - 'usuario': parte das permissões herdadas (perfil ou padrão do nível) e
//               registra exceções: clicar alterna Herdado → Permitir → Negar.
// Cada módulo tem atalhos de nível (Nenhum / Ver / Operar / Total).
import React, { useMemo, useState } from 'react';
import { Check, Ban, Plus, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { ModuloPermissoes, NivelPermissao } from '../../services/admin.service';

const ORDEM_NIVEL: Record<NivelPermissao, number> = { ver: 1, operar: 2, total: 3 };

const ATALHOS: { id: 'nenhum' | NivelPermissao; label: string }[] = [
  { id: 'nenhum', label: 'Nenhum' },
  { id: 'ver', label: 'Ver' },
  { id: 'operar', label: 'Operar' },
  { id: 'total', label: 'Total' },
];

type PropsPerfil = {
  modo: 'perfil';
  modulos: ModuloPermissoes[];
  selecionadas: Set<string>;
  onChange: (selecionadas: Set<string>) => void;
};

type PropsUsuario = {
  modo: 'usuario';
  modulos: ModuloPermissoes[];
  herdadas: Set<string>;
  concedidas: Set<string>;
  negadas: Set<string>;
  onChange: (excecoes: { concedidas: Set<string>; negadas: Set<string> }) => void;
};

type Props = (PropsPerfil | PropsUsuario) & { somenteLeitura?: boolean };

export const MatrizPermissoes: React.FC<Props> = (props) => {
  const { modulos, somenteLeitura } = props;
  const [busca, setBusca] = useState('');
  const [recolhidos, setRecolhidos] = useState<Set<string>>(new Set());

  const efetiva = (chave: string): boolean => {
    if (props.modo === 'perfil') return props.selecionadas.has(chave);
    if (props.negadas.has(chave)) return false;
    return props.herdadas.has(chave) || props.concedidas.has(chave);
  };

  // Aplica o valor desejado de várias permissões de uma vez.
  const definir = (alvos: { chave: string; ligada: boolean }[]) => {
    if (somenteLeitura) return;
    if (props.modo === 'perfil') {
      const proximo = new Set(props.selecionadas);
      alvos.forEach(({ chave, ligada }) => (ligada ? proximo.add(chave) : proximo.delete(chave)));
      props.onChange(proximo);
      return;
    }
    // Modo usuário: só guarda exceção quando o desejado difere do herdado.
    const concedidas = new Set(props.concedidas);
    const negadas = new Set(props.negadas);
    alvos.forEach(({ chave, ligada }) => {
      concedidas.delete(chave);
      negadas.delete(chave);
      const herdada = props.herdadas.has(chave);
      if (ligada && !herdada) concedidas.add(chave);
      if (!ligada && herdada) negadas.add(chave);
    });
    props.onChange({ concedidas, negadas });
  };

  const clicar = (chave: string) => {
    if (somenteLeitura) return;
    if (props.modo === 'perfil') {
      definir([{ chave, ligada: !props.selecionadas.has(chave) }]);
      return;
    }
    // Herdado → Permitir → Negar → Herdado
    const concedidas = new Set(props.concedidas);
    const negadas = new Set(props.negadas);
    if (concedidas.has(chave)) {
      concedidas.delete(chave);
      negadas.add(chave);
    } else if (negadas.has(chave)) {
      negadas.delete(chave);
    } else {
      concedidas.add(chave);
    }
    props.onChange({ concedidas, negadas });
  };

  const nivelAtual = (modulo: ModuloPermissoes): string | null => {
    for (const atalho of ATALHOS) {
      const limite = atalho.id === 'nenhum' ? 0 : ORDEM_NIVEL[atalho.id];
      if (modulo.permissoes.every((p) => efetiva(p.chave) === ORDEM_NIVEL[p.nivel] <= limite)) return atalho.id;
    }
    return null; // personalizado
  };

  const aplicarNivel = (modulo: ModuloPermissoes, nivel: 'nenhum' | NivelPermissao) => {
    const limite = nivel === 'nenhum' ? 0 : ORDEM_NIVEL[nivel];
    definir(modulo.permissoes.map((p) => ({ chave: p.chave, ligada: ORDEM_NIVEL[p.nivel] <= limite })));
  };

  const termo = busca.trim().toLowerCase();
  const grupos = useMemo(() => {
    const filtrados = modulos
      .map((m) => ({
        ...m,
        permissoes: termo && !m.titulo.toLowerCase().includes(termo)
          ? m.permissoes.filter((p) => `${p.label} ${p.descricao}`.toLowerCase().includes(termo))
          : m.permissoes,
      }))
      .filter((m) => m.permissoes.length > 0);
    const porGrupo = new Map<string, ModuloPermissoes[]>();
    filtrados.forEach((m) => porGrupo.set(m.grupo, [...(porGrupo.get(m.grupo) || []), m]));
    return [...porGrupo.entries()];
  }, [modulos, termo]);

  const alternarRecolhido = (grupo: string) =>
    setRecolhidos((atual) => {
      const proximo = new Set(atual);
      proximo.has(grupo) ? proximo.delete(grupo) : proximo.add(grupo);
      return proximo;
    });

  return (
    <div className="space-y-3 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="flex-1 flex items-center bg-white border border-slate-200 rounded-lg px-2 py-1.5">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Filtrar permissões (ex.: cancelar, NF-e, exportar)..."
            className="w-full px-2 focus:outline-none"
          />
        </div>
        {props.modo === 'usuario' && (
          <div className="flex items-center gap-3 text-[10px] text-slate-500 shrink-0">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded border border-emerald-300 bg-emerald-50" /> Herdada</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-600" /> Permitida</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-600" /> Negada</span>
          </div>
        )}
      </div>

      {grupos.length === 0 && (
        <p className="text-center text-slate-400 py-6">Nenhuma permissão corresponde ao filtro.</p>
      )}

      {grupos.map(([grupo, mods]) => {
        const recolhido = recolhidos.has(grupo) && !termo;
        const total = mods.reduce((n, m) => n + m.permissoes.length, 0);
        const ativas = mods.reduce((n, m) => n + m.permissoes.filter((p) => efetiva(p.chave)).length, 0);
        return (
          <div key={grupo} className="border border-slate-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => alternarRecolhido(grupo)}
              className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5 font-bold text-slate-700 uppercase tracking-wide text-[10px]">
                {recolhido ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {grupo}
              </span>
              <span className="text-[10px] font-semibold text-slate-500">{ativas}/{total}</span>
            </button>

            {!recolhido && (
              <div className="divide-y divide-slate-100">
                {mods.map((modulo) => {
                  const nivel = nivelAtual(modulo);
                  return (
                    <div key={modulo.id} className="px-3 py-2.5 flex flex-col lg:flex-row lg:items-start gap-2">
                      <div className="lg:w-44 shrink-0">
                        <div className="font-semibold text-slate-800">{modulo.titulo}</div>
                        <div className="flex mt-1 rounded-md border border-slate-200 overflow-hidden w-fit">
                          {ATALHOS.map((a) => (
                            <button
                              key={a.id}
                              type="button"
                              disabled={somenteLeitura}
                              onClick={() => aplicarNivel(modulo, a.id)}
                              title={`Aplicar nível "${a.label}" a ${modulo.titulo}`}
                              className={`px-1.5 py-0.5 text-[10px] font-medium transition-colors border-r border-slate-200 last:border-r-0 cursor-pointer disabled:cursor-default ${
                                nivel === a.id ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 hover:bg-slate-100'
                              }`}
                            >
                              {a.label}
                            </button>
                          ))}
                        </div>
                        {nivel === null && <div className="text-[10px] text-amber-600 mt-0.5">Personalizado</div>}
                      </div>

                      <div className="flex-1 flex flex-wrap gap-1.5">
                        {modulo.permissoes.map((p) => {
                          const ativa = efetiva(p.chave);
                          const concedida = props.modo === 'usuario' && props.concedidas.has(p.chave);
                          const negada = props.modo === 'usuario' && props.negadas.has(p.chave);
                          const estilo = negada
                            ? 'bg-rose-600 border-rose-600 text-white'
                            : concedida || (props.modo === 'perfil' && ativa)
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : ativa
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300';
                          const estado = negada ? 'negada para este usuário' : concedida ? 'concedida para este usuário' : ativa ? 'liberada' : 'bloqueada';
                          return (
                            <button
                              key={p.chave}
                              type="button"
                              onClick={() => clicar(p.chave)}
                              disabled={somenteLeitura}
                              title={`${p.descricao} — ${estado}`}
                              aria-pressed={ativa}
                              className={`flex items-center gap-1 px-2 py-1 rounded-md border text-[11px] font-medium transition-colors cursor-pointer disabled:cursor-default ${estilo}`}
                            >
                              {negada ? <Ban className="w-3 h-3" /> : concedida ? <Plus className="w-3 h-3" /> : ativa ? <Check className="w-3 h-3" /> : <span className="w-3 h-3 rounded-sm border border-slate-300" />}
                              {p.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
