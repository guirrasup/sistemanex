// C:\emissornfe\src\components\fiscal\DanfseViewer.tsx

import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Printer, Download, X, ShieldCheck, CheckCircle, FileCode, Building2 } from 'lucide-react';
import { NFSeDocumento } from '../../types/fiscal';
// ✅ CORRIGIDO: Import do frontend
import { formatarMoeda, formatarCpfCnpj, formatarCEP } from '../../utils/cpfCnpjValidator';
// ✅ CORRIGIDO: Import do frontend
import { formatarChaveAcesso44 } from '../../utils/chaveAcesso';

interface DanfseViewerProps {
  nfse: NFSeDocumento;
  onClose: () => void;
}

export const DanfseViewer: React.FC<DanfseViewerProps> = ({ nfse, onClose }) => {
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (qrCanvasRef.current) {
      const qrData = `https://www.nfse.gov.br/consultapublica?chave=${nfse.chaveAcesso}&codigo=${nfse.codigoVerificacao}`;
      QRCode.toCanvas(qrCanvasRef.current, qrData, {
        width: 110,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
    }
  }, [nfse]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadXml = () => {
    const blob = new Blob([nfse.xmlAssinado], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NFSe_Nacional_${nfse.numeroNfse}_${nfse.chaveAcesso.slice(0, 10)}.xml`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
      
      {/* Controles no topo (Não imprimem) */}
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
            className="inline-flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar XML</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-sm cursor-pointer"
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

      {/* DANFSe Oficial (Layout Documento Fiscal Nacional) */}
      <div className="bg-white text-black max-w-4xl w-full mx-auto p-8 rounded-b-xl shadow-2xl print:shadow-none print:p-0 print:rounded-none font-sans text-xs border border-slate-300 print:border-none">
        
        {/* Cabeçalho do Documento */}
        <div className="border border-black p-3 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 border border-slate-400 rounded-lg flex flex-col items-center justify-center p-1 bg-slate-50 text-center">
              <span className="font-black text-xs text-indigo-900 tracking-tighter">SUP</span>
              <span className="text-[8px] font-bold text-slate-600">SISTEMAS</span>
            </div>
            <div>
              <div className="font-black text-sm uppercase tracking-tight text-slate-900">
                PREFEITURA MUNICIPAL DE {nfse.emitente.endereco.nomeMunicipio.toUpperCase()} - {nfse.emitente.endereco.uf}
              </div>
              <div className="text-[11px] font-bold text-slate-700 uppercase">
                SECRETARIA MUNICIPAL DE FAZENDA / FINANÇAS
              </div>
              <div className="text-[10px] text-slate-600 font-semibold mt-0.5">
                DOCUMENTO AUXILIAR DA NOTA FISCAL DE SERVIÇOS ELETRÔNICA - DANFSe
              </div>
              <div className="text-[9px] text-indigo-800 font-bold">
                Padrão Nacional (Portal de Gestão NFS-e - Sistema SUP TECNOLOGIA)
              </div>
            </div>
          </div>

          {/* QR Code e Código de Verificação */}
          <div className="flex items-center space-x-3 border-l border-black pl-3 shrink-0">
            <canvas ref={qrCanvasRef} className="w-24 h-24 border border-slate-300 rounded"></canvas>
            <div className="text-[10px] space-y-1">
              <div>
                <span className="text-slate-500 block text-[8px] uppercase font-bold">Número NFS-e</span>
                <span className="font-black text-sm text-slate-900">{nfse.numeroNfse}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[8px] uppercase font-bold">Cód. Verificação</span>
                <span className="font-mono font-bold text-slate-900 text-xs">{nfse.codigoVerificacao}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[8px] uppercase font-bold">Competência</span>
                <span className="font-semibold text-slate-800">{new Date(nfse.dataCompetencia + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chave de Acesso Oficial de 53 Dígitos */}
        <div className="border-x border-b border-black p-2 bg-slate-50 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold uppercase text-slate-600 block">Chave de Acesso NFS-e Nacional</span>
            <span className="font-mono font-bold text-xs tracking-wider text-slate-900">
              {formatarChaveAcesso44(nfse.chaveAcesso)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-bold uppercase text-slate-600 block">Número da DPS / Série</span>
            <span className="font-bold text-xs text-slate-900">Nº {nfse.numeroDPS} / Série {nfse.serieDPS}</span>
          </div>
        </div>

        {/* DADOS DO PRESTADOR DE SERVIÇOS */}
        <div className="border-x border-b border-black p-3">
          <div className="font-bold text-[10px] uppercase text-slate-700 bg-slate-100 px-2 py-0.5 border border-slate-300 mb-2">
            1. PRESTADOR DE SERVIÇOS
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
            <div>
              <div className="font-bold text-slate-900 text-xs">{nfse.emitente.razaoSocial}</div>
              <div className="text-slate-600">Nome Fantasia: {nfse.emitente.nomeFantasia || '-'}</div>
              <div className="text-slate-700 font-medium mt-1">
                {nfse.emitente.endereco.logradouro}, {nfse.emitente.endereco.numero} {nfse.emitente.endereco.complemento || ''}
              </div>
              <div className="text-slate-700 font-medium">
                Bairro: {nfse.emitente.endereco.bairro} - CEP: {formatarCEP(nfse.emitente.endereco.cep)} - {nfse.emitente.endereco.nomeMunicipio}/{nfse.emitente.endereco.uf}
              </div>
            </div>

            <div className="space-y-0.5 md:text-right">
              <div><span className="font-semibold text-slate-600">CNPJ:</span> <span className="font-bold text-slate-900">{formatarCpfCnpj(nfse.emitente.cnpj)}</span></div>
              <div><span className="font-semibold text-slate-600">Inscrição Municipal:</span> <span className="font-bold">{nfse.emitente.inscricaoMunicipal}</span></div>
              <div><span className="font-semibold text-slate-600">Inscrição Estadual:</span> <span>{nfse.emitente.inscricaoEstadual || 'ISENTO'}</span></div>
              <div><span className="font-semibold text-slate-600">Regime Tributário:</span> <span className="font-semibold text-indigo-700">{nfse.emitente.optanteSimplesNacional ? 'Simples Nacional (ME/EPP)' : 'Lucro Presumido / Real'}</span></div>
              <div><span className="font-semibold text-slate-600">E-mail:</span> <span>{nfse.emitente.endereco.email || '-'}</span></div>
            </div>
          </div>
        </div>

        {/* DADOS DO TOMADOR DE SERVIÇOS */}
        <div className="border-x border-b border-black p-3">
          <div className="font-bold text-[10px] uppercase text-slate-700 bg-slate-100 px-2 py-0.5 border border-slate-300 mb-2">
            2. TOMADOR DE SERVIÇOS
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
            <div>
              <div className="font-bold text-slate-900 text-xs">{nfse.tomador.nomeRazaoSocial}</div>
              <div className="text-slate-700 font-medium mt-1">
                {nfse.tomador.endereco.logradouro}, {nfse.tomador.endereco.numero} {nfse.tomador.endereco.complemento || ''}
              </div>
              <div className="text-slate-700 font-medium">
                Bairro: {nfse.tomador.endereco.bairro} - CEP: {formatarCEP(nfse.tomador.endereco.cep)} - {nfse.tomador.endereco.nomeMunicipio}/{nfse.tomador.endereco.uf}
              </div>
            </div>

            <div className="space-y-0.5 md:text-right">
              <div><span className="font-semibold text-slate-600">CPF / CNPJ:</span> <span className="font-bold text-slate-900">{formatarCpfCnpj(nfse.tomador.documento)}</span></div>
              <div><span className="font-semibold text-slate-600">Inscrição Municipal:</span> <span>{nfse.tomador.inscricaoMunicipal || 'Não Informada'}</span></div>
              <div><span className="font-semibold text-slate-600">Telefone:</span> <span>{nfse.tomador.telefone || '-'}</span></div>
              <div><span className="font-semibold text-slate-600">E-mail:</span> <span>{nfse.tomador.email || '-'}</span></div>
            </div>
          </div>
        </div>

        {/* DISCRIMINAÇÃO DOS SERVIÇOS */}
        <div className="border-x border-b border-black p-3 min-h-[140px]">
          <div className="font-bold text-[10px] uppercase text-slate-700 bg-slate-100 px-2 py-0.5 border border-slate-300 mb-2 flex items-center justify-between">
            <span>3. DISCRIMINAÇÃO DOS SERVIÇOS PRESTADOS</span>
            <span className="text-[9px] font-normal text-slate-500">Local da Prestação: {nfse.servico.localPrestacao.nomeMunicipio} - {nfse.servico.localPrestacao.uf} (Cód. IBGE: {nfse.servico.localPrestacao.codigoMunicipio})</span>
          </div>

          <div className="whitespace-pre-wrap text-slate-800 text-xs leading-relaxed font-sans font-medium">
            {nfse.servico.descricao}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-slate-600">
            <div>
              <span className="font-bold">Item da Lista de Serviços (LC 116/03):</span> {nfse.servico.codigoTributacaoNacional}
            </div>
            <div>
              <span className="font-bold">Nomenclatura Brasileira de Serviços (NBS):</span> {nfse.servico.codigoNBS || '1.1403.21.10'}
            </div>
          </div>
        </div>

        {/* DETALHAMENTO DE TRIBUTOS E VALORES */}
        <div className="border-x border-b border-black p-3">
          <div className="font-bold text-[10px] uppercase text-slate-700 bg-slate-100 px-2 py-0.5 border border-slate-300 mb-2">
            4. APURAÇÃO DO ISSQN E RETENÇÕES FEDERAIS
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-[10px] mb-3">
            <div className="border border-slate-300 p-1.5 rounded">
              <div className="text-slate-500 font-bold text-[8px] uppercase">Valor dos Serviços</div>
              <div className="font-bold text-slate-900 text-xs mt-0.5">{formatarMoeda(nfse.valorTotalServicos)}</div>
            </div>
            <div className="border border-slate-300 p-1.5 rounded">
              <div className="text-slate-500 font-bold text-[8px] uppercase">Deduções / Reduções</div>
              <div className="font-bold text-slate-900 text-xs mt-0.5">{formatarMoeda(nfse.valorTotalDeducoes)}</div>
            </div>
            <div className="border border-slate-300 p-1.5 rounded">
              <div className="text-slate-500 font-bold text-[8px] uppercase">Desconto Incond.</div>
              <div className="font-bold text-slate-900 text-xs mt-0.5">{formatarMoeda(nfse.valorTotalDescontos)}</div>
            </div>
            <div className="border border-slate-300 p-1.5 rounded">
              <div className="text-slate-500 font-bold text-[8px] uppercase">Base de Cálculo</div>
              <div className="font-bold text-slate-900 text-xs mt-0.5">{formatarMoeda(nfse.baseCalculoISS)}</div>
            </div>
            <div className="border border-slate-300 p-1.5 rounded">
              <div className="text-slate-500 font-bold text-[8px] uppercase">Alíquota ISS</div>
              <div className="font-bold text-indigo-700 text-xs mt-0.5">{nfse.servico.aliquotaISS.toFixed(2)}%</div>
            </div>
            <div className="border border-slate-300 p-1.5 rounded bg-slate-50">
              <div className="text-slate-500 font-bold text-[8px] uppercase">Valor do ISSQN</div>
              <div className="font-bold text-slate-900 text-xs mt-0.5">{formatarMoeda(nfse.valorTotalISS)}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[10px]">
            <div className="border border-slate-200 p-1 rounded">
              <div className="text-slate-500 text-[8px]">PIS</div>
              <div className="font-semibold">{formatarMoeda(nfse.servico.valorPIS || 0)}</div>
            </div>
            <div className="border border-slate-200 p-1 rounded">
              <div className="text-slate-500 text-[8px]">COFINS</div>
              <div className="font-semibold">{formatarMoeda(nfse.servico.valorCOFINS || 0)}</div>
            </div>
            <div className="border border-slate-200 p-1 rounded">
              <div className="text-slate-500 text-[8px]">IRRF</div>
              <div className="font-semibold">{formatarMoeda(nfse.servico.valorIRRF || 0)}</div>
            </div>
            <div className="border border-slate-200 p-1 rounded">
              <div className="text-slate-500 text-[8px]">CSLL</div>
              <div className="font-semibold">{formatarMoeda(nfse.servico.valorCSLL || 0)}</div>
            </div>
            <div className="border border-slate-200 p-1 rounded">
              <div className="text-slate-500 text-[8px]">INSS Retido</div>
              <div className="font-semibold">{formatarMoeda(nfse.servico.valorINSS || 0)}</div>
            </div>
          </div>
        </div>

        {/* GRUPO EXCLUSIVO: REFORMA TRIBUTÁRIA 2026 (IBS / CBS) */}
        <div className="border-x border-b border-black p-3 bg-cyan-50/40">
          <div className="font-bold text-[10px] uppercase text-cyan-900 bg-cyan-100 px-2 py-0.5 border border-cyan-300 mb-2 flex items-center justify-between">
            <span>5. TRIBUTAÇÃO SOBRE CONSUMO - REFORMA TRIBUTÁRIA 2026 (IBS / CBS)</span>
            <span className="text-[9px] font-bold text-cyan-800">Emenda Constitucional nº 132/2023</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px]">
            <div className="border border-cyan-200 bg-white p-1.5 rounded">
              <div className="text-slate-500 text-[8px] uppercase font-bold">CBS União (0,90%)</div>
              <div className="font-bold text-indigo-900 text-xs mt-0.5">{formatarMoeda(nfse.valorTotalCBS)}</div>
            </div>
            <div className="border border-cyan-200 bg-white p-1.5 rounded">
              <div className="text-slate-500 text-[8px] uppercase font-bold">IBS Estadual (0,05%)</div>
              <div className="font-bold text-blue-900 text-xs mt-0.5">{formatarMoeda(nfse.servico.ibscbs?.valorIBSUF || 0)}</div>
            </div>
            <div className="border border-cyan-200 bg-white p-1.5 rounded">
              <div className="text-slate-500 text-[8px] uppercase font-bold">IBS Municipal (0,05%)</div>
              <div className="font-bold text-cyan-900 text-xs mt-0.5">{formatarMoeda(nfse.servico.ibscbs?.valorIBSMun || 0)}</div>
            </div>
            <div className="border border-cyan-200 bg-white p-1.5 rounded">
              <div className="text-slate-500 text-[8px] uppercase font-bold">Total IBS + CBS</div>
              <div className="font-black text-slate-900 text-xs mt-0.5">{formatarMoeda(nfse.valorTotalIBS + nfse.valorTotalCBS)}</div>
            </div>
          </div>
        </div>

        {/* VALOR LÍQUIDO FINAL */}
        <div className="border-x border-b border-black p-3 bg-slate-100 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-600 font-bold uppercase">Valor Total do Documento Fiscal</div>
            <div className="text-[9px] text-slate-500">Valor líquido disponível para pagamento após deduções e retenções</div>
          </div>
          <div className="text-right">
            <div className="text-xl font-black text-slate-900">{formatarMoeda(nfse.valorLiquidoNfse)}</div>
            <div className="text-[9px] text-slate-500 font-semibold">ISS Retido: {formatarMoeda(nfse.valorTotalISSRetido)}</div>
          </div>
        </div>

        {/* INFORMAÇÕES COMPLEMENTARES E ASSINATURA DIGITAL */}
        <div className="border-x border-b border-black p-3 text-[10px] space-y-2">
          <div className="font-bold text-slate-700 uppercase text-[9px]">6. INFORMAÇÕES COMPLEMENTARES / OBSERVAÇÕES</div>
          <div className="text-slate-600 text-[10px] leading-relaxed">
            {nfse.informacoesComplementares || 'Documento emitido eletronicamente com base na legislação tributária vigente.'}
            <div className="mt-1 font-semibold text-slate-700">
              Valor aproximado dos tributos: Federais {formatarMoeda(nfse.servico.valorTributosFederais)} | Municipais {formatarMoeda(nfse.servico.valorTributosMunicipais)} (Lei Federal 12.741/2012 - Fonte IBPT).
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-500">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Documento assinado digitalmente com Certificado Digital ICP-Brasil (Padrão XMLDSig).</span>
            </div>
            <div>
              SUP TECNOLOGIA - Sistema Emissor Fiscal & Gestão ERP
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};