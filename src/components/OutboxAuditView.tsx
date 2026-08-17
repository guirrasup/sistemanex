import React, { useState, useEffect } from "react";
import { store } from "../services/store";
import { AuditLog } from "../types";
import { Radio, Shield, CheckCircle2, Clock, Search, Eye, X, User, Activity } from "lucide-react";

export const OutboxAuditView: React.FC = () => {
  const [, setTick] = useState(0);
  useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

  const [activeTab, setActiveTab] = useState<"audit" | "outbox">("audit");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLog | null>(null);

  const outboxEvents = store.outboxEvents || [];
  const auditLogs = store.auditLogs || [];

  const filteredAuditLogs = auditLogs.filter(log => {
    const query = searchQuery.toLowerCase();
    const entity = log.entity_type.toLowerCase();
    const action = log.action.toLowerCase();
    const reason = (log.change_reason || "").toLowerCase();
    const user = (log.user_id || "").toLowerCase();
    return entity.includes(query) || action.includes(query) || reason.includes(query) || user.includes(query);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/40 border border-white/5 backdrop-blur-md p-5 rounded-2xl shadow-2xl">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            Trilha de Auditoria & Governança (Quem Fez o Quê)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Registro imutável de todas as ações no sistema com rastreabilidade de usuário, entidade, IP e valores alterados
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-white/5 text-xs font-bold font-mono">
          <button
            onClick={() => setActiveTab("audit")}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "audit" ? "bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.3)] font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Auditoria ({auditLogs.length})
          </button>

          <button
            onClick={() => setActiveTab("outbox")}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "outbox" ? "bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.3)] font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Outbox Events ({outboxEvents.length})
          </button>
        </div>
      </div>

      {activeTab === "audit" && (
        <div className="bg-slate-950/40 border border-white/5 backdrop-blur-md rounded-2xl p-5 space-y-4 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-3">
            <div className="flex items-center gap-2 font-mono">
              <Shield className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white">Logs de Auditoria do Sistema (audit_log)</h2>
            </div>

            {/* Search filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filtrar por entidade, ação ou motivo..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-slate-900 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 outline-none focus:border-cyan-500 w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] border-b border-white/5 tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-3">ID Log</th>
                  <th className="py-3 px-3">Quem Fez (Usuário)</th>
                  <th className="py-3 px-3">Ação</th>
                  <th className="py-3 px-3">Entidade / Onde</th>
                  <th className="py-3 px-3">Descrição / Motivo</th>
                  <th className="py-3 px-3">IP & Agente</th>
                  <th className="py-3 px-3">Data / Hora</th>
                  <th className="py-3 px-3 text-center">Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {filteredAuditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                      Nenhum registro de auditoria encontrado para o filtro.
                    </td>
                  </tr>
                ) : (
                  filteredAuditLogs.map(log => {
                    const actionBadgeColor =
                      log.action === "create" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" :
                      log.action === "update" ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" :
                      log.action === "delete" ? "bg-rose-500/20 text-rose-300 border-rose-500/30" :
                      log.action === "emit" ? "bg-purple-500/20 text-purple-300 border-purple-500/30" :
                      "bg-slate-800 text-slate-300 border-white/10";

                    return (
                      <tr key={log.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-3 text-cyan-400 font-bold">{log.id}</td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5 text-white font-bold font-sans">
                            <User className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span>Gestor NEXS Admin</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">Role: admin</div>
                        </td>

                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full uppercase font-bold text-[10px] border ${actionBadgeColor}`}>
                            {log.action}
                          </span>
                        </td>

                        <td className="py-3 px-3 font-bold text-white font-sans">
                          {log.entity_type} <span className="text-[10px] text-slate-400 font-mono">({log.entity_id})</span>
                        </td>

                        <td className="py-3 px-3 text-slate-200 font-sans max-w-xs">
                          {log.change_reason}
                        </td>

                        <td className="py-3 px-3 text-[10px] text-slate-400">
                          {log.ip_address}
                        </td>

                        <td className="py-3 px-3 text-slate-400 text-[10px]">
                          {new Date(log.created_at).toLocaleString("pt-BR")}
                        </td>

                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => setSelectedAuditLog(log)}
                            className="p-1.5 bg-slate-900 hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-400 border border-white/10 rounded-lg transition-all cursor-pointer"
                            title="Ver Valores / Payload"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "outbox" && (
        <div className="bg-slate-950/40 border border-white/5 backdrop-blur-md rounded-2xl p-5 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/5 pb-3 font-mono">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400" />
              Eventos Registrados na Tabela outbox_event (Transactional Pattern)
            </h2>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-bold uppercase tracking-wider">
              Guarantee: AT-LEAST-ONCE
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] border-b border-white/5 tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-3">ID Evento</th>
                  <th className="py-3 px-3">Tipo de Evento</th>
                  <th className="py-3 px-3">Agregado</th>
                  <th className="py-3 px-3">Payload Snapshot</th>
                  <th className="py-3 px-3">Status Publicação</th>
                  <th className="py-3 px-3">Criado em</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {outboxEvents.map(evt => (
                  <tr key={evt.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 text-cyan-400 font-bold">{evt.id}</td>
                    <td className="py-3 px-3 text-white font-bold">{evt.event_type}</td>
                    <td className="py-3 px-3 text-slate-400">{evt.aggregate_type} ({evt.aggregate_id})</td>
                    <td className="py-3 px-3 text-[10px] text-slate-400 max-w-xs truncate">
                      {JSON.stringify(evt.payload)}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold inline-flex items-center gap-1 font-mono tracking-wider ${
                        evt.status === "published"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse"
                      }`}>
                        {evt.status === "published" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {evt.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[10px]">
                      {new Date(evt.created_at).toLocaleTimeString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit Detail Modal */}
      {selectedAuditLog && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 font-sans">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyan-400" /> Detalhes do Log de Auditoria {selectedAuditLog.id}
              </h3>
              <button onClick={() => setSelectedAuditLog(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-white/5">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-bold">Entidade</span>
                  <span className="text-white font-bold">{selectedAuditLog.entity_type} ({selectedAuditLog.entity_id})</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-bold">Ação</span>
                  <span className="text-cyan-400 font-bold uppercase">{selectedAuditLog.action}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-bold">Usuário</span>
                  <span className="text-slate-300">Gestor NEXS Admin ({selectedAuditLog.user_id})</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-bold">IP</span>
                  <span className="text-slate-300">{selectedAuditLog.ip_address}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-bold mb-1">Motivo / Descrição</span>
                <p className="bg-slate-950 p-3 rounded-xl text-slate-200 font-sans border border-white/5">
                  {selectedAuditLog.change_reason}
                </p>
              </div>

              {selectedAuditLog.old_values && (
                <div>
                  <span className="text-[10px] text-rose-400 uppercase block font-bold mb-1">Valores Anteriores (Old Values)</span>
                  <pre className="bg-slate-950 p-3 rounded-xl text-rose-300 overflow-x-auto text-[10px] border border-white/5">
                    {JSON.stringify(selectedAuditLog.old_values, null, 2)}
                  </pre>
                </div>
              )}

              {selectedAuditLog.new_values && (
                <div>
                  <span className="text-[10px] text-emerald-400 uppercase block font-bold mb-1">Valores Novos / Criados (New Values)</span>
                  <pre className="bg-slate-950 p-3 rounded-xl text-emerald-300 overflow-x-auto text-[10px] border border-white/5">
                    {JSON.stringify(selectedAuditLog.new_values, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-3 flex justify-end border-t border-white/10 font-sans">
              <button
                onClick={() => setSelectedAuditLog(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
