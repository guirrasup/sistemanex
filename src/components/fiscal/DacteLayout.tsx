// src/components/fiscal/DacteLayout.tsx
// Espelho visual do DACTE (Documento Auxiliar do Conhecimento de Transporte
// Eletrônico) — componente puro (props in, JSX out), usado TANTO no preview
// pré-emissão (CteEmissor) quanto na visualização pós-emissão (DacteViewer),
// pra garantir que o preview seja um espelho de verdade do documento real, não
// uma versão resumida à parte. Chave de acesso/protocolo/data de autorização
// ainda não existem no momento do preview (só são gerados na autorização pela
// SEFAZ), então ficam como placeholder quando ausentes.
import React from 'react';
import { formatarCpfCnpj } from '../../utils/cpfCnpjValidator';

export interface DacteEndereco {
  logradouro: string;
  numero: string;
  bairro: string;
  nomeMunicipio: string;
  uf: string;
  cep: string;
}

export interface DacteParticipante {
  razaoSocial: string;
  documento: string;
  inscricaoEstadual?: string;
  endereco: DacteEndereco;
}

export interface DacteQuantidade {
  cUnid: string;
  tpMed: string;
  qCarga: number;
}

export interface DacteDocumentoTransportado {
  tipo: string;
  chave?: string;
}

export interface DacteComponente {
  xNome: string;
  vComp: number;
}

export interface DacteLayoutProps {
  numero: number;
  serie: number;
  modelo?: string;
  chaveAcesso?: string;
  protocoloAutorizacao?: string;
  dataHoraEmissao?: string;
  cfop: string;
  naturezaOperacao: string;
  municipioInicioNome: string;
  municipioInicioUf: string;
  municipioFimNome: string;
  municipioFimUf: string;
  tomadorServico: number;
  emitente: {
    razaoSocial: string;
    nomeFantasia?: string;
    cnpj: string;
    inscricaoEstadual?: string;
    endereco: DacteEndereco;
  };
  remetente: DacteParticipante;
  destinatario: DacteParticipante;
  produtoPredominante: string;
  valorCargaAverbada: number;
  quantidades: DacteQuantidade[];
  documentos: DacteDocumentoTransportado[];
  componentes: DacteComponente[];
  transportadora?: { razaoSocial: string; rntrc?: string };
  aliquotaICMS?: number;
  baseCalculoICMS?: number;
  valorICMS?: number;
  valorTotalFrete: number;
}

const TOMADOR_LABEL: Record<number, string> = {
  0: 'REMETENTE (CIF)',
  1: 'EXPEDIDOR',
  2: 'RECEBEDOR',
  3: 'DESTINATÁRIO (FOB)',
  4: 'OUTROS',
};

function formatarMoeda(valor: number | undefined | null): string {
  return (Number(valor) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function buscarQuantidade(quantidades: DacteQuantidade[], termo: string): DacteQuantidade | undefined {
  return quantidades.find(q => q.tpMed?.toUpperCase().includes(termo));
}

export const DacteLayout: React.FC<DacteLayoutProps> = ({
  numero, serie, modelo = '57', chaveAcesso, protocoloAutorizacao, dataHoraEmissao,
  cfop, naturezaOperacao, municipioInicioNome, municipioInicioUf, municipioFimNome, municipioFimUf,
  tomadorServico, emitente, remetente, destinatario, produtoPredominante, valorCargaAverbada,
  quantidades, documentos, componentes, transportadora, aliquotaICMS, baseCalculoICMS, valorICMS,
  valorTotalFrete,
}) => {
  const pesoBruto = buscarQuantidade(quantidades, 'PESO');
  const volumes = buscarQuantidade(quantidades, 'VOLUME');
  const chavesNFe = documentos.filter(d => d.chave).map(d => d.chave);

  return (
    <div className="bg-white border-2 border-slate-800 p-4 font-sans text-xs text-slate-900 space-y-2.5 print:border print:m-0 print:p-2">

      <div className="grid grid-cols-12 border-b-2 border-slate-800 pb-2 gap-2">

        <div className="col-span-5 border-r border-slate-400 pr-2 space-y-0.5">
          <div className="font-extrabold text-sm uppercase leading-tight">{emitente.razaoSocial}</div>
          <div className="text-[10px] text-slate-600">{emitente.nomeFantasia || 'Transportes e Logística'}</div>
          <div className="text-[10px] text-slate-700 leading-tight">
            {emitente.endereco.logradouro}, {emitente.endereco.numero} - {emitente.endereco.bairro}<br />
            {emitente.endereco.nomeMunicipio}/{emitente.endereco.uf} - CEP: {emitente.endereco.cep}
          </div>
          <div className="text-[10px] font-semibold pt-0.5">
            CNPJ: {formatarCpfCnpj(emitente.cnpj)} • IE: {emitente.inscricaoEstadual || 'ISENTO'}
          </div>
        </div>

        <div className="col-span-3 text-center border-r border-slate-400 px-2 flex flex-col justify-center">
          <div className="font-black text-sm uppercase tracking-wider">DACTE</div>
          <div className="text-[9px] uppercase leading-tight font-medium">
            Documento Auxiliar do Conhecimento de Transporte Eletrônico
          </div>
          <div className="mt-1 text-[11px] font-bold">
            MOD: {modelo} • SÉRIE: {serie}
          </div>
          <div className="text-xs font-black">
            Nº {numero.toString().padStart(9, '0')}
          </div>
        </div>

        <div className="col-span-4 pl-2 flex flex-col justify-center space-y-1">
          {chaveAcesso ? (
            <>
              <div className="bg-slate-100 p-1 border border-slate-300 text-center font-mono text-[9px] font-bold tracking-wider">
                {chaveAcesso.replace(/(\d{4})/g, '$1 ')}
              </div>
              <div className="text-[9px] text-center text-slate-600">
                Consulta de autenticidade no portal nacional do CT-e (www.cte.fazenda.gov.br) ou SEFAZ autorizadora
              </div>
              <div className="text-[10px] font-bold text-center text-emerald-800">
                {protocoloAutorizacao ? `Protocolo: ${protocoloAutorizacao} - ` : ''}
                {dataHoraEmissao ? new Date(dataHoraEmissao).toLocaleString('pt-BR') : ''}
              </div>
            </>
          ) : (
            <div className="border border-dashed border-slate-300 rounded p-2 text-center text-[9px] text-slate-500">
              Chave de acesso e protocolo gerados na autorização pela SEFAZ — aguardando transmissão
            </div>
          )}
        </div>

      </div>

      <div className="grid grid-cols-4 border border-slate-800 text-[10px]">
        <div className="p-1 border-r border-slate-800">
          <span className="font-bold block text-slate-600">CFOP / NATUREZA:</span>
          <span className="font-semibold">{cfop} - {naturezaOperacao.slice(0, 30)}{naturezaOperacao.length > 30 ? '...' : ''}</span>
        </div>
        <div className="p-1 border-r border-slate-800">
          <span className="font-bold block text-slate-600">INÍCIO DA PRESTAÇÃO:</span>
          <span className="font-bold">{municipioInicioNome} / {municipioInicioUf}</span>
        </div>
        <div className="p-1 border-r border-slate-800">
          <span className="font-bold block text-slate-600">TÉRMINO DA PRESTAÇÃO:</span>
          <span className="font-bold">{municipioFimNome} / {municipioFimUf}</span>
        </div>
        <div className="p-1 bg-slate-50">
          <span className="font-bold block text-slate-600">TOMADOR DO SERVIÇO:</span>
          <span className="font-bold text-blue-900">
            {TOMADOR_LABEL[tomadorServico] || tomadorServico}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">

        <div className="border border-slate-800 p-2 space-y-0.5 text-[10px]">
          <div className="font-bold text-[11px] uppercase text-blue-900 border-b border-slate-300 pb-0.5 flex items-center justify-between">
            <span>REMETENTE</span>
            <span>CNPJ/CPF: {formatarCpfCnpj(remetente.documento)}</span>
          </div>
          <div className="font-semibold text-slate-900">{remetente.razaoSocial}</div>
          <div>{remetente.endereco.logradouro}, {remetente.endereco.numero} - {remetente.endereco.bairro}</div>
          <div>{remetente.endereco.nomeMunicipio}/{remetente.endereco.uf} - CEP: {remetente.endereco.cep}</div>
          <div>Inscrição Estadual: {remetente.inscricaoEstadual || 'ISENTO'}</div>
        </div>

        <div className="border border-slate-800 p-2 space-y-0.5 text-[10px]">
          <div className="font-bold text-[11px] uppercase text-emerald-900 border-b border-slate-300 pb-0.5 flex items-center justify-between">
            <span>DESTINATÁRIO</span>
            <span>CNPJ/CPF: {formatarCpfCnpj(destinatario.documento)}</span>
          </div>
          <div className="font-semibold text-slate-900">{destinatario.razaoSocial}</div>
          <div>{destinatario.endereco.logradouro}, {destinatario.endereco.numero} - {destinatario.endereco.bairro}</div>
          <div>{destinatario.endereco.nomeMunicipio}/{destinatario.endereco.uf} - CEP: {destinatario.endereco.cep}</div>
          <div>Inscrição Estadual: {destinatario.inscricaoEstadual || 'ISENTO'}</div>
        </div>

      </div>

      <div className="border border-slate-800 p-2 space-y-1 text-[10px]">
        <div className="font-bold text-[11px] uppercase border-b border-slate-300 pb-0.5">
          INFORMAÇÕES DA CARGA & DOCUMENTOS TRANSPORTADOS
        </div>
        <div className="grid grid-cols-4 gap-2">
          <div>
            <span className="text-slate-600 block">PRODUTO PREDOMINANTE:</span>
            <span className="font-semibold">{produtoPredominante}</span>
          </div>
          <div>
            <span className="text-slate-600 block">VALOR DA CARGA AVERBADA:</span>
            <span className="font-bold text-slate-900">{formatarMoeda(valorCargaAverbada)}</span>
          </div>
          <div>
            <span className="text-slate-600 block">PESO BRUTO:</span>
            <span className="font-semibold">{pesoBruto ? `${pesoBruto.qCarga} Kg` : '—'}</span>
          </div>
          <div>
            <span className="text-slate-600 block">VOLUMES:</span>
            <span className="font-semibold">{volumes ? volumes.qCarga : '—'}</span>
          </div>
        </div>

        <div className="pt-1 border-t border-slate-200">
          <span className="font-bold text-slate-700">CHAVES DE NF-e TRANSPORTADAS:</span>
          <div className="font-mono text-[9px] text-slate-800 bg-slate-50 p-1 rounded mt-0.5">
            {chavesNFe.length > 0 ? chavesNFe.join(' • ') : 'Nenhum documento informado'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 border border-slate-800 text-[10px]">

        <div className="col-span-8 p-2 border-r border-slate-800 space-y-1">
          <div className="font-bold border-b border-slate-300 pb-0.5">COMPONENTES DO VALOR DA PRESTAÇÃO</div>
          <div className="grid grid-cols-4 gap-1 text-[9px]">
            {componentes.map((c, i) => (
              <div key={i}>{c.xNome}: <strong>{formatarMoeda(c.vComp)}</strong></div>
            ))}
          </div>
          <div className="text-[9px] text-slate-600 pt-1">
            {transportadora
              ? `Transportadora: ${transportadora.razaoSocial} • RNTRC: ${transportadora.rntrc || 'não cadastrado'}`
              : 'Carga própria (sem transportadora terceirizada) • RNTRC: ISENTO'}
          </div>
        </div>

        <div className="col-span-4 p-2 bg-slate-50 flex flex-col justify-between">
          <div>
            <div className="text-slate-600">Base ICMS ({aliquotaICMS ?? 0}%): <strong>{formatarMoeda(baseCalculoICMS)}</strong></div>
            <div className="text-slate-600">ICMS Apurado: <strong>{formatarMoeda(valorICMS)}</strong></div>
          </div>
          <div className="border-t border-slate-300 pt-1 text-right">
            <span className="text-[9px] block text-slate-500 font-bold">TOTAL DO FRETE:</span>
            <span className="text-sm font-black text-blue-900">{formatarMoeda(valorTotalFrete)}</span>
          </div>
        </div>

      </div>

      <div className="border border-slate-800 p-2 text-[9px] space-y-1 border-dashed">
        <div className="flex justify-between font-bold">
          <span>DECLARO QUE RECEBI OS VOLUMES DESTE CONHECIMENTO EM PERFEITO ESTADO</span>
          <span>CT-e Nº {numero}</span>
        </div>
        <div className="grid grid-cols-3 gap-4 pt-3">
          <div className="border-t border-slate-400 text-center">DATA DO RECEBIMENTO</div>
          <div className="border-t border-slate-400 text-center">NOME LEGÍVEL DO RECEBEDOR</div>
          <div className="border-t border-slate-400 text-center">ASSINATURA DO RECEBEDOR</div>
        </div>
      </div>

    </div>
  );
};
