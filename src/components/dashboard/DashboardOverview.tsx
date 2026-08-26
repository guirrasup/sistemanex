import React from 'react';
import { 
  FileText, 
  Receipt, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  FileCode2, 
  Download, 
  Eye, 
  Layers,
  Building2,
  Package
} from 'lucide-react';
import { NFSeDocumento, NFeDocumento } from '../../types/fiscal';
import { Produto, TituloFinanceiro, ConfiguracaoEmpresa } from '../../types/erp';
import { formatarMoeda, formatarCpfCnpj } from '../../utils/cpfCnpjValidator';

interface DashboardOverviewProps {
  empresa: ConfiguracaoEmpresa;
  nfses: NFSeDocumento[];
  nfes: NFeDocumento[];
  produtos: Produto[];
  titulos: TituloFinanceiro[];
  onNavigate: (view: string) => void;
  onOpenNovaNfse: () => void;
  onOpenNovaNfe: () => void;
  onViewDanfse: (nfse: NFSeDocumento) => void;
  onViewDanfe: (nfe: NFeDocumento) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  empresa,
  nfses,
  nfes,
  produtos,
  titulos,
  onNavigate,
  onOpenNovaNfse,
  onOpenNovaNfe,
  onViewDanfse,
  onViewDanfe,
}) => {
  // Cálculos consolidados em tempo real
  const totalNfse = nfses
    .filter(n => n.status === 'AUTORIZADA')
    .reduce((acc, curr) => acc + curr.valorTotalServicos, 0);

  const totalNfe = nfes
    .filter(n => n.status === 'AUTORIZADA')
    .reduce((acc, curr) => acc + curr.valorTotalNota, 0);

  const totalFaturamento = totalNfse + totalNfe;

  // Impostos consolidados
  const totalIssqn = nfses
    .filter(n => n.status === 'AUTORIZADA')
    .reduce((acc, curr) => acc + curr.valorTotalISS, 0);

  const totalIcms = nfes
    .filter(n => n.status === 'AUTORIZADA')
    .reduce((acc, curr) => acc + curr.valorTotalICMS, 0);

  const totalIbsCbs = 
    nfses.filter(n => n.status === 'AUTORIZADA').reduce((acc, curr) => acc + (curr.valorTotalIBS + curr.valorTotalCBS), 0) +
    nfes.filter(n => n.status === 'AUTORIZADA').reduce((acc, curr) => acc + (curr.valorTotalIBS + curr.valorTotalCBS), 0);

  const totalPisCofins = 
    nfses.filter(n => n.status === 'AUTORIZADA').reduce((acc, curr) => acc + (curr.servico.valorPIS || 0) + (curr.servico.valorCOFINS || 0), 0) +
    nfes.filter(n => n.status === 'AUTORIZADA').reduce((acc, curr) => acc + curr.valorTotalPIS + curr.valorTotalCOFINS, 0);

  // Financeiro
  const aReceberPendente = titulos
    .filter(t => t.tipo === 'RECEBER' && t.status === 'PENDENTE')
    .reduce((acc, curr) => acc + curr.valorOriginal, 0);

  const aPagarPendente = titulos
    .filter(t => t.tipo === 'PAGAR' && t.status === 'PENDENTE')
    .reduce((acc, curr) => acc + curr.valorOriginal, 0);

  // Alertas de estoque
  const produtosEstoqueBaixo = produtos.filter(p => p.estoqueAtual <= p.estoqueMinimo);

  // Unifica últimos documentos emitidos
  const ultimosDocs = [
    ...nfses.map(n => ({
      tipo: 'NFSE' as const,
      id: n.id,
      numero: n.numeroNfse,
      cliente: n.tomador.nomeRazaoSocial,
      documento: n.tomador.documento,
      valor: n.valorTotalServicos,
      data: n.dataHoraEmissao,
      status: n.status,
      ref: n,
    })),
    ...nfes.map(n => ({
      tipo: n.modelo === '55' ? 'NFE' : 'NFCE',
      id: n.id,
      numero: n.numero,
      cliente: n.destinatario.nomeRazaoSocial,
      documento: n.destinatario.documento,
      valor: n.valorTotalNota,
      data: n.dataHoraEmissao,
      status: n.status,
      ref: n,
    })),
  ].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()).slice(0, 6);

  return (
    <div className="space-y-5">
      
      {/* Barra de Ações Rápidas */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Dashboard</h1>
          <p className="text-xs text-slate-500">Resumo fiscal e financeiro consolidado.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNovaNfse}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-3.5 py-2 rounded shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Emitir NFS-e</span>
          </button>

          <button
            onClick={onOpenNovaNfe}
            className="bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs px-3.5 py-2 rounded shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Emitir NF-e</span>
          </button>
        </div>
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Faturamento Total */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Faturamento Total</span>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-black text-slate-900">{formatarMoeda(totalFaturamento)}</div>
            <div className="text-[11px] text-slate-500 mt-1">
              {nfses.length + nfes.length} notas emitidas
            </div>
          </div>
        </div>

        {/* Serviços (NFS-e) */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs hover:border-blue-300 transition-colors cursor-pointer" onClick={() => onNavigate('nfse-emissor')}>
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">NFS-e (Serviços)</span>
            <FileText className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-black text-slate-900">{formatarMoeda(totalNfse)}</div>
            <div className="text-[11px] text-slate-500 mt-1">
              {nfses.length} emitidas (DPS Nac.)
            </div>
          </div>
        </div>

        {/* Produtos (NF-e) */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs hover:border-blue-300 transition-colors cursor-pointer" onClick={() => onNavigate('nfe-emissor')}>
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">NF-e (Produtos)</span>
            <Receipt className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-black text-slate-900">{formatarMoeda(totalNfe)}</div>
            <div className="text-[11px] text-slate-500 mt-1">
              {nfes.length} emitidas (Mod. 55)
            </div>
          </div>
        </div>

        {/* Impostos Totais */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Tributos Totais</span>
            <Layers className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-black text-slate-900">{formatarMoeda(totalIssqn + totalIcms + totalPisCofins + totalIbsCbs)}</div>
            <div className="text-[11px] text-slate-500 mt-1">
              IBS/CBS: {formatarMoeda(totalIbsCbs)}
            </div>
          </div>
        </div>

      </div>

      {/* Grid: Composição Fiscal / Reforma 2026 + Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Painel IBS / CBS 2026 */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Tributos Reforma 2026 (IBS / CBS)
              </h2>
            </div>
            <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
              EC 132/2023
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 my-3">
            <div className="bg-slate-50 border border-slate-200 rounded p-2.5">
              <div className="text-[11px] font-semibold text-slate-500">CBS (Federal)</div>
              <div className="text-base font-bold text-slate-900 mt-0.5">0,90%</div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded p-2.5">
              <div className="text-[11px] font-semibold text-slate-500">IBS Estadual</div>
              <div className="text-base font-bold text-slate-900 mt-0.5">0,05%</div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded p-2.5">
              <div className="text-[11px] font-semibold text-slate-500">IBS Municipal</div>
              <div className="text-base font-bold text-slate-900 mt-0.5">0,05%</div>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center justify-between">
              <span>Total CBS Apurada:</span>
              <strong className="text-slate-900">{formatarMoeda(nfses.reduce((acc, curr) => acc + curr.valorTotalCBS, 0) + nfes.reduce((acc, curr) => acc + curr.valorTotalCBS, 0))}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Total IBS (UF + Mun) Apurado:</span>
              <strong className="text-slate-900">{formatarMoeda(nfses.reduce((acc, curr) => acc + curr.valorTotalIBS, 0) + nfes.reduce((acc, curr) => acc + curr.valorTotalIBS, 0))}</strong>
            </div>
          </div>
        </div>

        {/* Resumo Financeiro & Estoque */}
        <div className="space-y-3">
          
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
              Fluxo Pendente
            </h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded bg-emerald-50 border border-emerald-100 cursor-pointer" onClick={() => onNavigate('financeiro')}>
                <span className="text-xs font-semibold text-emerald-900">A Receber</span>
                <span className="text-xs font-bold text-emerald-700">{formatarMoeda(aReceberPendente)}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-rose-50 border border-rose-100 cursor-pointer" onClick={() => onNavigate('financeiro')}>
                <span className="text-xs font-semibold text-rose-900">A Pagar</span>
                <span className="text-xs font-bold text-rose-700">{formatarMoeda(aPagarPendente)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Estoque Mínimo
              </h3>
              <Package className="w-3.5 h-3.5 text-slate-400" />
            </div>

            {produtosEstoqueBaixo.length > 0 ? (
              <div className="space-y-1.5">
                {produtosEstoqueBaixo.map(prod => (
                  <div key={prod.id} className="flex items-center justify-between text-xs p-1.5 rounded bg-amber-50 border border-amber-200">
                    <span className="font-medium text-amber-900 truncate max-w-[130px]">{prod.descricao}</span>
                    <span className="font-bold text-amber-700">{prod.estoqueAtual} {prod.unidade}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-500">
                Nenhum item com estoque crítico.
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Tabela de Últimos Documentos Emitidos */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Últimos Documentos Fiscais
          </h2>
          <button
            onClick={() => onNavigate('documentos-fiscais')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            Ver todos ({nfses.length + nfes.length}) &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Tipo</th>
                <th className="py-2.5 px-3">Número</th>
                <th className="py-2.5 px-3">Destinatário</th>
                <th className="py-2.5 px-3">Data</th>
                <th className="py-2.5 px-3">Valor</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ultimosDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2 px-3">
                    {doc.tipo === 'NFSE' ? (
                      <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-semibold">
                        NFS-e
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                        NF-e
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3 font-semibold text-slate-900">
                    {doc.numero}
                  </td>
                  <td className="py-2 px-3">
                    <div className="font-medium text-slate-800 truncate max-w-xs">{doc.cliente}</div>
                    <div className="text-[10px] text-slate-400">{formatarCpfCnpj(doc.documento)}</div>
                  </td>
                  <td className="py-2 px-3 text-slate-500">
                    {new Date(doc.data).toLocaleDateString('pt-BR')} {new Date(doc.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-2 px-3 font-semibold text-slate-900">
                    {formatarMoeda(doc.valor)}
                  </td>
                  <td className="py-2 px-3">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                      {doc.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => {
                          if (doc.tipo === 'NFSE') onViewDanfse(doc.ref as NFSeDocumento);
                          else onViewDanfe(doc.ref as NFeDocumento);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                        title="Visualizar DANFE"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          const xmlBlob = new Blob([doc.ref.xmlAssinado], { type: 'application/xml' });
                          const url = URL.createObjectURL(xmlBlob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${doc.tipo}_${doc.numero}_SUP.xml`;
                          a.click();
                        }}
                        className="p-1 text-slate-500 hover:bg-slate-100 rounded cursor-pointer"
                        title="Baixar XML"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
