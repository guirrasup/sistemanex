// src/components/config/AparenciaView.tsx
// Configurações → Aparência: cor principal, fundo, fontes, tamanho e cantos.
// Cada escolha é aplicada ao vivo no sistema inteiro; "Salvar" grava neste
// navegador, "Descartar" volta ao que estava salvo.
import React, { useEffect, useRef, useState } from 'react';
import { Check, RotateCcw, Save } from 'lucide-react';
import {
  CORES_PREDEFINIDAS,
  FONTES,
  FUNDOS,
  TEMA_PADRAO,
  Tema,
  aplicarTema,
  carregarTema,
  escalaDaCor,
  hexValido,
  salvarTema,
  type FonteId,
} from '../../utils/tema';
import { useToast } from '../../hooks/useToast';

const Secao: React.FC<{ titulo: string; descricao: string; children: React.ReactNode }> = ({ titulo, descricao, children }) => (
  <section className="grid grid-cols-1 gap-4 border-t border-ink-200/70 py-6 first:border-t-0 first:pt-0 md:grid-cols-3">
    <div>
      <h3 className="text-sm font-semibold text-ink-950">{titulo}</h3>
      <p className="mt-1 text-xs leading-relaxed text-ink-500">{descricao}</p>
    </div>
    <div className="md:col-span-2">{children}</div>
  </section>
);

const Opcao: React.FC<{ ativo: boolean; onClick: () => void; children: React.ReactNode; className?: string }> = ({ ativo, onClick, children, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={ativo}
    className={`relative cursor-pointer rounded-xl border p-3 text-left transition-colors ${
      ativo ? 'border-brand-700 bg-white shadow-card ring-1 ring-brand-700' : 'border-ink-200 bg-white/60 hover:border-ink-300 hover:bg-white'
    } ${className}`}
  >
    {ativo && (
      <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-brand-700 text-white">
        <Check className="h-3 w-3" />
      </span>
    )}
    {children}
  </button>
);

export const AparenciaView: React.FC = () => {
  const toast = useToast();
  const salvoRef = useRef<Tema>(carregarTema());
  const [tema, setTema] = useState<Tema>(salvoRef.current);
  const [hexDigitado, setHexDigitado] = useState(tema.corPrincipal);
  const alterado = JSON.stringify(tema) !== JSON.stringify(salvoRef.current);

  // Pré-visualização ao vivo no app inteiro.
  useEffect(() => aplicarTema(tema), [tema]);

  // Saiu da tela sem salvar: volta ao tema salvo.
  useEffect(() => () => aplicarTema(carregarTema()), []);

  const mudar = (parcial: Partial<Tema>) => setTema((t) => ({ ...t, ...parcial }));

  const salvar = () => {
    salvarTema(tema);
    salvoRef.current = tema;
    setTema({ ...tema });
    toast.showSuccess('Aparência salva neste navegador.');
  };
  const descartar = () => {
    setTema(salvoRef.current);
    setHexDigitado(salvoRef.current.corPrincipal);
  };
  const restaurarPadrao = () => {
    setTema(TEMA_PADRAO);
    setHexDigitado(TEMA_PADRAO.corPrincipal);
  };

  const escala = escalaDaCor(hexValido(tema.corPrincipal) ? tema.corPrincipal : TEMA_PADRAO.corPrincipal);
  const presetAtivo = CORES_PREDEFINIDAS.find((c) => c.principal.toLowerCase() === tema.corPrincipal.toLowerCase());

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
      <div className="rounded-xl border border-ink-200/80 bg-white p-5 shadow-card sm:p-6 xl:col-span-8">
        <Secao titulo="Cor principal" descricao="Usada em botões, item ativo do menu, valores em destaque e gráficos. A escala de tons é gerada automaticamente.">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {CORES_PREDEFINIDAS.map((c) => (
              <Opcao
                key={c.nome}
                ativo={presetAtivo?.nome === c.nome}
                onClick={() => {
                  mudar({ corPrincipal: c.principal, corDestaque: c.destaque });
                  setHexDigitado(c.principal);
                }}
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 overflow-hidden rounded-lg border border-black/5">
                    <span className="flex-1" style={{ background: c.principal }} />
                    <span className="w-2.5" style={{ background: c.destaque }} />
                  </span>
                  <span className="text-[13px] font-medium text-ink-800">{c.nome}</span>
                </div>
              </Opcao>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-ink-200 bg-ink-50 p-3">
            <label className="flex items-center gap-2 text-xs text-ink-600">
              Personalizada
              <input
                type="color"
                value={hexValido(tema.corPrincipal) ? tema.corPrincipal : '#0B4F45'}
                onChange={(e) => {
                  mudar({ corPrincipal: e.target.value });
                  setHexDigitado(e.target.value.toUpperCase());
                }}
                className="h-8 w-10 cursor-pointer rounded border border-ink-200 bg-white p-0.5"
              />
            </label>
            <input
              value={hexDigitado}
              onChange={(e) => {
                setHexDigitado(e.target.value);
                if (hexValido(e.target.value)) mudar({ corPrincipal: e.target.value });
              }}
              className={`w-28 rounded-lg border bg-white px-2.5 py-1.5 font-mono text-xs uppercase outline-none focus:ring-2 focus:ring-brand-200 ${
                hexValido(hexDigitado) ? 'border-ink-200' : 'border-danger'
              }`}
              aria-label="Cor principal em hexadecimal"
            />
            <label className="flex items-center gap-2 text-xs text-ink-600">
              Destaque
              <input
                type="color"
                value={hexValido(tema.corDestaque) ? tema.corDestaque : '#5ED9A4'}
                onChange={(e) => mudar({ corDestaque: e.target.value })}
                className="h-8 w-10 cursor-pointer rounded border border-ink-200 bg-white p-0.5"
              />
            </label>
            <div className="ml-auto flex overflow-hidden rounded-md border border-ink-200" aria-hidden>
              {['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'].map((p) => (
                <span key={p} className="h-6 w-4" style={{ background: escala[p] }} title={p} />
              ))}
            </div>
          </div>
        </Secao>

        <Secao titulo="Fundo" descricao="O tom dos neutros: fundo do app, bordas e textos secundários.">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {(Object.keys(FUNDOS) as Tema['fundo'][]).map((id) => {
              const f = FUNDOS[id];
              return (
                <Opcao key={id} ativo={tema.fundo === id} onClick={() => mudar({ fundo: id })}>
                  <div className="mb-2.5 flex h-12 overflow-hidden rounded-lg border border-black/5">
                    <span className="w-1/3" style={{ background: f.escala[1] }} />
                    <span className="flex-1 p-1.5" style={{ background: f.escala[0] }}>
                      <span className="block h-1.5 w-3/4 rounded" style={{ background: f.escala[8] }} />
                      <span className="mt-1 block h-1.5 w-1/2 rounded" style={{ background: f.escala[4] }} />
                    </span>
                  </div>
                  <p className="text-[13px] font-medium text-ink-800">{f.nome}</p>
                  <p className="text-[11px] text-ink-500">{f.descricao}</p>
                </Opcao>
              );
            })}
          </div>
        </Secao>

        <Secao titulo="Fontes" descricao="Títulos e números grandes usam a fonte de títulos; o restante da interface usa a fonte de texto.">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {(
              [
                ['fonteTitulos', 'Títulos'],
                ['fonteTexto', 'Texto'],
              ] as const
            ).map(([campo, rotulo]) => (
              <div key={campo}>
                <p className="mb-2 text-xs font-medium text-ink-600">{rotulo}</p>
                <div className="space-y-1.5">
                  {(Object.keys(FONTES) as FonteId[]).map((id) => (
                    <Opcao key={id} ativo={tema[campo] === id} onClick={() => mudar({ [campo]: id } as Partial<Tema>)} className="w-full py-2.5">
                      <span className="text-[15px] text-ink-900" style={{ fontFamily: FONTES[id].pilha, fontWeight: campo === 'fonteTitulos' ? 700 : 400 }}>
                        {FONTES[id].nome}
                      </span>
                      <span className="ml-2 text-xs text-ink-400" style={{ fontFamily: FONTES[id].pilha }}>
                        R$ 1.234,56
                      </span>
                    </Opcao>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Secao>

        <Secao titulo="Tamanho e cantos" descricao="Densidade da interface e o arredondamento de cartões e botões.">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ['compacto', 'Compacto', 'Mais informação por tela'],
                  ['padrao', 'Padrão', 'Equilíbrio'],
                  ['confortavel', 'Confortável', 'Letras maiores'],
                ] as const
              ).map(([id, nome, desc]) => (
                <Opcao key={id} ativo={tema.tamanho === id} onClick={() => mudar({ tamanho: id })}>
                  <p className="text-[13px] font-medium text-ink-800">{nome}</p>
                  <p className="text-[11px] text-ink-500">{desc}</p>
                </Opcao>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ['retos', 'Retos', 2],
                  ['suaves', 'Suaves', 8],
                  ['arredondados', 'Arredondados', 16],
                ] as const
              ).map(([id, nome, raio]) => (
                <Opcao key={id} ativo={tema.cantos === id} onClick={() => mudar({ cantos: id })}>
                  <span className="mb-2 block h-6 w-10 border-2 border-ink-400 bg-ink-50" style={{ borderRadius: raio }} />
                  <p className="text-[13px] font-medium text-ink-800">{nome}</p>
                </Opcao>
              ))}
            </div>
          </div>
        </Secao>
      </div>

      {/* Pré-visualização + ações */}
      <div className="space-y-4 xl:col-span-4">
        <div className="sticky top-4 space-y-4">
          <div className="overflow-hidden rounded-xl border border-ink-200/80 bg-ink-100 shadow-card">
            <p className="px-4 pt-3 text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-500">Pré-visualização</p>
            <div className="flex gap-3 p-4">
              <div className="w-24 space-y-1.5">
                <div className="h-2 w-12 rounded bg-ink-300" />
                <div className="rounded-md border border-ink-200 bg-white px-2 py-1.5 text-[10px] font-medium text-ink-950 shadow-card">
                  <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-brand-700" />
                  Painel
                </div>
                {['NF-e', 'NFS-e', 'Clientes'].map((t) => (
                  <div key={t} className="px-2 text-[10px] text-ink-500">
                    {t}
                  </div>
                ))}
              </div>
              <div className="flex-1 space-y-2 rounded-lg border border-ink-200 bg-white p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-500">Faturamento</p>
                <p className="font-display text-xl font-bold text-brand-700">
                  <span className="mr-1 text-xs text-ink-400">R$</span>90.021,06
                </p>
                <div className="flex h-10 items-end gap-1">
                  {[30, 45, 38, 60, 52, 85].map((h, i) => (
                    <span key={i} className={`flex-1 rounded-t ${i === 5 ? 'bg-brand-700' : 'bg-brand-200'}`} style={{ height: `${h}%` }} />
                  ))}
                </div>
                <button type="button" className="w-full rounded-lg bg-brand-700 py-1.5 text-[11px] font-medium text-white">
                  Emitir NF-e
                </button>
              </div>
            </div>
            <div className="mx-4 mb-4 rounded-lg bg-brand-950 p-3">
              <p className="text-[10px] text-accent-300">Destaque sobre fundo escuro</p>
              <span className="mt-1.5 inline-block rounded-md bg-accent-400 px-2 py-1 text-[10px] font-medium text-brand-950">Acessar o painel</span>
            </div>
          </div>

          <div className="rounded-xl border border-ink-200/80 bg-white p-4 shadow-card">
            <p className="text-xs text-ink-500">
              {alterado ? 'Há alterações não salvas — o sistema já mostra como vai ficar.' : 'Aparência salva neste navegador.'}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={salvar}
                disabled={!alterado}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand-700 px-3.5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Save className="h-4 w-4" />
                Salvar
              </button>
              <button
                type="button"
                onClick={descartar}
                disabled={!alterado}
                className="cursor-pointer rounded-lg border border-ink-200 px-3.5 py-2 text-[13px] font-medium text-ink-700 transition-colors hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Descartar
              </button>
              <button
                type="button"
                onClick={restaurarPadrao}
                className="ml-auto inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-2 text-[13px] text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-800"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Padrão
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
