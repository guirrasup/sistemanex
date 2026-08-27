// C:\emissornfe\src\components\dashboard\DashboardReal.tsx

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Receipt,
  Package,
  Users,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Truck,
  ShoppingBag,
  AlertCircle,
  CheckCircle2,
  Activity,
  ShieldCheck,
  Wallet,
  Loader2,
  Building2,
  UserCheck,
  UserPlus,
  Settings,
  FileCode2,
  Search,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  CreditCard,
  HandCoins,
  Briefcase,
  User,
  Building,
  Store,
  ClipboardList
} from 'lucide-react';
import { formatarMoeda, formatarCpfCnpj } from '../../utils/cpfCnpjValidator';
import api from '../../services/api';

// ============================================================
// TIPOS
// ============================================================

interface DashboardData {
  faturamentoTotal: number;
  totalNfes: number;
  totalClientes: number;
  totalProdutos: number;
  totalFornecedores: number;
  totalTransportadoras: number;
  aReceber: number;
  aPagar: number;
  crescimento: number;
  nfesMes: number;
  faturamentoMes: number;
  comparativoMes: number;
  notasPorTipo: {
    NFE: number;
    NFSE: number;
    NFCE: number;
    CTE: number;
    NFAE: number;
  };
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
  faturamentoPorMes: Array<{ mes: string; valor: number }>;
  documentosPorStatus: { autorizadas: number; canceladas: number; pendentes: number };
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export const DashboardReal: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  // 🔥 COR DO MÓDULO (AZUL)
  const cor = 'blue';
  const corBg = 'bg-blue-50';
  const corBorder = 'border-blue-200';
  const corText = 'text-blue-700';
  const corTextDark = 'text-blue-800';
  const corBgButton = 'bg-blue-600 hover:bg-blue-700';
  const corBgBadge = 'bg-blue-100';
  const corIconBg = 'bg-blue-600';

  // ============================================================
  // FUNÇÃO DE NAVEGAÇÃO - USANDO O onNavigate DO APP
  // ============================================================

  // 🔥 ESTA FUNÇÃO SERÁ SUBSTITUÍDA PELO onNavigate DO APP
  // Mas por enquanto, usamos window.location
  const navegarPara = (rota: string) => {
    // Tenta encontrar o elemento com o id da rota e clicar
    const menuItem = document.getElementById(`menu-item-${rota}`);
    if (menuItem) {
      menuItem.click();
      return;
    }
    // Fallback: navegação tradicional
    window.location.href = rota;
  };

  // ============================================================
  // CARREGA DADOS
  // ============================================================

  const carregarDados = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Carregando dashboard...');

      // Busca todos os dados em paralelo
      const [
        clientesRes,
        produtosRes,
        titulosRes,
        nfesRes,
        nfsesRes,
        nfcesRes,
        ctesRes,
        nfaesRes,
        transportadorasRes
      ] = await Promise.all([
        api.get('/clientes?limit=999').catch(() => ({ data: { dados: { data: [] } } })),
        api.get('/produtos?limit=999').catch(() => ({ data: { dados: { data: [] } } })),
        api.get('/financeiro/titulos?limit=999').catch(() => ({ data: { dados: { data: [] } } })),
        api.get('/nfe?limit=999').catch(() => ({ data: { dados: { data: [] } } })),
        api.get('/nfse?limit=999').catch(() => ({ data: { dados: { data: [] } } })),
        api.get('/nfce?limit=999').catch(() => ({ data: { dados: { data: [] } } })),
        api.get('/cte?limit=999').catch(() => ({ data: { dados: { data: [] } } })),
        api.get('/nfae?limit=999').catch(() => ({ data: { dados: { data: [] } } })),
        api.get('/transportadoras?limit=999').catch(() => ({ data: { dados: { data: [] } } }))
      ]);

      // Extrair dados
      const clientes = clientesRes.data?.dados?.data || clientesRes.data?.dados || [];
      const produtos = produtosRes.data?.dados?.data || produtosRes.data?.dados || [];
      const titulos = titulosRes.data?.dados?.data || titulosRes.data?.dados || [];
      const nfes = nfesRes.data?.dados?.data || nfesRes.data?.dados || [];
      const nfses = nfsesRes.data?.dados?.data || nfsesRes.data?.dados || [];
      const nfces = nfcesRes.data?.dados?.data || nfcesRes.data?.dados || [];
      const ctes = ctesRes.data?.dados?.data || ctesRes.data?.dados || [];
      const nfaes = nfaesRes.data?.dados?.data || nfaesRes.data?.dados || [];
      const transportadoras = transportadorasRes.data?.dados?.data || transportadorasRes.data?.dados || [];

      console.log('📊 Dados carregados:', {
        clientes: clientes.length,
        produtos: produtos.length,
        titulos: titulos.length,
        nfes: nfes.length,
        nfses: nfses.length,
        nfces: nfces.length,
        ctes: ctes.length,
        nfaes: nfaes.length,
        transportadoras: transportadoras.length
      });

      // ============================================================
      // CÁLCULOS
      // ============================================================

      // 1. Faturamento total
      const totalNfe = nfes.reduce((acc: number, n: any) => acc + (n.valorTotalNota || 0), 0);
      const totalNfse = nfses.reduce((acc: number, n: any) => acc + (n.valorTotalServicos || 0), 0);
      const totalNfce = nfces.reduce((acc: number, n: any) => acc + (n.valorTotalNota || 0), 0);
      const totalCte = ctes.reduce((acc: number, n: any) => acc + (n.valorTotalFrete || 0), 0);
      const totalNfae = nfaes.reduce((acc: number, n: any) => acc + (n.valorTotalNota || 0), 0);
      const faturamentoTotal = totalNfe + totalNfse + totalNfce + totalCte + totalNfae;

      // 2. Contagem por tipo
      const notasPorTipo = {
        NFE: nfes.length,
        NFSE: nfses.length,
        NFCE: nfces.length,
        CTE: ctes.length,
        NFAE: nfaes.length
      };

      // 3. Últimas notas
      const todasNotas = [
        ...nfes.map((n: any) => ({ ...n, tipo: 'NFE', valor: n.valorTotalNota || 0, numero: n.numero, data: n.dataHoraEmissao })),
        ...nfses.map((n: any) => ({ ...n, tipo: 'NFSE', valor: n.valorTotalServicos || 0, numero: n.numeroNfse, data: n.dataHoraEmissao })),
        ...nfces.map((n: any) => ({ ...n, tipo: 'NFCE', valor: n.valorTotalNota || 0, numero: n.numero, data: n.dataHoraEmissao })),
        ...ctes.map((n: any) => ({ ...n, tipo: 'CTE', valor: n.valorTotalFrete || 0, numero: n.numero, data: n.dataHoraEmissao })),
        ...nfaes.map((n: any) => ({ ...n, tipo: 'NFAE', valor: n.valorTotalNota || 0, numero: n.numero, data: n.dataHoraEmissao }))
      ].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

      const totalNfes = todasNotas.length;

      // 4. Notas do mês
      const hoje = new Date();
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const notasMes = todasNotas.filter(n => new Date(n.data) >= inicioMes);
      const nfesMes = notasMes.length;
      const faturamentoMes = notasMes.reduce((acc: number, n: any) => acc + (n.valor || 0), 0);

      // 5. Status dos documentos
      const documentosPorStatus = {
        autorizadas: todasNotas.filter(n => n.status === 'AUTORIZADA').length,
        canceladas: todasNotas.filter(n => n.status === 'CANCELADA').length,
        pendentes: todasNotas.filter(n => n.status === 'PROCESSANDO' || n.status === 'RASCUNHO').length
      };

      // 6. Financeiro
      const aReceber = titulos
        .filter((t: any) => t.tipo === 'RECEBER' && (t.status === 'PENDENTE' || t.status === 'VENCIDO'))
        .reduce((acc: number, t: any) => acc + (t.valorOriginal || 0), 0);

      const aPagar = titulos
        .filter((t: any) => t.tipo === 'PAGAR' && (t.status === 'PENDENTE' || t.status === 'VENCIDO'))
        .reduce((acc: number, t: any) => acc + (t.valorOriginal || 0), 0);

      // 7. Faturamento por mês (últimos 6 meses)
      const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const faturamentoPorMes = [];
      for (let i = 5; i >= 0; i--) {
        const mes = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const mesFim = new Date(hoje.getFullYear(), hoje.getMonth() - i + 1, 0);
        const notasMesPeriodo = todasNotas.filter(n => {
          const data = new Date(n.data);
          return data >= mes && data <= mesFim;
        });
        const valor = notasMesPeriodo.reduce((acc: number, n: any) => acc + (n.valor || 0), 0);
        faturamentoPorMes.push({
          mes: meses[mes.getMonth()],
          valor: valor
        });
      }

      // 8. Crescimento
      const mesAtual = faturamentoPorMes[faturamentoPorMes.length - 1]?.valor || 0;
      const mesAnterior = faturamentoPorMes[faturamentoPorMes.length - 2]?.valor || 0;
      const crescimento = mesAnterior > 0 ? ((mesAtual - mesAnterior) / mesAnterior) * 100 : 0;

      // 9. Cadastros
      const totalClientes = clientes.filter((c: any) => c.tipo === 'CLIENTE' || c.tipo === 'AMBOS').length;
      const totalFornecedores = clientes.filter((c: any) => c.tipo === 'FORNECEDOR' || c.tipo === 'AMBOS').length;
      const totalProdutos = produtos.filter((p: any) => p.ativo !== false).length;
      const totalTransportadoras = transportadoras.length;

      // ============================================================
      // SET DASHBOARD
      // ============================================================

      setDashboard({
        faturamentoTotal,
        totalNfes,
        totalClientes,
        totalProdutos,
        totalFornecedores,
        totalTransportadoras,
        aReceber,
        aPagar,
        crescimento,
        nfesMes,
        faturamentoMes,
        comparativoMes: mesAtual - mesAnterior,
        notasPorTipo,
        ultimasNotas: todasNotas.slice(0, 10).map(n => ({
          id: n.id,
          numero: n.numero,
          chaveAcesso: n.chaveAcesso || '',
          dataHoraEmissao: n.data,
          valorTotalNota: n.tipo === 'NFE' ? n.valor : undefined,
          valorTotalServicos: n.tipo === 'NFSE' ? n.valor : undefined,
          status: n.status,
          destinatario: n.destinatario || n.tomador,
          tomador: n.tomador,
          tipo: n.tipo
        })),
        faturamentoPorMes,
        documentosPorStatus
      });

      console.log('✅ Dashboard processado:', {
        faturamentoTotal,
        totalNfes,
        notasPorTipo,
        documentosPorStatus
      });

    } catch (err: any) {
      console.error('❌ Erro:', err);
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  if (error || !dashboard) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-8 text-center max-w-lg mx-auto">
        <AlertCircle className="w-12 h-12 text-rose-600 mx-auto mb-3" />
        <p className="text-rose-800 font-medium text-lg">{error || 'Dados indisponíveis'}</p>
        <button 
          onClick={carregarDados}
          className="mt-4 px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
        >
          🔄 Tentar novamente
        </button>
      </div>
    );
  }

  const {
    faturamentoTotal = 0,
    totalNfes = 0,
    totalClientes = 0,
    totalProdutos = 0,
    totalFornecedores = 0,
    totalTransportadoras = 0,
    aReceber = 0,
    aPagar = 0,
    crescimento = 0,
    nfesMes = 0,
    faturamentoMes = 0,
    notasPorTipo = { NFE: 0, NFSE: 0, NFCE: 0, CTE: 0, NFAE: 0 },
    ultimasNotas = [],
    faturamentoPorMes = [],
    documentosPorStatus = { autorizadas: 0, canceladas: 0, pendentes: 0 }
  } = dashboard;

  const temCrescimento = crescimento > 0;

  // 🔥 CORRIGIDO: Calcular o valor máximo para o gráfico
  const maxValor = faturamentoPorMes.length > 0 ? Math.max(...faturamentoPorMes.map((i: any) => i.valor), 1) : 1;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className={`${corBg} rounded-xl border ${corBorder} p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}>
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-8 h-8 ${corIconBg} rounded-lg flex items-center justify-center text-white shadow-sm`}>
              <Activity className="w-4 h-4" />
            </span>
            <h1 className="text-base font-bold text-slate-900">Dashboard</h1>
            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
              ✅ Conectado
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Dados reais do banco · {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => navegarPara('nfse-emissor')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-3.5 py-2 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Nova NFS-e</span>
          </button>

          <button
            onClick={() => navegarPara('nfe-emissor')}
            className="bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs px-3.5 py-2 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Nova NF-e</span>
          </button>

          <button
            onClick={() => navegarPara('documentos-fiscais')}
            className="border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Ver Todos</span>
          </button>
        </div>
      </div>

      {/* CARDS PRINCIPAIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Faturamento Total</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{formatarMoeda(faturamentoTotal)}</div>
            </div>
            <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs font-semibold ${temCrescimento ? 'text-emerald-600' : 'text-rose-600'}`}>
              {temCrescimento ? '↑' : '↓'} {Math.abs(crescimento).toFixed(1)}%
            </span>
            <span className="text-xs text-slate-400">vs período anterior</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">{totalNfes} notas emitidas</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm cursor-pointer hover:border-blue-300 transition-colors" onClick={() => navegarPara('documentos-fiscais')}>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Notas no Mês</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{nfesMes}</div>
            </div>
            <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-xs text-slate-400 mt-2">Faturamento: {formatarMoeda(faturamentoMes)}</div>
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {Object.entries(notasPorTipo).map(([tipo, qtd]) => {
              if (qtd === 0) return null;
              const cores: Record<string, string> = {
                'NFE': 'bg-emerald-100 text-emerald-700',
                'NFSE': 'bg-blue-100 text-blue-700',
                'NFCE': 'bg-purple-100 text-purple-700',
                'CTE': 'bg-cyan-100 text-cyan-700',
                'NFAE': 'bg-amber-100 text-amber-700',
              };
              return (
                <span key={tipo} className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${cores[tipo] || 'bg-slate-100'}`}>
                  {tipo}: {qtd}
                </span>
              );
            })}
            {Object.values(notasPorTipo).every(v => v === 0) && (
              <span className="text-[9px] text-slate-400">Nenhuma nota emitida</span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm cursor-pointer hover:border-emerald-300 transition-colors" onClick={() => navegarPara('financeiro')}>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">A Receber</span>
              <div className="text-2xl font-black text-emerald-700 mt-1">{formatarMoeda(aReceber)}</div>
            </div>
            <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <div className="text-xs text-slate-400 mt-2">A Pagar: {formatarMoeda(aPagar)}</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Cadastros</span>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <button onClick={() => navegarPara('clientes')} className="cursor-pointer hover:bg-slate-100 px-2 py-1 rounded transition-colors flex flex-col items-center">
                  <div className="flex items-center gap-1">
                    <UserPlus className="w-3.5 h-3.5 text-sky-600" />
                    <span className="text-lg font-black text-slate-900">{totalClientes}</span>
                  </div>
                  <div className="text-[9px] text-slate-500">Clientes</div>
                </button>
                <button onClick={() => navegarPara('fornecedores')} className="cursor-pointer hover:bg-slate-100 px-2 py-1 rounded transition-colors flex flex-col items-center">
                  <div className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-violet-600" />
                    <span className="text-lg font-black text-slate-900">{totalFornecedores}</span>
                  </div>
                  <div className="text-[9px] text-slate-500">Fornecedores</div>
                </button>
                <button onClick={() => navegarPara('transportadoras')} className="cursor-pointer hover:bg-slate-100 px-2 py-1 rounded transition-colors flex flex-col items-center">
                  <div className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-cyan-600" />
                    <span className="text-lg font-black text-slate-900">{totalTransportadoras}</span>
                  </div>
                  <div className="text-[9px] text-slate-500">Transportadoras</div>
                </button>
                <button onClick={() => navegarPara('produtos')} className="cursor-pointer hover:bg-slate-100 px-2 py-1 rounded transition-colors flex flex-col items-center">
                  <div className="flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-lg font-black text-slate-900">{totalProdutos}</span>
                  </div>
                  <div className="text-[9px] text-slate-500">Produtos</div>
                </button>
              </div>
            </div>
            <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
        </div>

      </div>

      {/* GRÁFICO DE BARRAS + DISTRIBUIÇÃO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Faturamento por Mês</h3>
            </div>
            <span className="text-[10px] text-slate-400">Últimos 6 meses</span>
          </div>

          <div className="h-48 flex items-end justify-between gap-2 pt-2">
            {faturamentoPorMes.length > 0 && faturamentoPorMes.some((i: any) => i.valor > 0) ? (
              faturamentoPorMes.map((item: any, index: number) => {
                // 🔥 CORRIGIDO: Altura proporcional ao valor máximo
                const altura = maxValor > 0 ? (item.valor / maxValor) * 100 : 0;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1">
                    <div className="text-[9px] font-bold text-slate-600">{formatarMoeda(item.valor)}</div>
                    <div 
                      className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all hover:opacity-80 cursor-pointer"
                      style={{ height: `${Math.max(altura, 4)}%`, minHeight: '8px' }}
                      title={`${item.mes}: ${formatarMoeda(item.valor)}`}
                    />
                    <div className="text-[9px] text-slate-400 font-medium">{item.mes}</div>
                  </div>
                );
              })
            ) : (
              <div className="w-full text-center text-slate-400 text-xs py-8">
                Nenhum dado de faturamento disponível
              </div>
            )}
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between text-[10px] text-slate-400">
            <span>Total: {formatarMoeda(faturamentoTotal)}</span>
            <span>Média mensal: {formatarMoeda(faturamentoPorMes.length > 0 ? faturamentoTotal / faturamentoPorMes.length : 0)}</span>
          </div>
        </div>

        {/* DISTRIBUIÇÃO */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Distribuição</h3>
            </div>
            <span className="text-[10px] text-slate-400">Por Tipo</span>
          </div>

          <div className="space-y-2">
            {Object.entries(notasPorTipo).map(([tipo, qtd]) => {
              const total = Object.values(notasPorTipo).reduce((a, b) => a + b, 0) || 1;
              const percent = (qtd / total) * 100;
              const cores: Record<string, string> = {
                'NFE': 'bg-emerald-500',
                'NFSE': 'bg-blue-500',
                'NFCE': 'bg-purple-500',
                'CTE': 'bg-cyan-500',
                'NFAE': 'bg-amber-500',
              };
              const labels: Record<string, string> = {
                'NFE': 'NF-e',
                'NFSE': 'NFS-e',
                'NFCE': 'NFC-e',
                'CTE': 'CT-e',
                'NFAE': 'NFA-e',
              };
              return (
                <div key={tipo}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{labels[tipo] || tipo}</span>
                    <span className="text-slate-500">{qtd} ({percent.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-1">
                    <div 
                      className={`h-full ${cores[tipo] || 'bg-slate-400'} rounded-full transition-all`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {Object.values(notasPorTipo).every(v => v === 0) && (
              <div className="text-center text-slate-400 text-xs py-4">Nenhum documento emitido</div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Total de Documentos:</span>
              <span className="font-bold text-slate-900">{Object.values(notasPorTipo).reduce((a, b) => a + b, 0)}</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-slate-500">Faturamento Total:</span>
              <span className="font-bold text-slate-900">{formatarMoeda(faturamentoTotal)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* STATUS DOS DOCUMENTOS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-emerald-700">Autorizadas</span>
            <div className="text-2xl font-black text-emerald-800">{documentosPorStatus.autorizadas}</div>
          </div>
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-rose-700">Canceladas</span>
            <div className="text-2xl font-black text-rose-800">{documentosPorStatus.canceladas}</div>
          </div>
          <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-rose-600" />
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-amber-700">Pendentes</span>
            <div className="text-2xl font-black text-amber-800">{documentosPorStatus.pendentes}</div>
          </div>
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
        </div>
      </div>

      {/* ÚLTIMAS NOTAS */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-slate-900 text-sm">Últimos Documentos</span>
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{ultimasNotas.length}</span>
          </div>
          <button onClick={() => navegarPara('documentos-fiscais')} className="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer">
            Ver todos →
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {ultimasNotas.length === 0 ? (
            <div className="px-5 py-8 text-center text-slate-500 text-sm">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              Nenhum documento emitido ainda.
            </div>
          ) : (
            ultimasNotas.slice(0, 6).map((doc: any) => {
              const cores: Record<string, string> = {
                'NFE': 'bg-emerald-100 text-emerald-700',
                'NFSE': 'bg-blue-100 text-blue-700',
                'NFCE': 'bg-purple-100 text-purple-700',
                'CTE': 'bg-cyan-100 text-cyan-700',
                'NFAE': 'bg-amber-100 text-amber-700',
              };
              const icones: Record<string, React.ReactNode> = {
                'NFE': <Receipt className="w-3.5 h-3.5" />,
                'NFSE': <FileText className="w-3.5 h-3.5" />,
                'NFCE': <ShoppingBag className="w-3.5 h-3.5" />,
                'CTE': <Truck className="w-3.5 h-3.5" />,
                'NFAE': <FileCode2 className="w-3.5 h-3.5" />,
              };
              const cliente = doc.destinatario?.razaoSocial || doc.tomador?.razaoSocial || '—';
              const valor = doc.valorTotalNota || doc.valorTotalServicos || 0;
              const numero = doc.numero || 0;

              return (
                <div key={doc.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${cores[doc.tipo] || 'bg-slate-100 text-slate-600'}`}>
                      {icones[doc.tipo] || <FileText className="w-3.5 h-3.5" />}
                    </span>
                    <div className="min-w-0">
                      <div className="font-medium text-slate-900 text-sm truncate">
                        {doc.tipo} Nº {numero} - {cliente}
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(doc.dataHoraEmissao).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <div className="font-bold text-slate-900 text-sm">{formatarMoeda(valor)}</div>
                    <span className={`text-[10px] font-medium ${
                      doc.status === 'AUTORIZADA' ? 'text-emerald-600' : 
                      doc.status === 'CANCELADA' ? 'text-rose-600' : 'text-slate-400'
                    }`}>
                      {doc.status === 'AUTORIZADA' ? '✓ Autorizada' : doc.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
};