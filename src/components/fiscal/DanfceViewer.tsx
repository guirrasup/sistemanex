import React from 'react';
import { 
  Printer, 
  Download, 
  ArrowLeft, 
  CheckCircle2, 
  QrCode, 
  ShoppingBag,
  Share2
} from 'lucide-react';
import { NFCeDocumento } from '../../types/fiscal';
import { formatarCpfCnpj } from '../../utils/cpfCnpjValidator';

interface DanfceViewerProps {
  nfce: NFCeDocumento;
  onBack: () => void;
}

export const DanfceViewer: React.FC<DanfceViewerProps> = ({ nfce, onBack }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadXml = () => {
    const blob = new Blob([nfce.xmlAssinado], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NFCe_${nfce.numero}_${nfce.chaveAcesso.slice(-8)}.xml`;
    a.click();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
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
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-3.5 py-1.5 rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Cupom NFC-e</span>
          </button>
        </div>
      </div>

      {/* Cupom Fiscal Eletrônico NFC-e (Estilo Bobina Térmica / DANFE NFC-e) */}
      <div className="bg-white rounded-lg border border-slate-300 p-6 shadow-sm font-mono text-xs text-slate-800 space-y-4 max-w-md mx-auto print:border-none print:shadow-none print:p-0">
        
        {/* Cabeçalho do Emitente */}
        <div className="text-center border-b border-dashed border-slate-300 pb-3 space-y-0.5">
          <div className="font-bold text-sm text-slate-900">{nfce.emitente.razaoSocial}</div>
          {nfce.emitente.nomeFantasia && (
            <div className="text-[11px] text-slate-600">{nfce.emitente.nomeFantasia}</div>
          )}
          <div className="text-[10px] text-slate-500">
            CNPJ: {formatarCpfCnpj(nfce.emitente.cnpj)} • IE: {nfce.emitente.inscricaoEstadual}
          </div>
          <div className="text-[10px] text-slate-500">
            {nfce.emitente.endereco.logradouro}, {nfce.emitente.endereco.numero} - {nfce.emitente.endereco.bairro}, {nfce.emitente.endereco.nomeMunicipio}/{nfce.emitente.endereco.uf}
          </div>
        </div>

        {/* Título do Documento */}
        <div className="text-center border-b border-dashed border-slate-300 pb-2 space-y-0.5">
          <div className="font-bold text-xs uppercase tracking-wide">
            DANFE NFC-e - Documento Auxiliar da Nota Fiscal de Consumidor Eletrônica
          </div>
          <div className="text-[10px] text-slate-500">
            Não permite aproveitamento de crédito de ICMS
          </div>
        </div>

        {/* Tabela de Itens */}
        <div className="space-y-2 border-b border-dashed border-slate-300 pb-3">
          <div className="grid grid-cols-12 text-[10px] font-bold text-slate-700 uppercase border-b border-slate-200 pb-1">
            <span className="col-span-1">#</span>
            <span className="col-span-6">Descrição</span>
            <span className="col-span-2 text-right">Qtd x Unit</span>
            <span className="col-span-3 text-right">Total (R$)</span>
          </div>

          {nfce.itens.map((item, idx) => (
            <div key={item.id} className="grid grid-cols-12 text-[10px] leading-tight">
              <span className="col-span-1 text-slate-500">{(idx + 1).toString().padStart(2, '0')}</span>
              <span className="col-span-6 truncate font-medium text-slate-900">{item.descricao}</span>
              <span className="col-span-2 text-right text-slate-600">{item.quantidade}x{item.valorUnitario.toFixed(2)}</span>
              <span className="col-span-3 text-right font-bold text-slate-900">{item.valorTotalBruto.toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Totalizadores */}
        <div className="space-y-1 text-xs border-b border-dashed border-slate-300 pb-3">
          <div className="flex justify-between text-slate-600">
            <span>Qtd. Total de Itens:</span>
            <span>{nfce.itens.reduce((acc, it) => acc + it.quantidade, 0)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Subtotal:</span>
            <span>{formatarMoeda(nfce.valorTotalProdutos)}</span>
          </div>
          {nfce.valorTotalDesconto > 0 && (
            <div className="flex justify-between text-rose-600">
              <span>Desconto:</span>
              <span>-{formatarMoeda(nfce.valorTotalDesconto)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1 border-t border-slate-200">
            <span>VALOR TOTAL R$:</span>
            <span>{formatarMoeda(nfce.valorTotalNota)}</span>
          </div>

          <div className="flex justify-between text-slate-700 pt-1">
            <span>Forma de Pagamento ({nfce.formaPagamento === '17' ? 'PIX' : nfce.formaPagamento === '01' ? 'Dinheiro' : nfce.formaPagamento === '03' ? 'Cartão Crédito' : 'Cartão Débito'}):</span>
            <span>{formatarMoeda(nfce.valorPago)}</span>
          </div>
          {nfce.valorTroco > 0 && (
            <div className="flex justify-between text-slate-700">
              <span>Troco:</span>
              <span>{formatarMoeda(nfce.valorTroco)}</span>
            </div>
          )}

          <div className="flex justify-between text-[10px] text-slate-500 pt-1">
            <span>Tributos Totais Incidentes (Lei 12.741/2012):</span>
            <span>{formatarMoeda(nfce.valorTotalTributosAproximados)}</span>
          </div>
        </div>

        {/* Identificação do Consumidor */}
        <div className="text-center text-[10px] text-slate-600 border-b border-dashed border-slate-300 pb-2 space-y-0.5">
          {nfce.destinatario && nfce.destinatario.cpfCnpj ? (
            <>
              <div className="font-bold text-slate-800">CONSUMIDOR IDENTIFICADO</div>
              <div>CPF/CNPJ: {formatarCpfCnpj(nfce.destinatario.cpfCnpj)}</div>
              {nfce.destinatario.nomeRazaoSocial && (
                <div>Nome: {nfce.destinatario.nomeRazaoSocial}</div>
              )}
            </>
          ) : (
            <div className="italic text-slate-500">CONSUMIDOR NÃO IDENTIFICADO</div>
          )}
        </div>

        {/* Informações Fiscais e Emissão */}
        <div className="text-center text-[10px] text-slate-600 space-y-1">
          <div>
            <strong>NFC-e Nº {nfce.numero}</strong> • Série {nfce.serie} • Emissão: {new Date(nfce.dataHoraEmissao).toLocaleString('pt-BR')}
          </div>
          <div className="text-[9px] break-all font-mono bg-slate-50 p-1 rounded border border-slate-200">
            CHAVE DE ACESSO:<br />
            <strong>{nfce.chaveAcesso.replace(/(\d{4})/g, '$1 ')}</strong>
          </div>
          <div className="text-[10px] text-emerald-700 font-bold">
            Protocolo de Autorização: {nfce.protocoloAutorizacao}
          </div>
        </div>

        {/* QR Code SEFAZ para Consulta Pública */}
        <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded border border-slate-200 text-center space-y-2">
          <div className="w-28 h-28 bg-white p-2 border border-slate-300 rounded flex flex-col items-center justify-center shadow-2xs">
            <QrCode className="w-20 h-20 text-slate-900" />
            <span className="text-[7px] text-slate-400 font-sans mt-0.5">QR-CODE SEFAZ</span>
          </div>
          <div className="text-[9px] text-slate-500 max-w-xs">
            Consulte pela Chave de Acesso ou pelo QR Code no portal da SEFAZ:<br />
            <span className="text-emerald-700 font-mono text-[8px] break-all">{nfce.urlQrCode}</span>
          </div>
        </div>

      </div>
    </div>
  );
};
