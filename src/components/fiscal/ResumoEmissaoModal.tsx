// src/components/fiscal/ResumoEmissaoModal.tsx
// Substitui o toast de "emitido com sucesso" por um resumo real da emissão —
// mostra o que a SEFAZ efetivamente retornou (protocolo/motivo de rejeição),
// permite visualizar o documento e enviar o XML por e-mail (ex.: pro contador).
import React, { useState } from 'react';
import { CheckCircle2, XCircle, Clock, Eye, Mail, X, Loader2, Send, Copy, Check } from 'lucide-react';
import { formatarMoeda } from '../../utils/cpfCnpjValidator';

export type StatusEmissaoModal = 'AUTORIZADA' | 'REJEITADA' | 'PROCESSANDO';

interface ResumoEmissaoModalProps {
  aberto: boolean;
  onClose: () => void;
  status: StatusEmissaoModal;
  tipoDocumentoLabel: string; // "NF-e", "NFC-e", etc.
  numero: number;
  serie: number;
  chaveAcesso: string;
  protocolo?: string;
  motivoRejeicao?: string;
  valorTotal: number;
  destinatarioNome?: string;
  emailSugerido?: string;
  onVisualizar: () => void;
  onEnviarEmail: (email: string) => Promise<void>;
}

const estiloPorStatus: Record<StatusEmissaoModal, { icon: React.ReactNode; iconBg: string; corTexto: string; titulo: string }> = {
  AUTORIZADA: {
    icon: <CheckCircle2 className="w-8 h-8 text-emerald-600" />,
    iconBg: 'bg-emerald-100 border-emerald-200',
    corTexto: 'text-emerald-800',
    titulo: 'autorizada pela SEFAZ',
  },
  REJEITADA: {
    icon: <XCircle className="w-8 h-8 text-rose-600" />,
    iconBg: 'bg-rose-100 border-rose-200',
    corTexto: 'text-rose-800',
    titulo: 'rejeitada pela SEFAZ',
  },
  PROCESSANDO: {
    icon: <Clock className="w-8 h-8 text-amber-600" />,
    iconBg: 'bg-amber-100 border-amber-200',
    corTexto: 'text-amber-800',
    titulo: 'em processamento na SEFAZ',
  },
};

export const ResumoEmissaoModal: React.FC<ResumoEmissaoModalProps> = ({
  aberto,
  onClose,
  status,
  tipoDocumentoLabel,
  numero,
  serie,
  chaveAcesso,
  protocolo,
  motivoRejeicao,
  valorTotal,
  destinatarioNome,
  emailSugerido,
  onVisualizar,
  onEnviarEmail,
}) => {
  const [emailDestino, setEmailDestino] = useState(emailSugerido || '');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [chaveCopiada, setChaveCopiada] = useState(false);

  if (!aberto) return null;

  const estilo = estiloPorStatus[status];

  const handleEnviarEmail = async () => {
    if (!emailDestino.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailDestino)) {
      setErroEnvio('Informe um e-mail válido.');
      return;
    }
    setEnviando(true);
    setErroEnvio(null);
    try {
      await onEnviarEmail(emailDestino.trim());
      setEnviado(true);
    } catch (err: unknown) {
      setErroEnvio(err instanceof Error ? err.message : 'Erro ao enviar e-mail.');
    } finally {
      setEnviando(false);
    }
  };

  const handleCopiarChave = () => {
    navigator.clipboard.writeText(chaveAcesso);
    setChaveCopiada(true);
    setTimeout(() => setChaveCopiada(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 shrink-0 ${estilo.iconBg}`}>
            {estilo.icon}
          </div>
          <div>
            <h3 className={`text-base font-bold ${estilo.corTexto}`}>
              {tipoDocumentoLabel} {estilo.titulo}
            </h3>
            <p className="text-xs text-slate-500">
              Nº {numero} · Série {serie}{destinatarioNome ? ` · ${destinatarioNome}` : ''}
            </p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Valor total</span>
            <span className="font-bold text-slate-900">{formatarMoeda(valorTotal)}</span>
          </div>
          {protocolo && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Protocolo</span>
              <span className="font-mono text-slate-700">{protocolo}</span>
            </div>
          )}
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-500 font-medium shrink-0">Chave de acesso</span>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-mono text-slate-700 truncate">{chaveAcesso}</span>
              <button onClick={handleCopiarChave} className="shrink-0 text-slate-400 hover:text-slate-700 cursor-pointer" title="Copiar chave de acesso">
                {chaveCopiada ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          {motivoRejeicao && (
            <div className="pt-2 border-t border-rose-200">
              <span className="text-rose-700 font-semibold block mb-0.5">Motivo da rejeição:</span>
              <span className="text-rose-600 leading-relaxed">{motivoRejeicao}</span>
            </div>
          )}
        </div>

        <div className="mt-4">
          <button
            onClick={onVisualizar}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>Visualizar Documento</span>
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
            <Mail className="w-3.5 h-3.5" />
            <span>Enviar XML por e-mail</span>
          </label>
          {enviado ? (
            <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>XML enviado para {emailDestino}</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={emailDestino}
                  onChange={(e) => { setEmailDestino(e.target.value); setErroEnvio(null); }}
                  placeholder="email@escritoriocontabil.com.br"
                  className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  onClick={handleEnviarEmail}
                  disabled={enviando}
                  className="shrink-0 flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  {enviando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Enviar</span>
                </button>
              </div>
              {erroEnvio && <p className="text-[11px] text-rose-600 mt-1.5">{erroEnvio}</p>}
              {emailSugerido && (
                <p className="text-[10px] text-slate-400 mt-1.5">Sugerido a partir dos dados do contador cadastrados na empresa.</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
