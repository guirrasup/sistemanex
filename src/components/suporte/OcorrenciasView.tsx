// src/components/suporte/OcorrenciasView.tsx
// Ocorrências do programa beta (somente ADMIN): lista, detalhe com captura de
// tela + log técnico, e mudança de status do atendimento.
import React, { useCallback, useEffect, useState } from 'react';
import { Bug, ExternalLink, RefreshCw, X } from 'lucide-react';
import api from '../../services/api';
import { getApiErrorMessage } from '../../utils/apiError';
import { useToast } from '../../hooks/useToast';
import { CabecalhoPagina } from '../ui/CabecalhoPagina';

type Status = 'ABERTA' | 'EM_ANALISE' | 'RESOLVIDA' | 'DESCARTADA';

interface OcorrenciaResumo {
  id: string;
  tipo: string;
  gravidade: string;
  titulo: string;
  status: Status;
  tela: string | null;
  usuarioNome: string;
  usuarioEmail: string;
  createdAt: string;
}

interface OcorrenciaDetalhe extends OcorrenciaResumo {
  descricao: string;
  url: string | null;
  navegador: string | null;
  resolucao: string | null;
  versaoApp: string | null;
  screenshot: string | null;
  consoleLog: Array<{ nivel: string; quando: string; mensagem: string }> | null;
}

const STATUS: Record<Status, { rotulo: string; classe: string }> = {
  ABERTA: { rotulo: 'Aberta', classe: 'bg-nf-pendente-bg text-nf-pendente' },
  EM_ANALISE: { rotulo: 'Em análise', classe: 'bg-brand-50 text-brand-800' },
  RESOLVIDA: { rotulo: 'Resolvida', classe: 'bg-nf-autorizada-bg text-nf-autorizada' },
  DESCARTADA: { rotulo: 'Descartada', classe: 'bg-nf-cancelada-bg text-nf-cancelada' },
};
const TIPO: Record<string, string> = { ERRO: 'Erro', MELHORIA: 'Sugestão', DUVIDA: 'Dúvida' };
const GRAVIDADE: Record<string, string> = { BAIXA: 'Baixa', MEDIA: 'Média', ALTA: 'Alta', CRITICA: 'Crítica' };

const dataHora = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export const OcorrenciasView: React.FC = () => {
  const toast = useToast();
  const [lista, setLista] = useState<OcorrenciaResumo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState<Status | 'TODAS'>('TODAS');
  const [detalhe, setDetalhe] = useState<OcorrenciaDetalhe | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const { data } = await api.get('/ocorrencias', { params: filtro === 'TODAS' ? {} : { status: filtro } });
      setLista(data.dados ?? []);
    } catch (e) {
      toast.showError(getApiErrorMessage(e, 'Não foi possível carregar as ocorrências.'));
    } finally {
      setCarregando(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtro]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const abrir = async (id: string) => {
    try {
      const { data } = await api.get(`/ocorrencias/${id}`);
      setDetalhe(data.dados);
    } catch (e) {
      toast.showError(getApiErrorMessage(e, 'Não foi possível abrir a ocorrência.'));
    }
  };

  const mudarStatus = async (status: Status) => {
    if (!detalhe) return;
    try {
      await api.patch(`/ocorrencias/${detalhe.id}/status`, { status });
      setDetalhe({ ...detalhe, status });
      setLista((l) => l.map((o) => (o.id === detalhe.id ? { ...o, status } : o)));
    } catch (e) {
      toast.showError(getApiErrorMessage(e, 'Não foi possível alterar o status.'));
    }
  };

  const abertas = lista.filter((o) => o.status === 'ABERTA').length;

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <CabecalhoPagina
        icone={Bug}
        titulo="Ocorrências do beta"
        contagem={`${abertas} abertas`}
        descricao="Problemas e sugestões enviados pelo botão “Reportar problema”, com captura de tela e log técnico."
        acoes={
          <button
            onClick={carregar}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-2 text-xs font-medium text-ink-700 hover:border-ink-300 hover:bg-ink-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${carregando ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        }
      />

      <div className="flex h-9 w-fit items-center rounded-lg bg-ink-100 p-0.5 text-xs font-medium">
        {(['TODAS', 'ABERTA', 'EM_ANALISE', 'RESOLVIDA', 'DESCARTADA'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFiltro(s)}
            className={`h-8 cursor-pointer rounded-md px-3 transition-colors ${filtro === s ? 'bg-white text-ink-950 shadow-card' : 'text-ink-500 hover:text-ink-800'}`}
          >
            {s === 'TODAS' ? 'Todas' : STATUS[s].rotulo}
          </button>
        ))}
      </div>

      <section className="overflow-hidden rounded-xl border border-ink-200/80 bg-white shadow-card">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-ink-50 text-[10.5px] uppercase tracking-[0.06em] text-ink-500">
            <tr>
              <th className="px-4 py-2.5 font-semibold">Aberta em</th>
              <th className="px-4 py-2.5 font-semibold">Título</th>
              <th className="px-4 py-2.5 font-semibold">Usuário</th>
              <th className="px-4 py-2.5 font-semibold">Tela</th>
              <th className="px-4 py-2.5 font-semibold">Tipo · gravidade</th>
              <th className="px-4 py-2.5 font-semibold">Situação</th>
            </tr>
          </thead>
          <tbody>
            {!carregando && lista.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-14 text-center text-sm text-ink-400">
                  Nenhuma ocorrência {filtro !== 'TODAS' ? 'com essa situação' : 'registrada ainda'}.
                </td>
              </tr>
            )}
            {lista.map((o) => (
              <tr key={o.id} onClick={() => abrir(o.id)} className="cursor-pointer border-t border-ink-100 transition-colors hover:bg-ink-50/70">
                <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-ink-600">{dataHora(o.createdAt)}</td>
                <td className="max-w-[340px] truncate px-4 py-2.5 font-medium text-ink-900">{o.titulo}</td>
                <td className="px-4 py-2.5 text-ink-700">
                  {o.usuarioNome}
                  <div className="text-[11px] text-ink-400">{o.usuarioEmail}</div>
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-ink-500">{o.tela ?? '—'}</td>
                <td className="whitespace-nowrap px-4 py-2.5 text-xs text-ink-600">
                  {TIPO[o.tipo] ?? o.tipo} · {GRAVIDADE[o.gravidade] ?? o.gravidade}
                </td>
                <td className="px-4 py-2.5">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS[o.status]?.classe}`}>{STATUS[o.status]?.rotulo ?? o.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Detalhe */}
      {detalhe && (
        <div className="fixed inset-0 z-[70] flex justify-end bg-ink-950/30 backdrop-blur-[2px]" onMouseDown={() => setDetalhe(null)}>
          <aside onMouseDown={(e) => e.stopPropagation()} className="flex h-full w-full max-w-3xl flex-col overflow-hidden border-l border-ink-200 bg-white shadow-float">
            <header className="flex items-start justify-between gap-3 border-b border-ink-100 px-5 py-4">
              <div className="min-w-0">
                <p className="font-mono text-[11px] text-ink-400">
                  {dataHora(detalhe.createdAt)} · {TIPO[detalhe.tipo] ?? detalhe.tipo} · {GRAVIDADE[detalhe.gravidade] ?? detalhe.gravidade}
                </p>
                <h2 className="mt-0.5 font-display text-lg font-bold text-ink-950">{detalhe.titulo}</h2>
                <p className="text-xs text-ink-500">
                  {detalhe.usuarioNome} · {detalhe.usuarioEmail}
                </p>
              </div>
              <button onClick={() => setDetalhe(null)} className="cursor-pointer rounded-md p-1.5 text-ink-400 hover:bg-ink-100" aria-label="Fechar">
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4 text-sm">
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(STATUS) as Status[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => mudarStatus(s)}
                    className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      detalhe.status === s ? `${STATUS[s].classe} border-transparent` : 'border-ink-200 text-ink-600 hover:bg-ink-50'
                    }`}
                  >
                    {STATUS[s].rotulo}
                  </button>
                ))}
              </div>

              <p className="whitespace-pre-wrap rounded-lg bg-ink-50 p-3 text-ink-800">{detalhe.descricao}</p>

              {detalhe.screenshot ? (
                <a href={detalhe.screenshot} target="_blank" rel="noreferrer" className="group block overflow-hidden rounded-lg border border-ink-200">
                  <img src={detalhe.screenshot} alt="Captura enviada com a ocorrência" className="w-full" />
                  <span className="flex items-center gap-1 border-t border-ink-100 px-3 py-1.5 text-[11px] text-ink-500 group-hover:text-brand-700">
                    <ExternalLink className="h-3 w-3" /> Abrir em tamanho real
                  </span>
                </a>
              ) : (
                <p className="text-xs text-ink-400">Enviada sem captura de tela.</p>
              )}

              <dl className="grid grid-cols-1 gap-x-4 gap-y-1.5 rounded-lg border border-ink-200 p-3 text-xs sm:grid-cols-2">
                {[
                  ['Tela', detalhe.tela],
                  ['Resolução', detalhe.resolucao],
                  ['Versão', detalhe.versaoApp],
                  ['URL', detalhe.url],
                  ['Navegador', detalhe.navegador],
                ].map(([r, v]) => (
                  <div key={r} className={r === 'Navegador' || r === 'URL' ? 'sm:col-span-2' : ''}>
                    <dt className="text-ink-400">{r}</dt>
                    <dd className="break-all font-mono text-ink-800">{v || '—'}</dd>
                  </div>
                ))}
              </dl>

              <div>
                <p className="mb-1 text-xs font-medium text-ink-700">Log técnico ({detalhe.consoleLog?.length ?? 0} eventos)</p>
                <pre className="max-h-80 overflow-auto rounded-lg border border-ink-200 bg-ink-50 p-3 font-mono text-[11px] leading-relaxed text-ink-700">
                  {detalhe.consoleLog?.length
                    ? detalhe.consoleLog.map((l) => `${l.quando.replace('T', ' ').slice(0, 19)} [${l.nivel}] ${l.mensagem}`).join('\n')
                    : 'Sem eventos.'}
                </pre>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};
