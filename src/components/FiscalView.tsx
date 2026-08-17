import React, { useState, useEffect } from "react";
import { store } from "../services/store";
import { FiscalDocument, FiscalDocType } from "../types";
import { DanfeModal } from "./DanfeModal";
import {
  FileText, Plus, ShieldCheck, AlertCircle, Eye, X, Calculator, Sparkles, CheckCircle2
} from "lucide-react";

export const FiscalView: React.FC = () => {
  const [, setTick] = useState(0);
  useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

  const [selectedDocForDanfe, setSelectedDocForDanfe] = useState<FiscalDocument | null>(null);
  const [showIssueModal, setShowIssueModal] = useState(false);

  // Issue Form
  const [docType, setDocType] = useState<FiscalDocType>("nf_e");
  const [personId, setPersonId] = useState(store.people[0]?.id || "");
  const [productId, setProductId] = useState(store.products[0]?.id || "");
  const [quantity, setQuantity] = useState<number>(10);
  const [unitPrice, setUnitPrice] = useState<number>(1500);

  // Cancellation Form Modal
  const [cancelDocId, setCancelDocId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const fiscalDocs = store.fiscalDocuments || [];
  const people = store.people || [];
  const products = store.products || [];

  // Live Tax Calculation preview
  const lineTotal = Number((quantity * unitPrice).toFixed(2));
  const previewICMS = Number((lineTotal * 0.18).toFixed(2));
  const previewPIS = Number((lineTotal * 0.0165).toFixed(2));
  const previewCOFINS = Number((lineTotal * 0.076).toFixed(2));
  const previewCBS = Number((lineTotal * 0.088).toFixed(2));
  const previewIBS = Number((lineTotal * 0.177).toFixed(2));

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personId || !productId || !quantity || !unitPrice) return;

    const newDoc = store.issueFiscalDocument({
      document_type: docType,
      person_id: personId,
      items: [{ product_id: productId, quantity: Number(quantity), unit_price: Number(unitPrice) }]
    });

    setShowIssueModal(false);
    setSelectedDocForDanfe(newDoc);
  };

  const handleCancelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelDocId || !cancelReason) return;

    store.cancelFiscalDocument(cancelDocId, cancelReason);
    setCancelDocId(null);
    setCancelReason("");
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/30 border border-white/5 backdrop-blur-md p-5 rounded-2xl shadow-2xl">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            Emissor & Motor Fiscal (Reforma Tributária CBS/IBS)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Emissão de NF-e, NFC-e e NFS-e com Tax Engine automatizado e regras de imutabilidade (FISC-001)
          </p>
        </div>

        <button
          onClick={() => setShowIssueModal(true)}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 uppercase tracking-wider font-mono font-bold rounded-xl text-xs shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Emitir Nota Fiscal
        </button>
      </div>

      {/* Tax Engine Explanation Banner */}
      <div className="bg-slate-950/30 border border-white/5 backdrop-blur-md p-4 rounded-2xl text-xs text-slate-300 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-white block">Fonte da Verdade Tributária Definida (Tax Engine)</span>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Cadeia de Derivação: <strong className="text-cyan-300">TaxCalculation (cálculo bruto)</strong> → <strong className="text-cyan-300">FiscalDocumentItem (por item)</strong> → <strong className="text-cyan-300">FiscalDocument (snapshot imutável)</strong>.
            </p>
          </div>
        </div>
        <span className="hidden md:inline-block px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono uppercase tracking-wider font-bold">
          CBS 8.8% + IBS 17.7%
        </span>
      </div>

      {/* Fiscal Documents Table */}
      <div className="bg-slate-950/30 border border-white/5 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-white/5 bg-slate-950/80 flex items-center justify-between text-xs font-bold text-slate-300 font-mono">
          <span>Documentos Fiscais Emitidos ({fiscalDocs.length})</span>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" /> SEFAZ SP Online
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-bold border-b border-white/5 text-[10px] font-mono tracking-wider">
              <tr>
                <th className="py-3 px-4">Tipo / Número</th>
                <th className="py-3 px-4">Destinatário</th>
                <th className="py-3 px-4">Chave de Acesso / Protocolo</th>
                <th className="py-3 px-4 text-right">Valor Total</th>
                <th className="py-3 px-4 text-right">CBS + IBS (Reforma)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {(fiscalDocs || []).map(doc => {
                const person = (people || []).find(p => p.id === doc.person_id);
                const cbsIbsTotal = (doc.cbs_value || 0) + (doc.ibs_value || 0);

                return (
                  <tr key={doc.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-mono">
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 uppercase font-bold text-[10px] mr-2">
                        {doc.document_type}
                      </span>
                      <span className="font-bold text-white">N° {doc.document_number}</span>
                    </td>

                    <td className="py-3 px-4 font-medium">
                      {person?.trade_name || person?.legal_name}
                    </td>

                    <td className="py-3 px-4 font-mono text-[10px] text-slate-400 max-w-xs truncate">
                      <span className="block text-slate-300 font-bold">{doc.access_key}</span>
                      <span>Prot: {doc.protocol}</span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                      R$ {doc.total_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-cyan-300">
                      R$ {cbsIbsTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold font-mono tracking-wider ${
                        doc.status === "authorized"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      }`}>
                        {doc.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center font-mono">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedDocForDanfe(doc)}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-cyan-300 rounded-lg text-[11px] font-bold border border-white/10 cursor-pointer flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> DANFE
                        </button>
                        {doc.status === "authorized" && (
                          <button
                            onClick={() => setCancelDocId(doc.id)}
                            className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-lg text-[11px] font-bold border border-rose-500/30 cursor-pointer"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Issue Fiscal Document */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Emissão & Autorização de Nota Fiscal SEFAZ
              </h2>
              <button onClick={() => setShowIssueModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIssueSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Tipo de Nota</label>
                  <select
                    value={docType}
                    onChange={e => setDocType(e.target.value as FiscalDocType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white outline-none cursor-pointer"
                  >
                    <option value="nf_e">NF-e (Produto)</option>
                    <option value="nfc_e">NFC-e (Consumidor)</option>
                    <option value="nfs_e">NFS-e (Serviço)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Destinatário (Cliente)</label>
                  <select
                    value={personId}
                    onChange={e => setPersonId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white outline-none cursor-pointer"
                  >
                    {people.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.trade_name || p.legal_name} ({p.tax_id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Item / Produto</label>
                <select
                  value={productId}
                  onChange={e => setProductId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white outline-none cursor-pointer"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.sku} — {p.name} (NCM: {p.ncm_code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Quantidade</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={e => setQuantity(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Preço Unitário (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={unitPrice}
                    onChange={e => setUnitPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono outline-none"
                    required
                  />
                </div>
              </div>

              {/* Tax Engine Live Preview */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                  Simulação Tax Engine (Reforma Tributária)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] font-mono">
                  <div>
                    <span className="text-slate-400 block">Total Bruto</span>
                    <strong className="text-white">R$ {lineTotal.toLocaleString('pt-BR')}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">ICMS (18%)</span>
                    <strong className="text-slate-300">R$ {previewICMS.toLocaleString('pt-BR')}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">PIS/COFINS</span>
                    <strong className="text-slate-300">R$ {(previewPIS + previewCOFINS).toLocaleString('pt-BR')}</strong>
                  </div>
                  <div className="bg-indigo-500/10 border border-indigo-500/20 p-1.5 rounded">
                    <span className="text-indigo-300 font-bold block">CBS (8.8%)</span>
                    <strong className="text-indigo-200">R$ {previewCBS.toLocaleString('pt-BR')}</strong>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 p-1.5 rounded">
                    <span className="text-blue-300 font-bold block">IBS (17.7%)</span>
                    <strong className="text-blue-200">R$ {previewIBS.toLocaleString('pt-BR')}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl cursor-pointer shadow-lg shadow-indigo-600/20"
                >
                  Emitir e Autorizar na SEFAZ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Cancel Fiscal Document */}
      {cancelDocId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-400" />
              Solicitar Cancelamento de Nota Fiscal
            </h2>
            <form onSubmit={handleCancelSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Motivo do Cancelamento (Mínimo 15 caracteres)</label>
                <textarea
                  rows={3}
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  placeholder="Ex: Erro no preenchimento do valor do item ou desacordo comercial."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCancelDocId(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl cursor-pointer"
                >
                  Confirmar Cancelamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DANFE Viewer Modal */}
      {selectedDocForDanfe && (
        <DanfeModal document={selectedDocForDanfe} onClose={() => setSelectedDocForDanfe(null)} />
      )}
    </div>
  );
};
