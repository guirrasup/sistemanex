// src/components/fiscal/DanfeLayout.tsx
// Layout puro do DANFE (papel), extraído do DanfeViewer pra ser reaproveitado
// tanto na visualização de uma NF-e já autorizada (DanfeViewer) quanto no
// preview de pré-emissão (NfeEmissor) — o preview usa exatamente este mesmo
// componente, então é um espelho real do DANFE final, não uma aproximação
// que pode divergir com o tempo. Campos que só existem depois da autorização
// (chaveAcesso, protocolo, data) são opcionais e mostram "—"/placeholder
// quando ainda não existem.
import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { formatarMoeda, formatarCpfCnpj, formatarCEP } from '../../utils/cpfCnpjValidator';
import { formatarChaveAcesso44 } from '../../utils/chaveAcesso';

interface DanfeEndereco {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  nomeMunicipio: string;
  uf: string;
  cep: string;
  telefone?: string;
}

interface DanfeEmitente {
  razaoSocial: string;
  cnpj: string;
  inscricaoEstadual?: string;
  endereco: DanfeEndereco;
}

interface DanfeDestinatario {
  nomeRazaoSocial: string;
  documento: string;
  telefone?: string;
  inscricaoEstadual?: string;
  endereco: DanfeEndereco;
}

interface DanfeDuplicata {
  numero: string;
  dataVencimento: string;
  valor: number;
}

interface DanfeItem {
  codigoProduto: string;
  descricao: string;
  ncm: string;
  cstICMS: string;
  cfop: string;
  unidadeMedida: string;
  quantidade: number;
  valorUnitario: number;
  valorTotalBruto: number;
  baseCalculoICMS: number;
  valorICMS: number;
  aliquotaICMS: number | string;
}

interface DanfeTotais {
  baseCalculoICMS: number;
  valorTotalICMS: number;
  baseCalculoICMSST: number;
  valorTotalICMSST: number;
  valorTotalProdutos: number;
  valorTotalNota: number;
  valorTotalFrete: number;
  valorTotalSeguro: number;
  valorTotalDesconto: number;
  valorTotalIPI: number;
  valorTotalPIS: number;
  valorTotalCOFINS: number;
}

export interface DanfeLayoutProps {
  numero: number | string;
  serie: number | string;
  tipoDocumento: number | string;
  naturezaOperacao: string;
  chaveAcesso?: string;
  protocoloAutorizacao?: string;
  dataHoraAutorizacao?: string;
  emitente: DanfeEmitente;
  destinatario: DanfeDestinatario;
  duplicatas: DanfeDuplicata[];
  itens: DanfeItem[];
  totais: DanfeTotais;
  informacoesAdicionais?: string;
}

export const DanfeLayout: React.FC<DanfeLayoutProps> = ({
  numero,
  serie,
  tipoDocumento,
  naturezaOperacao,
  chaveAcesso,
  protocoloAutorizacao,
  dataHoraAutorizacao,
  emitente,
  destinatario,
  duplicatas,
  itens,
  totais,
  informacoesAdicionais,
}) => {
  const barcodeSvgRef = useRef<SVGSVGElement | null>(null);
  const temChaveAcesso = !!chaveAcesso && chaveAcesso.replace(/\D/g, '').length === 44;

  useEffect(() => {
    if (barcodeSvgRef.current && temChaveAcesso) {
      try {
        JsBarcode(barcodeSvgRef.current, chaveAcesso as string, {
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
  }, [chaveAcesso, temChaveAcesso]);

  return (
    <div className="bg-white text-black max-w-4xl w-full mx-auto p-6 rounded-b-xl font-sans text-xs space-y-2">

      <div className="border border-black p-2 text-[9px]">
        <div className="flex items-center justify-between border-b border-dashed border-black pb-1.5">
          <div>
            RECEBEMOS DE <span className="font-bold">{emitente.razaoSocial}</span> OS PRODUTOS CONSTANTES DA NOTA FISCAL INDICADA AO LADO
          </div>
          <div className="text-right font-bold text-xs pl-2 border-l border-black">
            NF-e Nº {numero}<br/>SÉRIE {serie}
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

      <div className="border border-black grid grid-cols-12">

        <div className="col-span-5 p-3 border-r border-black flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black text-sm mb-1">
              SUP
            </div>
            <div className="font-bold text-xs leading-tight">{emitente.razaoSocial}</div>
            <div className="text-[10px] text-slate-700 leading-tight mt-1">
              {emitente.endereco.logradouro}, {emitente.endereco.numero} {emitente.endereco.complemento || ''}<br/>
              {emitente.endereco.bairro} - CEP: {formatarCEP(emitente.endereco.cep)}<br/>
              {emitente.endereco.nomeMunicipio} - {emitente.endereco.uf} - Fone: {emitente.endereco.telefone || '-'}
            </div>
          </div>
        </div>

        <div className="col-span-3 p-3 border-r border-black flex flex-col items-center justify-center text-center">
          <div className="font-black text-sm tracking-wider">DANFE</div>
          <div className="text-[8px] text-slate-600 leading-tight">Documento Auxiliar da Nota Fiscal Eletrônica</div>

          <div className="flex items-center space-x-2 my-2 text-[10px]">
            <div>
              <span className="font-bold">0</span> - Entrada<br/>
              <span className="font-bold">1</span> - Saída
            </div>
            <div className="w-6 h-6 border border-black font-black text-sm flex items-center justify-center bg-slate-100">
              {tipoDocumento}
            </div>
          </div>

          <div className="font-black text-xs">
            Nº {numero.toString().padStart(9, '0')}<br/>
            SÉRIE {serie.toString().padStart(3, '0')}<br/>
            FOLHA 1/1
          </div>
        </div>

        <div className="col-span-4 p-2 flex flex-col justify-between">
          <div className="flex flex-col items-center">
            {temChaveAcesso ? (
              <svg ref={barcodeSvgRef} className="w-full h-11"></svg>
            ) : (
              <div className="w-full h-11 flex items-center justify-center border border-dashed border-slate-300 text-[8px] text-slate-400">
                Código de barras gerado após a autorização
              </div>
            )}
          </div>
          <div>
            <span className="text-[8px] font-bold block uppercase text-slate-600">Chave de Acesso</span>
            <span className="font-mono text-[9px] font-bold tracking-tight block">
              {temChaveAcesso ? formatarChaveAcesso44(chaveAcesso as string) : 'GERADA NA AUTORIZAÇÃO PELA SEFAZ'}
            </span>
          </div>
          <div className="text-[8px] text-slate-600 mt-1 border-t border-slate-200 pt-1">
            Consulta de autenticidade no portal nacional da NF-e www.nfe.fazenda.gov.br ou no site da Sefaz Autorizadora.
          </div>
        </div>

      </div>

      <div className="border border-black grid grid-cols-12 text-[9px]">
        <div className="col-span-7 p-1.5 border-r border-black">
          <span className="block text-[8px] text-slate-500 font-bold uppercase">Natureza da Operação</span>
          <span className="font-bold text-[10px] text-slate-900">{naturezaOperacao}</span>
        </div>
        <div className="col-span-5 p-1.5">
          <span className="block text-[8px] text-slate-500 font-bold uppercase">Protocolo de Autorização de Uso</span>
          <span className="font-bold text-[10px] text-slate-900">
            {protocoloAutorizacao && dataHoraAutorizacao
              ? `${protocoloAutorizacao} - ${new Date(dataHoraAutorizacao).toLocaleDateString('pt-BR')} ${new Date(dataHoraAutorizacao).toLocaleTimeString('pt-BR')}`
              : 'AGUARDANDO TRANSMISSÃO PARA A SEFAZ'}
          </span>
        </div>
      </div>

      <div className="border border-black grid grid-cols-3 text-[9px]">
        <div className="p-1.5 border-r border-black">
          <span className="block text-[8px] text-slate-500 uppercase font-bold">Inscrição Estadual</span>
          <span className="font-bold">{emitente.inscricaoEstadual || 'ISENTO'}</span>
        </div>
        <div className="p-1.5 border-r border-black">
          <span className="block text-[8px] text-slate-500 uppercase font-bold">Inscr. Estadual do Subst. Trib.</span>
          <span className="font-bold">-</span>
        </div>
        <div className="p-1.5">
          <span className="block text-[8px] text-slate-500 uppercase font-bold">CNPJ</span>
          <span className="font-bold">{formatarCpfCnpj(emitente.cnpj)}</span>
        </div>
      </div>

      <div className="border border-black text-[9px]">
        <div className="bg-slate-100 px-2 py-0.5 font-bold uppercase text-[8px] border-b border-black">
          DESTINATÁRIO / REMETENTE
        </div>
        <div className="grid grid-cols-12 p-1.5 gap-y-1">
          <div className="col-span-8">
            <span className="block text-[8px] text-slate-500">NOME / RAZÃO SOCIAL</span>
            <span className="font-bold text-[10px]">{destinatario.nomeRazaoSocial || '—'}</span>
          </div>
          <div className="col-span-4">
            <span className="block text-[8px] text-slate-500">CNPJ / CPF</span>
            <span className="font-bold text-[10px]">{destinatario.documento ? formatarCpfCnpj(destinatario.documento) : '—'}</span>
          </div>
          <div className="col-span-6">
            <span className="block text-[8px] text-slate-500">ENDEREÇO</span>
            <span>{destinatario.endereco.logradouro}{destinatario.endereco.numero ? `, ${destinatario.endereco.numero}` : ''} {destinatario.endereco.complemento || ''}</span>
          </div>
          <div className="col-span-3">
            <span className="block text-[8px] text-slate-500">BAIRRO / DISTRITO</span>
            <span>{destinatario.endereco.bairro}</span>
          </div>
          <div className="col-span-3">
            <span className="block text-[8px] text-slate-500">CEP</span>
            <span>{formatarCEP(destinatario.endereco.cep)}</span>
          </div>
          <div className="col-span-4">
            <span className="block text-[8px] text-slate-500">MUNICÍPIO</span>
            <span>{destinatario.endereco.nomeMunicipio}</span>
          </div>
          <div className="col-span-2">
            <span className="block text-[8px] text-slate-500">UF</span>
            <span>{destinatario.endereco.uf}</span>
          </div>
          <div className="col-span-3">
            <span className="block text-[8px] text-slate-500">FONE / FAX</span>
            <span>{destinatario.telefone || '-'}</span>
          </div>
          <div className="col-span-3">
            <span className="block text-[8px] text-slate-500">INSCRIÇÃO ESTADUAL</span>
            <span>{destinatario.inscricaoEstadual || 'ISENTO'}</span>
          </div>
        </div>
      </div>

      {duplicatas.length > 0 && (
        <div className="border border-black text-[9px]">
          <div className="bg-slate-100 px-2 py-0.5 font-bold uppercase text-[8px] border-b border-black">
            FATURA / DUPLICATA
          </div>
          <div className="p-1.5 flex flex-wrap gap-3">
            {duplicatas.map((dup, i) => (
              <div key={i} className="border border-slate-300 p-1 rounded bg-slate-50 min-w-[130px]">
                <div className="text-[8px] text-slate-500">Nº {dup.numero}</div>
                <div className="font-bold">Venc: {new Date(dup.dataVencimento + 'T00:00:00').toLocaleDateString('pt-BR')}</div>
                <div className="font-bold text-slate-900">{formatarMoeda(dup.valor)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border border-black text-[9px]">
        <div className="bg-slate-100 px-2 py-0.5 font-bold uppercase text-[8px] border-b border-black">
          CÁLCULO DO IMPOSTO
        </div>
        <div className="grid grid-cols-6 p-1 text-center">
          <div>
            <span className="block text-[7px] text-slate-500">BASE DE CÁLC. ICMS</span>
            <span className="font-bold">{formatarMoeda(totais.baseCalculoICMS)}</span>
          </div>
          <div>
            <span className="block text-[7px] text-slate-500">VALOR DO ICMS</span>
            <span className="font-bold">{formatarMoeda(totais.valorTotalICMS)}</span>
          </div>
          <div>
            <span className="block text-[7px] text-slate-500">BASE CÁLC. ICMS ST</span>
            <span className="font-bold">{formatarMoeda(totais.baseCalculoICMSST)}</span>
          </div>
          <div>
            <span className="block text-[7px] text-slate-500">VALOR DO ICMS ST</span>
            <span className="font-bold">{formatarMoeda(totais.valorTotalICMSST)}</span>
          </div>
          <div>
            <span className="block text-[7px] text-slate-500">VALOR TOTAL PROD.</span>
            <span className="font-bold">{formatarMoeda(totais.valorTotalProdutos)}</span>
          </div>
          <div className="bg-slate-100 p-0.5 rounded">
            <span className="block text-[7px] text-slate-700 font-bold">VALOR TOTAL DA NOTA</span>
            <span className="font-black text-[11px] text-slate-900">{formatarMoeda(totais.valorTotalNota)}</span>
          </div>
        </div>
        <div className="grid grid-cols-6 p-1 border-t border-slate-200 text-center">
          <div>
            <span className="block text-[7px] text-slate-500">VALOR DO FRETE</span>
            <span>{formatarMoeda(totais.valorTotalFrete)}</span>
          </div>
          <div>
            <span className="block text-[7px] text-slate-500">VALOR DO SEGURO</span>
            <span>{formatarMoeda(totais.valorTotalSeguro)}</span>
          </div>
          <div>
            <span className="block text-[7px] text-slate-500">DESCONTO</span>
            <span>{formatarMoeda(totais.valorTotalDesconto)}</span>
          </div>
          <div>
            <span className="block text-[7px] text-slate-500">VALOR DO IPI</span>
            <span>{formatarMoeda(totais.valorTotalIPI)}</span>
          </div>
          <div>
            <span className="block text-[7px] text-slate-500">VALOR DO PIS</span>
            <span>{formatarMoeda(totais.valorTotalPIS)}</span>
          </div>
          <div>
            <span className="block text-[7px] text-slate-500">VALOR DA COFINS</span>
            <span>{formatarMoeda(totais.valorTotalCOFINS)}</span>
          </div>
        </div>
      </div>

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
            {itens.map((it, idx) => (
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

      <div className="border border-black text-[9px] p-2 space-y-1">
        <div className="font-bold text-[8px] uppercase text-slate-700">DADOS ADICIONAIS / INFORMAÇÕES COMPLEMENTARES</div>
        <div className="text-slate-700 leading-relaxed">
          {informacoesAdicionais || 'Emitido por SUP TECNOLOGIA - Sistema Emissor Fiscal Integrado.'}
        </div>
        <div className="text-[8px] text-slate-500 pt-1 border-t border-slate-200 flex items-center justify-between">
          <span>Emitido e Autorizado via SEFAZ - Transmissão Síncrona SUP TECNOLOGIA ERP</span>
          <span className="font-mono">Sistema Homologado 2026</span>
        </div>
      </div>

    </div>
  );
};
