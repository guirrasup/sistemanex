// src/components/fiscal/DanfceViewer.tsx
import React, { useEffect, useState } from 'react';
import { Printer, Download, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { ConfiguracaoEmpresa } from '../../types/erp';
import { nfceService } from '../../services/nfce.service';
import { getApiErrorMessage } from '../../utils/apiError';
import { DanfceLayout } from './DanfceLayout';

interface DanfceViewerProps {
  /** Busca sempre o registro completo pelo id — a resposta bruta da API já
   *  bate quase 1:1 com o que a DANFCE precisa (NFC-e usa nomes de campo
   *  amigáveis no schema, ao contrário de NF-e/CT-e), só falta coerção de
   *  Decimal-string e o emitente (empresa) não vem incluso em toda consulta. */
  nfceId: string;
  empresa: ConfiguracaoEmpresa;
  onBack: () => void;
}

interface ItemNfceRaw {
  id: string;
  descricao: string;
  quantidade: number | string;
  valorUnitario: number | string;
  valorTotalBruto: number | string;
}

interface NfceDetalheRaw {
  id: string;
  numero: number;
  serie: number;
  dataHoraEmissao: string;
  chaveAcesso: string;
  protocoloAutorizacao?: string | null;
  urlQrCode?: string | null;
  xmlAssinado: string;
  consumidorCpfCnpj?: string | null;
  consumidorNome?: string | null;
  itens?: ItemNfceRaw[] | null;
  valorTotalProdutos: number | string;
  valorTotalDesconto: number | string;
  valorTotalNota: number | string;
  valorPago: number | string;
  valorTroco: number | string;
  valorTotalTributosAprox: number | string;
  formaPagamento: string;
}

const num = (v: unknown): number => {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
};

export const DanfceViewer: React.FC<DanfceViewerProps> = ({ nfceId, empresa, onBack }) => {
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [nfceRaw, setNfceRaw] = useState<NfceDetalheRaw | null>(null);

  useEffect(() => {
    let cancelado = false;
    setCarregando(true);
    setErro(null);
    nfceService.buscarPorId(nfceId)
      .then((resposta) => {
        if (!cancelado) setNfceRaw(resposta as unknown as NfceDetalheRaw);
      })
      .catch((error: unknown) => {
        if (!cancelado) setErro(getApiErrorMessage(error, 'Erro ao carregar a NFC-e'));
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });
    return () => { cancelado = true; };
  }, [nfceId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadXml = () => {
    if (!nfceRaw?.xmlAssinado) return;
    const blob = new Blob([nfceRaw.xmlAssinado], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NFCe_${nfceRaw.numero}_${nfceRaw.chaveAcesso.slice(-8)}.xml`;
    a.click();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
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
            disabled={!nfceRaw}
            className="bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 font-medium text-xs px-3 py-1.5 rounded border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar XML</span>
          </button>

          <button
            onClick={handlePrint}
            disabled={!nfceRaw}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-xs px-3.5 py-1.5 rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Cupom NFC-e</span>
          </button>
        </div>
      </div>

      {carregando && (
        <div className="bg-white rounded-lg border border-slate-300 p-12 flex flex-col items-center gap-3 max-w-md mx-auto">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          <p className="text-sm text-slate-500">Carregando dados da NFC-e...</p>
        </div>
      )}

      {!carregando && erro && (
        <div className="bg-white rounded-lg border border-slate-300 p-12 flex flex-col items-center gap-3 text-center max-w-md mx-auto">
          <AlertCircle className="w-8 h-8 text-rose-600" />
          <p className="text-sm text-rose-700 font-medium">{erro}</p>
        </div>
      )}

      {!carregando && !erro && nfceRaw && (
        <DanfceLayout
          numero={nfceRaw.numero}
          serie={nfceRaw.serie}
          dataHoraEmissao={nfceRaw.dataHoraEmissao}
          chaveAcesso={nfceRaw.chaveAcesso}
          protocoloAutorizacao={nfceRaw.protocoloAutorizacao || undefined}
          urlQrCode={nfceRaw.urlQrCode || undefined}
          emitente={{
            razaoSocial: empresa.razaoSocial,
            nomeFantasia: empresa.nomeFantasia,
            cnpj: empresa.cnpj,
            inscricaoEstadual: empresa.inscricaoEstadual,
            endereco: empresa.endereco,
          }}
          consumidor={nfceRaw.consumidorCpfCnpj ? {
            cpfCnpj: nfceRaw.consumidorCpfCnpj,
            nomeRazaoSocial: nfceRaw.consumidorNome || undefined,
          } : null}
          itens={(nfceRaw.itens || []).map((it) => ({
            id: it.id,
            descricao: it.descricao,
            quantidade: num(it.quantidade),
            valorUnitario: num(it.valorUnitario),
            valorTotalBruto: num(it.valorTotalBruto),
          }))}
          valorTotalProdutos={num(nfceRaw.valorTotalProdutos)}
          valorTotalDesconto={num(nfceRaw.valorTotalDesconto)}
          valorTotalNota={num(nfceRaw.valorTotalNota)}
          valorPago={num(nfceRaw.valorPago)}
          valorTroco={num(nfceRaw.valorTroco)}
          valorTotalTributosAprox={num(nfceRaw.valorTotalTributosAprox)}
          formaPagamento={nfceRaw.formaPagamento}
        />
      )}
    </div>
  );
};
