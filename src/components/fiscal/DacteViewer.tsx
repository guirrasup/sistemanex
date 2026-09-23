// src/components/fiscal/DacteViewer.tsx
import React, { useEffect, useState } from 'react';
import { Printer, Download, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { cteService } from '../../services/cte.service';
import { getApiErrorMessage } from '../../utils/apiError';
import { DacteLayout } from './DacteLayout';

interface DacteViewerProps {
  /** Busca sempre o registro completo pelo id — igual ao padrão já usado em
   *  DanfeViewer/DanfceViewer/DanfseViewer, em vez de confiar num objeto
   *  passado por quem chamou (que podia vir com o shape errado). */
  cteId: string;
  onBack: () => void;
}

interface DacteEnderecoRaw {
  logradouro: string;
  numero: string;
  bairro: string;
  nomeMunicipio: string;
  uf: string;
  cep: string;
}

interface CteDetalheRaw {
  id: string;
  nCT: number;
  serie: number;
  mod: string;
  chaveAcesso?: string | null;
  protocoloAutorizacao?: string | null;
  dhEmi?: string | null;
  CFOP: string;
  natOp: string;
  xMunIni: string;
  UFIni: string;
  xMunFim: string;
  UFFim: string;
  toma: number | string;
  proPred: string;
  vCargaAverb?: number | string | null;
  pICMS00?: number | string | null;
  vBC00?: number | string | null;
  vICMS00?: number | string | null;
  vTPrest: number | string;
  xmlAssinado: string;

  emitente: {
    razaoSocial: string;
    nomeFantasia?: string | null;
    cnpj: string;
    inscricaoEstadual?: string | null;
    endereco: DacteEnderecoRaw;
  };
  remetente?: {
    razaoSocial: string;
    documento: string;
    inscricaoEstadual?: string | null;
    endereco: DacteEnderecoRaw;
  } | null;
  destinatario?: {
    razaoSocial: string;
    documento: string;
    inscricaoEstadual?: string | null;
    endereco: DacteEnderecoRaw;
  } | null;
  transportadora?: {
    razaoSocial: string;
    rntrc?: string | null;
  } | null;
  componentes: { xNome: string; vComp: number | string }[];
  quantidades: { cUnid: string; tpMed: string; qCarga: number | string }[];
  documentos: { tipo: string; chave?: string | null }[];
}

const TOMADOR_POR_CODIGO: Record<string, number> = {
  REMETENTE: 0, EXPEDIDOR: 1, RECEBEDOR: 2, DESTINATARIO: 3, OUTROS: 4,
};

const num = (v: unknown): number => {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
};

const enderecoVazio: DacteEnderecoRaw = { logradouro: '', numero: '', bairro: '', nomeMunicipio: '', uf: '', cep: '' };

export const DacteViewer: React.FC<DacteViewerProps> = ({ cteId, onBack }) => {
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [cteRaw, setCteRaw] = useState<CteDetalheRaw | null>(null);

  useEffect(() => {
    let cancelado = false;
    setCarregando(true);
    setErro(null);
    cteService.buscarPorId(cteId)
      .then((resposta) => {
        if (cancelado) return;
        if (!resposta) {
          setErro('CT-e não encontrado.');
          return;
        }
        setCteRaw(resposta as unknown as CteDetalheRaw);
      })
      .catch((error: unknown) => {
        if (!cancelado) setErro(getApiErrorMessage(error, 'Erro ao carregar o CT-e'));
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });
    return () => { cancelado = true; };
  }, [cteId]);

  const handlePrint = () => window.print();

  const handleDownloadXml = () => {
    if (!cteRaw?.xmlAssinado) return;
    const blob = new Blob([cteRaw.xmlAssinado], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CTe_${cteRaw.nCT}_${(cteRaw.chaveAcesso || '').slice(-8)}.xml`;
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-xs flex items-center justify-between gap-2 print:hidden">
        <button
          onClick={onBack}
          className="text-slate-600 hover:text-slate-900 text-xs font-semibold px-3 py-1.5 rounded hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar para Emissão</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadXml}
            disabled={!cteRaw}
            className="bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 font-medium text-xs px-3 py-1.5 rounded border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar XML</span>
          </button>

          <button
            onClick={handlePrint}
            disabled={!cteRaw}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-xs px-3.5 py-1.5 rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir DACTE</span>
          </button>
        </div>
      </div>

      {carregando && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
          <p className="text-sm text-slate-500">Carregando dados do CT-e...</p>
        </div>
      )}

      {!carregando && erro && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 flex flex-col items-center gap-3 text-center">
          <AlertCircle className="w-8 h-8 text-rose-600" />
          <p className="text-sm text-rose-700 font-medium">{erro}</p>
        </div>
      )}

      {!carregando && !erro && cteRaw && (
        <DacteLayout
          numero={cteRaw.nCT}
          serie={cteRaw.serie}
          modelo={cteRaw.mod}
          chaveAcesso={cteRaw.chaveAcesso || undefined}
          protocoloAutorizacao={cteRaw.protocoloAutorizacao || undefined}
          dataHoraEmissao={cteRaw.dhEmi || undefined}
          cfop={cteRaw.CFOP}
          naturezaOperacao={cteRaw.natOp}
          municipioInicioNome={cteRaw.xMunIni}
          municipioInicioUf={cteRaw.UFIni}
          municipioFimNome={cteRaw.xMunFim}
          municipioFimUf={cteRaw.UFFim}
          tomadorServico={typeof cteRaw.toma === 'string' ? (TOMADOR_POR_CODIGO[cteRaw.toma] ?? 0) : cteRaw.toma}
          emitente={{
            razaoSocial: cteRaw.emitente.razaoSocial,
            nomeFantasia: cteRaw.emitente.nomeFantasia || undefined,
            cnpj: cteRaw.emitente.cnpj,
            inscricaoEstadual: cteRaw.emitente.inscricaoEstadual || undefined,
            endereco: cteRaw.emitente.endereco || enderecoVazio,
          }}
          remetente={{
            razaoSocial: cteRaw.remetente?.razaoSocial || '—',
            documento: cteRaw.remetente?.documento || '',
            inscricaoEstadual: cteRaw.remetente?.inscricaoEstadual || undefined,
            endereco: cteRaw.remetente?.endereco || enderecoVazio,
          }}
          destinatario={{
            razaoSocial: cteRaw.destinatario?.razaoSocial || '—',
            documento: cteRaw.destinatario?.documento || '',
            inscricaoEstadual: cteRaw.destinatario?.inscricaoEstadual || undefined,
            endereco: cteRaw.destinatario?.endereco || enderecoVazio,
          }}
          produtoPredominante={cteRaw.proPred}
          valorCargaAverbada={num(cteRaw.vCargaAverb)}
          quantidades={(cteRaw.quantidades || []).map(q => ({ cUnid: q.cUnid, tpMed: q.tpMed, qCarga: num(q.qCarga) }))}
          documentos={(cteRaw.documentos || []).map(d => ({ tipo: d.tipo, chave: d.chave || undefined }))}
          componentes={(cteRaw.componentes || []).map(c => ({ xNome: c.xNome, vComp: num(c.vComp) }))}
          transportadora={cteRaw.transportadora ? { razaoSocial: cteRaw.transportadora.razaoSocial, rntrc: cteRaw.transportadora.rntrc || undefined } : undefined}
          aliquotaICMS={num(cteRaw.pICMS00)}
          baseCalculoICMS={num(cteRaw.vBC00)}
          valorICMS={num(cteRaw.vICMS00)}
          valorTotalFrete={num(cteRaw.vTPrest)}
        />
      )}
    </div>
  );
};
