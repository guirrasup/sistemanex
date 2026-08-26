// C:\emissornfe\src\components\fiscal\DocumentosFiscaisList.tsx

import React, { useState } from 'react';
import { 
  FileText, 
  Receipt, 
  Search, 
  Download, 
  Eye, 
  Plus, 
  Copy, 
  Check, 
  FileSpreadsheet, 
  Filter, 
  CheckCircle2, 
  Layers, 
  Building2, 
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  ChevronDown,
  ShoppingBag,
  Truck,
  FileBadge2,
  FolderOpen
} from 'lucide-react';
import { NFSeDocumento, NFeDocumento, NFCeDocumento, CTeDocumento, NFAeDocumento } from '../../types/fiscal';
import { formatarMoeda, formatarCpfCnpj } from '../../utils/cpfCnpjValidator';
import { formatarChaveAcesso44 } from '../../utils/chaveAcesso';

interface DocumentosFiscaisListProps {
  nfses: NFSeDocumento[];
  nfes: NFeDocumento[];
  nfces?: NFCeDocumento[];
  ctes?: CTeDocumento[];
  nfaes?: NFAeDocumento[];
  onViewDanfse: (nfse: NFSeDocumento) => void;
  onViewDanfe: (nfe: NFeDocumento) => void;
  onViewDanfce?: (nfce: NFCeDocumento) => void;
  onViewDacte?: (cte: CTeDocumento) => void;
  onViewDanfae?: (nfae: NFAeDocumento) => void;
  onEmitirNovaNfse?: () => void;
  onEmitirNovaNfe?: () => void;
  onEmitirNovaNfce?: () => void;
  onEmitirNovoCte?: () => void;
  onEmitirNovaNfae?: () => void;
  onCancelarNfse?: (id: string) => void;
  onCancelarNfe?: (id: string) => void;
}

export const DocumentosFiscaisList: React.FC<DocumentosFiscaisListProps> = ({
  nfses,
  nfes,
  nfces = [],
  ctes = [],
  nfaes = [],
  onViewDanfse,
  onViewDanfe,
  onViewDanfce,
  onViewDacte,
  onViewDanfae,
  onEmitirNovaNfse,
  onEmitirNovaNfe,
  onEmitirNovaNfce,
  onEmitirNovoCte,
  onEmitirNovaNfae,
}) => {
  const [tipoFiltro, setTipoFiltro] = useState<'TODOS' | 'NFE' | 'NFSE' | 'NFCE' | 'CTE' | 'NFAE'>('TODOS');
  const [statusFiltro, setStatusFiltro] = useState<'TODOS' | 'AUTORIZADA' | 'CANCELADA'>('TODOS');
  const [busca, setBusca] = useState('');
  const [chaveCopiada, setChaveCopiada] = useState<string | null>(null);
  const [menuNovaNotaAberto, setMenuNovaNotaAberto] = useState(false);

  // 🔥 COR DO MÓDULO (ÍNDIGO) - MESMA DO HEADER E SIDEBAR
  const cor = 'indigo';
  const corBg = 'bg-indigo-50';
  const corBorder = 'border-indigo-200';
  const corText = 'text-indigo-700';
  const corTextDark = 'text-indigo-800';
  const corBgButton = 'bg-indigo-600 hover:bg-indigo-700';
  const corBgBadge = 'bg-indigo-100';
  const corFocus = 'focus:ring-indigo-500';
  const corIconBg = 'bg-indigo-600';
  const corGradient = 'from-indigo-600 to-indigo-700';

  // 🔥 CORES POR TIPO (MESMAS DO HEADER E SIDEBAR)
  const coresPorTipo = {
    TODOS: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-300', hover: 'hover:bg-indigo-100' },
    NFE: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300', hover: 'hover:bg-emerald-100' },
    NFSE: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300', hover: 'hover:bg-blue-100' },
    NFCE: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-300', hover: 'hover:bg-purple-100' },
    CTE: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-300', hover: 'hover:bg-cyan-100' },
    NFAE: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300', hover: 'hover:bg-amber-100' },
  };

  // Unifica todos os 5 tipos de documentos fiscais ordenados por data decrescente
  const todosDocs = [
    ...nfes.map(n => ({
      tipo: 'NFE' as const,
      tipoLabel: 'NF-e (Produto)',
      modelo: '55',
      corBadge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      id: n.id,
      numero: n.numero,
      serie: n.serie,
      chave: n.chaveAcesso,
      destinatario: n.destinatario.nomeRazaoSocial,
      documento: n.destinatario.documento,
      valor: n.valorTotalNota,
      data: n.dataHoraEmissao,
      status: n.status,
      xml: n.xmlAssinado,
      detalhes: `${n.itens.length} item(ns) faturado(s)`,
      onView: () => onViewDanfe(n),
    })),
    ...nfses.map(n => ({
      tipo: 'NFSE' as const,
      tipoLabel: 'NFS-e (Serviço)',
      modelo: 'DPS/Nac',
      corBadge: 'bg-blue-50 text-blue-800 border-blue-200',
      id: n.id,
      numero: n.numeroNfse,
      serie: n.serieDPS,
      chave: n.chaveAcesso,
      destinatario: n.tomador.nomeRazaoSocial,
      documento: n.tomador.documento,
      valor: n.valorTotalServicos,
      data: n.dataHoraEmissao,
      status: n.status,
      xml: n.xmlAssinado,
      detalhes: n.servico.descricao,
      onView: () => onViewDanfse(n),
    })),
    ...nfces.map(n => ({
      tipo: 'NFCE' as const,
      tipoLabel: 'NFC-e (Consumidor)',
      modelo: '65',
      corBadge: 'bg-purple-50 text-purple-800 border-purple-200',
      id: n.id,
      numero: n.numero,
      serie: n.serie,
      chave: n.chaveAcesso,
      destinatario: n.destinatario?.nomeRazaoSocial || 'Consumidor Final (PDV)',
      documento: n.destinatario?.cpfCnpj || 'Não Informado',
      valor: n.valorTotalNota,
      data: n.dataHoraEmissao,
      status: n.status,
      xml: n.xmlAssinado,
      detalhes: `${n.itens.length} item(ns) • Cupom Fiscal PDV`,
      onView: () => onViewDanfce && onViewDanfce(n),
    })),
    ...ctes.map(n => ({
      tipo: 'CTE' as const,
      tipoLabel: 'CT-e (Transporte)',
      modelo: '57',
      corBadge: 'bg-cyan-50 text-cyan-800 border-cyan-200',
      id: n.id,
      numero: n.numero,
      serie: n.serie,
      chave: n.chaveAcesso,
      destinatario: `${n.remetente.nomeRazaoSocial.slice(0, 18)} ➔ ${n.destinatario.nomeRazaoSocial.slice(0, 18)}`,
      documento: n.remetente.documento,
      valor: n.valorTotalFrete,
      data: n.dataHoraEmissao,
      status: n.status,
      xml: n.xmlAssinado,
      detalhes: `Frete ${n.municipioInicio.nome}/${n.municipioInicio.uf} ➔ ${n.municipioFim.nome}/${n.municipioFim.uf}`,
      onView: () => onViewDacte && onViewDacte(n),
    })),
    ...nfaes.map(n => ({
      tipo: 'NFAE' as const,
      tipoLabel: 'NFA-e (Avulsa)',
      modelo: 'Série 900',
      corBadge: 'bg-amber-50 text-amber-800 border-amber-200',
      id: n.id,
      numero: n.numero,
      serie: n.serie,
      chave: n.chaveAcesso,
      destinatario: n.destinatario.nomeRazaoSocial,
      documento: n.destinatario.documento,
      valor: n.valorTotalNota,
      data: n.dataHoraEmissao,
      status: n.status,
      xml: n.xmlAssinado,
      detalhes: `${n.requerente.nomeRazaoSocial} • ${n.motivoEmissao}`,
      onView: () => onViewDanfae && onViewDanfae(n),
    })),
  ].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  // Métricas Consolidadas
  const totalFaturado = todosDocs.reduce((acc, d) => acc + d.valor, 0);
  const totalNfe = nfes.reduce((acc, d) => acc + d.valorTotalNota, 0);
  const totalNfse = nfses.reduce((acc, d) => acc + d.valorTotalServicos, 0);
  const totalNfce = nfces.reduce((acc, d) => acc + d.valorTotalNota, 0);
  const totalCte = ctes.reduce((acc, d) => acc + d.valorTotalFrete, 0);
  const totalNfae = nfaes.reduce((acc, d) => acc + d.valorTotalNota, 0);

  // Filtros aplicados
  const docsFiltrados = todosDocs.filter(d => {
    if (tipoFiltro !== 'TODOS' && d.tipo !== tipoFiltro) return false;
    if (statusFiltro !== 'TODOS' && d.status !== statusFiltro) return false;
    if (busca.trim()) {
      const q = busca.toLowerCase();
      return (
        d.numero.toString().includes(q) ||
        d.destinatario.toLowerCase().includes(q) ||
        d.documento.includes(q) ||
        d.chave.toLowerCase().includes(q) ||
        d.detalhes.toLowerCase().includes(q) ||
        d.tipoLabel.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopiarChave = (chave: string) => {
    navigator.clipboard.writeText(chave);
    setChaveCopiada(chave);
    setTimeout(() => setChaveCopiada(null), 2000);
  };

  const handleExportarCsv = () => {
    const headers = ['Tipo', 'Modelo', 'Numero', 'Serie', 'Destinatario_Tomador', 'CPF_CNPJ', 'Data_Emissao', 'Valor_Total', 'Status', 'Chave_Acesso'];
    const rows = docsFiltrados.map(d => [
      d.tipoLabel,
      d.modelo,
      d.numero,
      d.serie,
      `"${d.destinatario.replace(/"/g, '""')}"`,
      d.documento,
      new Date(d.data).toLocaleString('pt-BR'),
      d.valor.toFixed(2),
      d.status,
      d.chave
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `notas_fiscais_todas_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 🔥 Função para renderizar botão de filtro com cor
  const renderFiltroBotao = (tipo: 'TODOS' | 'NFE' | 'NFSE' | 'NFCE' | 'CTE' | 'NFAE', label: string, count: number) => {
    const isActive = tipoFiltro === tipo;
    const cores = coresPorTipo[tipo];
    
    return (
      <button
        type="button"
        onClick={() => setTipoFiltro(tipo)}
        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer text-xs font-medium ${
          isActive 
            ? `${cores.bg} ${cores.text} border ${cores.border} shadow-sm font-semibold` 
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        {label} ({count})
      </button>
    );
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      
      {/* 🔥 HEADER - COR ÍNDIGO (SEM BADGE NO ÍCONE) */}
      <div className={`${corBg} rounded-xl border ${corBorder} p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}>
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-8 h-8 ${corIconBg} rounded-lg flex items-center justify-center text-white shadow-sm`}>
              <FolderOpen className="w-4 h-4" />
            </span>
            <h1 className="text-base font-bold text-slate-900">
              Central de Documentos Fiscais
            </h1>
            <span className={`${corBgBadge} ${corTextDark} text-[10px] font-bold px-2 py-0.5 rounded-full border ${corBorder}`}>
              {todosDocs.length} Documentos
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestão e emissão completa de todos os modelos fiscais: NF-e, NFS-e, NFC-e, CT-e e NFA-e.
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs font-semibold text-slate-700">Emissor Fiscal</div>
          <div className={`text-[10px] font-medium ${corText}`}>{todosDocs.length} documentos emitidos</div>
        </div>
      </div>

      {/* 2. Cards de Resumo & Métricas do Grid - 6 CARDS (incluindo NFA-e) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Faturamento Total</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg font-bold text-slate-900 mt-1">
            {formatarMoeda(totalFaturado)}
          </div>
          <div className="text-[10px] text-slate-400">
            {todosDocs.length} documentos emitidos
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">NF-e (Produtos)</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Receipt className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg font-bold text-slate-900 mt-1">
            {formatarMoeda(totalNfe)}
          </div>
          <div className="text-[10px] text-slate-400">
            {nfes.length} notas modelo 55
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">NFS-e (Serviços)</span>
            <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg font-bold text-slate-900 mt-1">
            {formatarMoeda(totalNfse)}
          </div>
          <div className="text-[10px] text-slate-400">
            {nfses.length} notas padrão DPS
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">NFC-e (Consumidor)</span>
            <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg font-bold text-slate-900 mt-1">
            {formatarMoeda(totalNfce)}
          </div>
          <div className="text-[10px] text-slate-400">
            {nfces.length} cupons PDV
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">CT-e (Transporte)</span>
            <div className="w-6 h-6 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center">
              <Truck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg font-bold text-slate-900 mt-1">
            {formatarMoeda(totalCte)}
          </div>
          <div className="text-[10px] text-slate-400">
            {ctes.length} conhecimentos
          </div>
        </div>

        {/* 🔥 CARD NFA-e */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">NFA-e (Avulsa)</span>
            <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <FileBadge2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg font-bold text-slate-900 mt-1">
            {formatarMoeda(totalNfae)}
          </div>
          <div className="text-[10px] text-slate-400">
            {nfaes.length} notas série 900
          </div>
        </div>

      </div>

      {/* 3. Barra de Controles, Busca e Filtros */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Campo de Busca */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por número, destinatário, CNPJ/CPF, chave de acesso ou tipo..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 ${corFocus}`}
            />
          </div>

          {/* Filtros em Abas de Tipos Fiscais com Cores do Header/Sidebar */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200 text-xs">
            {renderFiltroBotao('TODOS', 'Todos', todosDocs.length)}
            {renderFiltroBotao('NFE', 'NF-e', nfes.length)}
            {renderFiltroBotao('NFSE', 'NFS-e', nfses.length)}
            {renderFiltroBotao('NFCE', 'NFC-e', nfces.length)}
            {renderFiltroBotao('CTE', 'CT-e', ctes.length)}
            {renderFiltroBotao('NFAE', 'NFA-e', nfaes.length)}
          </div>

          {/* Botão Emitir Nova Nota */}
          <div className="relative flex items-center gap-2">
            <div className="relative inline-block text-left">
              <div className="flex rounded-lg shadow-sm">
                <button
                  type="button"
                  onClick={() => setMenuNovaNotaAberto(!menuNovaNotaAberto)}
                  id="btn-emitir-nova-nota"
                  className={`${corBgButton} text-white text-xs font-bold px-4 py-2 rounded-l-lg transition-colors flex items-center gap-2 cursor-pointer`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Emitir Nova Nota</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMenuNovaNotaAberto(!menuNovaNotaAberto)}
                  className="bg-indigo-700 hover:bg-indigo-800 text-white px-2.5 py-2 rounded-r-lg border-l border-indigo-500 transition-colors cursor-pointer flex items-center justify-center"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {menuNovaNotaAberto && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setMenuNovaNotaAberto(false)} />
                  <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-xl shadow-xl bg-white ring-1 ring-black ring-opacity-5 z-30 border border-slate-200 p-2 space-y-1">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Selecione o Tipo de Documento Fiscal
                      </span>
                    </div>

                    {/* 1. NF-e */}
                    <button
                      type="button"
                      onClick={() => {
                        setMenuNovaNotaAberto(false);
                        if (onEmitirNovaNfe) onEmitirNovaNfe();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors flex items-start gap-2.5 cursor-pointer group"
                    >
                      <div className="w-7 h-7 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors mt-0.5">
                        <Receipt className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                          NF-e (Produto Eletrônica)
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Modelo 55 • Venda de Produtos e Mercadorias
                        </div>
                      </div>
                    </button>

                    {/* 2. NFS-e */}
                    <button
                      type="button"
                      onClick={() => {
                        setMenuNovaNotaAberto(false);
                        if (onEmitirNovaNfse) onEmitirNovaNfse();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors flex items-start gap-2.5 cursor-pointer group"
                    >
                      <div className="w-7 h-7 rounded bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors mt-0.5">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                          NFS-e (Serviço Eletrônica)
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Padrão Nacional • Prestação de Serviços DPS
                        </div>
                      </div>
                    </button>

                    {/* 3. NFC-e */}
                    <button
                      type="button"
                      onClick={() => {
                        setMenuNovaNotaAberto(false);
                        if (onEmitirNovaNfce) onEmitirNovaNfce();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors flex items-start gap-2.5 cursor-pointer group"
                    >
                      <div className="w-7 h-7 rounded bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors mt-0.5">
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-purple-700">
                          NFC-e (Consumidor Eletrônica)
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Modelo 65 • Cupom Fiscal Varejo / PDV
                        </div>
                      </div>
                    </button>

                    {/* 4. CT-e */}
                    <button
                      type="button"
                      onClick={() => {
                        setMenuNovaNotaAberto(false);
                        if (onEmitirNovoCte) onEmitirNovoCte();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors flex items-start gap-2.5 cursor-pointer group"
                    >
                      <div className="w-7 h-7 rounded bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0 group-hover:bg-cyan-600 group-hover:text-white transition-colors mt-0.5">
                        <Truck className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-cyan-700">
                          CT-e (Conhecimento de Transporte)
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Modelo 57 • Prestação de Frete Rodoviário
                        </div>
                      </div>
                    </button>

                    {/* 5. NFA-e */}
                    <button
                      type="button"
                      onClick={() => {
                        setMenuNovaNotaAberto(false);
                        if (onEmitirNovaNfae) onEmitirNovaNfae();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors flex items-start gap-2.5 cursor-pointer group"
                    >
                      <div className="w-7 h-7 rounded bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors mt-0.5">
                        <FileBadge2 className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-amber-700">
                          NFA-e (Nota Avulsa Eletrônica)
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Série 900 • Produtor Rural / MEI / Avulsa SEFAZ
                        </div>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Exportar CSV */}
            <button
              type="button"
              onClick={handleExportarCsv}
              className="p-2 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              title="Exportar dados da grid para CSV"
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* 4. Tabela Grid de Documentos Fiscais */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Tipo / Mod</th>
                <th className="py-3 px-4">Número / Série</th>
                <th className="py-3 px-4">Destinatário / Tomador</th>
                <th className="py-3 px-4">Data Emissão</th>
                <th className="py-3 px-4 text-right">Valor Total</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {docsFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">Nenhum documento fiscal encontrado</p>
                    <p className="text-slate-400 text-xs mt-0.5">Tente ajustar os termos da busca ou filtros acima.</p>
                  </td>
                </tr>
              ) : (
                docsFiltrados.map((doc) => (
                  <tr key={`${doc.tipo}-${doc.id}`} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Tipo / Badge */}
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded border ${doc.corBadge}`}>
                        {doc.tipoLabel}
                      </span>
                    </td>

                    {/* Número / Série / Chave */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">
                        Nº {doc.numero} <span className="text-slate-400 font-normal">Série {doc.serie}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono mt-0.5">
                        <span>Chave: {doc.chave.slice(0, 8)}...{doc.chave.slice(-6)}</span>
                        <button
                          type="button"
                          onClick={() => handleCopiarChave(doc.chave)}
                          className="hover:text-indigo-600 p-0.5 cursor-pointer"
                          title="Copiar chave de acesso completa"
                        >
                          {chaveCopiada === doc.chave ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Destinatário */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 truncate max-w-xs">{doc.destinatario}</div>
                      <div className="text-[11px] text-slate-500">{doc.documento}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-xs">{doc.detalhes}</div>
                    </td>

                    {/* Data */}
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      <div>{new Date(doc.data).toLocaleDateString('pt-BR')}</div>
                      <div className="text-[10px] text-slate-400">{new Date(doc.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>

                    {/* Valor */}
                    <td className="py-3 px-4 text-right whitespace-nowrap font-bold text-slate-900">
                      {formatarMoeda(doc.valor)}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{doc.status}</span>
                      </span>
                    </td>

                    {/* Ações */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={doc.onView}
                          className="bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-medium text-xs px-2.5 py-1.5 rounded transition-colors flex items-center gap-1 cursor-pointer"
                          title="Visualizar documento auxiliar impresso"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Visualizar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const blob = new Blob([doc.xml], { type: 'application/xml' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${doc.tipo}_${doc.numero}_SUP.xml`;
                            a.click();
                          }}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                          title="Baixar XML assinado pela SEFAZ"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};