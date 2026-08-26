// C:\emissornfe\src\components\fiscal\DanfeViewer.tsx

import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { Printer, Download, X, ShieldCheck, Receipt } from 'lucide-react';
import { NFeDocumento } from '../../types/fiscal';
// ✅ CORRIGIDO: Import do frontend
import { formatarMoeda, formatarCpfCnpj, formatarCEP } from '../../utils/cpfCnpjValidator';
// ✅ CORRIGIDO: Import do frontend
import { formatarChaveAcesso44 } from '../../utils/chaveAcesso';

interface DanfeViewerProps {
  nfe: NFeDocumento;
  onClose: () => void;
}

export const DanfeViewer: React.FC<DanfeViewerProps> = ({ nfe, onClose }) => {
  const barcodeSvgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (barcodeSvgRef.current && nfe.chaveAcesso) {
      try {
        JsBarcode(barcodeSvgRef.current, nfe.chaveAcesso, {
          format: 'CODE128',
          width: 1.2,
          height: 42,
          displayValue: false,
          margin: 0,
        });
      } catch (err) {
        console.error('Erro ao renderizar código de barras:', err);
      }
    }
  }, [nfe]);

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
      
      {/* Controles do Topo (Não Imprimem) */}
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

      {/* Layout Oficial DANFE Retrato */}
      <div className="bg-white text-black max-w-4xl w-full mx-auto p-6 rounded-b-xl shadow-2xl print:shadow-none print:p-0 print:rounded-none font-sans text-xs border border-slate-300 print:border-none space-y-2">
        
        {/* CANHOTO DE RECEBIMENTO */}
        <div className="border border-black p-2 text-[9px]">
          <div className="flex items-center justify-between border-b border-dashed border-black pb-1.5">
            <div>
              RECEBEMOS DE <span className="font-bold">{nfe.emitente.razaoSocial}</span> OS PRODUTOS CONSTANTES DA NOTA FISCAL INDICADA AO LADO
            </div>
            <div className="text-right font-bold text-xs pl-2 border-l border-black">
              NF-e Nº {nfe.numero}<br/>SÉRIE {nfe.serie}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 pt-1.5">
            <div className="col-span-1 border-r border-black pr-2">
              <span className="block text-[8px] text-slate-500">DATA DE RECEBIMENTO</span>
              <div className="h-4 border-b border-dotted border-black mt-1"></div>
            </div>
            <div className="col-span-3">
              <span className="block text-[8px] text-slate-500">IDENTIFICAÇÃO E ASSINATURA DO RECEBEDOR</span>
              <div className="h-4 border-b border-dotted border-black mt-1"></div>
            </div>
          </div>
        </div>

        {/* CABEÇALHO DO DANFE */}
        <div className="border border-black grid grid-cols-12">
          
          {/* Identificação do Emitente */}
          <div className="col-span-5 p-3 border-r border-black flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black text-sm mb-1">
                SUP
              </div>
              <div className="font-bold text-xs leading-tight">{nfe.emitente.razaoSocial}</div>
              <div className="text-[10px] text-slate-700 leading-tight mt-1">
                {nfe.emitente.endereco.logradouro}, {nfe.emitente.endereco.numero} {nfe.emitente.endereco.complemento || ''}<br/>
                {nfe.emitente.endereco.bairro} - CEP: {formatarCEP(nfe.emitente.endereco.cep)}<br/>
                {nfe.emitente.endereco.nomeMunicipio} - {nfe.emitente.endereco.uf} - Fone: {nfe.emitente.endereco.telefone || '-'}
              </div>
            </div>
          </div>

          {/* Tipo DANFE e Dados Básicos */}
          <div className="col-span-3 p-3 border-r border-black flex flex-col items-center justify-center text-center">
            <div className="font-black text-sm tracking-wider">DANFE</div>
            <div className="text-[8px] text-slate-600 leading-tight">Documento Auxiliar da Nota Fiscal Eletrônica</div>
            
            <div className="flex items-center space-x-2 my-2 text-[10px]">
              <div>
                <span className="font-bold">0</span> - Entrada<br/>
                <span className="font-bold">1</span> - Saída
              </div>
              <div className="w-6 h-6 border border-black font-black text-sm flex items-center justify-center bg-slate-100">
                {nfe.tipoDocumento}
              </div>
            </div>

            <div className="font-black text-xs">
              Nº {nfe.numero.toString().padStart(9, '0')}<br/>
              SÉRIE {nfe.serie.toString().padStart(3, '0')}<br/>
              FOLHA 1/1
            </div>
          </div>

          {/* Código de Barras e Chave de Acesso */}
          <div className="col-span-4 p-2 flex flex-col justify-between">
            <div className="flex flex-col items-center">
              <svg ref={barcodeSvgRef} className="w-full h-11"></svg>
            </div>
            <div>
              <span className="text-[8px] font-bold block uppercase text-slate-600">Chave de Acesso</span>
              <span className="font-mono text-[9px] font-bold tracking-tight block">
                {formatarChaveAcesso44(nfe.chaveAcesso)}
              </span>
            </div>
            <div className="text-[8px] text-slate-600 mt-1 border-t border-slate-200 pt-1">
              Consulta de autenticidade no portal nacional da NF-e www.nfe.fazenda.gov.br ou no site da Sefaz Autorizadora.
            </div>
          </div>

        </div>

        {/* NATUREZA DA OPERAÇÃO E PROTOCOLO */}
        <div className="border border-black grid grid-cols-12 text-[9px]">
          <div className="col-span-7 p-1.5 border-r border-black">
            <span className="block text-[8px] text-slate-500 font-bold uppercase">Natureza da Operação</span>
            <span className="font-bold text-[10px] text-slate-900">{nfe.naturezaOperacao}</span>
          </div>
          <div className="col-span-5 p-1.5">
            <span className="block text-[8px] text-slate-500 font-bold uppercase">Protocolo de Autorização de Uso</span>
            <span className="font-bold text-[10px] text-slate-900">{nfe.protocoloAutorizacao} - {new Date(nfe.dataHoraAutorizacao).toLocaleDateString('pt-BR')} {new Date(nfe.dataHoraAutorizacao).toLocaleTimeString('pt-BR')}</span>
          </div>
        </div>

        {/* INSCRIÇÕES */}
        <div className="border border-black grid grid-cols-3 text-[9px]">
          <div className="p-1.5 border-r border-black">
            <span className="block text-[8px] text-slate-500 uppercase font-bold">Inscrição Estadual</span>
            <span className="font-bold">{nfe.emitente.inscricaoEstadual || 'ISENTO'}</span>
          </div>
          <div className="p-1.5 border-r border-black">
            <span className="block text-[8px] text-slate-500 uppercase font-bold">Inscr. Estadual do Subst. Trib.</span>
            <span className="font-bold">-</span>
          </div>
          <div className="p-1.5">
            <span className="block text-[8px] text-slate-500 uppercase font-bold">CNPJ</span>
            <span className="font-bold">{formatarCpfCnpj(nfe.emitente.cnpj)}</span>
          </div>
        </div>

        {/* DESTINATÁRIO / REMETENTE */}
        <div className="border border-black text-[9px]">
          <div className="bg-slate-100 px-2 py-0.5 font-bold uppercase text-[8px] border-b border-black">
            DESTINATÁRIO / REMETENTE
          </div>
          <div className="grid grid-cols-12 p-1.5 gap-y-1">
            <div className="col-span-8">
              <span className="block text-[8px] text-slate-500">NOME / RAZÃO SOCIAL</span>
              <span className="font-bold text-[10px]">{nfe.destinatario.nomeRazaoSocial}</span>
            </div>
            <div className="col-span-4">
              <span className="block text-[8px] text-slate-500">CNPJ / CPF</span>
              <span className="font-bold text-[10px]">{formatarCpfCnpj(nfe.destinatario.documento)}</span>
            </div>
            <div className="col-span-6">
              <span className="block text-[8px] text-slate-500">ENDEREÇO</span>
              <span>{nfe.destinatario.endereco.logradouro}, {nfe.destinatario.endereco.numero} {nfe.destinatario.endereco.complemento || ''}</span>
            </div>
            <div className="col-span-3">
              <span className="block text-[8px] text-slate-500">BAIRRO / DISTRITO</span>
              <span>{nfe.destinatario.endereco.bairro}</span>
            </div>
            <div className="col-span-3">
              <span className="block text-[8px] text-slate-500">CEP</span>
              <span>{formatarCEP(nfe.destinatario.endereco.cep)}</span>
            </div>
            <div className="col-span-4">
              <span className="block text-[8px] text-slate-500">MUNICÍPIO</span>
              <span>{nfe.destinatario.endereco.nomeMunicipio}</span>
            </div>
            <div className="col-span-2">
              <span className="block text-[8px] text-slate-500">UF</span>
              <span>{nfe.destinatario.endereco.uf}</span>
            </div>
            <div className="col-span-3">
              <span className="block text-[8px] text-slate-500">FONE / FAX</span>
              <span>{nfe.destinatario.telefone || '-'}</span>
            </div>
            <div className="col-span-3">
              <span className="block text-[8px] text-slate-500">INSCRIÇÃO ESTADUAL</span>
              <span>{nfe.destinatario.inscricaoEstadual || 'ISENTO'}</span>
            </div>
          </div>
        </div>

        {/* FATURA / DUPLICATAS */}
        <div className="border border-black text-[9px]">
          <div className="bg-slate-100 px-2 py-0.5 font-bold uppercase text-[8px] border-b border-black">
            FATURA / DUPLICATA
          </div>
          <div className="p-1.5 flex flex-wrap gap-3">
            {nfe.duplicatas.map((dup, i) => (
              <div key={i} className="border border-slate-300 p-1 rounded bg-slate-50 min-w-[130px]">
                <div className="text-[8px] text-slate-500">Nº {dup.numero}</div>
                <div className="font-bold">Venc: {new Date(dup.dataVencimento + 'T00:00:00').toLocaleDateString('pt-BR')}</div>
                <div className="font-bold text-slate-900">{formatarMoeda(dup.valor)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CÁLCULO DO IMPOSTO */}
        <div className="border border-black text-[9px]">
          <div className="bg-slate-100 px-2 py-0.5 font-bold uppercase text-[8px] border-b border-black">
            CÁLCULO DO IMPOSTO
          </div>
          <div className="grid grid-cols-6 p-1 text-center">
            <div>
              <span className="block text-[7px] text-slate-500">BASE DE CÁLC. ICMS</span>
              <span className="font-bold">{formatarMoeda(nfe.baseCalculoICMS)}</span>
            </div>
            <div>
              <span className="block text-[7px] text-slate-500">VALOR DO ICMS</span>
              <span className="font-bold">{formatarMoeda(nfe.valorTotalICMS)}</span>
            </div>
            <div>
              <span className="block text-[7px] text-slate-500">BASE CÁLC. ICMS ST</span>
              <span className="font-bold">{formatarMoeda(nfe.baseCalculoICMSST)}</span>
            </div>
            <div>
              <span className="block text-[7px] text-slate-500">VALOR DO ICMS ST</span>
              <span className="font-bold">{formatarMoeda(nfe.valorTotalICMSST)}</span>
            </div>
            <div>
              <span className="block text-[7px] text-slate-500">VALOR TOTAL PROD.</span>
              <span className="font-bold">{formatarMoeda(nfe.valorTotalProdutos)}</span>
            </div>
            <div className="bg-slate-100 p-0.5 rounded">
              <span className="block text-[7px] text-slate-700 font-bold">VALOR TOTAL DA NOTA</span>
              <span className="font-black text-[11px] text-slate-900">{formatarMoeda(nfe.valorTotalNota)}</span>
            </div>
          </div>
          <div className="grid grid-cols-6 p-1 border-t border-slate-200 text-center">
            <div>
              <span className="block text-[7px] text-slate-500">VALOR DO FRETE</span>
              <span>{formatarMoeda(nfe.valorTotalFrete)}</span>
            </div>
            <div>
              <span className="block text-[7px] text-slate-500">VALOR DO SEGURO</span>
              <span>{formatarMoeda(nfe.valorTotalSeguro)}</span>
            </div>
            <div>
              <span className="block text-[7px] text-slate-500">DESCONTO</span>
              <span>{formatarMoeda(nfe.valorTotalDesconto)}</span>
            </div>
            <div>
              <span className="block text-[7px] text-slate-500">VALOR DO IPI</span>
              <span>{formatarMoeda(nfe.valorTotalIPI)}</span>
            </div>
            <div>
              <span className="block text-[7px] text-slate-500">VALOR DO PIS</span>
              <span>{formatarMoeda(nfe.valorTotalPIS)}</span>
            </div>
            <div>
              <span className="block text-[7px] text-slate-500">VALOR DA COFINS</span>
              <span>{formatarMoeda(nfe.valorTotalCOFINS)}</span>
            </div>
          </div>
        </div>

        {/* DADOS DOS PRODUTOS / SERVIÇOS */}
        <div className="border border-black text-[9px]">
          <div className="bg-slate-100 px-2 py-0.5 font-bold uppercase text-[8px] border-b border-black">
            DADOS DO PRODUTO / SERVIÇO
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-black text-[8px] font-bold">
              <tr>
                <th className="p-1">CÓDIGO</th>
                <th className="p-1">DESCRIÇÃO DOS PRODUTOS</th>
                <th className="p-1">NCM/SH</th>
                <th className="p-1">CST</th>
                <th className="p-1">CFOP</th>
                <th className="p-1">UN</th>
                <th className="p-1 text-right">QTD</th>
                <th className="p-1 text-right">V. UNIT</th>
                <th className="p-1 text-right">V. TOTAL</th>
                <th className="p-1 text-right">BC ICMS</th>
                <th className="p-1 text-right">V. ICMS</th>
                <th className="p-1 text-right">% ICMS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {nfe.itens.map((it, idx) => (
                <tr key={idx}>
                  <td className="p-1 font-mono">{it.codigoProduto}</td>
                  <td className="p-1 font-medium">{it.descricao}</td>
                  <td className="p-1 font-mono">{it.ncm}</td>
                  <td className="p-1 font-mono">{it.cstICMS}</td>
                  <td className="p-1 font-mono">{it.cfop}</td>
                  <td className="p-1">{it.unidadeMedida}</td>
                  <td className="p-1 text-right">{it.quantidade}</td>
                  <td className="p-1 text-right">{formatarMoeda(it.valorUnitario)}</td>
                  <td className="p-1 text-right font-bold">{formatarMoeda(it.valorTotalBruto)}</td>
                  <td className="p-1 text-right">{formatarMoeda(it.baseCalculoICMS)}</td>
                  <td className="p-1 text-right">{formatarMoeda(it.valorICMS)}</td>
                  <td className="p-1 text-right">{it.aliquotaICMS}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* DADOS ADICIONAIS */}
        <div className="border border-black text-[9px] p-2 space-y-1">
          <div className="font-bold text-[8px] uppercase text-slate-700">DADOS ADICIONAIS / INFORMAÇÕES COMPLEMENTARES</div>
          <div className="text-slate-700 leading-relaxed">
            {nfe.informacoesAdicionais || 'Emitido por SUP TECNOLOGIA - Sistema Emissor Fiscal Integrado.'}
          </div>
          <div className="text-[8px] text-slate-500 pt-1 border-t border-slate-200 flex items-center justify-between">
            <span>Emitido e Autorizado via SEFAZ - Transmissão Síncrona SUP TECNOLOGIA ERP</span>
            <span className="font-mono">Sistema Homologado 2026</span>
          </div>
        </div>

      </div>

    </div>
  );
};