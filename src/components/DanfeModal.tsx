import React from "react";
import { FiscalDocument } from "../types";
import { store } from "../services/store";
import { X, Printer, ShieldCheck, QrCode } from "lucide-react";

interface DanfeModalProps {
  document: FiscalDocument;
  onClose: () => void;
}

export const DanfeModal: React.FC<DanfeModalProps> = ({ document: doc, onClose }) => {
  const company = (store.companies || []).find(c => c.id === doc?.company_id) || (store.companies || [])[0];
  const person = (store.people || []).find(p => p.id === doc?.person_id);
  const items = (store.fiscalDocumentItems || []).filter(i => i.fiscal_document_id === doc?.id);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-white/10 text-slate-100 max-w-4xl w-full rounded-2xl shadow-2xl p-6 space-y-6 my-8 font-sans">
        {/* Header Actions */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-xs uppercase border border-emerald-500/30 font-mono">
              DANFE — Documento Auxiliar da NF-e
            </span>
            <span className="text-xs text-slate-400 font-mono">Status SEFAZ: <strong className="text-emerald-400">AUTORIZADA</strong></span>
          </div>

          <div className="flex items-center gap-2 font-mono">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.3)]"
            >
              <Printer className="w-4 h-4 text-slate-950" /> Imprimir DANFE
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white cursor-pointer rounded-lg bg-white/5 border border-white/10">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* DANFE Official Structure Layout */}
        <div className="bg-white text-slate-900 rounded-xl border-2 border-slate-900 p-4 space-y-4 text-xs">
          {/* Top Row: Issuer info & Key */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-slate-900 pb-3">
            <div className="space-y-1">
              <h2 className="font-extrabold text-sm uppercase">{company.legal_name}</h2>
              <p className="text-[11px] text-slate-700">{company.trade_name}</p>
              <p className="text-[10px] text-slate-600">CNPJ: {company.cnpj}</p>
              <p className="text-[10px] text-slate-600">IE: {company.state_registration}</p>
            </div>

            <div className="border-x border-slate-900 px-3 text-center space-y-1">
              <span className="font-extrabold text-base block">DANFE</span>
              <span className="text-[10px] uppercase font-bold block">Documento Auxiliar da Nota Fiscal Eletrônica</span>
              <div className="text-[11px] font-bold mt-2">
                N° {doc.document_number} • Série {doc.series}
              </div>
              <span className="text-[10px] text-slate-600">0 - Entrada / 1 - Saída: <strong>1</strong></span>
            </div>

            <div className="space-y-1 text-right">
              <span className="text-[10px] font-bold text-slate-600 uppercase block">Chave de Acesso</span>
              <span className="font-mono text-[10px] font-bold block break-all bg-slate-100 p-1 rounded border border-slate-300">
                {doc.access_key}
              </span>
              <div className="pt-2 text-[10px] text-slate-700">
                Protocolo: <strong>{doc.protocol}</strong>
              </div>
            </div>
          </div>

          {/* Recipient Section */}
          <div className="border-b border-slate-900 pb-3 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-500 block">DESTINATÁRIO / REMETENTE</span>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[11px]">
              <div><strong>Nome/Razão Social:</strong> {person?.legal_name || person?.trade_name}</div>
              <div><strong>CNPJ/CPF:</strong> {person?.tax_id}</div>
              <div><strong>Data Emissão:</strong> {new Date(doc.issue_date).toLocaleDateString("pt-BR")}</div>
            </div>
          </div>

          {/* Tax Breakdown Grid (CBS / IBS Reforma Tributária) */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-500 block">CÁLCULO DO IMPOSTO & REFORMA TRIBUTÁRIA</span>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 bg-slate-50 p-2 border border-slate-300 rounded text-center text-[10px]">
              <div>
                <span className="text-slate-500 block">Base ICMS</span>
                <strong className="font-mono">R$ {doc.base_calc_icms?.toLocaleString('pt-BR')}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Valor ICMS</span>
                <strong className="font-mono">R$ {doc.icms_value?.toLocaleString('pt-BR')}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Valor PIS</span>
                <strong className="font-mono">R$ {doc.pis_value?.toLocaleString('pt-BR')}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Valor COFINS</span>
                <strong className="font-mono">R$ {doc.cofins_value?.toLocaleString('pt-BR')}</strong>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded p-1">
                <span className="text-indigo-800 font-bold block">CBS (8.8%)</span>
                <strong className="font-mono text-indigo-900">R$ {doc.cbs_value?.toLocaleString('pt-BR')}</strong>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded p-1">
                <span className="text-blue-800 font-bold block">IBS (17.7%)</span>
                <strong className="font-mono text-blue-900">R$ {doc.ibs_value?.toLocaleString('pt-BR')}</strong>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-500 block">DADOS DOS PRODUTOS / SERVIÇOS</span>
            <table className="w-full text-left border-collapse border border-slate-300 text-[10px]">
              <thead className="bg-slate-100 uppercase font-bold">
                <tr>
                  <th className="p-1.5 border border-slate-300">Cód</th>
                  <th className="p-1.5 border border-slate-300">Descrição</th>
                  <th className="p-1.5 border border-slate-300">NCM</th>
                  <th className="p-1.5 border border-slate-300 text-center">CFOP</th>
                  <th className="p-1.5 border border-slate-300 text-right">Qtd</th>
                  <th className="p-1.5 border border-slate-300 text-right">V. Unit</th>
                  <th className="p-1.5 border border-slate-300 text-right">V. Total</th>
                </tr>
              </thead>
              <tbody>
                {(items || []).map(item => {
                  const prod = (store.products || []).find(p => p.id === item.product_id);
                  return (
                    <tr key={item.id}>
                      <td className="p-1.5 border border-slate-300 font-mono">{prod?.sku}</td>
                      <td className="p-1.5 border border-slate-300 font-semibold">{prod?.name}</td>
                      <td className="p-1.5 border border-slate-300 font-mono">{item.ncm_code}</td>
                      <td className="p-1.5 border border-slate-300 font-mono text-center">{item.cfop}</td>
                      <td className="p-1.5 border border-slate-300 font-mono text-right">{item.quantity}</td>
                      <td className="p-1.5 border border-slate-300 font-mono text-right">R$ {item.unit_price.toLocaleString('pt-BR')}</td>
                      <td className="p-1.5 border border-slate-300 font-mono text-right font-bold">R$ {item.total_price.toLocaleString('pt-BR')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer Validation Signature */}
          <div className="pt-3 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-600">
            <div className="flex items-center gap-1 text-emerald-800 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Assinatura Digital Certificado A1: {doc.signer_certificate}</span>
            </div>
            <span>NEX Fiscal Engine — Autorizado em {new Date(doc.issue_date).toLocaleString('pt-BR')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
