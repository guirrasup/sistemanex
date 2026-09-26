// src/components/fiscal/DocumentosFiscaisList.tsx
import React, { useState, useMemo } from 'react';
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
  FileArchive,
  FolderOpen,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Calendar,
  X
} from 'lucide-react';
import { NFSeDocumento, NFeDocumento, NFCeDocumento, CTeDocumento, NFAeDocumento } from '../../types/fiscal';
import { MDFeDocumento } from '../../types/mdfe';
import { formatarMoeda, formatarCpfCnpj } from '../../utils/cpfCnpjValidator';
import { formatarChaveAcesso44 } from '../../utils/chaveAcesso';

// 🔥 Tipo de filtro exportado para o App.tsx conseguir tipar o estado de
// "com qual tipo o usuário entrou nesta tela" sem duplicar a união em dois lugares.
export type TipoDocumentoFiltro = 'TODOS' | 'NFE' | 'NFSE' | 'NFCE' | 'CTE' | 'NFAE' | 'MDFE';

interface DocumentosFiscaisListProps {
  nfses: NFSeDocumento[];
  nfes: NFeDocumento[];
  nfces?: NFCeDocumento[];
  ctes?: CTeDocumento[];
  nfaes?: NFAeDocumento[];
  mdfes?: MDFeDocumento[];
  // 🔥 Com qual tipo a tela deve abrir já filtrada — quando a navegação vem de
  // uma ação específica de tipo (ex.: atalho do Dashboard), não de um acesso
  // genérico pelo menu "Documentos Emitidos" (que mostra todos os tipos).
  initialTipo?: TipoDocumentoFiltro;
  onViewDanfse: (nfseId: string) => void;
  onViewDanfe: (nfeId: string) => void;
  onViewDanfce?: (nfceId: string) => void;
  onViewDacte?: (cteId: string) => void;
  onViewDanfae?: (nfae: NFAeDocumento) => void;
  onViewMdfe?: (mdfe: MDFeDocumento) => void;
  onEmitirNovaNfse?: () => void;
  onEmitirNovaNfe?: () => void;
  onEmitirNovaNfce?: () => void;
  onEmitirNovoCte?: () => void;
  onEmitirNovaNfae?: () => void;
  onEmitirNovoMdfe?: () => void;
  onCancelarNfse?: (id: string) => void;
  onCancelarNfe?: (id: string) => void;
}

// 🔥 TIPO PARA ORDENAÇÃO
type OrdenacaoCampo = 'tipo' | 'numero' | 'serie' | 'destinatario' | 'data' | 'valor' | 'status';
type OrdenacaoDirecao = 'asc' | 'desc';

// Decimal do Prisma chega como string no JSON (ex.: "1450.00") — somar direto
// com `+` sem converter faz concatenação de string em vez de soma.
function paraNumero(v: unknown): number {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return typeof n === 'number' && !isNaN(n) ? n : 0;
}

// 🔥 TIPO PARA PERÍODO
type PeriodoFiltro = 'TODOS' | 'HOJE' | 'SEMANA' | 'MES' | 'TRIMESTRE' | 'SEMESTRE' | 'ANO' | 'PERSONALIZADO';

// 🔥 CAMPOS BRUTOS LIDOS DE QUALQUER TIPO DE DOCUMENTO FISCAL (todos opcionais: cada
// tipo concreto só preenche o subconjunto de campos que lhe é próprio)
interface DocumentoFiscalBruto {
  id?: string;
  numero?: number;
  numeroNfse?: number;
  serie?: number;
  serieDPS?: number;
  chaveAcesso?: string;
  // 🔥 NFe/CTe: relação real com Cliente (schema.prisma) — campo é `razaoSocial`,
  // não `nomeRazaoSocial` (nome do protótipo antigo, nunca existiu no backend real).
  destinatario?: { razaoSocial?: string; documento?: string };
  tomador?: { razaoSocial?: string; documento?: string };
  remetente?: { razaoSocial?: string; documento?: string };
  // 🔥 NFCe/NFAe não têm relação com Cliente — gravam os dados crus direto na
  // linha do documento.
  consumidorNome?: string;
  consumidorCpfCnpj?: string;
  destinatarioNome?: string;
  destinatarioDocumento?: string;
  requerenteNome?: string;
  valorTotalNota?: number;
  valorTotalServicos?: number;
  valorTotalFrete?: number;
  dataHoraEmissao?: string;
  status?: string;
  xmlAssinado?: string;
  itens?: unknown[];
  servico?: { descricao?: string };
  municipioInicio?: { nome?: string; uf?: string };
  municipioFim?: { nome?: string; uf?: string };
  motivoEmissao?: string;
  // 🔥 CT-e: schema.prisma segue o leiaute SEFAZ ao pé da letra — número é
  // `nCT`, municípios/valor de frete são campos escalares, não objetos aninhados.
  nCT?: number;
  xMunIni?: string;
  UFIni?: string;
  xMunFim?: string;
  UFFim?: string;
  vTPrest?: number | string;
  dhEmi?: string;
  // 🔥 NF-e/NFS-e: schema.prisma grava os totais no leiaute SEFAZ/nacional —
  // `vNF`/`valorServico`, não `valorTotalNota`/`valorTotalServicos` (esses dois
  // nunca existiram no backend real, por isso os cards vinham sempre zerados).
  vNF?: number | string;
  valorServico?: number | string;
  // 🔥 MDF-e: schema.prisma segue o leiaute SEFAZ — `vCarga`/`xProd`, não um
  // objeto "produtoPredominante" aninhado.
  vCarga?: number | string;
  xProd?: string;
  qCTe?: number;
  qNFe?: number;
}

// 🔥 TIPO PARA DOCUMENTO UNIFICADO
interface DocumentoUnificado {
  tipo: 'NFE' | 'NFSE' | 'NFCE' | 'CTE' | 'NFAE' | 'MDFE';
  tipoLabel: string;
  modelo: string;
  corBadge: string;
  id: string;
  numero: number;
  serie: number;
  chave: string;
  destinatario: string;
  documento: string;
  valor: number;
  data: string;
  status: string;
  xml: string;
  detalhes: string;
  onView: () => void;
}

export const DocumentosFiscaisList: React.FC<DocumentosFiscaisListProps> = ({
  nfses = [],
  nfes = [],
  nfces = [],
  ctes = [],
  nfaes = [],
  mdfes = [],
  initialTipo = 'TODOS',
  onViewDanfse,
  onViewDanfe,
  onViewDanfce,
  onViewDacte,
  onViewDanfae,
  onViewMdfe,
  onEmitirNovaNfse,
  onEmitirNovaNfe,
  onEmitirNovaNfce,
  onEmitirNovoCte,
  onEmitirNovaNfae,
  onEmitirNovoMdfe,
}) => {
  const [tipoFiltro, setTipoFiltro] = useState<TipoDocumentoFiltro>(initialTipo);
  const [statusFiltro, setStatusFiltro] = useState<'TODOS' | 'AUTORIZADA' | 'CANCELADA'>('TODOS');
  const [periodoFiltro, setPeriodoFiltro] = useState<PeriodoFiltro>('TODOS');
  const [dataInicio, setDataInicio] = useState<string>('');
  const [dataFim, setDataFim] = useState<string>('');
  const [busca, setBusca] = useState('');
  const [chaveCopiada, setChaveCopiada] = useState<string | null>(null);
  const [menuNovaNotaAberto, setMenuNovaNotaAberto] = useState(false);
  const [menuPeriodoAberto, setMenuPeriodoAberto] = useState(false);

  // 🔥 ESTADO DE ORDENAÇÃO
  const [ordenacaoCampo, setOrdenacaoCampo] = useState<OrdenacaoCampo>('data');
  const [ordenacaoDirecao, setOrdenacaoDirecao] = useState<OrdenacaoDirecao>('desc');

  // 🔥 COR DO MÓDULO (ÍNDIGO)
  const cor = 'indigo';
  const corBg = 'bg-indigo-50';
  const corBorder = 'border-indigo-200';
  const corText = 'text-indigo-700';
  const corTextDark = 'text-indigo-800';
  const corBgButton = 'bg-indigo-600 hover:bg-indigo-700';
  const corBgBadge = 'bg-indigo-100';
  const corFocus = 'focus:ring-indigo-500';
  const corIconBg = 'bg-indigo-600';

  // 🔥 CORES POR TIPO
  const coresPorTipo = {
    TODOS: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-300', hover: 'hover:bg-indigo-100' },
    NFE: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300', hover: 'hover:bg-emerald-100' },
    NFSE: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300', hover: 'hover:bg-blue-100' },
    NFCE: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-300', hover: 'hover:bg-purple-100' },
    CTE: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-300', hover: 'hover:bg-cyan-100' },
    NFAE: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300', hover: 'hover:bg-amber-100' },
    MDFE: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300', hover: 'hover:bg-orange-100' },
  };

  // 🔥 LABELS DOS PERÍODOS
  const periodosLabels: Record<PeriodoFiltro, string> = {
    TODOS: 'Todos os períodos',
    HOJE: 'Hoje',
    SEMANA: 'Última semana',
    MES: 'Último mês',
    TRIMESTRE: 'Último trimestre',
    SEMESTRE: 'Último semestre',
    ANO: 'Último ano',
    PERSONALIZADO: 'Personalizado'
  };

  // 🔥 FUNÇÃO PARA CALCULAR DATAS POR PERÍODO
  const getDatasPorPeriodo = (periodo: PeriodoFiltro): { inicio: Date | null; fim: Date | null } => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const fim = new Date(hoje);
    fim.setHours(23, 59, 59, 999);
    let inicio: Date | null = null;

    switch (periodo) {
      case 'HOJE':
        inicio = new Date(hoje);
        break;
      case 'SEMANA':
        inicio = new Date(hoje);
        inicio.setDate(hoje.getDate() - 7);
        break;
      case 'MES':
        inicio = new Date(hoje);
        inicio.setMonth(hoje.getMonth() - 1);
        break;
      case 'TRIMESTRE':
        inicio = new Date(hoje);
        inicio.setMonth(hoje.getMonth() - 3);
        break;
      case 'SEMESTRE':
        inicio = new Date(hoje);
        inicio.setMonth(hoje.getMonth() - 6);
        break;
      case 'ANO':
        inicio = new Date(hoje);
        inicio.setFullYear(hoje.getFullYear() - 1);
        break;
      case 'PERSONALIZADO':
        if (dataInicio && dataFim) {
          inicio = new Date(dataInicio + 'T00:00:00');
          const fimPersonalizado = new Date(dataFim + 'T23:59:59');
          return { inicio, fim: fimPersonalizado };
        }
        return { inicio: null, fim: null };
      case 'TODOS':
      default:
        return { inicio: null, fim: null };
    }

    if (inicio) {
      inicio.setHours(0, 0, 0, 0);
    }
    return { inicio, fim };
  };

  // 🔥 FUNÇÃO PARA CRIAR DOCUMENTO UNIFICADO COM FALLBACKS
  const criarDocumento = (doc: DocumentoFiscalBruto, tipo: string): DocumentoUnificado | null => {
    if (!doc) return null;

    switch (tipo) {
      case 'NFE':
        return {
          tipo: 'NFE',
          tipoLabel: 'NF-e (Produto)',
          modelo: '55',
          corBadge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          id: doc.id || '',
          numero: doc.numero || 0,
          serie: doc.serie || 0,
          chave: doc.chaveAcesso || '',
          // 🔥 destinatario vem da relação real com Cliente (schema.prisma), cujo
          // campo é `razaoSocial` — não `nomeRazaoSocial` (nome do protótipo antigo).
          destinatario: doc.destinatario?.razaoSocial || 'Destinatário não informado',
          documento: doc.destinatario?.documento || 'Não informado',
          valor: paraNumero(doc.vNF),
          data: doc.dataHoraEmissao || new Date().toISOString(),
          status: doc.status || 'PROCESSANDO',
          xml: doc.xmlAssinado || '',
          detalhes: `${doc.itens?.length || 0} item(ns) faturado(s)`,
          onView: () => onViewDanfe(doc.id || ''),
        };
      case 'NFSE':
        return {
          tipo: 'NFSE',
          tipoLabel: 'NFS-e (Serviço)',
          modelo: 'DPS/Nac',
          corBadge: 'bg-blue-50 text-blue-800 border-blue-200',
          id: doc.id || '',
          numero: doc.numeroNfse || 0,
          serie: doc.serieDPS || 0,
          chave: doc.chaveAcesso || '',
          destinatario: doc.tomador?.razaoSocial || 'Tomador não informado',
          documento: doc.tomador?.documento || 'Não informado',
          valor: paraNumero(doc.valorServico),
          data: doc.dataHoraEmissao || new Date().toISOString(),
          status: doc.status || 'PROCESSANDO',
          xml: doc.xmlAssinado || '',
          detalhes: doc.servico?.descricao || 'Serviço sem descrição',
          onView: () => onViewDanfse(doc.id || ''),
        };
      case 'NFCE':
        return {
          tipo: 'NFCE',
          tipoLabel: 'NFC-e (Consumidor)',
          modelo: '65',
          corBadge: 'bg-purple-50 text-purple-800 border-purple-200',
          id: doc.id || '',
          numero: doc.numero || 0,
          serie: doc.serie || 0,
          chave: doc.chaveAcesso || '',
          // 🔥 NFCe não tem relação `destinatario` — o schema grava o consumidor em
          // campos crus direto na linha (consumidorNome/consumidorCpfCnpj).
          destinatario: doc.consumidorNome || 'Consumidor Final (PDV)',
          documento: doc.consumidorCpfCnpj || 'Não Informado',
          valor: paraNumero(doc.valorTotalNota),
          data: doc.dataHoraEmissao || new Date().toISOString(),
          status: doc.status || 'PROCESSANDO',
          xml: doc.xmlAssinado || '',
          detalhes: `${doc.itens?.length || 0} item(ns) • Cupom Fiscal PDV`,
          onView: () => onViewDanfce && onViewDanfce(doc.id || ''),
        };
      case 'CTE':
        return {
          tipo: 'CTE',
          tipoLabel: 'CT-e (Transporte)',
          modelo: '57',
          corBadge: 'bg-cyan-50 text-cyan-800 border-cyan-200',
          id: doc.id || '',
          numero: doc.nCT || 0,
          serie: doc.serie || 0,
          chave: doc.chaveAcesso || '',
          destinatario: `${doc.remetente?.razaoSocial?.slice(0, 18) || 'Remetente'} ➔ ${doc.destinatario?.razaoSocial?.slice(0, 18) || 'Destinatário'}`,
          documento: doc.remetente?.documento || 'Não informado',
          valor: paraNumero(doc.vTPrest),
          data: doc.dhEmi || new Date().toISOString(),
          status: doc.status || 'PROCESSANDO',
          xml: doc.xmlAssinado || '',
          detalhes: `Frete ${doc.xMunIni || '?'}/${doc.UFIni || '?'} ➔ ${doc.xMunFim || '?'}/${doc.UFFim || '?'}`,
          onView: () => onViewDacte && doc.id && onViewDacte(doc.id),
        };
      case 'NFAE':
        return {
          tipo: 'NFAE',
          tipoLabel: 'NFA-e (Avulsa)',
          modelo: 'Série 900',
          corBadge: 'bg-amber-50 text-amber-800 border-amber-200',
          id: doc.id || '',
          numero: doc.numero || 0,
          serie: doc.serie || 0,
          chave: doc.chaveAcesso || '',
          // 🔥 NFAe não tem relação destinatario/requerente — schema grava tudo em
          // campos crus direto na linha (destinatarioNome/requerenteNome etc.).
          destinatario: doc.destinatarioNome || 'Destinatário não informado',
          documento: doc.destinatarioDocumento || 'Não informado',
          valor: paraNumero(doc.valorTotalNota),
          data: doc.dataHoraEmissao || new Date().toISOString(),
          status: doc.status || 'PROCESSANDO',
          xml: doc.xmlAssinado || '',
          detalhes: `${doc.requerenteNome || 'Requerente'} • ${doc.motivoEmissao || 'Sem motivo'}`,
          onView: () => onViewDanfae && onViewDanfae(doc as unknown as NFAeDocumento),
        };
      case 'MDFE':
        return {
          tipo: 'MDFE',
          tipoLabel: 'MDF-e (Manifesto)',
          modelo: '58',
          corBadge: 'bg-orange-50 text-orange-800 border-orange-200',
          id: doc.id || '',
          numero: doc.numero || 0,
          serie: doc.serie || 0,
          chave: doc.chaveAcesso || '',
          // 🔥 MDF-e não tem destinatário — é um manifesto de viagem, não uma
          // venda/serviço; mostramos o trajeto no lugar.
          destinatario: `${doc.UFIni || '?'} ➔ ${doc.UFFim || '?'}`,
          documento: doc.xProd || 'Carga não descrita',
          valor: paraNumero(doc.vCarga),
          data: doc.dhEmi || new Date().toISOString(),
          status: doc.status || 'PROCESSANDO',
          xml: doc.xmlAssinado || '',
          detalhes: `${doc.qCTe || 0} CT-e(s) e ${doc.qNFe || 0} NF-e(s) vinculados`,
          onView: () => onViewMdfe && onViewMdfe(doc as unknown as MDFeDocumento),
        };
      default:
        return null;
    }
  };

  // 🔥 UNIFICA TODOS OS DOCUMENTOS (com fallbacks)
  const todosDocsRaw = [
    ...nfes.map(d => criarDocumento(d as unknown as DocumentoFiscalBruto, 'NFE')).filter(Boolean),
    ...nfses.map(d => criarDocumento(d as unknown as DocumentoFiscalBruto, 'NFSE')).filter(Boolean),
    ...nfces.map(d => criarDocumento(d as unknown as DocumentoFiscalBruto, 'NFCE')).filter(Boolean),
    ...ctes.map(d => criarDocumento(d as unknown as DocumentoFiscalBruto, 'CTE')).filter(Boolean),
    ...nfaes.map(d => criarDocumento(d as unknown as DocumentoFiscalBruto, 'NFAE')).filter(Boolean),
    ...mdfes.map(d => criarDocumento(d as unknown as DocumentoFiscalBruto, 'MDFE')).filter(Boolean),
  ] as DocumentoUnificado[];

  // 🔥 ORDENAÇÃO E FILTRO COM useMemo
  const todosDocs = useMemo(() => {
    // 🔥 FILTRO POR PERÍODO
    const { inicio, fim } = getDatasPorPeriodo(periodoFiltro);
    
    const filtrados = todosDocsRaw.filter(d => {
      // Filtro por tipo
      if (tipoFiltro !== 'TODOS' && d.tipo !== tipoFiltro) return false;
      
      // Filtro por status
      if (statusFiltro !== 'TODOS' && d.status !== statusFiltro) return false;
      
      // Filtro por período
      if (inicio && fim) {
        const dataDoc = new Date(d.data);
        if (dataDoc < inicio || dataDoc > fim) return false;
      }
      
      // Filtro por busca
      if (busca.trim()) {
        const q = busca.toLowerCase();
        return (
          String(d.numero).includes(q) ||
          d.destinatario.toLowerCase().includes(q) ||
          d.documento.includes(q) ||
          d.chave.toLowerCase().includes(q) ||
          d.detalhes.toLowerCase().includes(q) ||
          d.tipoLabel.toLowerCase().includes(q)
        );
      }
      return true;
    });

    // 🔥 ORDENAÇÃO
    return [...filtrados].sort((a, b) => {
      let valorA: unknown;
      let valorB: unknown;

      switch (ordenacaoCampo) {
        case 'tipo':
          valorA = a.tipoLabel;
          valorB = b.tipoLabel;
          break;
        case 'numero':
          valorA = a.numero;
          valorB = b.numero;
          break;
        case 'serie':
          valorA = a.serie;
          valorB = b.serie;
          break;
        case 'destinatario':
          valorA = a.destinatario;
          valorB = b.destinatario;
          break;
        case 'data':
          valorA = new Date(a.data).getTime();
          valorB = new Date(b.data).getTime();
          break;
        case 'valor':
          valorA = a.valor;
          valorB = b.valor;
          break;
        case 'status':
          valorA = a.status;
          valorB = b.status;
          break;
        default:
          valorA = a.data;
          valorB = b.data;
      }

      if (typeof valorA === 'number' && typeof valorB === 'number') {
        return ordenacaoDirecao === 'asc' ? valorA - valorB : valorB - valorA;
      }

      if (typeof valorA === 'string' && typeof valorB === 'string') {
        return ordenacaoDirecao === 'asc'
          ? valorA.localeCompare(valorB)
          : valorB.localeCompare(valorA);
      }

      return 0;
    });
  }, [todosDocsRaw, busca, tipoFiltro, statusFiltro, periodoFiltro, dataInicio, dataFim, ordenacaoCampo, ordenacaoDirecao]);

  // 🔥 FUNÇÃO PARA ORDENAR
  const handleOrdenar = (campo: OrdenacaoCampo) => {
    if (ordenacaoCampo === campo) {
      setOrdenacaoDirecao(ordenacaoDirecao === 'asc' ? 'desc' : 'asc');
    } else {
      setOrdenacaoCampo(campo);
      setOrdenacaoDirecao('asc');
    }
  };

  // 🔥 COMPONENTE ÍCONE DE ORDENAÇÃO
  const IconeOrdenacao = ({ campo }: { campo: OrdenacaoCampo }) => {
    if (ordenacaoCampo !== campo) {
      return <ArrowUpDown className="w-3 h-3 text-slate-400 ml-1" />;
    }
    return ordenacaoDirecao === 'asc'
      ? <ArrowUp className="w-3 h-3 text-indigo-600 ml-1" />
      : <ArrowDown className="w-3 h-3 text-indigo-600 ml-1" />;
  };

  // 🔥 CLASSE DO CABEÇALHO
  const thClass = "py-3 px-4 text-left text-xs font-bold text-slate-700 cursor-pointer hover:text-indigo-600 transition-colors select-none";

  // Métricas Consolidadas
  const totalFaturado = todosDocs.reduce((acc, d) => acc + (d.valor || 0), 0);
  const totalNfe = todosDocs.filter(d => d.tipo === 'NFE').reduce((acc, d) => acc + d.valor, 0);
  const totalNfse = todosDocs.filter(d => d.tipo === 'NFSE').reduce((acc, d) => acc + d.valor, 0);
  const totalNfce = todosDocs.filter(d => d.tipo === 'NFCE').reduce((acc, d) => acc + d.valor, 0);
  const totalCte = todosDocs.filter(d => d.tipo === 'CTE').reduce((acc, d) => acc + d.valor, 0);
  const totalNfae = todosDocs.filter(d => d.tipo === 'NFAE').reduce((acc, d) => acc + d.valor, 0);
  const totalMdfe = todosDocs.filter(d => d.tipo === 'MDFE').reduce((acc, d) => acc + d.valor, 0);

  const handleCopiarChave = (chave: string) => {
    navigator.clipboard.writeText(chave);
    setChaveCopiada(chave);
    setTimeout(() => setChaveCopiada(null), 2000);
  };

  const handleExportarCsv = () => {
    const headers = ['Tipo', 'Modelo', 'Numero', 'Serie', 'Destinatario_Tomador', 'CPF_CNPJ', 'Data_Emissao', 'Valor_Total', 'Status', 'Chave_Acesso'];
    const rows = todosDocs.map(d => [
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
    link.setAttribute('download', `notas_fiscais_${periodoFiltro}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 🔥 Função para renderizar botão de filtro
  const renderFiltroBotao = (tipo: TipoDocumentoFiltro, label: string, count: number) => {
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

  // 🔥 Quando um tipo específico já está selecionado (veio de um atalho por
  // tipo, ou o usuário clicou num filtro), "Emitir Nova Nota" vai direto pro
  // emissor daquele tipo — só mostra o dropdown de seleção quando o filtro é
  // "TODOS" (ou o tipo ativo não tiver uma ação de emissão configurada).
  const emitirPorTipo: Partial<Record<TipoDocumentoFiltro, { label: string; onEmitir?: () => void }>> = {
    NFE: { label: 'Nova NF-e', onEmitir: onEmitirNovaNfe },
    NFSE: { label: 'Nova NFS-e', onEmitir: onEmitirNovaNfse },
    NFCE: { label: 'Nova NFC-e', onEmitir: onEmitirNovaNfce },
    CTE: { label: 'Novo CT-e', onEmitir: onEmitirNovoCte },
    NFAE: { label: 'Nova NFA-e', onEmitir: onEmitirNovaNfae },
    MDFE: { label: 'Novo MDF-e', onEmitir: onEmitirNovoMdfe },
  };
  const emitirAtivo = tipoFiltro !== 'TODOS' ? emitirPorTipo[tipoFiltro] : undefined;

  const handleClickEmitirPrincipal = () => {
    if (emitirAtivo?.onEmitir) {
      emitirAtivo.onEmitir();
      return;
    }
    setMenuNovaNotaAberto(!menuNovaNotaAberto);
  };

  // 🔥 Renderizar o seletor de período - CORRIGIDO
  const renderPeriodoSelector = () => {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuPeriodoAberto(!menuPeriodoAberto)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
            periodoFiltro !== 'TODOS' 
              ? 'bg-indigo-50 border-indigo-300 text-indigo-700' 
              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>{periodosLabels[periodoFiltro]}</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${menuPeriodoAberto ? 'rotate-180' : ''}`} />
        </button>

        {menuPeriodoAberto && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setMenuPeriodoAberto(false)} />
            <div className="absolute right-0 mt-1 w-64 rounded-xl shadow-xl bg-white ring-1 ring-black ring-opacity-5 z-30 border border-slate-200 p-1.5 max-h-96 overflow-y-auto">
              {(['TODOS', 'HOJE', 'SEMANA', 'MES', 'TRIMESTRE', 'SEMESTRE', 'ANO'] as PeriodoFiltro[]).map((periodo) => (
                <button
                  key={periodo}
                  onClick={() => {
                    setPeriodoFiltro(periodo);
                    setDataInicio('');
                    setDataFim('');
                    setMenuPeriodoAberto(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    periodoFiltro === periodo
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {periodosLabels[periodo]}
                </button>
              ))}

              <button
                onClick={() => {
                  setPeriodoFiltro('PERSONALIZADO');
                  // 🔥 NÃO FECHA O MENU - mantém aberto para mostrar os inputs
                }}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  periodoFiltro === 'PERSONALIZADO'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {periodosLabels.PERSONALIZADO}
              </button>

              {periodoFiltro === 'PERSONALIZADO' && (
                <div className="mt-2 pt-2 border-t border-slate-200 space-y-2 px-1">
                  <div>
                    <label className="text-[10px] font-medium text-slate-500">Data Início</label>
                    <input
                      type="date"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-slate-500">Data Fim</label>
                    <input
                      type="date"
                      value={dataFim}
                      onChange={(e) => setDataFim(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setMenuPeriodoAberto(false);
                      }}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium py-1.5 rounded-lg transition-colors"
                    >
                      Aplicar
                    </button>
                    <button
                      onClick={() => {
                        setPeriodoFiltro('TODOS');
                        setDataInicio('');
                        setDataFim('');
                        setMenuPeriodoAberto(false);
                      }}
                      className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium py-1.5 rounded-lg transition-colors"
                    >
                      Limpar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      
      <div className={`${corBg} rounded-xl border ${corBorder} p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}>
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-8 h-8 ${corIconBg} rounded-lg flex items-center justify-center text-white shadow-sm`}>
              <FolderOpen className="w-4 h-4" />
            </span>
            <h1 className="text-base font-bold text-slate-900">Central de Documentos Fiscais</h1>
            <span className={`${corBgBadge} ${corTextDark} text-[10px] font-bold px-2 py-0.5 rounded-full border ${corBorder}`}>
              {todosDocs.length} Documentos
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestão e emissão completa de todos os modelos fiscais: NF-e, NFS-e, NFC-e, CT-e, NFA-e e MDF-e.
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs font-semibold text-slate-700">Emissor Fiscal</div>
          <div className={`text-[10px] font-medium ${corText}`}>{todosDocs.length} documentos emitidos</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Faturamento Total</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg font-bold text-slate-900 mt-1">{formatarMoeda(totalFaturado)}</div>
          <div className="text-[10px] text-slate-400">{todosDocs.length} documentos emitidos</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">NF-e (Produtos)</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Receipt className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg font-bold text-slate-900 mt-1">{formatarMoeda(totalNfe)}</div>
          <div className="text-[10px] text-slate-400">{todosDocs.filter(d => d.tipo === 'NFE').length} notas modelo 55</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">NFS-e (Serviços)</span>
            <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg font-bold text-slate-900 mt-1">{formatarMoeda(totalNfse)}</div>
          <div className="text-[10px] text-slate-400">{todosDocs.filter(d => d.tipo === 'NFSE').length} notas padrão DPS</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">NFC-e (Consumidor)</span>
            <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg font-bold text-slate-900 mt-1">{formatarMoeda(totalNfce)}</div>
          <div className="text-[10px] text-slate-400">{todosDocs.filter(d => d.tipo === 'NFCE').length} cupons PDV</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">CT-e (Transporte)</span>
            <div className="w-6 h-6 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center">
              <Truck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg font-bold text-slate-900 mt-1">{formatarMoeda(totalCte)}</div>
          <div className="text-[10px] text-slate-400">{todosDocs.filter(d => d.tipo === 'CTE').length} conhecimentos</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">NFA-e (Avulsa)</span>
            <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <FileBadge2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg font-bold text-slate-900 mt-1">{formatarMoeda(totalNfae)}</div>
          <div className="text-[10px] text-slate-400">{todosDocs.filter(d => d.tipo === 'NFAE').length} notas série 900</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">MDF-e (Manifesto)</span>
            <div className="w-6 h-6 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center">
              <FileArchive className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg font-bold text-slate-900 mt-1">{formatarMoeda(totalMdfe)}</div>
          <div className="text-[10px] text-slate-400">{todosDocs.filter(d => d.tipo === 'MDFE').length} manifestos</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
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

          <div className="flex flex-wrap items-center gap-2">
            {renderPeriodoSelector()}

            <div className="flex flex-wrap items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200 text-xs">
              {renderFiltroBotao('TODOS', 'Todos', todosDocs.length)}
              {renderFiltroBotao('NFE', 'NF-e', todosDocs.filter(d => d.tipo === 'NFE').length)}
              {renderFiltroBotao('NFSE', 'NFS-e', todosDocs.filter(d => d.tipo === 'NFSE').length)}
              {renderFiltroBotao('NFCE', 'NFC-e', todosDocs.filter(d => d.tipo === 'NFCE').length)}
              {renderFiltroBotao('CTE', 'CT-e', todosDocs.filter(d => d.tipo === 'CTE').length)}
              {renderFiltroBotao('NFAE', 'NFA-e', todosDocs.filter(d => d.tipo === 'NFAE').length)}
              {renderFiltroBotao('MDFE', 'MDF-e', todosDocs.filter(d => d.tipo === 'MDFE').length)}
            </div>

            <div className="relative flex items-center gap-2">
              <div className="relative inline-block text-left">
                <div className="flex rounded-lg shadow-sm">
                  <button
                    type="button"
                    onClick={handleClickEmitirPrincipal}
                    id="btn-emitir-nova-nota"
                    className={`${corBgButton} text-white text-xs font-bold px-4 py-2 rounded-l-lg transition-colors flex items-center gap-2 cursor-pointer`}
                    title={emitirAtivo ? `Emitir ${emitirAtivo.label} diretamente` : 'Selecione o tipo de documento'}
                  >
                    <Plus className="w-4 h-4" />
                    <span>{emitirAtivo ? `Emitir ${emitirAtivo.label}` : 'Emitir Nova Nota'}</span>
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
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Selecione o Tipo de Documento Fiscal</span>
                      </div>

                      <button onClick={() => { setMenuNovaNotaAberto(false); if (onEmitirNovaNfe) onEmitirNovaNfe(); }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors flex items-start gap-2.5 cursor-pointer group">
                        <div className="w-7 h-7 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors mt-0.5">
                          <Receipt className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">NF-e (Produto Eletrônica)</div>
                          <div className="text-[10px] text-slate-500">Modelo 55 • Venda de Produtos e Mercadorias</div>
                        </div>
                      </button>

                      <button onClick={() => { setMenuNovaNotaAberto(false); if (onEmitirNovaNfse) onEmitirNovaNfse(); }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors flex items-start gap-2.5 cursor-pointer group">
                        <div className="w-7 h-7 rounded bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors mt-0.5">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700">NFS-e (Serviço Eletrônica)</div>
                          <div className="text-[10px] text-slate-500">Padrão Nacional • Prestação de Serviços DPS</div>
                        </div>
                      </button>

                      <button onClick={() => { setMenuNovaNotaAberto(false); if (onEmitirNovaNfce) onEmitirNovaNfce(); }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors flex items-start gap-2.5 cursor-pointer group">
                        <div className="w-7 h-7 rounded bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors mt-0.5">
                          <ShoppingBag className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-purple-700">NFC-e (Consumidor Eletrônica)</div>
                          <div className="text-[10px] text-slate-500">Modelo 65 • Cupom Fiscal Varejo / PDV</div>
                        </div>
                      </button>

                      <button onClick={() => { setMenuNovaNotaAberto(false); if (onEmitirNovoCte) onEmitirNovoCte(); }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors flex items-start gap-2.5 cursor-pointer group">
                        <div className="w-7 h-7 rounded bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0 group-hover:bg-cyan-600 group-hover:text-white transition-colors mt-0.5">
                          <Truck className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-cyan-700">CT-e (Conhecimento de Transporte)</div>
                          <div className="text-[10px] text-slate-500">Modelo 57 • Prestação de Frete Rodoviário</div>
                        </div>
                      </button>

                      <button onClick={() => { setMenuNovaNotaAberto(false); if (onEmitirNovaNfae) onEmitirNovaNfae(); }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors flex items-start gap-2.5 cursor-pointer group">
                        <div className="w-7 h-7 rounded bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors mt-0.5">
                          <FileBadge2 className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-amber-700">NFA-e (Nota Avulsa Eletrônica)</div>
                          <div className="text-[10px] text-slate-500">Série 900 • Produtor Rural / MEI / Avulsa SEFAZ</div>
                        </div>
                      </button>

                      <button onClick={() => { setMenuNovaNotaAberto(false); if (onEmitirNovoMdfe) onEmitirNovoMdfe(); }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors flex items-start gap-2.5 cursor-pointer group">
                        <div className="w-7 h-7 rounded bg-orange-100 text-orange-700 flex items-center justify-center shrink-0 group-hover:bg-orange-600 group-hover:text-white transition-colors mt-0.5">
                          <FileArchive className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-orange-700">MDF-e (Manifesto Eletrônico)</div>
                          <div className="text-[10px] text-slate-500">Modelo 58 • Manifesto de Documentos Fiscais</div>
                        </div>
                      </button>
                    </div>
                  </>
                )}
              </div>

              <button onClick={handleExportarCsv} className="p-2 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer" title="Exportar dados da grid para CSV">
                <FileSpreadsheet className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {periodoFiltro !== 'TODOS' && (
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            <span>Filtrado por: <strong>{periodosLabels[periodoFiltro]}</strong></span>
            {periodoFiltro === 'PERSONALIZADO' && dataInicio && dataFim && (
              <span>
                ({new Date(dataInicio).toLocaleDateString('pt-BR')} - {new Date(dataFim).toLocaleDateString('pt-BR')})
              </span>
            )}
            <button
              onClick={() => {
                setPeriodoFiltro('TODOS');
                setDataInicio('');
                setDataFim('');
              }}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className={thClass} onClick={() => handleOrdenar('tipo')}>
                  <div className="flex items-center">Tipo / Mod <IconeOrdenacao campo="tipo" /></div>
                </th>
                <th className={thClass} onClick={() => handleOrdenar('numero')}>
                  <div className="flex items-center">Número <IconeOrdenacao campo="numero" /></div>
                </th>
                <th className={thClass} onClick={() => handleOrdenar('destinatario')}>
                  <div className="flex items-center">Destinatário / Tomador <IconeOrdenacao campo="destinatario" /></div>
                </th>
                <th className={thClass} onClick={() => handleOrdenar('data')}>
                  <div className="flex items-center">Data Emissão <IconeOrdenacao campo="data" /></div>
                </th>
                <th className={`${thClass} text-right`} onClick={() => handleOrdenar('valor')}>
                  <div className="flex items-center justify-end">Valor Total <IconeOrdenacao campo="valor" /></div>
                </th>
                <th className={`${thClass} text-center`} onClick={() => handleOrdenar('status')}>
                  <div className="flex items-center justify-center">Status <IconeOrdenacao campo="status" /></div>
                </th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {todosDocs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">Nenhum documento fiscal encontrado</p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {periodoFiltro !== 'TODOS' ? 'Tente ajustar o período ou os filtros' : 'Tente ajustar os termos da busca ou filtros acima.'}
                    </p>
                  </td>
                </tr>
              ) : (
                todosDocs.map((doc) => (
                  <tr key={`${doc.tipo}-${doc.id}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded border ${doc.corBadge}`}>
                        {doc.tipoLabel}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">Nº {doc.numero} <span className="text-slate-400 font-normal">Série {doc.serie}</span></div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono mt-0.5">
                        <span>Chave: {doc.chave.slice(0, 8)}...{doc.chave.slice(-6)}</span>
                        <button onClick={() => handleCopiarChave(doc.chave)} className="hover:text-indigo-600 p-0.5 cursor-pointer" title="Copiar chave de acesso completa">
                          {chaveCopiada === doc.chave ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 truncate max-w-xs">{doc.destinatario}</div>
                      <div className="text-[11px] text-slate-500">{doc.documento}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-xs">{doc.detalhes}</div>
                    </td>

                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      <div>{new Date(doc.data).toLocaleDateString('pt-BR')}</div>
                      <div className="text-[10px] text-slate-400">{new Date(doc.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap font-bold text-slate-900">
                      {formatarMoeda(doc.valor)}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${
                        doc.status === 'AUTORIZADA' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        doc.status === 'CANCELADA' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{doc.status}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={doc.onView} className="bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-medium text-xs px-2.5 py-1.5 rounded transition-colors flex items-center gap-1 cursor-pointer" title="Visualizar documento auxiliar impresso">
                          <Eye className="w-3.5 h-3.5" />
                          <span>Visualizar</span>
                        </button>

                        <button onClick={() => { const blob = new Blob([doc.xml], { type: 'application/xml' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${doc.tipo}_${doc.numero}_SUP.xml`; a.click(); }} className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors cursor-pointer" title="Baixar XML assinado pela SEFAZ">
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

      <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
        <span>Total de documentos: <strong>{todosDocs.length}</strong></span>
        <span>Faturamento total: <strong>{formatarMoeda(totalFaturado)}</strong></span>
        <span className="hidden sm:block">
          Período: <strong>{periodosLabels[periodoFiltro]}</strong>
          {periodoFiltro === 'PERSONALIZADO' && dataInicio && dataFim && (
            ` (${new Date(dataInicio).toLocaleDateString('pt-BR')} - ${new Date(dataFim).toLocaleDateString('pt-BR')})`
          )}
        </span>
      </div>

    </div>
  );
};