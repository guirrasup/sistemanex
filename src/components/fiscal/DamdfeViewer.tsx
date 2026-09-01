// src/components/fiscal/DamdfeViewer.tsx

import React from 'react';
import {
  Printer,
  Download,
  ArrowLeft,
  Truck,
  MapPin,
  FileText,
  Package,
  CheckCircle2,
  Barcode,
  QrCode,
  Shield,
  Users,
  Route
} from 'lucide-react';
import { MDFeDocumento } from '../../types/mdfe';
import { formatarMoeda, formatarCpfCnpj } from '../../utils/cpfCnpjValidator';
import { formatarChaveAcesso44 } from '../../utils/chaveAcesso';

interface DamdfeViewerProps {
  mdfe: MDFeDocumento;
  onClose: () => void;
}

export const DamdfeViewer: React.FC<DamdfeViewerProps> = ({ mdfe, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadXml = () => {
    const blob = new Blob([mdfe.xmlAssinado], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MDFe_${mdfe.numero}_${mdfe.chaveAcesso.slice(-8)}.xml`;
    a.click();
  };

  const totalDocumentos = 
    (mdfe.totalizadores.qCTe || 0) +
    (mdfe.totalizadores.qNFe || 0) +
    (mdfe.totalizadores.qMDFe || 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
      
      {/* Controles do Topo */}
      <div className="bg-slate-900 text-white rounded-t-xl px-6 py-3 flex items-center justify-between max-w-4xl w-full mx-auto print:hidden shadow-lg border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <Truck className="w-4 h-4 text-orange-400" />
          <span className="font-bold text-sm tracking-wide">
            DAMDFe - Documento Auxiliar do MDF-e (Mod. 58)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadXml}
            className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar XML</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir DAMDFE</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer ml-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* DAMDFE */}
      <div className="bg-white text-black max-w-4xl w-full mx-auto p-6 rounded-b-xl shadow-2xl print:shadow-none print:p-0 print:rounded-none font-sans text-xs border border-slate-300 print:border-none space-y-3">
        
        {/* Cabeçalho */}
        <div className="border border-black p-3 flex items-center justify-between">
          <div>
            <div className="font-black text-sm uppercase">MANIFESTO DE DOCUMENTOS FISCAIS ELETRÔNICOS</div>
            <div className="text-[10px] text-slate-600">MODELO 58 - MDF-e</div>
            <div className="font-bold text-lg">{mdfe.numero.toString().padStart(9, '0')}</div>
            <div>Série {mdfe.serie}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-600">Modal</div>
            <div className="font-bold uppercase">{mdfe.modal}</div>
            <div className="text-[10px] text-slate-600 mt-1">Chave de Acesso</div>
            <div className="font-mono text-[9px] break-all">{formatarChaveAcesso44(mdfe.chaveAcesso)}</div>
          </div>
        </div>

        {/* Status */}
        <div className="border border-black p-2 flex items-center justify-between">
          <div>
            <span className="font-bold">Status:</span>
            <span className={`ml-2 font-semibold ${
              mdfe.status === 'AUTORIZADA' ? 'text-emerald-700' :
              mdfe.status === 'CANCELADA' ? 'text-rose-700' :
              mdfe.status === 'ENCERRADA' ? 'text-blue-700' :
              'text-slate-600'
            }`}>
              {mdfe.status}
            </span>
          </div>
          {mdfe.protocoloAutorizacao && (
            <div>
              <span className="text-slate-600">Protocolo:</span>
              <span className="font-mono ml-1">{mdfe.protocoloAutorizacao}</span>
            </div>
          )}
          <div>
            <span className="text-slate-600">Emissão:</span>
            <span className="ml-1">{new Date(mdfe.dhEmi).toLocaleString('pt-BR')}</span>
          </div>
        </div>

        {/* Emitente */}
        <div className="border border-black p-2">
          <div className="font-bold text-[10px] uppercase text-slate-600">Emitente</div>
          <div className="font-bold">{mdfe.emitente.razaoSocial}</div>
          <div className="grid grid-cols-2 gap-1 text-[10px]">
            <div>CNPJ/CPF: {formatarCpfCnpj(mdfe.emitente.cnpj || mdfe.emitente.cpf || '')}</div>
            <div>IE: {mdfe.emitente.inscricaoEstadual || 'ISENTO'}</div>
            <div className="col-span-2">{mdfe.emitente.endereco.logradouro}, {mdfe.emitente.endereco.numero} - {mdfe.emitente.endereco.bairro}</div>
            <div className="col-span-2">{mdfe.emitente.endereco.nomeMunicipio} - {mdfe.emitente.endereco.uf}</div>
          </div>
        </div>

        {/* Percurso */}
        <div className="border border-black p-2">
          <div className="font-bold text-[10px] uppercase text-slate-600">Percurso</div>
          <div className="flex items-center gap-2">
            <span className="font-bold">{mdfe.UFIni}</span>
            <span className="text-slate-400">➔</span>
            {mdfe.percursos.map((p, idx) => (
              <span key={idx} className="text-slate-600">{p.uf}</span>
            ))}
            <span className="text-slate-400">➔</span>
            <span className="font-bold">{mdfe.UFFim}</span>
          </div>
          {mdfe.dhIniViagem && (
            <div className="text-[10px] text-slate-600 mt-1">Início da viagem: {new Date(mdfe.dhIniViagem).toLocaleString('pt-BR')}</div>
          )}
        </div>

        {/* Carregamento e Descarga */}
        <div className="grid grid-cols-2 gap-3">
          <div className="border border-black p-2">
            <div className="font-bold text-[10px] uppercase text-slate-600 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Carregamento
            </div>
            {mdfe.municipiosCarrega.map((m, idx) => (
              <div key={idx} className="text-[10px]">{m.codigo} - {m.nome}</div>
            ))}
          </div>
          <div className="border border-black p-2">
            <div className="font-bold text-[10px] uppercase text-slate-600 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Descarga
            </div>
            {mdfe.municipiosDescarga.map((m, idx) => (
              <div key={idx} className="text-[10px]">{m.codigo} - {m.nome}</div>
            ))}
          </div>
        </div>

        {/* Documentos e Totalizadores */}
        <div className="border border-black p-2">
          <div className="font-bold text-[10px] uppercase text-slate-600 flex items-center gap-1">
            <FileText className="w-3 h-3" />
            Documentos Vinculados
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
            <div className="bg-slate-50 p-1 rounded">
              <span className="text-slate-600">CT-e</span>
              <div className="font-bold">{mdfe.totalizadores.qCTe || 0}</div>
            </div>
            <div className="bg-slate-50 p-1 rounded">
              <span className="text-slate-600">NF-e</span>
              <div className="font-bold">{mdfe.totalizadores.qNFe || 0}</div>
            </div>
            <div className="bg-slate-50 p-1 rounded">
              <span className="text-slate-600">MDF-e</span>
              <div className="font-bold">{mdfe.totalizadores.qMDFe || 0}</div>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px]">
            <span>Total de documentos: <strong>{totalDocumentos}</strong></span>
            <span>Peso: <strong>{mdfe.totalizadores.pesoCarga} {mdfe.totalizadores.unidadePeso === '01' ? 'KG' : 'TON'}</strong></span>
            <span>Valor da carga: <strong>{formatarMoeda(mdfe.totalizadores.valorCarga)}</strong></span>
          </div>
        </div>

        {/* Produto Predominante */}
        <div className="border border-black p-2">
          <div className="font-bold text-[10px] uppercase text-slate-600 flex items-center gap-1">
            <Package className="w-3 h-3" />
            Produto Predominante
          </div>
          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <div>
              <span className="text-slate-600">Tipo:</span>
              <span className="font-medium ml-1">{mdfe.produtoPredominante.tipoCarga}</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-600">Descrição:</span>
              <span className="font-medium ml-1">{mdfe.produtoPredominante.descricao}</span>
            </div>
            {mdfe.produtoPredominante.ncm && (
              <div>
                <span className="text-slate-600">NCM:</span>
                <span className="font-mono ml-1">{mdfe.produtoPredominante.ncm}</span>
              </div>
            )}
            {mdfe.produtoPredominante.ean && (
              <div>
                <span className="text-slate-600">EAN:</span>
                <span className="font-mono ml-1">{mdfe.produtoPredominante.ean}</span>
              </div>
            )}
          </div>
        </div>

        {/* Seguro */}
        {mdfe.seguros && mdfe.seguros.length > 0 && (
          <div className="border border-black p-2">
            <div className="font-bold text-[10px] uppercase text-slate-600 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Seguro
            </div>
            {mdfe.seguros.map((s, idx) => (
              <div key={idx} className="grid grid-cols-3 gap-2 text-[10px]">
                <div>
                  <span className="text-slate-600">Responsável:</span>
                  <span className="font-medium ml-1">{s.responsavel === '1' ? 'Emitente' : 'Contratante'}</span>
                </div>
                {s.seguradoraNome && (
                  <div>
                    <span className="text-slate-600">Seguradora:</span>
                    <span className="font-medium ml-1">{s.seguradoraNome}</span>
                  </div>
                )}
                {s.apolice && (
                  <div>
                    <span className="text-slate-600">Apólice:</span>
                    <span className="font-medium ml-1">{s.apolice}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Lacres */}
        {mdfe.lacres && mdfe.lacres.length > 0 && (
          <div className="border border-black p-2">
            <div className="font-bold text-[10px] uppercase text-slate-600 flex items-center gap-1">
              <Barcode className="w-3 h-3" />
              Lacres
            </div>
            <div className="flex flex-wrap gap-1">
              {mdfe.lacres.map((l, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono">
                  {l}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Rodapé */}
        <div className="border border-black p-2 text-[9px] text-slate-500 flex items-center justify-between">
          <span>SUP TECNOLOGIA - Sistema Emissor Fiscal</span>
          <span>MDF-e autorizado via SEFAZ</span>
          <span>{new Date().toLocaleDateString('pt-BR')}</span>
        </div>

      </div>

    </div>
  );
};