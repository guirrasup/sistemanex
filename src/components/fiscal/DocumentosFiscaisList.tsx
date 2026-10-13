// src/components/fiscal/DocumentosFiscaisList.tsx
import React, { useEffect, useMemo, useState } from 'react';
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
  X,
  Ban,
  XCircle,
  CloudOff,
  Clock,
} from 'lucide-react';
import { NFSeDocumento, NFeDocumento, NFCeDocumento, CTeDocumento, NFAeDocumento } from '../../types/fiscal';
import { MDFeDocumento } from '../../types/mdfe';
import { formatarMoeda, formatarCpfCnpj } from '../../utils/cpfCnpjValidator';
import { formatarChaveAcesso44 } from '../../utils/chaveAcesso';
import { usePermissoes } from '../../hooks/usePermissoes';

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
  const { pode } = usePermissoes();
  const [tipoFiltro, setTipoFiltro] = useState<TipoDocumentoFiltro>(initialTipo);
  const [statusFiltro, setStatusFiltro] = useState<'TODOS' | 'AUTORIZADA' | 'PROCESSANDO' | 'REJEITADA' | 'CANCELADA'>('TODOS');
  const [pagina, setPagina] = useState(1);
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
          // 🔥 NFe (schema.prisma) não tem campo `dataHoraEmissao` — é `dhEmi`,
          // igual CT-e/MDF-e. Usar o nome errado fazia toda NF-e cair no
          // fallback `new Date()` (hora do render), fazendo-a "vencer" o sort
          // por data mais recente contra os outros tipos — por isso "Todos"
          // aparecia fora de ordem enquanto o filtro por tipo (que não
          // dependia da comparação entre tipos) parecia correto.
          data: doc.dhEmi || new Date().toISOString(),
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

  // 🔥 Filtro por período/status/busca SEM o filtro de tipo — usado pelos
  // badges/cards de contagem por tipo. Antes esses badges/cards liam de
  // `todosDocs` (que já vem filtrado pelo tipo ativo), então com qualquer
  // filtro de tipo selecionado o card "Todos" mostrava a contagem do tipo
  // ativo e os demais tipos apareciam zerados — dava a impressão de que os
  // outros documentos tinham sumido, quando na verdade só o rótulo/contagem
  // estava errado (a tabela em si sempre respeitou o filtro corretamente).
  const docsFiltradosSemTipo = useMemo(() => {
    const { inicio, fim } = getDatasPorPeriodo(periodoFiltro);

    return todosDocsRaw.filter(d => {
      if (statusFiltro === 'PROCESSANDO' && !['PROCESSANDO', 'RASCUNHO', 'CONTINGENCIA'].includes(d.status)) return false;
      if (statusFiltro === 'REJEITADA' && !['REJEITADA', 'DENEGADA'].includes(d.status)) return false;
      if ((statusFiltro === 'AUTORIZADA' || statusFiltro === 'CANCELADA') && d.status !== statusFiltro) return false;

      if (inicio && fim) {
        const dataDoc = new Date(d.data);
        if (dataDoc < inicio || dataDoc > fim) return false;
      }

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
  }, [todosDocsRaw, busca, statusFiltro, periodoFiltro, dataInicio, dataFim]);

  // 🔥 ORDENAÇÃO E FILTRO COM useMemo
  const todosDocs = useMemo(() => {
    const filtrados = docsFiltradosSemTipo.filter(d => {
      if (tipoFiltro !== 'TODOS' && d.tipo !== tipoFiltro) return false;
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

      let resultado = 0;
      if (typeof valorA === 'number' && typeof valorB === 'number') {
        resultado = ordenacaoDirecao === 'asc' ? valorA - valorB : valorB - valorA;
      } else if (typeof valorA === 'string' && typeof valorB === 'string') {
        resultado = ordenacaoDirecao === 'asc'
          ? valorA.localeCompare(valorB)
          : valorB.localeCompare(valorA);
      }

      // 🔥 Desempate: quando o critério principal empata (ex.: mesma data de
      // emissão — comum em documentos importados/testados em lote, ou tipos
      // diferentes emitidos no mesmo segundo), usa o número da nota em ordem
      // decrescente como segundo critério, pra ordem final ficar determinística.
      if (resultado === 0) {
        return b.numero - a.numero;
      }

      return resultado;
    });
  }, [docsFiltradosSemTipo, tipoFiltro, ordenacaoCampo, ordenacaoDirecao]);

  // Qualquer mudança de filtro/ordenação volta para a primeira página.
  useEffect(() => setPagina(1), [tipoFiltro, statusFiltro, periodoFiltro, dataInicio, dataFim, busca, ordenacaoCampo, ordenacaoDirecao]);

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
      return <ArrowUpDown className="ml-1 h-3 w-3 text-ink-300 opacity-0 transition-opacity group-hover:opacity-100" />;
    }
    return ordenacaoDirecao === 'asc' ? <ArrowUp className="ml-1 h-3 w-3 text-brand-700" /> : <ArrowDown className="ml-1 h-3 w-3 text-brand-700" />;
  };

  const thClass =
    'group sticky top-0 z-10 cursor-pointer select-none border-b border-ink-200 bg-ink-50 px-4 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-500 transition-colors hover:text-ink-900';

  // Métricas consolidadas — contagens usam todos os status; valores, só
  // documentos autorizados (cancelada/rejeitada não é faturamento).
  // Usam `docsFiltradosSemTipo` (período/status/busca, sem o filtro de tipo)
  // para os totais por tipo mostrarem sempre o panorama completo.
  const valorAutorizado = (lista: DocumentoUnificado[]) => lista.filter((d) => d.status === 'AUTORIZADA').reduce((acc, d) => acc + (d.valor || 0), 0);
  const totalFaturado = valorAutorizado(docsFiltradosSemTipo.filter((d) => d.tipo !== 'MDFE'));

  const TIPOS: Array<{ id: TipoDocumentoFiltro; rotulo: string; detalhe: string }> = [
    { id: 'TODOS', rotulo: 'Todos', detalhe: 'faturado' },
    { id: 'NFE', rotulo: 'NF-e', detalhe: 'Mod. 55' },
    { id: 'NFSE', rotulo: 'NFS-e', detalhe: 'Nacional' },
    { id: 'NFCE', rotulo: 'NFC-e', detalhe: 'Mod. 65' },
    { id: 'CTE', rotulo: 'CT-e', detalhe: 'Mod. 57' },
    { id: 'NFAE', rotulo: 'NFA-e', detalhe: 'Avulsa' },
    { id: 'MDFE', rotulo: 'MDF-e', detalhe: 'valor de carga' },
  ];
  const tiposVisiveis = TIPOS.filter((t) => t.id === 'TODOS' || pode(`${t.id.toLowerCase()}.ver`));

  const handleCopiarChave = (chave: string) => {
    navigator.clipboard.writeText(chave);
    setChaveCopiada(chave);
    setTimeout(() => setChaveCopiada(null), 2000);
  };

  const handleExportarCsv = () => {
    const headers = ['Tipo', 'Modelo', 'Numero', 'Serie', 'Destinatario_Tomador', 'CPF_CNPJ', 'Data_Emissao', 'Valor_Total', 'Status', 'Chave_Acesso'];
    const rows = todosDocs.map((d) => [
      d.tipoLabel,
      d.modelo,
      d.numero,
      d.serie,
      `"${d.destinatario.replace(/"/g, '""')}"`,
      d.documento,
      new Date(d.data).toLocaleString('pt-BR'),
      d.valor.toFixed(2),
      d.status,
      d.chave,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `notas_fiscais_${periodoFiltro}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 🔥 Quando um tipo específico já está selecionado (veio de um atalho por
  // tipo, ou o usuário clicou num filtro), "Emitir" vai direto pro emissor
  // daquele tipo — só mostra o menu de seleção quando o filtro é "Todos"
  // (ou o tipo ativo não tiver uma ação de emissão configurada).
  const emitirPorTipo: Partial<Record<TipoDocumentoFiltro, { label: string; onEmitir?: () => void }>> = {
    NFE: { label: 'NF-e', onEmitir: onEmitirNovaNfe },
    NFSE: { label: 'NFS-e', onEmitir: onEmitirNovaNfse },
    NFCE: { label: 'NFC-e', onEmitir: onEmitirNovaNfce },
    CTE: { label: 'CT-e', onEmitir: onEmitirNovoCte },
    NFAE: { label: 'NFA-e', onEmitir: onEmitirNovaNfae },
    MDFE: { label: 'MDF-e', onEmitir: onEmitirNovoMdfe },
  };
  const emitirAtivo = tipoFiltro !== 'TODOS' ? emitirPorTipo[tipoFiltro] : undefined;

  const handleClickEmitirPrincipal = () => {
    if (emitirAtivo?.onEmitir) {
      emitirAtivo.onEmitir();
      return;
    }
    setMenuNovaNotaAberto(!menuNovaNotaAberto);
  };

  const opcoesEmissao: Array<{ onEmitir?: () => void; icon: typeof Receipt; titulo: string; detalhe: string }> = [
    { onEmitir: onEmitirNovaNfe, icon: Receipt, titulo: 'NF-e', detalhe: 'Mod. 55 · venda de produtos e mercadorias' },
    { onEmitir: onEmitirNovaNfse, icon: FileText, titulo: 'NFS-e', detalhe: 'Padrão Nacional · prestação de serviços' },
    { onEmitir: onEmitirNovaNfce, icon: ShoppingBag, titulo: 'NFC-e', detalhe: 'Mod. 65 · cupom do varejo / PDV' },
    { onEmitir: onEmitirNovoCte, icon: Truck, titulo: 'CT-e', detalhe: 'Mod. 57 · prestação de frete' },
    { onEmitir: onEmitirNovaNfae, icon: FileBadge2, titulo: 'NFA-e', detalhe: 'Série 900 · produtor rural / avulsa' },
    { onEmitir: onEmitirNovoMdfe, icon: FileArchive, titulo: 'MDF-e', detalhe: 'Mod. 58 · manifesto da viagem' },
  ];

  // Situação do documento — mesmos tokens nf-* do resto do app.
  const situacao = (status: string) => {
    switch (status) {
      case 'AUTORIZADA':
        return { rotulo: 'Autorizada', icon: CheckCircle2, classe: 'bg-nf-autorizada-bg text-nf-autorizada' };
      case 'CANCELADA':
        return { rotulo: 'Cancelada', icon: Ban, classe: 'bg-nf-cancelada-bg text-nf-cancelada' };
      case 'REJEITADA':
      case 'DENEGADA':
        return { rotulo: status === 'DENEGADA' ? 'Denegada' : 'Rejeitada', icon: XCircle, classe: 'bg-nf-rejeitada-bg text-nf-rejeitada' };
      case 'CONTINGENCIA':
        return { rotulo: 'Contingência', icon: CloudOff, classe: 'bg-nf-contingencia-bg text-nf-contingencia' };
      default:
        return { rotulo: status ? status.charAt(0) + status.slice(1).toLowerCase() : 'Processando', icon: Clock, classe: 'bg-nf-pendente-bg text-nf-pendente' };
    }
  };

  const STATUS_OPCOES: Array<{ id: typeof statusFiltro; rotulo: string }> = [
    { id: 'TODOS', rotulo: 'Todas' },
    { id: 'AUTORIZADA', rotulo: 'Autorizadas' },
    { id: 'PROCESSANDO', rotulo: 'Processando' },
    { id: 'REJEITADA', rotulo: 'Rejeitadas' },
    { id: 'CANCELADA', rotulo: 'Canceladas' },
  ];

  // Paginação
  const POR_PAGINA = 50;
  const totalPaginas = Math.max(1, Math.ceil(todosDocs.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const docsPagina = todosDocs.slice((paginaAtual - 1) * POR_PAGINA, paginaAtual * POR_PAGINA);

  const Dinheiro = ({ valor, className = '' }: { valor: number; className?: string }) => (
    <span className={`tabular-nums ${className}`}>
      <span className="mr-[0.25em] text-[0.62em] font-medium text-ink-400">R$</span>
      {formatarMoeda(valor).replace(/^R\$\s?/, '')}
    </span>
  );

  const formatarDoc = (doc: string) => (/^\d{11}$|^\d{14}$/.test(doc) ? formatarCpfCnpj(doc) : doc);

  const renderPeriodoSelector = () => (
    <div className="relative">
      <button
        type="button"
        onClick={() => setMenuPeriodoAberto(!menuPeriodoAberto)}
        className={`flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border px-3 text-[13px] transition-colors ${
          periodoFiltro !== 'TODOS' ? 'border-brand-300 bg-brand-50 font-medium text-brand-800' : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300'
        }`}
      >
        <Calendar className="h-4 w-4 text-ink-400" />
        <span>{periodosLabels[periodoFiltro]}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-ink-400 transition-transform ${menuPeriodoAberto ? 'rotate-180' : ''}`} />
      </button>

      {menuPeriodoAberto && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setMenuPeriodoAberto(false)} />
          <div className="absolute right-0 z-30 mt-1.5 w-64 rounded-xl border border-ink-200 bg-white p-1.5 shadow-float">
            {(['TODOS', 'HOJE', 'SEMANA', 'MES', 'TRIMESTRE', 'SEMESTRE', 'ANO'] as PeriodoFiltro[]).map((periodo) => (
              <button
                key={periodo}
                onClick={() => {
                  setPeriodoFiltro(periodo);
                  setDataInicio('');
                  setDataFim('');
                  setMenuPeriodoAberto(false);
                }}
                className={`w-full cursor-pointer rounded-lg px-3 py-1.5 text-left text-[13px] transition-colors ${
                  periodoFiltro === periodo ? 'bg-brand-50 font-medium text-brand-800' : 'text-ink-700 hover:bg-ink-50'
                }`}
              >
                {periodosLabels[periodo]}
              </button>
            ))}

            <button
              onClick={() => setPeriodoFiltro('PERSONALIZADO')}
              className={`w-full cursor-pointer rounded-lg px-3 py-1.5 text-left text-[13px] transition-colors ${
                periodoFiltro === 'PERSONALIZADO' ? 'bg-brand-50 font-medium text-brand-800' : 'text-ink-700 hover:bg-ink-50'
              }`}
            >
              {periodosLabels.PERSONALIZADO}
            </button>

            {periodoFiltro === 'PERSONALIZADO' && (
              <div className="mt-2 space-y-2 border-t border-ink-100 px-1 pt-2">
                <label className="block text-[11px] font-medium text-ink-500">
                  Data início
                  <input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-ink-200 p-1.5 text-xs text-ink-900 outline-none focus:ring-2 focus:ring-brand-200"
                  />
                </label>
                <label className="block text-[11px] font-medium text-ink-500">
                  Data fim
                  <input
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-ink-200 p-1.5 text-xs text-ink-900 outline-none focus:ring-2 focus:ring-brand-200"
                  />
                </label>
                <div className="flex gap-2">
                  <button onClick={() => setMenuPeriodoAberto(false)} className="flex-1 cursor-pointer rounded-lg bg-brand-700 py-1.5 text-xs font-medium text-white hover:bg-brand-800">
                    Aplicar
                  </button>
                  <button
                    onClick={() => {
                      setPeriodoFiltro('TODOS');
                      setDataInicio('');
                      setDataFim('');
                      setMenuPeriodoAberto(false);
                    }}
                    className="flex-1 cursor-pointer rounded-lg border border-ink-200 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50"
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

  const filtrosAtivos = periodoFiltro !== 'TODOS' || statusFiltro !== 'TODOS' || tipoFiltro !== 'TODOS' || busca.trim() !== '';

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      {/* ===== Totais por tipo (também filtram a tabela) ===== */}
      <section
        className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-ink-200/80 bg-ink-100 shadow-card sm:grid-cols-4 xl:grid-cols-7"
        role="tablist"
        aria-label="Filtrar por tipo de documento"
      >
        {tiposVisiveis.map((t) => {
          const docs = t.id === 'TODOS' ? docsFiltradosSemTipo : docsFiltradosSemTipo.filter((d) => d.tipo === t.id);
          const valor = t.id === 'TODOS' ? totalFaturado : valorAutorizado(docs);
          const sel = tipoFiltro === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={sel}
              onClick={() => setTipoFiltro(t.id)}
              className={`relative min-w-0 cursor-pointer p-4 text-left transition-colors ${sel ? 'bg-white' : 'bg-white/70 hover:bg-white'}`}
            >
              {sel && <span className="absolute inset-x-0 top-0 h-0.5 bg-brand-700" />}
              <div className="flex items-baseline justify-between gap-2">
                <span className={`text-[13px] font-semibold ${sel ? 'text-ink-950' : 'text-ink-700'}`}>{t.rotulo}</span>
                <span className="font-mono text-[11px] tabular-nums text-ink-400">{docs.length}</span>
              </div>
              {t.id === 'MDFE' ? (
                <p className="mt-1.5 truncate text-[11px] text-ink-400">{t.detalhe}</p>
              ) : (
                <p
                  className={`mt-1 truncate font-display text-[17px] font-bold tracking-[-0.01em] ${sel ? 'text-brand-700' : 'text-ink-900'}`}
                  title={formatarMoeda(valor)}
                >
                  {valor >= 1_000_000 ? (
                    <span className="tabular-nums">
                      <span className="mr-[0.25em] text-[0.62em] font-medium text-ink-400">R$</span>
                      {(valor / 1_000_000).toFixed(2).replace('.', ',')} mi
                    </span>
                  ) : (
                    <Dinheiro valor={valor} />
                  )}
                </p>
              )}
              {t.id !== 'MDFE' && <p className="truncate text-[10.5px] text-ink-400">{t.id === 'TODOS' ? 'autorizado no período' : t.detalhe}</p>}
            </button>
          );
        })}
      </section>

      {/* ===== Barra de ferramentas ===== */}
      <section className="rounded-xl border border-ink-200/80 bg-white p-3 shadow-card">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              placeholder="Buscar por número, destinatário, CNPJ/CPF ou chave de acesso…"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="h-9 w-full rounded-lg border border-ink-200 bg-ink-50/60 pl-9 pr-3 text-[13px] text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-brand-300 focus:bg-white focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex h-9 items-center rounded-lg bg-ink-100 p-0.5 text-xs font-medium" role="radiogroup" aria-label="Situação">
              {STATUS_OPCOES.map((s) => (
                <button
                  key={s.id}
                  role="radio"
                  aria-checked={statusFiltro === s.id}
                  onClick={() => setStatusFiltro(s.id)}
                  className={`h-8 cursor-pointer rounded-md px-2.5 transition-colors ${statusFiltro === s.id ? 'bg-white text-ink-950 shadow-card' : 'text-ink-500 hover:text-ink-800'}`}
                >
                  {s.rotulo}
                </button>
              ))}
            </div>

            {renderPeriodoSelector()}

            {pode('relatorios.exportar') && (
              <button
                onClick={handleExportarCsv}
                className="flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 text-[13px] text-ink-700 transition-colors hover:border-ink-300 hover:text-ink-950"
                title="Exportar a lista filtrada para CSV"
              >
                <FileSpreadsheet className="h-4 w-4 text-ink-400" />
                CSV
              </button>
            )}

            {Object.values(emitirPorTipo).some((e) => e?.onEmitir) && (
              <div className="relative">
                <div className="flex h-9 overflow-hidden rounded-lg shadow-card">
                  <button
                    type="button"
                    onClick={handleClickEmitirPrincipal}
                    id="btn-emitir-nova-nota"
                    className="flex cursor-pointer items-center gap-1.5 bg-brand-700 px-3.5 text-[13px] font-medium text-white transition-colors hover:bg-brand-800"
                    title={emitirAtivo ? `Emitir ${emitirAtivo.label}` : 'Escolher o tipo de documento'}
                  >
                    <Plus className="h-4 w-4" />
                    {emitirAtivo ? `Emitir ${emitirAtivo.label}` : 'Emitir'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMenuNovaNotaAberto(!menuNovaNotaAberto)}
                    className="flex cursor-pointer items-center border-l border-white/20 bg-brand-700 px-2 text-white transition-colors hover:bg-brand-800"
                    aria-label="Escolher o tipo de documento"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>

                {menuNovaNotaAberto && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setMenuNovaNotaAberto(false)} />
                    <div className="absolute right-0 z-30 mt-2 w-80 origin-top-right rounded-xl border border-ink-200 bg-white p-1.5 shadow-float">
                      <p className="px-2.5 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-400">Novo documento</p>
                      {opcoesEmissao
                        .filter((o) => o.onEmitir)
                        .map((o) => (
                          <button
                            key={o.titulo}
                            onClick={() => {
                              setMenuNovaNotaAberto(false);
                              o.onEmitir?.();
                            }}
                            className="group flex w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-left hover:bg-ink-50"
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-ink-200 text-ink-500 transition-colors group-hover:border-brand-200 group-hover:bg-brand-50 group-hover:text-brand-700">
                              <o.icon className="h-4 w-4" />
                            </span>
                            <span>
                              <span className="block text-sm font-medium text-ink-900">{o.titulo}</span>
                              <span className="block text-xs text-ink-500">{o.detalhe}</span>
                            </span>
                          </button>
                        ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {filtrosAtivos && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-ink-100 pt-2.5 text-xs text-ink-500">
            <span className="mr-1">Filtros:</span>
            {tipoFiltro !== 'TODOS' && (
              <button onClick={() => setTipoFiltro('TODOS')} className="flex cursor-pointer items-center gap-1 rounded-full border border-ink-200 bg-ink-50 px-2 py-0.5 text-ink-700 hover:border-ink-300">
                {TIPOS.find((t) => t.id === tipoFiltro)?.rotulo} <X className="h-3 w-3 text-ink-400" />
              </button>
            )}
            {statusFiltro !== 'TODOS' && (
              <button onClick={() => setStatusFiltro('TODOS')} className="flex cursor-pointer items-center gap-1 rounded-full border border-ink-200 bg-ink-50 px-2 py-0.5 text-ink-700 hover:border-ink-300">
                {STATUS_OPCOES.find((s) => s.id === statusFiltro)?.rotulo} <X className="h-3 w-3 text-ink-400" />
              </button>
            )}
            {periodoFiltro !== 'TODOS' && (
              <button
                onClick={() => {
                  setPeriodoFiltro('TODOS');
                  setDataInicio('');
                  setDataFim('');
                }}
                className="flex cursor-pointer items-center gap-1 rounded-full border border-ink-200 bg-ink-50 px-2 py-0.5 text-ink-700 hover:border-ink-300"
              >
                {periodosLabels[periodoFiltro]}
                {periodoFiltro === 'PERSONALIZADO' && dataInicio && dataFim && (
                  <span className="font-mono text-[11px]">
                    {new Date(dataInicio + 'T00:00:00').toLocaleDateString('pt-BR')}–{new Date(dataFim + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </span>
                )}
                <X className="h-3 w-3 text-ink-400" />
              </button>
            )}
            {busca.trim() && (
              <button onClick={() => setBusca('')} className="flex cursor-pointer items-center gap-1 rounded-full border border-ink-200 bg-ink-50 px-2 py-0.5 text-ink-700 hover:border-ink-300">
                “{busca.trim()}” <X className="h-3 w-3 text-ink-400" />
              </button>
            )}
            <button
              onClick={() => {
                setTipoFiltro('TODOS');
                setStatusFiltro('TODOS');
                setPeriodoFiltro('TODOS');
                setDataInicio('');
                setDataFim('');
                setBusca('');
              }}
              className="ml-auto cursor-pointer font-medium text-brand-700 hover:text-brand-800"
            >
              Limpar tudo
            </button>
          </div>
        )}
      </section>

      {/* ===== Tabela ===== */}
      <section className="overflow-hidden rounded-xl border border-ink-200/80 bg-white shadow-card">
        <div className="max-h-[calc(100vh-300px)] min-h-[320px] overflow-auto">
          <table className="w-full min-w-[920px] border-separate border-spacing-0 text-left text-[13px]">
            <thead>
              <tr>
                <th className={thClass} onClick={() => handleOrdenar('tipo')}>
                  <div className="flex items-center">Doc. <IconeOrdenacao campo="tipo" /></div>
                </th>
                <th className={thClass} onClick={() => handleOrdenar('numero')}>
                  <div className="flex items-center">Número / chave <IconeOrdenacao campo="numero" /></div>
                </th>
                <th className={thClass} onClick={() => handleOrdenar('destinatario')}>
                  <div className="flex items-center">Destinatário / tomador <IconeOrdenacao campo="destinatario" /></div>
                </th>
                <th className={thClass} onClick={() => handleOrdenar('data')}>
                  <div className="flex items-center">Emissão <IconeOrdenacao campo="data" /></div>
                </th>
                <th className={`${thClass} text-right`} onClick={() => handleOrdenar('valor')}>
                  <div className="flex items-center justify-end">Valor <IconeOrdenacao campo="valor" /></div>
                </th>
                <th className={thClass} onClick={() => handleOrdenar('status')}>
                  <div className="flex items-center">Situação <IconeOrdenacao campo="status" /></div>
                </th>
                <th className="sticky top-0 z-10 border-b border-ink-200 bg-ink-50 px-4 py-2.5" aria-label="Ações" />
              </tr>
            </thead>
            <tbody>
              {docsPagina.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <Layers className="mx-auto mb-2 h-8 w-8 text-ink-300" />
                    <p className="text-sm font-medium text-ink-800">Nenhum documento encontrado</p>
                    <p className="mt-0.5 text-xs text-ink-500">{filtrosAtivos ? 'Ajuste ou limpe os filtros acima.' : 'Os documentos emitidos aparecem aqui.'}</p>
                  </td>
                </tr>
              ) : (
                docsPagina.map((doc) => {
                  const s = situacao(doc.status);
                  const cancelada = doc.status === 'CANCELADA';
                  const data = new Date(doc.data);
                  return (
                    <tr key={`${doc.tipo}-${doc.id}`} className="group/linha transition-colors hover:bg-ink-50/70">
                      <td className="border-b border-ink-100 px-4 py-2.5 align-top">
                        <span className="inline-block w-14 rounded border border-ink-200 bg-white px-1 py-0.5 text-center font-mono text-[10.5px] font-medium text-ink-600">
                          {TIPOS.find((t) => t.id === doc.tipo)?.rotulo ?? doc.tipo}
                        </span>
                      </td>

                      <td className="border-b border-ink-100 px-4 py-2.5 align-top">
                        <div className="font-mono text-[13px] font-medium text-ink-950">
                          {doc.numero}
                          <span className="ml-1.5 text-[11px] font-normal text-ink-400">série {doc.serie}</span>
                        </div>
                        {doc.chave && (
                          <button
                            onClick={() => handleCopiarChave(doc.chave)}
                            className="mt-0.5 flex cursor-pointer items-center gap-1 font-mono text-[10.5px] text-ink-400 transition-colors hover:text-brand-700"
                            title={`Copiar chave: ${doc.chave}`}
                          >
                            {doc.chave.slice(0, 4)} … {doc.chave.slice(-8)}
                            {chaveCopiada === doc.chave ? <Check className="h-3 w-3 text-brand-600" /> : <Copy className="h-3 w-3 opacity-0 transition-opacity group-hover/linha:opacity-100" />}
                          </button>
                        )}
                      </td>

                      <td className="max-w-[320px] border-b border-ink-100 px-4 py-2.5 align-top">
                        <div className="truncate font-medium text-ink-900" title={doc.destinatario}>
                          {doc.destinatario}
                        </div>
                        <div className="truncate text-[11px] text-ink-500">
                          <span className={/\d{11}/.test(doc.documento) ? 'font-mono' : ''}>{formatarDoc(doc.documento)}</span>
                          {doc.detalhes && <span className="text-ink-400"> · {doc.detalhes}</span>}
                        </div>
                      </td>

                      <td className="whitespace-nowrap border-b border-ink-100 px-4 py-2.5 align-top font-mono text-xs text-ink-600">
                        {data.toLocaleDateString('pt-BR')}
                        <div className="text-[10.5px] text-ink-400">{data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>

                      <td className={`whitespace-nowrap border-b border-ink-100 px-4 py-2.5 text-right align-top ${cancelada ? 'text-ink-400 line-through' : 'font-medium text-ink-950'}`}>
                        <Dinheiro valor={doc.valor} />
                      </td>

                      <td className="whitespace-nowrap border-b border-ink-100 px-4 py-2.5 align-top">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${s.classe}`}>
                          <s.icon className="h-3 w-3" />
                          {s.rotulo}
                        </span>
                      </td>

                      <td className="whitespace-nowrap border-b border-ink-100 px-3 py-2 text-right align-top">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={doc.onView}
                            className="flex cursor-pointer items-center gap-1 rounded-md border border-transparent px-2 py-1 text-xs font-medium text-ink-600 transition-colors hover:border-ink-200 hover:bg-white hover:text-brand-700"
                            title="Visualizar documento auxiliar"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Ver
                          </button>
                          {pode(`${doc.tipo.toLowerCase()}.download`) && (
                            <button
                              onClick={() => {
                                const blob = new Blob([doc.xml], { type: 'application/xml' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `${doc.tipo}_${doc.numero}_SUP.xml`;
                                a.click();
                              }}
                              className="cursor-pointer rounded-md p-1.5 text-ink-400 transition-colors hover:bg-white hover:text-ink-800"
                              title="Baixar XML"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé: resumo + paginação */}
        <div className="flex flex-col gap-2 border-t border-ink-200/70 bg-ink-50/60 px-4 py-2.5 text-xs text-ink-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            <span className="font-medium text-ink-800">{todosDocs.length}</span> documentos · autorizado{' '}
            <Dinheiro valor={valorAutorizado(todosDocs.filter((d) => d.tipo !== 'MDFE'))} className="font-medium text-ink-800" />
          </span>
          {totalPaginas > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPagina(Math.max(1, paginaAtual - 1))}
                disabled={paginaAtual === 1}
                className="cursor-pointer rounded-md border border-ink-200 bg-white px-2 py-1 text-ink-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="px-2 font-mono tabular-nums">
                {paginaAtual} / {totalPaginas}
              </span>
              <button
                onClick={() => setPagina(Math.min(totalPaginas, paginaAtual + 1))}
                disabled={paginaAtual === totalPaginas}
                className="cursor-pointer rounded-md border border-ink-200 bg-white px-2 py-1 text-ink-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Próxima
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};