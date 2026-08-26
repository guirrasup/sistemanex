// C:\emissornfe\src\components\dashboard\DashboardReal.tsx

import React, { useState, useMemo } from 'react';
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
  CreditCard,
  Truck,
  FileBadge2,
  ShoppingBag,
  AlertCircle,
  CheckCircle2,
  Building2,
  Calendar,
  PieChart,
  BarChart3,
  Activity,
  Zap,
  ShieldCheck,
  Wallet,
  Briefcase,
  UserPlus,
  UserCheck,
  Percent,
  Coins,
  Banknote,
  PiggyBank
} from 'lucide-react';
import { formatarMoeda } from '../../utils/cpfCnpjValidator';
import { NFSeDocumento, NFeDocumento, NFCeDocumento, CTeDocumento, NFAeDocumento } from '../../types/fiscal';
import { Produto, ClienteFornecedor, TituloFinanceiro } from '../../types/erp';

interface DashboardRealProps {
  nfses: NFSeDocumento[];
  nfes: NFeDocumento[];
  nfces: NFCeDocumento[];
  ctes: CTeDocumento[];
  nfaes: NFAeDocumento[];
  produtos: Produto[];
  clientes: ClienteFornecedor[];
  servicos: ServicoCatalogo[];
  titulos: TituloFinanceiro[];
}

type PeriodoFiltro = 'hoje' | 'semana' | 'mes' | 'trimestre' | 'ano';

export const DashboardReal: React.FC<DashboardRealProps> = ({
  nfses,
  nfes,
  nfces,
  ctes,
  nfaes,
  produtos,
  clientes,
  servicos,
  titulos,
}) => {
  const [periodo, setPeriodo] = useState<PeriodoFiltro>('mes');

  // 🔥 FILTROS POR PERÍODO
  const getDataInicio = () => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    switch(periodo) {
      case 'hoje': return new Date(hoje);
      case 'semana': {
        const d = new Date(hoje);
        d.setDate(d.getDate() - 7);
        return d;
      }
      case 'mes': {
        const d = new Date(hoje);
        d.setMonth(d.getMonth() - 1);
        return d;
      }
      case 'trimestre': {
        const d = new Date(hoje);
        d.setMonth(d.getMonth() - 3);
        return d;
      }
      case 'ano': {
        const d = new Date(hoje);
        d.setFullYear(d.getFullYear() - 1);
        return d;
      }
      default: return new Date(hoje);
    }
  };

  const dataInicio = getDataInicio();
  const dataFim = new Date();

  // 🔥 FILTRA DOCUMENTOS POR PERÍODO
  const filtrarPorPeriodo = (docs: any[]) => {
    return docs.filter(d => {
      const data = new Date(d.dataHoraEmissao);
      return data >= dataInicio && data <= dataFim;
    });
  };

  const nfsesPeriodo = filtrarPorPeriodo(nfses);
  const nfesPeriodo = filtrarPorPeriodo(nfes);
  const nfcesPeriodo = filtrarPorPeriodo(nfces);
  const ctesPeriodo = filtrarPorPeriodo(ctes);
  const nfaesPeriodo = filtrarPorPeriodo(nfaes);

  // 🔥 CÁLCULOS
  const totalNfse = nfsesPeriodo
    .filter(n => n.status === 'AUTORIZADA')
    .reduce((acc, curr) => acc + curr.valorTotalServicos, 0);

  const totalNfe = nfesPeriodo
    .filter(n => n.status === 'AUTORIZADA')
    .reduce((acc, curr) => acc + curr.valorTotalNota, 0);

  const totalNfce = nfcesPeriodo
    .filter(n => n.status === 'AUTORIZADA')
    .reduce((acc, curr) => acc + curr.valorTotalNota, 0);

  const totalCte = ctesPeriodo
    .filter(n => n.status === 'AUTORIZADA')
    .reduce((acc, curr) => acc + curr.valorTotalFrete, 0);

  const totalNfae = nfaesPeriodo
    .filter(n => n.status === 'AUTORIZADA')
    .reduce((acc, curr) => acc + curr.valorTotalNota, 0);

  const totalFaturamento = totalNfse + totalNfe + totalNfce + totalCte + totalNfae;
  const totalDocumentos = nfsesPeriodo.length + nfesPeriodo.length + nfcesPeriodo.length + ctesPeriodo.length + nfaesPeriodo.length;

  // 🔥 FINANCEIRO
  const aReceberPendente = titulos
    .filter(t => t.tipo === 'RECEBER' && t.status === 'PENDENTE')
    .reduce((acc, curr) => acc + curr.valorOriginal, 0);

  const aReceberPago = titulos
    .filter(t => t.tipo === 'RECEBER' && t.status === 'PAGO')
    .reduce((acc, curr) => acc + (curr.valorPago || curr.valorOriginal), 0);

  const aPagarPendente = titulos
    .filter(t => t.tipo === 'PAGAR' && t.status === 'PENDENTE')
    .reduce((acc, curr) => acc + curr.valorOriginal, 0);

  const totalTitulos = titulos.length;
  const totalPagos = titulos.filter(t => t.status === 'PAGO').length;
  const taxaRecebimento = totalTitulos > 0 ? (totalPagos / totalTitulos) * 100 : 0;

  // 🔥 ESTOQUE
  const produtosEstoqueBaixo = produtos.filter(p => p.estoqueAtual <= p.estoqueMinimo);
  const produtosEstoqueZero = produtos.filter(p => p.estoqueAtual === 0);
  const totalEstoque = produtos.reduce((acc, p) => acc + p.estoqueAtual, 0);

  // 🔥 TAXA DE CRESCIMENTO (comparação com período anterior)
  const dataInicioAnterior = new Date(dataInicio);
  dataInicioAnterior.setDate(dataInicioAnterior.getDate() - (dataFim.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24));

  const nfsesAnterior = nfses.filter(d => {
    const data = new Date(d.dataHoraEmissao);
    return data >= dataInicioAnterior && data < dataInicio;
  });

  const totalAnterior = nfsesAnterior
    .filter(n => n.status === 'AUTORIZADA')
    .reduce((acc, curr) => acc + curr.valorTotalServicos, 0);

  const crescimento = totalAnterior > 0 ? ((totalFaturamento - totalAnterior) / totalAnterior) * 100 : 0;

  // 🔥 ÚLTIMOS DOCUMENTOS
  const ultimosDocs = [
    ...nfsesPeriodo.map(n => ({ ...n, tipo: 'NFS-e' as const, valor: n.valorTotalServicos })),
    ...nfesPeriodo.map(n => ({ ...n, tipo: 'NF-e' as const, valor: n.valorTotalNota })),
    ...nfcesPeriodo.map(n => ({ ...n, tipo: 'NFC-e' as const, valor: n.valorTotalNota })),
    ...ctesPeriodo.map(n => ({ ...n, tipo: 'CT-e' as const, valor: n.valorTotalFrete })),
    ...nfaesPeriodo.map(n => ({ ...n, tipo: 'NFA-e' as const, valor: n.valorTotalNota })),
  ].sort((a, b) => new Date(b.dataHoraEmissao).getTime() - new Date(a.dataHoraEmissao).getTime()).slice(0, 8);

  // 🔥 DISTRIBUIÇÃO POR TIPO
  const distribuicao = [
    { tipo: 'NF-e', valor: totalNfe, cor: 'bg-emerald-500', count: nfesPeriodo.length },
    { tipo: 'NFS-e', valor: totalNfse, cor: 'bg-blue-500', count: nfsesPeriodo.length },
    { tipo: 'NFC-e', valor: totalNfce, cor: 'bg-purple-500', count: nfcesPeriodo.length },
    { tipo: 'CT-e', valor: totalCte, cor: 'bg-cyan-500', count: ctesPeriodo.length },
    { tipo: 'NFA-e', valor: totalNfae, cor: 'bg-amber-500', count: nfaesPeriodo.length },
  ].filter(d => d.valor > 0 || d.count > 0);

  const maxDistribuicao = Math.max(...distribuicao.map(d => d.valor), 1);

  return (
    <div className="space-y-6">
      
      {/* 🔥 HEADER COM PERÍODO E RESUMO */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" />
            <span>Dashboard Executivo</span>
            <span className="text-sm font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
              {periodo.charAt(0).toUpperCase() + periodo.slice(1)}
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Visão completa do negócio em tempo real
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(['hoje', 'semana', 'mes', 'trimestre', 'ano'] as PeriodoFiltro[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                periodo === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {p === 'hoje' ? 'Hoje' : p === 'semana' ? '7 dias' : p === 'mes' ? '30 dias' : p === 'trimestre' ? '3 meses' : '12 meses'}
            </button>
          ))}
        </div>
      </div>

      {/* 🔥 CARDS DE MÉTRICAS PRINCIPAIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Faturamento */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Faturamento Total</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {formatarMoeda(totalFaturamento)}
              </div>
            </div>
            <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs font-semibold ${crescimento >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {crescimento >= 0 ? '+' : ''}{crescimento.toFixed(1)}%
            </span>
            <span className="text-xs text-slate-400">vs período anterior</span>
            {crescimento >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
            )}
          </div>
          <div className="text-xs text-slate-400 mt-1">{totalDocumentos} documentos emitidos</div>
        </div>

        {/* Documentos Fiscais */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Documentos Emitidos</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{totalDocumentos}</div>
            </div>
            <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs">
            <span className="text-emerald-600 font-medium">NF-e: {nfesPeriodo.length}</span>
            <span className="text-blue-600 font-medium">NFS-e: {nfsesPeriodo.length}</span>
            <span className="text-purple-600 font-medium">NFC-e: {nfcesPeriodo.length}</span>
          </div>
        </div>

        {/* Financeiro */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">A Receber</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {formatarMoeda(aReceberPendente)}
              </div>
            </div>
            <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs">
            <span className="text-emerald-600 font-medium">Recebido: {formatarMoeda(aReceberPago)}</span>
            <span className="text-rose-600 font-medium">A Pagar: {formatarMoeda(aPagarPendente)}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div 
              className="bg-emerald-500 h-1.5 rounded-full transition-all"
              style={{ width: `${Math.min(taxaRecebimento, 100)}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {taxaRecebimento.toFixed(0)}% dos títulos recebidos
          </div>
        </div>

        {/* Estoque */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Estoque</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{produtos.length}</div>
            </div>
            <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs">
            {produtosEstoqueZero.length > 0 && (
              <span className="text-rose-600 font-medium">⚠️ {produtosEstoqueZero.length} sem estoque</span>
            )}
            {produtosEstoqueBaixo.length > 0 && (
              <span className="text-amber-600 font-medium">⚠️ {produtosEstoqueBaixo.length} baixo</span>
            )}
          </div>
          <div className="text-xs text-slate-400 mt-1">{totalEstoque} unidades em estoque</div>
        </div>

      </div>

      {/* 🔥 GRID PRINCIPAL: 2 COLUNAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUNA ESQUERDA (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Distribuição por Tipo de Documento */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-bold text-slate-900">Distribuição por Tipo</h3>
              </div>
              <span className="text-xs text-slate-400">{distribuicao.length} tipos ativos</span>
            </div>

            {distribuicao.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="font-medium">Nenhum documento emitido no período</p>
              </div>
            ) : (
              <div className="space-y-3">
                {distribuicao.map((item) => (
                  <div key={item.tipo} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${item.cor}`}></span>
                        <span className="font-medium text-slate-700">{item.tipo}</span>
                        <span className="text-slate-400">({item.count})</span>
                      </div>
                      <span className="font-bold text-slate-900">{formatarMoeda(item.valor)}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${item.cor} transition-all`}
                        style={{ width: `${(item.valor / maxDistribuicao) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Últimos Documentos Emitidos */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-slate-900 text-sm">Últimos Documentos</span>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {ultimosDocs.length}
                </span>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {ultimosDocs.length === 0 ? (
                <div className="px-5 py-8 text-center text-slate-500 text-sm">
                  Nenhum documento emitido no período
                </div>
              ) : (
                ultimosDocs.map((doc) => {
                  const cores = {
                    'NF-e': 'bg-emerald-100 text-emerald-700',
                    'NFS-e': 'bg-blue-100 text-blue-700',
                    'NFC-e': 'bg-purple-100 text-purple-700',
                    'CT-e': 'bg-cyan-100 text-cyan-700',
                    'NFA-e': 'bg-amber-100 text-amber-700',
                  };
                  const icones = {
                    'NF-e': <Receipt className="w-3.5 h-3.5" />,
                    'NFS-e': <FileText className="w-3.5 h-3.5" />,
                    'NFC-e': <ShoppingBag className="w-3.5 h-3.5" />,
                    'CT-e': <Truck className="w-3.5 h-3.5" />,
                    'NFA-e': <FileBadge2 className="w-3.5 h-3.5" />,
                  };

                  return (
                    <div key={doc.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${cores[doc.tipo]}`}>
                          {icones[doc.tipo]}
                        </span>
                        <div>
                          <div className="font-medium text-slate-900 text-sm">Nº {doc.numero || doc.numeroNfse}</div>
                          <div className="text-xs text-slate-400">
                            {doc.tipo} • {new Date(doc.dataHoraEmissao).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900">{formatarMoeda(doc.valor)}</div>
                        <span className="text-[10px] text-emerald-600 font-medium">✓ Autorizada</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* COLUNA DIREITA (1/3) */}
        <div className="space-y-6">
          
          {/* Resumo Financeiro */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Wallet className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-bold text-slate-900">Resumo Financeiro</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-medium text-emerald-900">A Receber</span>
                </div>
                <span className="text-sm font-bold text-emerald-700">{formatarMoeda(aReceberPendente)}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-rose-50 rounded-lg border border-rose-100">
                <div className="flex items-center gap-2">
                  <ArrowDownRight className="w-4 h-4 text-rose-600" />
                  <span className="text-xs font-medium text-rose-900">A Pagar</span>
                </div>
                <span className="text-sm font-bold text-rose-700">{formatarMoeda(aPagarPendente)}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-medium text-slate-700">Já Recebido</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{formatarMoeda(aReceberPago)}</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Total de títulos</span>
                <span className="font-semibold text-slate-900">{totalTitulos}</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-slate-500">Recebidos</span>
                <span className="font-semibold text-emerald-600">{totalPagos} ({taxaRecebimento.toFixed(0)}%)</span>
              </div>
            </div>
          </div>

          {/* Alertas de Estoque */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900">Alertas de Estoque</h3>
              {produtosEstoqueBaixo.length > 0 && (
                <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {produtosEstoqueBaixo.length}
                </span>
              )}
            </div>

            {produtosEstoqueBaixo.length === 0 ? (
              <div className="text-center py-6 text-slate-500">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-medium">Todos os produtos com estoque OK</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {produtosEstoqueBaixo.slice(0, 10).map(prod => (
                  <div key={prod.id} className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-slate-900 truncate">{prod.descricao}</div>
                      <div className="text-[10px] text-slate-500">
                        {prod.estoqueAtual} {prod.unidade} / Mínimo {prod.estoqueMinimo}
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      prod.estoqueAtual === 0 ? 'bg-rose-200 text-rose-800' : 'bg-amber-200 text-amber-800'
                    }`}>
                      {prod.estoqueAtual === 0 ? 'ESGOTADO' : 'BAIXO'}
                    </span>
                  </div>
                ))}
                {produtosEstoqueBaixo.length > 10 && (
                  <div className="text-center text-xs text-slate-400 pt-1">
                    + {produtosEstoqueBaixo.length - 10} outros produtos
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Resumo do Sistema */}

<div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
  <div className="flex items-center gap-2 mb-4">
    <ShieldCheck className="w-4 h-4 text-blue-600" />
    <h3 className="text-sm font-bold text-slate-900">Status do Sistema</h3>
  </div>

  <div className="space-y-2 text-xs">
    <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
      <span className="text-slate-600 font-medium">Ambiente</span>
      <span className="font-semibold text-emerald-700">● Produção SEFAZ</span>
    </div>
    <div className="flex items-center justify-between p-2.5 bg-blue-50 rounded-lg border border-blue-100">
      <span className="text-slate-600 font-medium">Certificado A1</span>
      <span className="font-semibold text-blue-700">✓ Válido</span>
    </div>
    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
      <span className="text-slate-600 font-medium">Último backup</span>
      <span className="font-semibold text-slate-700">{new Date().toLocaleDateString('pt-BR')}</span>
    </div>
  </div>

  <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-3 gap-2 text-center text-xs">
    <div className="bg-slate-50 rounded-lg p-2">
      <div className="text-lg font-bold text-slate-900">{clientes.length}</div>
      <div className="text-slate-500">Clientes</div>
    </div>
    <div className="bg-slate-50 rounded-lg p-2">
      <div className="text-lg font-bold text-slate-900">{produtos.length}</div>
      <div className="text-slate-500">Produtos</div>
    </div>
    <div className="bg-slate-50 rounded-lg p-2">
      <div className="text-lg font-bold text-slate-900">{servicos.length}</div>
      <div className="text-slate-500">Serviços</div>
    </div>
  </div>
</div>

        </div>

      </div>

    </div>
  );
};