// src/components/fiscal/DanfceLayout.tsx
// Layout puro do cupom DANFCE, reaproveitado tanto na visualização pós-emissão
// (DanfceViewer) quanto no preview de pré-emissão (NfceEmissor) — mesmo
// princípio do DanfeLayout (NF-e): um único componente, sem duas versões que
// podem divergir. QR code real (gerado a partir da urlQrCode devolvida pela
// SEFAZ) e chave de acesso só existem depois da autorização; antes disso,
// aparecem como placeholder.
import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { QrCode as QrCodeIcon } from 'lucide-react';
import { formatarMoeda, formatarCpfCnpj } from '../../utils/cpfCnpjValidator';

interface DanfceEndereco {
  logradouro: string;
  numero: string;
  bairro: string;
  nomeMunicipio: string;
  uf: string;
}

interface DanfceEmitente {
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  inscricaoEstadual?: string;
  endereco: DanfceEndereco;
}

interface DanfceItem {
  id: string;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  valorTotalBruto: number;
}

const FORMAS_PAGAMENTO: Record<string, string> = {
  '01': 'Dinheiro', '02': 'Cheque', '03': 'Cartão de Crédito', '04': 'Cartão de Débito',
  '05': 'Crédito Loja', '10': 'Vale Alimentação', '11': 'Vale Refeição', '12': 'Vale Presente',
  '13': 'Vale Combustível', '15': 'Boleto', '17': 'PIX', '90': 'Sem Pagamento', '99': 'Outros',
};

export interface DanfceLayoutProps {
  numero: number | string;
  serie: number | string;
  dataHoraEmissao?: string;
  chaveAcesso?: string;
  protocoloAutorizacao?: string;
  urlQrCode?: string;
  emitente: DanfceEmitente;
  consumidor?: { cpfCnpj?: string; nomeRazaoSocial?: string } | null;
  itens: DanfceItem[];
  valorTotalProdutos: number;
  valorTotalDesconto: number;
  valorTotalNota: number;
  valorPago: number;
  valorTroco: number;
  valorTotalTributosAprox: number;
  formaPagamento: string;
}

export const DanfceLayout: React.FC<DanfceLayoutProps> = ({
  numero,
  serie,
  dataHoraEmissao,
  chaveAcesso,
  protocoloAutorizacao,
  urlQrCode,
  emitente,
  consumidor,
  itens,
  valorTotalProdutos,
  valorTotalDesconto,
  valorTotalNota,
  valorPago,
  valorTroco,
  valorTotalTributosAprox,
  formaPagamento,
}) => {
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const temQrCode = !!urlQrCode;

  useEffect(() => {
    if (qrCanvasRef.current && urlQrCode) {
      QRCode.toCanvas(qrCanvasRef.current, urlQrCode, {
        width: 112,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' },
      }).catch((err) => console.error('Erro ao renderizar QR Code:', err));
    }
  }, [urlQrCode]);

  return (
    <div className="bg-white rounded-lg border border-slate-300 p-6 shadow-sm font-mono text-xs text-slate-800 space-y-4 max-w-md mx-auto print:border-none print:shadow-none print:p-0">

      <div className="text-center border-b border-dashed border-slate-300 pb-3 space-y-0.5">
        <div className="font-bold text-sm text-slate-900">{emitente.razaoSocial}</div>
        {emitente.nomeFantasia && (
          <div className="text-[11px] text-slate-600">{emitente.nomeFantasia}</div>
        )}
        <div className="text-[10px] text-slate-500">
          CNPJ: {formatarCpfCnpj(emitente.cnpj)} • IE: {emitente.inscricaoEstadual || '-'}
        </div>
        <div className="text-[10px] text-slate-500">
          {emitente.endereco.logradouro}, {emitente.endereco.numero} - {emitente.endereco.bairro}, {emitente.endereco.nomeMunicipio}/{emitente.endereco.uf}
        </div>
      </div>

      <div className="text-center border-b border-dashed border-slate-300 pb-2 space-y-0.5">
        <div className="font-bold text-xs uppercase tracking-wide">
          DANFE NFC-e - Documento Auxiliar da Nota Fiscal de Consumidor Eletrônica
        </div>
        <div className="text-[10px] text-slate-500">
          Não permite aproveitamento de crédito de ICMS
        </div>
      </div>

      <div className="space-y-2 border-b border-dashed border-slate-300 pb-3">
        <div className="grid grid-cols-12 text-[10px] font-bold text-slate-700 uppercase border-b border-slate-200 pb-1">
          <span className="col-span-1">#</span>
          <span className="col-span-6">Descrição</span>
          <span className="col-span-2 text-right">Qtd x Unit</span>
          <span className="col-span-3 text-right">Total (R$)</span>
        </div>

        {itens.length === 0 ? (
          <div className="text-center text-slate-400 text-[10px] py-2">Nenhum item no cupom</div>
        ) : (
          itens.map((item, idx) => {
            // 🔥 Blindagem: mesmo com os chamadores corrigidos, qualquer valor que
            // chegue como string (Decimal do Prisma) não pode quebrar o preview —
            // é exatamente esse .toFixed() em string que já crashou 2x nesta sessão.
            const qtd = Number(item.quantidade) || 0;
            const vUnit = Number(item.valorUnitario) || 0;
            const vTotal = Number(item.valorTotalBruto) || 0;
            return (
              <div key={item.id} className="grid grid-cols-12 text-[10px] leading-tight">
                <span className="col-span-1 text-slate-500">{(idx + 1).toString().padStart(2, '0')}</span>
                <span className="col-span-6 truncate font-medium text-slate-900">{item.descricao}</span>
                <span className="col-span-2 text-right text-slate-600">{qtd}x{vUnit.toFixed(2)}</span>
                <span className="col-span-3 text-right font-bold text-slate-900">{vTotal.toFixed(2)}</span>
              </div>
            );
          })
        )}
      </div>

      <div className="space-y-1 text-xs border-b border-dashed border-slate-300 pb-3">
        <div className="flex justify-between text-slate-600">
          <span>Qtd. Total de Itens:</span>
          <span>{itens.reduce((acc, it) => acc + (Number(it.quantidade) || 0), 0)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Subtotal:</span>
          <span>{formatarMoeda(valorTotalProdutos)}</span>
        </div>
        {valorTotalDesconto > 0 && (
          <div className="flex justify-between text-rose-600">
            <span>Desconto:</span>
            <span>-{formatarMoeda(valorTotalDesconto)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1 border-t border-slate-200">
          <span>VALOR TOTAL R$:</span>
          <span>{formatarMoeda(valorTotalNota)}</span>
        </div>

        <div className="flex justify-between text-slate-700 pt-1">
          <span>Forma de Pagamento ({FORMAS_PAGAMENTO[formaPagamento] || formaPagamento}):</span>
          <span>{formatarMoeda(valorPago)}</span>
        </div>
        {valorTroco > 0 && (
          <div className="flex justify-between text-slate-700">
            <span>Troco:</span>
            <span>{formatarMoeda(valorTroco)}</span>
          </div>
        )}

        <div className="flex justify-between text-[10px] text-slate-500 pt-1">
          <span>Tributos Totais Incidentes (Lei 12.741/2012):</span>
          <span>{formatarMoeda(valorTotalTributosAprox)}</span>
        </div>
      </div>

      <div className="text-center text-[10px] text-slate-600 border-b border-dashed border-slate-300 pb-2 space-y-0.5">
        {consumidor && consumidor.cpfCnpj ? (
          <>
            <div className="font-bold text-slate-800">CONSUMIDOR IDENTIFICADO</div>
            <div>CPF/CNPJ: {formatarCpfCnpj(consumidor.cpfCnpj)}</div>
            {consumidor.nomeRazaoSocial && (
              <div>Nome: {consumidor.nomeRazaoSocial}</div>
            )}
          </>
        ) : (
          <div className="italic text-slate-500">CONSUMIDOR NÃO IDENTIFICADO</div>
        )}
      </div>

      <div className="text-center text-[10px] text-slate-600 space-y-1">
        <div>
          <strong>NFC-e Nº {numero}</strong> • Série {serie}
          {dataHoraEmissao && <> • Emissão: {new Date(dataHoraEmissao).toLocaleString('pt-BR')}</>}
        </div>
        <div className="text-[9px] break-all font-mono bg-slate-50 p-1 rounded border border-slate-200">
          CHAVE DE ACESSO:<br />
          <strong>{chaveAcesso ? chaveAcesso.replace(/(\d{4})/g, '$1 ') : 'GERADA NA AUTORIZAÇÃO PELA SEFAZ'}</strong>
        </div>
        <div className="text-[10px] text-emerald-700 font-bold">
          {protocoloAutorizacao ? `Protocolo de Autorização: ${protocoloAutorizacao}` : 'Aguardando transmissão para a SEFAZ'}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded border border-slate-200 text-center space-y-2">
        {temQrCode ? (
          <canvas ref={qrCanvasRef} className="border border-slate-300 rounded bg-white" />
        ) : (
          <div className="w-28 h-28 bg-white p-2 border border-dashed border-slate-300 rounded flex flex-col items-center justify-center">
            <QrCodeIcon className="w-16 h-16 text-slate-200" />
            <span className="text-[7px] text-slate-400 font-sans mt-0.5 text-center">QR Code gerado após a autorização</span>
          </div>
        )}
        <div className="text-[9px] text-slate-500 max-w-xs">
          Consulte pela Chave de Acesso ou pelo QR Code no portal da SEFAZ.
        </div>
      </div>

    </div>
  );
};
