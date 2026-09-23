// src/components/fiscal/DanfeViewer.tsx
import React from 'react';
import { Printer, Download, X, Receipt } from 'lucide-react';
import { NFeDocumento } from '../../types/fiscal';
import { DanfeLayout } from './DanfeLayout';

interface DanfeViewerProps {
  nfe: NFeDocumento;
  onClose: () => void;
}

export const DanfeViewer: React.FC<DanfeViewerProps> = ({ nfe, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadXml = () => {
    const blob = new Blob([nfe.xmlAssinado], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NFe_${nfe.numero}_${nfe.chaveAcesso}.xml`;
    link.click();
  };

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
            className="inline-flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar XML SEFAZ</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-sm cursor-pointer"
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

      <div className="shadow-2xl print:shadow-none border border-slate-300 print:border-none">
        <DanfeLayout
          numero={nfe.numero}
          serie={nfe.serie}
          tipoDocumento={nfe.tipoDocumento}
          naturezaOperacao={nfe.naturezaOperacao}
          chaveAcesso={nfe.chaveAcesso}
          protocoloAutorizacao={nfe.protocoloAutorizacao}
          dataHoraAutorizacao={nfe.dataHoraAutorizacao}
          emitente={nfe.emitente}
          destinatario={nfe.destinatario}
          duplicatas={nfe.duplicatas}
          itens={nfe.itens}
          totais={{
            baseCalculoICMS: nfe.baseCalculoICMS,
            valorTotalICMS: nfe.valorTotalICMS,
            baseCalculoICMSST: nfe.baseCalculoICMSST,
            valorTotalICMSST: nfe.valorTotalICMSST,
            valorTotalProdutos: nfe.valorTotalProdutos,
            valorTotalNota: nfe.valorTotalNota,
            valorTotalFrete: nfe.valorTotalFrete,
            valorTotalSeguro: nfe.valorTotalSeguro,
            valorTotalDesconto: nfe.valorTotalDesconto,
            valorTotalIPI: nfe.valorTotalIPI,
            valorTotalPIS: nfe.valorTotalPIS,
            valorTotalCOFINS: nfe.valorTotalCOFINS,
          }}
          informacoesAdicionais={nfe.informacoesAdicionais}
        />
      </div>

    </div>
  );
};
