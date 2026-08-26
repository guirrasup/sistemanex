import React from 'react';
import { 
  Printer, 
  Download, 
  ArrowLeft, 
  QrCode, 
  FileCheck, 
  Barcode, 
  CheckCircle2 
} from 'lucide-react';
import { NFAeDocumento } from '../../types/fiscal';
import { formatarCpfCnpj } from '../../utils/cpfCnpjValidator';

interface DanfaeViewerProps {
  nfae: NFAeDocumento;
  onBack: () => void;
}

export const DanfaeViewer: React.FC<DanfaeViewerProps> = ({ nfae, onBack }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadXml = () => {
    const blob = new Blob([nfae.xmlAssinado], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NFAe_${nfae.numero}_${nfae.chaveAcesso.slice(-8)}.xml`;
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Barra de Ações */}
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
            className="bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs px-3 py-1.5 rounded border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar XML</span>
          </button>

          <button
            onClick={handlePrint}
            className="bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs px-3.5 py-1.5 rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir DANFE NFA-e + Guia DAE</span>
          </button>
        </div>
      </div>

      {/* DANFE NFA-e Oficial */}
      <div className="bg-white border-2 border-slate-800 p-4 font-sans text-xs text-slate-900 space-y-3 print:border print:m-0 print:p-2">
        
        {/* Cabeçalho SEFAZ */}
        <div className="grid grid-cols-12 border-b-2 border-slate-800 pb-2 gap-2">
          <div className="col-span-8 space-y-1 border-r border-slate-400 pr-2">
            <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wide">
              {nfae.orgaoEmissorSefaz}
            </div>
            <div className="text-base font-black uppercase text-slate-900">
              NOTA FISCAL AVULSA ELETRÔNICA - NFA-e
            </div>
            <div className="text-[10px] text-slate-600">
              Motivo: {nfae.descricaoMotivo}
            </div>
          </div>

          <div className="col-span-4 text-center flex flex-col justify-center">
            <div className="font-mono text-xs font-black">SÉRIE {nfae.serie} • Nº {nfae.numero}</div>
            <div className="text-[9px] font-mono break-all bg-slate-100 p-1 border border-slate-300 mt-1">
              CHAVE: {nfae.chaveAcesso.replace(/(\d{4})/g, '$1 ')}
            </div>
            <div className="text-[9px] font-bold text-emerald-800 mt-0.5">
              Protocolo: {nfae.protocoloAutorizacao}
            </div>
          </div>
        </div>

        {/* Requerente / Emitente */}
        <div className="border border-slate-800 p-2 text-[10px] space-y-0.5">
          <div className="font-bold text-[11px] text-amber-900 border-b border-slate-300 pb-0.5 uppercase flex justify-between">
            <span>REQUERENTE / EMITENTE AVULSO</span>
            <span>CPF/CNPJ: {formatarCpfCnpj(nfae.requerente.cpfCnpj)}</span>
          </div>
          <div className="font-bold text-slate-900 text-xs">{nfae.requerente.nomeRazaoSocial}</div>
          {nfae.requerente.inscricaoProdutorRural && (
            <div>Inscrição Produtor Rural: <strong>{nfae.requerente.inscricaoProdutorRural}</strong></div>
          )}
          <div>{nfae.requerente.endereco.logradouro}, {nfae.requerente.endereco.numero} - {nfae.requerente.endereco.bairro}</div>
          <div>{nfae.requerente.endereco.nomeMunicipio}/{nfae.requerente.endereco.uf} - CEP: {nfae.requerente.endereco.cep}</div>
        </div>

        {/* Destinatário */}
        <div className="border border-slate-800 p-2 text-[10px] space-y-0.5">
          <div className="font-bold text-[11px] text-slate-900 border-b border-slate-300 pb-0.5 uppercase flex justify-between">
            <span>DESTINATÁRIO / REMETENTE</span>
            <span>CPF/CNPJ: {formatarCpfCnpj(nfae.destinatario.documento)}</span>
          </div>
          <div className="font-bold text-slate-900 text-xs">{nfae.destinatario.nomeRazaoSocial}</div>
          <div>{nfae.destinatario.endereco.logradouro}, {nfae.destinatario.endereco.numero} - {nfae.destinatario.endereco.bairro}</div>
          <div>{nfae.destinatario.endereco.nomeMunicipio}/{nfae.destinatario.endereco.uf} - CEP: {nfae.destinatario.endereco.cep}</div>
        </div>

        {/* Tabela de Itens */}
        <div className="border border-slate-800 text-[10px]">
          <div className="bg-slate-100 grid grid-cols-12 p-1 font-bold border-b border-slate-800">
            <span className="col-span-1">CÓD</span>
            <span className="col-span-5">DESCRIÇÃO DOS PRODUTOS / INSUMOS</span>
            <span className="col-span-2">NCM</span>
            <span className="col-span-1 text-center">QTD</span>
            <span className="col-span-1 text-right">UNIT (R$)</span>
            <span className="col-span-2 text-right">TOTAL (R$)</span>
          </div>

          {nfae.itens.map((it) => (
            <div key={it.id} className="grid grid-cols-12 p-1 border-b border-slate-200">
              <span className="col-span-1 text-slate-600 font-mono">{it.codigo}</span>
              <span className="col-span-5 font-semibold text-slate-900">{it.descricao}</span>
              <span className="col-span-2 font-mono">{it.ncm}</span>
              <span className="col-span-1 text-center">{it.quantidade} {it.unidade}</span>
              <span className="col-span-1 text-right">{it.valorUnitario.toFixed(2)}</span>
              <span className="col-span-2 text-right font-bold">{it.valorTotal.toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Cálculo do Imposto */}
        <div className="grid grid-cols-4 border border-slate-800 p-2 text-[10px] gap-2 bg-slate-50">
          <div>
            <span className="text-slate-600 block">BASE DE CÁLCULO ICMS:</span>
            <span className="font-bold text-xs">{formatarMoeda(nfae.baseCalculoICMS)}</span>
          </div>
          <div>
            <span className="text-slate-600 block">VALOR DO ICMS RECOLHIDO:</span>
            <span className="font-bold text-xs text-amber-800">{formatarMoeda(nfae.valorTotalICMS)}</span>
          </div>
          <div>
            <span className="text-slate-600 block">VALOR TOTAL DOS PRODUTOS:</span>
            <span className="font-bold text-xs">{formatarMoeda(nfae.valorTotalProdutos)}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-600 block font-bold">VALOR TOTAL DA NOTA:</span>
            <span className="font-extrabold text-sm text-slate-900">{formatarMoeda(nfae.valorTotalNota)}</span>
          </div>
        </div>

        {/* Guia DAE de Arrecadação Estadual Vinculada */}
        {nfae.guiaDAE && (
          <div className="border-2 border-amber-800 rounded p-3 bg-amber-50/40 text-[10px] space-y-2">
            <div className="flex items-center justify-between border-b border-amber-300 pb-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-950 text-[11px]">
                <FileCheck className="w-4 h-4 text-amber-700" />
                <span>DAE - DOCUMENTO DE ARRECADAÇÃO ESTADUAL (VINCULADO À NFA-e)</span>
              </div>
              <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[9px]">
                STATUS: {nfae.guiaDAE.statusPagamento}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-slate-600 block">NÚMERO DA GUIA DAE:</span>
                <span className="font-bold text-slate-900">{nfae.guiaDAE.numeroDAE}</span>
              </div>
              <div>
                <span className="text-slate-600 block">DATA DE VENCIMENTO:</span>
                <span className="font-bold text-slate-900">{new Date(nfae.guiaDAE.dataVencimento).toLocaleDateString('pt-BR')}</span>
              </div>
              <div>
                <span className="text-slate-600 block">VALOR DO ICMS A RECOLHER:</span>
                <span className="font-black text-amber-900">{formatarMoeda(nfae.guiaDAE.valorDAE)}</span>
              </div>
            </div>

            <div className="pt-1">
              <span className="text-slate-600 block">LINHA DIGITÁVEL / CÓDIGO DE BARRAS:</span>
              <div className="font-mono bg-white p-1.5 border border-amber-300 rounded text-center text-[10px] font-bold text-slate-800">
                {nfae.guiaDAE.codigoBarras}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
