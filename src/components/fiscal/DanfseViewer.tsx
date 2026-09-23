// src/components/fiscal/DanfseViewer.tsx
import React, { useEffect, useState } from 'react';
import { Printer, Download, X, Loader2, AlertCircle } from 'lucide-react';
import { nfseService } from '../../services/nfse.service';
import { getApiErrorMessage } from '../../utils/apiError';
import { DanfseLayout } from './DanfseLayout';

interface DanfseViewerProps {
  /** Busca sempre o registro completo pelo id. Diferente de NF-e/NFC-e, a
   *  NFS-e grava um retrato completo do prestador e do tomador direto na
   *  própria linha (campos "prestadorX" e "tomadorX") — não depende de uma
   *  prop `empresa` com os dados atuais, mostra exatamente o que foi
   *  autorizado. */
  nfseId: string;
  onClose: () => void;
}

interface NfseDetalheRaw {
  id: string;
  numeroNfse: number;
  serieDPS: number;
  numeroDPS: number;
  codigoVerificacao?: string | null;
  dataCompetencia?: string | null;
  chaveAcesso: string;
  protocoloAutorizacao?: string | null;
  xmlAssinado: string;

  prestadorRazaoSocial: string;
  prestadorNomeFantasia?: string | null;
  prestadorCnpj: string;
  prestadorInscricaoMunicipal?: string | null;
  prestadorOptanteSimples?: boolean;
  prestadorLogradouro: string;
  prestadorNumero: string;
  prestadorComplemento?: string | null;
  prestadorBairro: string;
  prestadorNomeMunicipio: string;
  prestadorUf: string;
  prestadorCep: string;
  prestadorEmail?: string | null;

  tomadorRazaoSocial: string;
  tomadorDocumento: string;
  tomadorInscricaoMunicipal?: string | null;
  tomadorTelefone?: string | null;
  tomadorEmail?: string | null;
  tomadorLogradouro: string;
  tomadorNumero: string;
  tomadorComplemento?: string | null;
  tomadorBairro: string;
  tomadorNomeMunicipio: string;
  tomadorUf: string;
  tomadorCep: string;

  descricaoServico: string;
  codigoTributacaoNacional: string;
  codigoNBS?: string | null;
  localPrestacaoNomeMunicipio: string;
  localPrestacaoUf: string;
  localPrestacaoCodigoMunicipio?: string | null;

  valorTotalServicos: number | string;
  valorTotalDeducoes: number | string;
  valorTotalDescontos: number | string;
  baseCalculoISS: number | string;
  aliquotaISS: number | string;
  valorTotalISS: number | string;
  valorPIS: number | string;
  valorCOFINS: number | string;
  valorIRRF: number | string;
  valorCSLL: number | string;
  valorINSS: number | string;
  valorCBS: number | string;
  valorIBSUF: number | string;
  valorIBSMun: number | string;
  valorTotalIBS: number | string;
  valorLiquidoNfse: number | string;
  valorTotalISSRetido: number | string;
  informacoesComplementares?: string | null;
}

const num = (v: unknown): number => {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
};

export const DanfseViewer: React.FC<DanfseViewerProps> = ({ nfseId, onClose }) => {
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [nfseRaw, setNfseRaw] = useState<NfseDetalheRaw | null>(null);

  useEffect(() => {
    let cancelado = false;
    setCarregando(true);
    setErro(null);
    nfseService.buscarPorId(nfseId)
      .then((resposta) => {
        if (cancelado) return;
        if (!resposta) {
          setErro('NFS-e não encontrada.');
          return;
        }
        setNfseRaw(resposta as unknown as NfseDetalheRaw);
      })
      .catch((error: unknown) => {
        if (!cancelado) setErro(getApiErrorMessage(error, 'Erro ao carregar a NFS-e'));
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });
    return () => { cancelado = true; };
  }, [nfseId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadXml = () => {
    if (!nfseRaw?.xmlAssinado) return;
    const blob = new Blob([nfseRaw.xmlAssinado], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NFSe_Nacional_${nfseRaw.numeroNfse}_${nfseRaw.chaveAcesso.slice(0, 10)}.xml`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">

      <div className="bg-slate-900 text-white rounded-t-xl px-6 py-3 flex items-center justify-between max-w-4xl w-full mx-auto print:hidden shadow-lg border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <span className="font-bold text-sm tracking-wide">
            DANFSe - Documento Auxiliar da NFS-e Nacional (v1.01)
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownloadXml}
            disabled={!nfseRaw}
            className="inline-flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar XML</span>
          </button>

          <button
            onClick={handlePrint}
            disabled={!nfseRaw}
            className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir / PDF</span>
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
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm text-slate-500">Carregando dados da NFS-e...</p>
        </div>
      )}

      {!carregando && erro && (
        <div className="bg-white rounded-b-xl shadow-2xl max-w-4xl w-full mx-auto p-12 flex flex-col items-center gap-3 text-center">
          <AlertCircle className="w-8 h-8 text-rose-600" />
          <p className="text-sm text-rose-700 font-medium">{erro}</p>
        </div>
      )}

      {!carregando && !erro && nfseRaw && (
        <div className="shadow-2xl print:shadow-none border border-slate-300 print:border-none">
          <DanfseLayout
            numeroNfse={nfseRaw.numeroNfse}
            serieDPS={nfseRaw.serieDPS}
            numeroDPS={nfseRaw.numeroDPS}
            codigoVerificacao={nfseRaw.codigoVerificacao || undefined}
            dataCompetencia={nfseRaw.dataCompetencia || undefined}
            chaveAcesso={nfseRaw.chaveAcesso}
            protocoloAutorizacao={nfseRaw.protocoloAutorizacao || undefined}
            prestador={{
              razaoSocial: nfseRaw.prestadorRazaoSocial,
              nomeFantasia: nfseRaw.prestadorNomeFantasia || undefined,
              cnpj: nfseRaw.prestadorCnpj,
              inscricaoMunicipal: nfseRaw.prestadorInscricaoMunicipal || undefined,
              optanteSimplesNacional: nfseRaw.prestadorOptanteSimples,
              endereco: {
                logradouro: nfseRaw.prestadorLogradouro,
                numero: nfseRaw.prestadorNumero,
                complemento: nfseRaw.prestadorComplemento || undefined,
                bairro: nfseRaw.prestadorBairro,
                nomeMunicipio: nfseRaw.prestadorNomeMunicipio,
                uf: nfseRaw.prestadorUf,
                cep: nfseRaw.prestadorCep,
                email: nfseRaw.prestadorEmail || undefined,
              },
            }}
            tomador={{
              nomeRazaoSocial: nfseRaw.tomadorRazaoSocial,
              documento: nfseRaw.tomadorDocumento,
              inscricaoMunicipal: nfseRaw.tomadorInscricaoMunicipal || undefined,
              telefone: nfseRaw.tomadorTelefone || undefined,
              email: nfseRaw.tomadorEmail || undefined,
              endereco: {
                logradouro: nfseRaw.tomadorLogradouro,
                numero: nfseRaw.tomadorNumero,
                complemento: nfseRaw.tomadorComplemento || undefined,
                bairro: nfseRaw.tomadorBairro,
                nomeMunicipio: nfseRaw.tomadorNomeMunicipio,
                uf: nfseRaw.tomadorUf,
                cep: nfseRaw.tomadorCep,
              },
            }}
            descricaoServico={nfseRaw.descricaoServico}
            codigoTributacaoNacional={nfseRaw.codigoTributacaoNacional}
            codigoNBS={nfseRaw.codigoNBS || undefined}
            localPrestacaoNomeMunicipio={nfseRaw.localPrestacaoNomeMunicipio}
            localPrestacaoUf={nfseRaw.localPrestacaoUf}
            localPrestacaoCodigoMunicipio={nfseRaw.localPrestacaoCodigoMunicipio || undefined}
            valorTotalServicos={num(nfseRaw.valorTotalServicos)}
            valorTotalDeducoes={num(nfseRaw.valorTotalDeducoes)}
            valorTotalDescontos={num(nfseRaw.valorTotalDescontos)}
            baseCalculoISS={num(nfseRaw.baseCalculoISS)}
            aliquotaISS={num(nfseRaw.aliquotaISS)}
            valorTotalISS={num(nfseRaw.valorTotalISS)}
            valorPIS={num(nfseRaw.valorPIS)}
            valorCOFINS={num(nfseRaw.valorCOFINS)}
            valorIRRF={num(nfseRaw.valorIRRF)}
            valorCSLL={num(nfseRaw.valorCSLL)}
            valorINSS={num(nfseRaw.valorINSS)}
            valorCBS={num(nfseRaw.valorCBS)}
            valorIBSUF={num(nfseRaw.valorIBSUF)}
            valorIBSMun={num(nfseRaw.valorIBSMun)}
            valorTotalIBS={num(nfseRaw.valorTotalIBS)}
            valorLiquidoNfse={num(nfseRaw.valorLiquidoNfse)}
            valorTotalISSRetido={num(nfseRaw.valorTotalISSRetido)}
            informacoesComplementares={nfseRaw.informacoesComplementares || undefined}
          />
        </div>
      )}

    </div>
  );
};
