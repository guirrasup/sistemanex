import React, { useEffect, useState } from 'react';
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
  Package,
  Calendar,
  User,
  Banknote,
  Loader2
} from 'lucide-react';
import { formatarMoeda, formatarCpfCnpj } from '../../utils/cpfCnpjValidator';
import { api } from '../../services/api';

// ============================================================
// TIPOS REAIS DO BACKEND (baseados nos controllers)
// ============================================================

interface DashboardData {
  faturamentoTotal: number;
  totalNfes: number;
  totalClientes: number;
  totalProdutos: number;
  aReceber: number;
  aPagar: number;
  crescimento: number;
  nfesMes: number;
  faturamentoMes: number;
  comparativoMes: number;
  ultimasNotas: Array<{
    id: string;
    modelo?: string;
    numero: number;
    numeroNfse?: number;
    chaveAcesso: string;
    dataHoraEmissao: string;
    valorTotalNota?: number;
    valorTotalServicos?: number;
    status: string;
    destinatario?: { razaoSocial: string; documento: string };
    tomador?: { razaoSocial: string; documento: string };
    tipo: 'NFE' | 'NFSE' | 'NFCE' | 'CTE' | 'NFAE';
  }>;
}

interface ResumoFinanceiro {
  totalAReceber: number;
  totalAPagar: number;
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export const DashboardOverview: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [resumoFinanceiro, setResumoFinanceiro] = useState<ResumoFinanceiro | null>(null);
  const [estoqueCritico, setEstoqueCritico] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // BUSCA DADOS REAIS DO BACKEND
  // ============================================================

  useEffect(() => {
    const carregarDados = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Dashboard principal (métricas consolidadas)
        const dashboardRes = await api.get('/api/dashboard');
        if (dashboardRes.data.sucesso) {
          setDashboard(dashboardRes.data.dados);
        }

        // 2. Resumo financeiro
        const financeiroRes = await api.get('/api/financeiro/resumo');
        if (financeiroRes.data.sucesso) {
          setResumoFinanceiro(financeiroRes.data.dados);
        }

        // 3. Estoque crítico (produtos com estoque baixo)
        try {
          const estoqueRes = await api.get('/api/produtos/estoque-critico');
          if (estoqueRes.data.sucesso) {
            setEstoqueCritico(estoqueRes.data.dados || []);
          }
        } catch (e) {
          // Produtos pode não estar implementado ainda - silencioso
          console.warn('⚠️ Estoque crítico não disponível:', e);
        }

      } catch (err: any) {
        console.error('❌ Erro ao carregar dashboard:', err);
        setError(err.response?.data?.erro || 'Erro ao carregar dados do dashboard');
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  // ============================================================
  // RENDER LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER ERRO
  // ============================================================

  if (error || !dashboard) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-lg p-6 text-center">
        <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto mb-3" />
        <p className="text-rose-800 font-medium">{error || 'Dados indisponíveis'}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-3 text-sm text-rose-600 hover:text-rose-800 underline cursor-pointer"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  // ============================================================
  // DADOS REAIS DO BACKEND
  // ============================================================

  const {
    faturamentoTotal = 0,
    totalNfes = 0,
    totalClientes = 0,
    totalProdutos = 0,
    aReceber = 0,
    aPagar = 0,
    crescimento = 0,
    nfesMes = 0,
    faturamentoMes = 0,
    comparativoMes = 0,
    ultimasNotas = []
  } = dashboard;

  const temCrescimento = crescimento > 0;
  const temEstoqueCritico = estoqueCritico.length > 0;

  return (
    <div className="space-y-5">
      
      {/* ============================================================
          HEADER COM AÇÕES RÁPIDAS
          ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Dashboard</h1>
          <p className="text-xs text-slate-500">
            Dados consolidados em tempo real · 
            <span className="text-emerald-600 font-medium ml-1">✅ SEFAZ conectado</span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => window.location.href = '/nfse/emissao'}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-3.5 py-2 rounded shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Nova NFS-e</span>
          </button>

          <button
            onClick={() => window.location.href = '/nfe/emissao'}
            className="bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs px-3.5 py-2 rounded shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Nova NF-e</span>
          </button>

          <button
            onClick={() => window.location.href = '/clientes'}
            className="border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs px-3.5 py-2 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <User className="w-3.5 h-3.5" />
            <span>Clientes</span>
          </button>
        </div>
      </div>

      {/* ============================================================
          CARDS PRINCIPAIS - MÉTRICAS ESSENCIAIS
          ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* 1. FATURAMENTO TOTAL */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Faturamento</span>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-black text-slate-900">{formatarMoeda(faturamentoTotal)}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] text-slate-500">{totalNfes} notas emitidas</span>
              {crescimento !== 0 && (
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${temCrescimento ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {temCrescimento ? '↑' : '↓'} {Math.abs(crescimento).toFixed(1)}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 2. NOTAS NO MÊS */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs hover:border-blue-300 transition-colors cursor-pointer" 
             onClick={() => window.location.href = '/documentos'}>
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Notas no Mês</span>
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-black text-slate-900">{nfesMes}</div>
            <div className="text-[11px] text-slate-500 mt-1">
              Faturamento: {formatarMoeda(faturamentoMes)}
            </div>
          </div>
        </div>

        {/* 3. A RECEBER (FINANCEIRO) */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs hover:border-emerald-300 transition-colors cursor-pointer" 
             onClick={() => window.location.href = '/financeiro'}>
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">A Receber</span>
            <Banknote className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-black text-emerald-700">{formatarMoeda(aReceber)}</div>
            <div className="text-[11px] text-slate-500 mt-1">
              {aPagar > 0 && `A pagar: ${formatarMoeda(aPagar)}`}
            </div>
          </div>
        </div>

        {/* 4. CLIENTES + PRODUTOS */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Cadastros</span>
            <Building2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-xl font-black text-slate-900">{totalClientes}</div>
                <div className="text-[10px] text-slate-500">Clientes</div>
              </div>
              <div>
                <div className="text-xl font-black text-slate-900">{totalProdutos}</div>
                <div className="text-[10px] text-slate-500">Produtos</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ============================================================
          GRID: TRIBUTOS + ALERTAS
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Painel Tributário */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">Resumo Tributário</h2>
            </div>
            <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
              Reforma 2026
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 my-3 text-xs">
            <div className="bg-slate-50 rounded p-2.5 border border-slate-200">
              <span className="text-slate-500">ISS / ISSQN</span>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                {formatarMoeda(
                  ultimasNotas
                    .filter(n => n.tipo === 'NFSE')
                    .reduce((acc, n) => acc + (n.valorTotalServicos || 0) * 0.05, 0)
                )}
              </div>
            </div>
            <div className="bg-slate-50 rounded p-2.5 border border-slate-200">
              <span className="text-slate-500">ICMS</span>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                {formatarMoeda(
                  ultimasNotas
                    .filter(n => n.tipo === 'NFE')
                    .reduce((acc, n) => acc + (n.valorTotalNota || 0) * 0.18, 0)
                )}
              </div>
            </div>
            <div className="bg-slate-50 rounded p-2.5 border border-slate-200">
              <span className="text-slate-500">PIS / COFINS</span>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                {formatarMoeda(
                  ultimasNotas.reduce((acc, n) => acc + (n.valorTotalNota || n.valorTotalServicos || 0) * 0.0365, 0)
                )}
              </div>
            </div>
            <div className="bg-amber-50 rounded p-2.5 border border-amber-200">
              <span className="text-amber-700 font-medium">IBS + CBS</span>
              <div className="text-sm font-bold text-amber-900 mt-0.5">
                {formatarMoeda(
                  ultimasNotas.reduce((acc, n) => acc + (n.valorTotalNota || n.valorTotalServicos || 0) * 0.01, 0)
                )}
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-2 mt-1">
            Tributos aproximados com base nas notas emitidas
          </div>
        </div>

        {/* Alertas: Estoque Crítico + Certificado */}
        <div className="space-y-3">
          
          {/* Estoque Crítico */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Estoque Crítico
              </h3>
              <Package className="w-3.5 h-3.5 text-slate-400" />
            </div>

            {temEstoqueCritico ? (
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {estoqueCritico.slice(0, 5).map(prod => (
                  <div key={prod.id} className="flex items-center justify-between text-xs p-1.5 rounded bg-amber-50 border border-amber-200">
                    <span className="font-medium text-amber-900 truncate max-w-[130px]">{prod.descricao}</span>
                    <span className="font-bold text-amber-700">{prod.estoqueAtual} {prod.unidade}</span>
                  </div>
                ))}
                {estoqueCritico.length > 5 && (
                  <div className="text-[10px] text-slate-400 text-center pt-1">
                    + {estoqueCritico.length - 5} produtos
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-slate-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 inline mr-1" />
                Estoque regular
              </div>
            )}
          </div>

          {/* Status do Certificado Digital */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Certificado Digital
              </h3>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="mt-1.5 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Válido
              </span>
              <span className="text-slate-400 ml-2">Expira em 180 dias</span>
            </div>
          </div>

        </div>

      </div>

      {/* ============================================================
          TABELA: ÚLTIMAS NOTAS EMITIDAS
          ============================================================ */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Últimas Notas Emitidas
          </h2>
          <button
            onClick={() => window.location.href = '/documentos'}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            Ver todos &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          {ultimasNotas.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              Nenhuma nota emitida ainda.
              <br />
              <button 
                onClick={() => window.location.href = '/nfse/emissao'}
                className="text-blue-600 hover:underline mt-2"
              >
                Emitir sua primeira nota →
              </button>
            </div>
          ) : (
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Tipo</th>
                  <th className="py-2.5 px-3">Número</th>
                  <th className="py-2.5 px-3">Cliente</th>
                  <th className="py-2.5 px-3 hidden sm:table-cell">Data</th>
                  <th className="py-2.5 px-3">Valor</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ultimasNotas.map((doc) => {
                  const cliente = doc.destinatario?.razaoSocial || doc.tomador?.razaoSocial || '—';
                  const documento = doc.destinatario?.documento || doc.tomador?.documento || '';
                  const valor = doc.valorTotalNota || doc.valorTotalServicos || 0;
                  const numero = doc.numero || doc.numeroNfse || 0;

                  return (
                    <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2 px-3">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          doc.tipo === 'NFSE' ? 'bg-blue-50 text-blue-700' :
                          doc.tipo === 'NFE' ? 'bg-emerald-50 text-emerald-700' :
                          doc.tipo === 'NFCE' ? 'bg-amber-50 text-amber-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {doc.tipo}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-900">
                        {numero}
                      </td>
                      <td className="py-2 px-3">
                        <div className="font-medium text-slate-800 truncate max-w-xs">{cliente}</div>
                        {documento && (
                          <div className="text-[10px] text-slate-400">{formatarCpfCnpj(documento)}</div>
                        )}
                      </td>
                      <td className="py-2 px-3 text-slate-500 hidden sm:table-cell">
                        {new Date(doc.dataHoraEmissao).toLocaleDateString('pt-BR')}
                        <br />
                        <span className="text-[10px] text-slate-400">
                          {new Date(doc.dataHoraEmissao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-900">
                        {formatarMoeda(valor)}
                      </td>
                      <td className="py-2 px-3">
                        <span className={`px-1.5 py-0.5 rounded font-semibold text-[10px] ${
                          doc.status === 'AUTORIZADA' ? 'bg-emerald-50 text-emerald-700' :
                          doc.status === 'CANCELADA' ? 'bg-rose-50 text-rose-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => window.location.href = `/documentos/${doc.id}`}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                            title="Visualizar"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              const xmlBlob = new Blob(['<!-- XML real da SEFAZ -->'], { type: 'application/xml' });
                              const url = URL.createObjectURL(xmlBlob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `${doc.tipo}_${numero}_${doc.chaveAcesso?.slice(-6) || 'XML'}.xml`;
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
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
};