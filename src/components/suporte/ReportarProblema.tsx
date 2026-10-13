// src/components/suporte/ReportarProblema.tsx
// Programa beta: botão flutuante (canto inferior direito) que abre um ticket de
// suporte já com a captura da tela, o log do console/rede e os dados técnicos.
// Quem abriu e quando é gravado pelo servidor (token), não pelo formulário.
import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bug, Camera, ChevronDown, RefreshCw, Send, Trash2, X } from 'lucide-react';
import api from '../../services/api';
import { obterLog, type EntradaLog } from '../../utils/diagnostico';
import { getApiErrorMessage } from '../../utils/apiError';
import { useToast } from '../../hooks/useToast';

const TIPOS = [
  { id: 'ERRO', rotulo: 'Erro' },
  { id: 'MELHORIA', rotulo: 'Sugestão' },
  { id: 'DUVIDA', rotulo: 'Dúvida' },
] as const;

const GRAVIDADES = [
  { id: 'BAIXA', rotulo: 'Baixa' },
  { id: 'MEDIA', rotulo: 'Média' },
  { id: 'ALTA', rotulo: 'Alta' },
  { id: 'CRITICA', rotulo: 'Impede o trabalho' },
] as const;

const ID_IGNORAR = 'sup-reportar-problema';

// Captura a área visível do app como JPEG reduzido (≤1600px de largura).
async function capturarTela(): Promise<string | null> {
  try {
    const { domToJpeg } = await import('modern-screenshot');
    const largura = window.innerWidth;
    const escala = Math.min(1, 1600 / largura) * Math.min(window.devicePixelRatio || 1, 1.5);
    return await domToJpeg(document.body, {
      width: largura,
      height: window.innerHeight,
      scale: escala,
      quality: 0.72,
      backgroundColor: '#ffffff',
      // não fotografa o próprio botão/formulário
      filter: (no) => !(no instanceof HTMLElement && no.dataset?.ignorarCaptura === 'sim'),
      features: { restoreScrollPosition: true },
    });
  } catch (e) {
    console.warn('Não foi possível capturar a tela para o ticket:', e);
    return null;
  }
}

export const ReportarProblema: React.FC<{ telaAtual: string }> = ({ telaAtual }) => {
  const toast = useToast();
  const [aberto, setAberto] = useState(false);
  const [capturando, setCapturando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [log, setLog] = useState<EntradaLog[]>([]);
  const [verLog, setVerLog] = useState(false);
  const [tipo, setTipo] = useState<(typeof TIPOS)[number]['id']>('ERRO');
  const [gravidade, setGravidade] = useState<(typeof GRAVIDADES)[number]['id']>('MEDIA');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tentou, setTentou] = useState(false);

  useEffect(() => {
    if (!aberto) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && !enviando && setAberto(false);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [aberto, enviando]);

  const abrir = async () => {
    // Captura ANTES de abrir o formulário — a foto é do que o usuário estava vendo.
    setCapturando(true);
    setScreenshot(await capturarTela());
    setLog(obterLog());
    setCapturando(false);
    setTentou(false);
    setAberto(true);
  };

  const recapturar = async () => {
    setAberto(false);
    await new Promise((r) => setTimeout(r, 250));
    setScreenshot(await capturarTela());
    setAberto(true);
  };

  const limpar = () => {
    setTitulo('');
    setDescricao('');
    setTipo('ERRO');
    setGravidade('MEDIA');
    setScreenshot(null);
    setVerLog(false);
  };

  const enviar = async () => {
    setTentou(true);
    if (titulo.trim().length < 3 || !descricao.trim()) return;
    setEnviando(true);
    try {
      await api.post('/ocorrencias', {
        tipo,
        gravidade,
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        tela: telaAtual,
        url: window.location.href,
        navegador: navigator.userAgent,
        resolucao: `${window.innerWidth}×${window.innerHeight} @${window.devicePixelRatio || 1}x`,
        versaoApp: import.meta.env.VITE_APP_VERSION || 'dev',
        screenshot: screenshot ?? undefined,
        consoleLog: log,
      });
      toast.showSuccess('Ocorrência enviada ao suporte. Obrigado por ajudar a melhorar o sistema!');
      setAberto(false);
      limpar();
    } catch (e) {
      toast.showError(getApiErrorMessage(e, 'Não foi possível enviar a ocorrência.'));
    } finally {
      setEnviando(false);
    }
  };

  const erros = log.filter((l) => l.nivel === 'erro' || l.nivel === 'rede').length;
  const campo = (vazio: boolean) =>
    `w-full rounded-lg border bg-white px-3 py-2 text-sm text-ink-950 outline-none transition-colors focus:ring-2 ${
      tentou && vazio ? 'border-danger focus:ring-nf-rejeitada-bg' : 'border-ink-200 focus:border-brand-300 focus:ring-brand-100'
    }`;

  return (
    <div id={ID_IGNORAR} data-ignorar-captura="sim">
      {/* Botão flutuante — canto inferior direito */}
      <button
        type="button"
        onClick={abrir}
        disabled={capturando}
        title="Reportar um problema ou sugestão ao suporte (programa beta)"
        className="group fixed bottom-5 right-5 z-[60] flex h-12 cursor-pointer items-center gap-2 rounded-full bg-brand-700 pl-3.5 pr-4 text-sm font-medium text-white shadow-float transition-all hover:bg-brand-800 disabled:cursor-wait disabled:opacity-80"
      >
        {capturando ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Bug className="h-5 w-5" />}
        <span className="hidden sm:inline">{capturando ? 'Capturando a tela…' : 'Reportar problema'}</span>
        <span className="rounded-full bg-accent-400 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-brand-950">Beta</span>
      </button>

      <AnimatePresence>
        {aberto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-end justify-end bg-ink-950/30 p-0 backdrop-blur-[2px] sm:items-center sm:justify-center sm:p-4"
            onMouseDown={() => !enviando && setAberto(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Reportar problema"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              onMouseDown={(e) => e.stopPropagation()}
              className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border border-ink-200 bg-white shadow-float sm:max-w-2xl sm:rounded-2xl"
            >
              <header className="flex items-start justify-between gap-3 border-b border-ink-100 px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-700 text-white">
                    <Bug className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="font-display text-base font-bold text-ink-950">Reportar problema</h2>
                    <p className="text-xs text-ink-500">Seu usuário, a data e a hora são enviados automaticamente.</p>
                  </div>
                </div>
                <button onClick={() => setAberto(false)} disabled={enviando} className="cursor-pointer rounded-md p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-800" aria-label="Fechar">
                  <X className="h-4 w-4" />
                </button>
              </header>

              <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <p className="mb-1 text-xs font-medium text-ink-600">Tipo</p>
                    <div className="flex rounded-lg bg-ink-100 p-0.5 text-xs font-medium">
                      {TIPOS.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setTipo(t.id)}
                          className={`flex-1 cursor-pointer rounded-md px-2 py-1.5 transition-colors ${tipo === t.id ? 'bg-white text-ink-950 shadow-card' : 'text-ink-500 hover:text-ink-800'}`}
                        >
                          {t.rotulo}
                        </button>
                      ))}
                    </div>
                  </div>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-ink-600">Gravidade</span>
                    <select value={gravidade} onChange={(e) => setGravidade(e.target.value as typeof gravidade)} className={campo(false)}>
                      {GRAVIDADES.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.rotulo}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-ink-600">
                    Título <span className="text-danger">*</span>
                  </span>
                  <input
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    maxLength={140}
                    placeholder="Ex.: Erro ao emitir NF-e com desconto"
                    className={campo(titulo.trim().length < 3)}
                    autoFocus
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-ink-600">
                    O que aconteceu? <span className="text-danger">*</span>
                  </span>
                  <textarea
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    rows={4}
                    maxLength={5000}
                    placeholder="O que você fez, o que esperava e o que aconteceu."
                    className={`${campo(!descricao.trim())} resize-y`}
                  />
                </label>

                {/* Captura da tela */}
                <section className="rounded-xl border border-ink-200">
                  <header className="flex items-center justify-between border-b border-ink-100 px-3 py-2">
                    <p className="flex items-center gap-1.5 text-xs font-medium text-ink-700">
                      <Camera className="h-3.5 w-3.5 text-ink-400" />
                      Captura da tela
                    </p>
                    <div className="flex gap-1">
                      <button type="button" onClick={recapturar} className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-[11px] text-ink-600 hover:bg-ink-50">
                        <RefreshCw className="h-3 w-3" /> Capturar de novo
                      </button>
                      {screenshot && (
                        <button type="button" onClick={() => setScreenshot(null)} className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-[11px] text-ink-600 hover:bg-ink-50">
                          <Trash2 className="h-3 w-3" /> Não enviar
                        </button>
                      )}
                    </div>
                  </header>
                  {screenshot ? (
                    <img src={screenshot} alt="Captura da tela que será enviada" className="max-h-56 w-full bg-ink-50 object-contain" />
                  ) : (
                    <p className="px-3 py-6 text-center text-xs text-ink-400">Sem captura — o ticket segue só com o texto e o log.</p>
                  )}
                </section>

                {/* Log técnico */}
                <section className="rounded-xl border border-ink-200">
                  <button type="button" onClick={() => setVerLog((v) => !v)} className="flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left">
                    <span className="text-xs font-medium text-ink-700">
                      Log técnico anexado <span className="font-mono text-ink-400">({log.length} eventos{erros ? ` · ${erros} erros` : ''})</span>
                    </span>
                    <ChevronDown className={`h-3.5 w-3.5 text-ink-400 transition-transform ${verLog ? 'rotate-180' : ''}`} />
                  </button>
                  {verLog && (
                    <pre className="max-h-48 overflow-auto border-t border-ink-100 bg-ink-50 px-3 py-2 font-mono text-[10.5px] leading-relaxed text-ink-700">
                      {log.length
                        ? log
                            .slice(-60)
                            .map((l) => `${l.quando.slice(11, 19)} [${l.nivel}] ${l.mensagem}`)
                            .join('\n')
                        : 'Nenhum evento registrado.'}
                    </pre>
                  )}
                  <p className="border-t border-ink-100 px-3 py-1.5 text-[10.5px] text-ink-400">
                    Tela: <span className="font-mono">{telaAtual}</span> · senhas e tokens são mascarados.
                  </p>
                </section>
              </div>

              <footer className="flex items-center justify-between gap-3 border-t border-ink-100 bg-ink-50/60 px-5 py-3">
                <p className="hidden text-[11px] text-ink-400 sm:block">O suporte recebe tudo isso junto com o seu relato.</p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setAberto(false)} disabled={enviando} className="cursor-pointer rounded-lg border border-ink-200 bg-white px-3.5 py-2 text-[13px] font-medium text-ink-700 hover:bg-ink-50">
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={enviar}
                    disabled={enviando}
                    className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-[13px] font-semibold text-white shadow-card hover:bg-brand-800 disabled:opacity-60"
                  >
                    {enviando ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {enviando ? 'Enviando…' : 'Enviar ao suporte'}
                  </button>
                </div>
              </footer>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

