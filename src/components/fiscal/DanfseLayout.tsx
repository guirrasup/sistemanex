// src/components/fiscal/DanfseLayout.tsx
// Layout puro do DANFSe, reaproveitado tanto na visualização pós-emissão
// (DanfseViewer) quanto no preview de pré-emissão (NfseEmissor) — mesmo
// princípio do DanfeLayout/DanfceLayout. Diferente de NF-e/NFC-e, a NFS-e
// grava um retrato (snapshot) completo do prestador/tomador/serviço direto
// na própria linha no banco (campos prestador*/tomador*), então a visualização
// pós-emissão não depende dos dados atuais da empresa — mostra exatamente o
// que foi autorizado, mesmo que o cadastro mude depois.
import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { ShieldCheck } from 'lucide-react';
import { formatarMoeda, formatarCpfCnpj, formatarCEP } from '../../utils/cpfCnpjValidator';
import { formatarChaveAcesso44 } from '../../utils/chaveAcesso';

interface DanfseEndereco {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  nomeMunicipio: string;
  uf: string;
  cep: string;
  email?: string;
}

interface DanfsePrestador {
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  inscricaoMunicipal?: string;
  optanteSimplesNacional?: boolean;
  endereco: DanfseEndereco;
}

interface DanfseTomador {
  nomeRazaoSocial: string;
  documento: string;
  inscricaoMunicipal?: string;
  telefone?: string;
  email?: string;
  endereco: DanfseEndereco;
}

export interface DanfseLayoutProps {
  numeroNfse: number | string;
  serieDPS: number | string;
  numeroDPS: number | string;
  codigoVerificacao?: string;
  dataCompetencia?: string;
  chaveAcesso?: string;
  protocoloAutorizacao?: string;
  prestador: DanfsePrestador;
  tomador: DanfseTomador;
  descricaoServico: string;
  codigoTributacaoNacional: string;
  codigoNBS?: string;
  localPrestacaoNomeMunicipio: string;
  localPrestacaoUf: string;
  localPrestacaoCodigoMunicipio?: string;
  valorTotalServicos: number;
  valorTotalDeducoes: number;
  valorTotalDescontos: number;
  baseCalculoISS: number;
  aliquotaISS: number;
  valorTotalISS: number;
  valorPIS: number;
  valorCOFINS: number;
  valorIRRF: number;
  valorCSLL: number;
  valorINSS: number;
  valorCBS: number;
  valorIBSUF: number;
  valorIBSMun: number;
  valorTotalIBS: number;
  valorLiquidoNfse: number;
  valorTotalISSRetido: number;
  informacoesComplementares?: string;
}

export const DanfseLayout: React.FC<DanfseLayoutProps> = ({
  numeroNfse,
  serieDPS,
  numeroDPS,
  codigoVerificacao,
  dataCompetencia,
  chaveAcesso,
  protocoloAutorizacao,
  prestador,
  tomador,
  descricaoServico,
  codigoTributacaoNacional,
  codigoNBS,
  localPrestacaoNomeMunicipio,
  localPrestacaoUf,
  localPrestacaoCodigoMunicipio,
  valorTotalServicos,
  valorTotalDeducoes,
  valorTotalDescontos,
  baseCalculoISS,
  aliquotaISS,
  valorTotalISS,
  valorPIS,
  valorCOFINS,
  valorIRRF,
  valorCSLL,
  valorINSS,
  valorCBS,
  valorIBSUF,
  valorIBSMun,
  valorTotalIBS,
  valorLiquidoNfse,
  valorTotalISSRetido,
  informacoesComplementares,
}) => {
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const temChaveAcesso = !!chaveAcesso;

  useEffect(() => {
    if (qrCanvasRef.current && temChaveAcesso) {
      const qrData = `https://www.nfse.gov.br/consultapublica?chave=${chaveAcesso}&codigo=${codigoVerificacao || ''}`;
      QRCode.toCanvas(qrCanvasRef.current, qrData, {
        width: 110,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' },
      }).catch((err) => console.error('Erro ao renderizar QR Code:', err));
    }
  }, [chaveAcesso, codigoVerificacao, temChaveAcesso]);

  return (
    <div className="bg-white text-black max-w-4xl w-full mx-auto p-8 rounded-b-xl font-sans text-xs">

      <div className="border border-black p-3 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 border border-slate-400 rounded-lg flex flex-col items-center justify-center p-1 bg-slate-50 text-center">
            <span className="font-black text-xs text-indigo-900 tracking-tighter">SUP</span>
            <span className="text-[8px] font-bold text-slate-600">SISTEMAS</span>
          </div>
          <div>
            <div className="font-black text-sm uppercase tracking-tight text-slate-900">
              PREFEITURA MUNICIPAL DE {prestador.endereco.nomeMunicipio.toUpperCase()} - {prestador.endereco.uf}
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

        <div className="flex items-center space-x-3 border-l border-black pl-3 shrink-0">
          {temChaveAcesso ? (
            <canvas ref={qrCanvasRef} className="w-24 h-24 border border-slate-300 rounded"></canvas>
          ) : (
            <div className="w-24 h-24 border border-dashed border-slate-300 rounded flex items-center justify-center text-center p-1">
              <span className="text-[7px] text-slate-400">QR Code gerado após a autorização</span>
            </div>
          )}
          <div className="text-[10px] space-y-1">
            <div>
              <span className="text-slate-500 block text-[8px] uppercase font-bold">Número NFS-e</span>
              <span className="font-black text-sm text-slate-900">{numeroNfse}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[8px] uppercase font-bold">Cód. Verificação</span>
              <span className="font-mono font-bold text-slate-900 text-xs">{codigoVerificacao || '—'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[8px] uppercase font-bold">Competência</span>
              <span className="font-semibold text-slate-800">
                {dataCompetencia ? new Date(dataCompetencia).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-x border-b border-black p-2 bg-slate-50 flex items-center justify-between">
        <div>
          <span className="text-[9px] font-bold uppercase text-slate-600 block">Chave de Acesso NFS-e Nacional</span>
          <span className="font-mono font-bold text-xs tracking-wider text-slate-900">
            {temChaveAcesso ? formatarChaveAcesso44(chaveAcesso as string) : 'GERADA NA AUTORIZAÇÃO PELA SEFAZ'}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[9px] font-bold uppercase text-slate-600 block">Número da DPS / Série</span>
          <span className="font-bold text-xs text-slate-900">Nº {numeroDPS} / Série {serieDPS}</span>
        </div>
      </div>

      <div className="border-x border-b border-black p-2 bg-white flex items-center justify-between">
        <span className="text-[9px] font-bold uppercase text-slate-600">Protocolo de Autorização</span>
        <span className="font-bold text-[10px] text-slate-900">
          {protocoloAutorizacao || 'AGUARDANDO TRANSMISSÃO PARA A SEFAZ'}
        </span>
      </div>

      <div className="border-x border-b border-black p-3">
        <div className="font-bold text-[10px] uppercase text-slate-700 bg-slate-100 px-2 py-0.5 border border-slate-300 mb-2">
          1. PRESTADOR DE SERVIÇOS
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
          <div>
            <div className="font-bold text-slate-900 text-xs">{prestador.razaoSocial}</div>
            <div className="text-slate-600">Nome Fantasia: {prestador.nomeFantasia || '-'}</div>
            <div className="text-slate-700 font-medium mt-1">
              {prestador.endereco.logradouro}, {prestador.endereco.numero} {prestador.endereco.complemento || ''}
            </div>
            <div className="text-slate-700 font-medium">
              Bairro: {prestador.endereco.bairro} - CEP: {formatarCEP(prestador.endereco.cep)} - {prestador.endereco.nomeMunicipio}/{prestador.endereco.uf}
            </div>
          </div>

          <div className="space-y-0.5 md:text-right">
            <div><span className="font-semibold text-slate-600">CNPJ:</span> <span className="font-bold text-slate-900">{formatarCpfCnpj(prestador.cnpj)}</span></div>
            <div><span className="font-semibold text-slate-600">Inscrição Municipal:</span> <span className="font-bold">{prestador.inscricaoMunicipal || '-'}</span></div>
            <div><span className="font-semibold text-slate-600">Regime Tributário:</span> <span className="font-semibold text-indigo-700">{prestador.optanteSimplesNacional ? 'Simples Nacional (ME/EPP)' : 'Lucro Presumido / Real'}</span></div>
            <div><span className="font-semibold text-slate-600">E-mail:</span> <span>{prestador.endereco.email || '-'}</span></div>
          </div>
        </div>
      </div>

      <div className="border-x border-b border-black p-3">
        <div className="font-bold text-[10px] uppercase text-slate-700 bg-slate-100 px-2 py-0.5 border border-slate-300 mb-2">
          2. TOMADOR DE SERVIÇOS
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
          <div>
            <div className="font-bold text-slate-900 text-xs">{tomador.nomeRazaoSocial || '—'}</div>
            <div className="text-slate-700 font-medium mt-1">
              {tomador.endereco.logradouro}{tomador.endereco.numero ? `, ${tomador.endereco.numero}` : ''} {tomador.endereco.complemento || ''}
            </div>
            <div className="text-slate-700 font-medium">
              Bairro: {tomador.endereco.bairro} - CEP: {formatarCEP(tomador.endereco.cep)} - {tomador.endereco.nomeMunicipio}/{tomador.endereco.uf}
            </div>
          </div>

          <div className="space-y-0.5 md:text-right">
            <div><span className="font-semibold text-slate-600">CPF / CNPJ:</span> <span className="font-bold text-slate-900">{tomador.documento ? formatarCpfCnpj(tomador.documento) : '—'}</span></div>
            <div><span className="font-semibold text-slate-600">Inscrição Municipal:</span> <span>{tomador.inscricaoMunicipal || 'Não Informada'}</span></div>
            <div><span className="font-semibold text-slate-600">Telefone:</span> <span>{tomador.telefone || '-'}</span></div>
            <div><span className="font-semibold text-slate-600">E-mail:</span> <span>{tomador.email || '-'}</span></div>
          </div>
        </div>
      </div>

      <div className="border-x border-b border-black p-3 min-h-[100px]">
        <div className="font-bold text-[10px] uppercase text-slate-700 bg-slate-100 px-2 py-0.5 border border-slate-300 mb-2 flex items-center justify-between">
          <span>3. DISCRIMINAÇÃO DOS SERVIÇOS PRESTADOS</span>
          <span className="text-[9px] font-normal text-slate-500">
            Local da Prestação: {localPrestacaoNomeMunicipio} - {localPrestacaoUf}{localPrestacaoCodigoMunicipio ? ` (Cód. IBGE: ${localPrestacaoCodigoMunicipio})` : ''}
          </span>
        </div>

        <div className="whitespace-pre-wrap text-slate-800 text-xs leading-relaxed font-sans font-medium">
          {descricaoServico || '—'}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-slate-600">
          <div>
            <span className="font-bold">Item da Lista de Serviços (LC 116/03):</span> {codigoTributacaoNacional || '—'}
          </div>
          <div>
            <span className="font-bold">Nomenclatura Brasileira de Serviços (NBS):</span> {codigoNBS || '—'}
          </div>
        </div>
      </div>

      <div className="border-x border-b border-black p-3">
        <div className="font-bold text-[10px] uppercase text-slate-700 bg-slate-100 px-2 py-0.5 border border-slate-300 mb-2">
          4. APURAÇÃO DO ISSQN E RETENÇÕES FEDERAIS
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-[10px] mb-3">
          <div className="border border-slate-300 p-1.5 rounded">
            <div className="text-slate-500 font-bold text-[8px] uppercase">Valor dos Serviços</div>
            <div className="font-bold text-slate-900 text-xs mt-0.5">{formatarMoeda(valorTotalServicos)}</div>
          </div>
          <div className="border border-slate-300 p-1.5 rounded">
            <div className="text-slate-500 font-bold text-[8px] uppercase">Deduções / Reduções</div>
            <div className="font-bold text-slate-900 text-xs mt-0.5">{formatarMoeda(valorTotalDeducoes)}</div>
          </div>
          <div className="border border-slate-300 p-1.5 rounded">
            <div className="text-slate-500 font-bold text-[8px] uppercase">Desconto Incond.</div>
            <div className="font-bold text-slate-900 text-xs mt-0.5">{formatarMoeda(valorTotalDescontos)}</div>
          </div>
          <div className="border border-slate-300 p-1.5 rounded">
            <div className="text-slate-500 font-bold text-[8px] uppercase">Base de Cálculo</div>
            <div className="font-bold text-slate-900 text-xs mt-0.5">{formatarMoeda(baseCalculoISS)}</div>
          </div>
          <div className="border border-slate-300 p-1.5 rounded">
            <div className="text-slate-500 font-bold text-[8px] uppercase">Alíquota ISS</div>
            <div className="font-bold text-indigo-700 text-xs mt-0.5">{aliquotaISS.toFixed(2)}%</div>
          </div>
          <div className="border border-slate-300 p-1.5 rounded bg-slate-50">
            <div className="text-slate-500 font-bold text-[8px] uppercase">Valor do ISSQN</div>
            <div className="font-bold text-slate-900 text-xs mt-0.5">{formatarMoeda(valorTotalISS)}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[10px]">
          <div className="border border-slate-200 p-1 rounded">
            <div className="text-slate-500 text-[8px]">PIS</div>
            <div className="font-semibold">{formatarMoeda(valorPIS)}</div>
          </div>
          <div className="border border-slate-200 p-1 rounded">
            <div className="text-slate-500 text-[8px]">COFINS</div>
            <div className="font-semibold">{formatarMoeda(valorCOFINS)}</div>
          </div>
          <div className="border border-slate-200 p-1 rounded">
            <div className="text-slate-500 text-[8px]">IRRF</div>
            <div className="font-semibold">{formatarMoeda(valorIRRF)}</div>
          </div>
          <div className="border border-slate-200 p-1 rounded">
            <div className="text-slate-500 text-[8px]">CSLL</div>
            <div className="font-semibold">{formatarMoeda(valorCSLL)}</div>
          </div>
          <div className="border border-slate-200 p-1 rounded">
            <div className="text-slate-500 text-[8px]">INSS Retido</div>
            <div className="font-semibold">{formatarMoeda(valorINSS)}</div>
          </div>
        </div>
      </div>

      <div className="border-x border-b border-black p-3 bg-cyan-50/40">
        <div className="font-bold text-[10px] uppercase text-cyan-900 bg-cyan-100 px-2 py-0.5 border border-cyan-300 mb-2 flex items-center justify-between">
          <span>5. TRIBUTAÇÃO SOBRE CONSUMO - REFORMA TRIBUTÁRIA 2026 (IBS / CBS)</span>
          <span className="text-[9px] font-bold text-cyan-800">Emenda Constitucional nº 132/2023</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px]">
          <div className="border border-cyan-200 bg-white p-1.5 rounded">
            <div className="text-slate-500 text-[8px] uppercase font-bold">CBS União</div>
            <div className="font-bold text-indigo-900 text-xs mt-0.5">{formatarMoeda(valorCBS)}</div>
          </div>
          <div className="border border-cyan-200 bg-white p-1.5 rounded">
            <div className="text-slate-500 text-[8px] uppercase font-bold">IBS Estadual</div>
            <div className="font-bold text-blue-900 text-xs mt-0.5">{formatarMoeda(valorIBSUF)}</div>
          </div>
          <div className="border border-cyan-200 bg-white p-1.5 rounded">
            <div className="text-slate-500 text-[8px] uppercase font-bold">IBS Municipal</div>
            <div className="font-bold text-cyan-900 text-xs mt-0.5">{formatarMoeda(valorIBSMun)}</div>
          </div>
          <div className="border border-cyan-200 bg-white p-1.5 rounded">
            <div className="text-slate-500 text-[8px] uppercase font-bold">Total IBS + CBS</div>
            <div className="font-black text-slate-900 text-xs mt-0.5">{formatarMoeda(valorTotalIBS + valorCBS)}</div>
          </div>
        </div>
      </div>

      <div className="border-x border-b border-black p-3 bg-slate-100 flex items-center justify-between">
        <div>
          <div className="text-[10px] text-slate-600 font-bold uppercase">Valor Total do Documento Fiscal</div>
          <div className="text-[9px] text-slate-500">Valor líquido disponível para pagamento após deduções e retenções</div>
        </div>
        <div className="text-right">
          <div className="text-xl font-black text-slate-900">{formatarMoeda(valorLiquidoNfse)}</div>
          <div className="text-[9px] text-slate-500 font-semibold">ISS Retido: {formatarMoeda(valorTotalISSRetido)}</div>
        </div>
      </div>

      <div className="border-x border-b border-black p-3 text-[10px] space-y-2">
        <div className="font-bold text-slate-700 uppercase text-[9px]">6. INFORMAÇÕES COMPLEMENTARES / OBSERVAÇÕES</div>
        <div className="text-slate-600 text-[10px] leading-relaxed">
          {informacoesComplementares || 'Documento emitido eletronicamente com base na legislação tributária vigente.'}
          <div className="mt-1 font-semibold text-slate-700">
            Retenções federais: {formatarMoeda(valorPIS + valorCOFINS + valorIRRF + valorCSLL + valorINSS)} | ISSQN municipal: {formatarMoeda(valorTotalISS)}.
          </div>
        </div>

        <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-500">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Documento assinado digitalmente com Certificado Digital ICP-Brasil (Padrão XMLDSig).</span>
          </div>
          <div>
            SUP TECNOLOGIA - Sistema Emissor Fiscal &amp; Gestão ERP
          </div>
        </div>
      </div>

    </div>
  );
};
