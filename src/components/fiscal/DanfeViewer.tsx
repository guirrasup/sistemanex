// src/components/fiscal/DanfeViewer.tsx
import React, { useEffect, useState } from 'react';
import { Printer, Download, X, Receipt, Loader2, AlertCircle } from 'lucide-react';
import { ConfiguracaoEmpresa } from '../../types/erp';
import { nfeService } from '../../services/nfe.service';
import { getApiErrorMessage } from '../../utils/apiError';
import { DanfeLayout, DanfeLayoutProps } from './DanfeLayout';

interface DanfeViewerProps {
  /** Sempre busca o registro completo pelo id — nunca confia num objeto que
   *  o chamador já tenha em mãos: a listagem de NF-e não inclui `empresa`
   *  (só o detalhe por id inclui), e mais de um lugar chama isso com formatos
   *  diferentes (registro cru recém-emitido vs. linha da listagem). Buscar
   *  sempre pelo id garante um único formato de dado, completo, correto. */
  nfeId: string;
  empresa: ConfiguracaoEmpresa;
  onClose: () => void;
}

// Forma real devolvida por GET /api/nfe/:id (NfeRepository.findById) — campos
// crus do Prisma/leiaute SEFAZ (natOp, tpNF, vNF, vBC...), não os nomes
// amigáveis que o protótipo antigo (NFeDocumento) usava. Decimal do Prisma
// chega como string.
interface ItemNfeRaw {
  codigoProduto: string;
  descricao: string;
  ncm: string;
  cstICMS: string;
  cfop: string;
  unidadeMedida: string;
  quantidade: number | string;
  valorUnitario: number | string;
  vProd: number | string;
  vBC?: number | string | null;
  vICMS?: number | string | null;
  pICMS?: number | string | null;
}

interface DuplicataRaw {
  numero: string;
  dataVencimento: string;
  valor: number | string;
}

interface DestinatarioRaw {
  razaoSocial: string;
  documento: string;
  telefone?: string | null;
  inscricaoEstadual?: string | null;
  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string | null;
    bairro: string;
    nomeMunicipio: string;
    uf: string;
    cep: string;
    telefone?: string | null;
  };
}

interface NfeDetalheRaw {
  id: string;
  numero: number;
  serie: number;
  tpNF: string | number;
  natOp: string;
  chaveAcesso: string;
  protocoloAutorizacao?: string | null;
  dataHoraAutorizacao?: string | null;
  xmlAssinado: string;
  infCpl?: string | null;
  vBC: number | string;
  vICMS: number | string;
  vBCST?: number | string | null;
  vST?: number | string | null;
  vProd: number | string;
  vNF: number | string;
  vFrete: number | string;
  vSeg: number | string;
  vDesc: number | string;
  vIPI: number | string;
  vPIS: number | string;
  vCOFINS: number | string;
  destinatario?: DestinatarioRaw | null;
  itens?: ItemNfeRaw[] | null;
  duplicatas?: DuplicataRaw[] | null;
}

const num = (v: unknown): number => {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
};

function mapParaDanfeLayout(nfe: NfeDetalheRaw, empresa: ConfiguracaoEmpresa): DanfeLayoutProps {
  return {
    numero: nfe.numero,
    serie: nfe.serie,
    tipoDocumento: nfe.tpNF,
    naturezaOperacao: nfe.natOp,
    chaveAcesso: nfe.chaveAcesso,
    protocoloAutorizacao: nfe.protocoloAutorizacao || undefined,
    dataHoraAutorizacao: nfe.dataHoraAutorizacao || undefined,
    emitente: {
      razaoSocial: empresa.razaoSocial,
      cnpj: empresa.cnpj,
      inscricaoEstadual: empresa.inscricaoEstadual,
      endereco: empresa.endereco,
    },
    destinatario: {
      nomeRazaoSocial: nfe.destinatario?.razaoSocial || '—',
      documento: nfe.destinatario?.documento || '—',
      telefone: nfe.destinatario?.telefone || nfe.destinatario?.endereco?.telefone || undefined,
      inscricaoEstadual: nfe.destinatario?.inscricaoEstadual || undefined,
      endereco: nfe.destinatario?.endereco || {
        logradouro: '', numero: '', bairro: '', nomeMunicipio: '', uf: '', cep: '',
      },
    },
    duplicatas: (nfe.duplicatas || []).map((d) => ({
      numero: d.numero,
      dataVencimento: d.dataVencimento,
      valor: num(d.valor),
    })),
    itens: (nfe.itens || []).map((it) => ({
      codigoProduto: it.codigoProduto,
      descricao: it.descricao,
      ncm: it.ncm,
      cstICMS: it.cstICMS,
      cfop: it.cfop,
      unidadeMedida: it.unidadeMedida,
      quantidade: num(it.quantidade),
      valorUnitario: num(it.valorUnitario),
      valorTotalBruto: num(it.vProd),
      baseCalculoICMS: num(it.vBC),
      valorICMS: num(it.vICMS),
      aliquotaICMS: num(it.pICMS),
    })),
    totais: {
      baseCalculoICMS: num(nfe.vBC),
      valorTotalICMS: num(nfe.vICMS),
      baseCalculoICMSST: num(nfe.vBCST),
      valorTotalICMSST: num(nfe.vST),
      valorTotalProdutos: num(nfe.vProd),
      valorTotalNota: num(nfe.vNF),
      valorTotalFrete: num(nfe.vFrete),
      valorTotalSeguro: num(nfe.vSeg),
      valorTotalDesconto: num(nfe.vDesc),
      valorTotalIPI: num(nfe.vIPI),
      valorTotalPIS: num(nfe.vPIS),
      valorTotalCOFINS: num(nfe.vCOFINS),
    },
    informacoesAdicionais: nfe.infCpl || undefined,
  };
}

export const DanfeViewer: React.FC<DanfeViewerProps> = ({ nfeId, empresa, onClose }) => {
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [nfeRaw, setNfeRaw] = useState<NfeDetalheRaw | null>(null);

  useEffect(() => {
    let cancelado = false;
    setCarregando(true);
    setErro(null);
    nfeService.buscarPorId(nfeId)
      .then((resposta) => {
        if (!cancelado) setNfeRaw(resposta as unknown as NfeDetalheRaw);
      })
      .catch((error: unknown) => {
        if (!cancelado) setErro(getApiErrorMessage(error, 'Erro ao carregar a NF-e'));
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });
    return () => { cancelado = true; };
  }, [nfeId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadXml = () => {
    if (!nfeRaw?.xmlAssinado) return;
    const blob = new Blob([nfeRaw.xmlAssinado], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NFe_${nfeRaw.numero}_${nfeRaw.chaveAcesso}.xml`;
    link.click();
  };

  const danfeProps = nfeRaw ? mapParaDanfeLayout(nfeRaw, empresa) : null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">

      <div className="bg-slate-900 text-white rounded-t-xl px-6 py-3 flex items-center justify-between max-w-4xl w-full mx-auto print:hidden shadow-lg border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <Receipt className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-sm tracking-wide">
            DANFE - Documento Auxiliar da Nota Fiscal Eletrônica (Mod. 55)
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownloadXml}
            disabled={!nfeRaw}
            className="inline-flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar XML SEFAZ</span>
          </button>

          <button
            onClick={handlePrint}
            disabled={!nfeRaw}
            className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir DANFE</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {carregando && (
        <div className="bg-white rounded-b-xl shadow-2xl max-w-4xl w-full mx-auto p-12 flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-sm text-slate-500">Carregando dados da NF-e...</p>
        </div>
      )}

      {!carregando && erro && (
        <div className="bg-white rounded-b-xl shadow-2xl max-w-4xl w-full mx-auto p-12 flex flex-col items-center gap-3 text-center">
          <AlertCircle className="w-8 h-8 text-rose-600" />
          <p className="text-sm text-rose-700 font-medium">{erro}</p>
        </div>
      )}

      {!carregando && !erro && danfeProps && (
        <div className="shadow-2xl print:shadow-none border border-slate-300 print:border-none">
          <DanfeLayout {...danfeProps} />
        </div>
      )}

    </div>
  );
};
