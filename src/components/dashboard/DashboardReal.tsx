// src/components/dashboard/DashboardReal.tsx
// Painel financeiro-fiscal — denso e tom sobre tom (mesmo idioma da Sidebar):
// tinta "ink" para estrutura, verde-petróleo para o que é receita/ativo,
// números tabulares. Tudo calculado dos dados já carregados pelo App.tsx.
import React, { useMemo, useState } from 'react';
import { ArrowRight, FileText } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatarMoeda } from '../../utils/cpfCnpjValidator';
import { TipoDocumentoFiltro } from '../fiscal/DocumentosFiscaisList';
import { useCoresTema } from '../../hooks/useCoresTema';

type TipoDoc = 'NFE' | 'NFSE' | 'NFCE' | 'CTE' | 'NFAE' | 'MDFE';

interface DocumentoFiscalResumo {
  id: string;
  numero?: number;
  numeroNfse?: number;
  chaveAcesso?: string;
  dataHoraEmissao?: string;
  valorTotalNota?: number;
  valorTotalServicos?: number;
  valorTotalFrete?: number;
  status?: string;
  destinatario?: unknown;
  tomador?: unknown;
  // NFe e CTe devolvem os campos crus do Prisma (leiaute SEFAZ): vNF/vTPrest/dhEmi/nCT.
  vNF?: number | string;
  vTPrest?: number | string;
  dhEmi?: string;
  nCT?: number;
  // MDF-e: `vCarga` é o valor da carga transportada — não é receita.
  vCarga?: number | string;
  // Contraparte gravada em campos crus em alguns tipos (ver nomeContraparte).
  remetente?: unknown;
  consumidorNome?: string;
  destinatarioNome?: string;
  UFIni?: string;
  UFFim?: string;
}

interface ClienteResumo {
  tipo?: string;
}

interface ProdutoResumo {
  ativo?: boolean;
}

interface TituloResumo {
  tipo?: string;
  status?: string;
  valorOriginal?: number | string;
  dataVencimento?: string;
}

interface DashboardRealProps {
  nfes: DocumentoFiscalResumo[];
  nfses: DocumentoFiscalResumo[];
  nfces: DocumentoFiscalResumo[];
  ctes: DocumentoFiscalResumo[];
  nfaes: DocumentoFiscalResumo[];
  mdfes: DocumentoFiscalResumo[];
  produtos: ProdutoResumo[];
  clientes: ClienteResumo[];
  titulos: TituloResumo[];
  transportadoras?: unknown[];
  onNavigateDocumentosTipo?: (tipo: TipoDocumentoFiltro) => void;
  onNavigate: (view: string) => void;
}

// Decimal do Prisma chega como string no JSON — converter antes de somar.
function paraNumero(v: unknown): number {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return typeof n === 'number' && !isNaN(n) ? n : 0;
}

// "2026-10-27" vira meia-noite LOCAL (new Date('2026-10-27') seria UTC e cairia no dia anterior no Brasil).
function dataLocal(v?: string): Date | null {
  if (!v) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(v);
  if (m && (v.length <= 10 || /T00:00:00(\.000)?Z?$/.test(v))) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

const DIA = 86_400_000;
const inicioDoDia = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const ROTULO_TIPO: Record<TipoDoc, string> = { NFE: 'NF-e', NFSE: 'NFS-e', NFCE: 'NFC-e', CTE: 'CT-e', NFAE: 'NFA-e', MDFE: 'MDF-e' };
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];


// Quem é a "outra ponta" de cada documento — mesmo mapeamento da tela de Documentos emitidos.
function nomeContraparte(doc: DocumentoFiscalResumo, tipo: TipoDoc): string {
  const razao = (v: unknown) => (v as { razaoSocial?: string } | undefined)?.razaoSocial;
  switch (tipo) {
    case 'NFE':
      return razao(doc.destinatario) || 'Destinatário não informado';
    case 'NFSE':
      return razao(doc.tomador) || 'Tomador não informado';
    case 'NFCE':
      return doc.consumidorNome || 'Consumidor final';
    case 'CTE':
      return `${razao(doc.remetente) || 'Remetente'} → ${razao(doc.destinatario) || 'Destinatário'}`;
    case 'NFAE':
      return doc.destinatarioNome || 'Destinatário não informado';
    case 'MDFE':
      return `Percurso ${doc.UFIni || '?'} → ${doc.UFFim || '?'}`;
  }
}

// Valores compactos para eixos.
function compacto(v: number): string {
  const a = Math.abs(v);
  const sinal = v < 0 ? '−' : '';
  if (a >= 1_000_000) return `${sinal}${(a / 1_000_000).toFixed(1).replace('.', ',')} mi`;
  if (a >= 1_000) return `${sinal}${(a / 1_000).toFixed(a >= 100_000 ? 0 : 1).replace('.', ',')} mil`;
  return `${sinal}${Math.round(a)}`;
}

const pct = (v: number) => `${v.toFixed(1).replace('.', ',')}%`;

// "R$" mais claro que o valor, algarismos tabulares.
const Dinheiro: React.FC<{ valor: number; className?: string }> = ({ valor, className = '' }) => (
  <span className={`tabular-nums ${className}`}>
    <span className="mr-[0.25em] text-[0.62em] font-medium text-ink-400">R$</span>
    {valor < 0 ? '−' : ''}
    {formatarMoeda(Math.abs(valor)).replace(/^R\$\s?/, '')}
  </span>
);

const Variacao: React.FC<{ valor: number | null }> = ({ valor }) => {
  if (valor === null || !isFinite(valor)) return <span className="text-ink-400">sem base de comparação</span>;
  const bom = valor >= 0;
  return (
    <span className={`rounded px-1 py-px font-mono text-[11px] tabular-nums ${bom ? 'bg-brand-50 text-brand-700' : 'bg-ink-100 text-ink-700'}`}>
      {valor >= 0 ? '▲' : '▼'} {pct(Math.abs(valor))}
    </span>
  );
};

// Mini gráfico de linha em SVG puro (sem eixos), para as células de KPI.
const Sparkline: React.FC<{ dados: number[]; id: string; cor: string }> = ({ dados, id, cor }) => {
  if (dados.length < 2 || dados.every((v) => v === 0)) return <div className="h-8" />;
  const w = 100;
  const h = 28;
  const max = Math.max(...dados);
  const min = Math.min(...dados, 0);
  const pts = dados.map((v, i) => [(i / (dados.length - 1)) * w, h - 2 - ((v - min) / (max - min || 1)) * (h - 4)]);
  const linha = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-8 w-full" aria-hidden>
      <defs>
        <linearGradient id={`sp-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={cor} stopOpacity="0.18" />
          <stop offset="1" stopColor={cor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${linha} L${w},${h} L0,${h} Z`} fill={`url(#sp-${id})`} />
      <path d={linha} fill="none" stroke={cor} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

const Cartao: React.FC<{
  titulo: string;
  subtitulo?: React.ReactNode;
  acao?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}> = ({ titulo, subtitulo, acao, className = '', children }) => (
  <section className={`flex flex-col rounded-xl border border-ink-200/80 bg-white shadow-card ${className}`}>
    <header className="flex items-start justify-between gap-3 px-4 pb-1 pt-3.5">
      <div className="min-w-0">
        <h2 className="text-[13px] font-semibold text-ink-900">{titulo}</h2>
        {subtitulo && <p className="mt-0.5 text-[11px] text-ink-500">{subtitulo}</p>}
      </div>
      {acao}
    </header>
    {children}
  </section>
);

interface ItemTooltip {
  name?: string;
  value?: number;
  color?: string;
  dataKey?: string | number;
}

const TooltipValores: React.FC<{ active?: boolean; payload?: ItemTooltip[]; label?: string | number; prefixo?: string }> = ({
  active,
  payload,
  label,
  prefixo = '',
}) =>
  active && payload?.length ? (
    <div className="min-w-[170px] rounded-lg border border-ink-200 bg-white px-3 py-2 shadow-float">
      <p className="mb-1 text-[11px] text-ink-500">
        {prefixo}
        {label}
      </p>
      {payload
        .filter((p) => p.value !== undefined && p.value !== null)
        .map((p) => (
          <p key={String(p.dataKey)} className="flex items-center justify-between gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-ink-600">
              <span className="h-2 w-2 rounded-sm" style={{ background: p.color }} />
              {p.name}
            </span>
            <Dinheiro valor={Number(p.value)} className="font-medium text-ink-950" />
          </p>
        ))}
    </div>
  ) : null;


// O Dashboard só calcula a partir dos dados que o App.tsx já carregou (props) —
// nada de chamadas próprias à API (antes isso estourava o rate limit).
export const DashboardReal: React.FC<DashboardRealProps> = ({
  nfes,
  nfses,
  nfces,
  ctes,
  nfaes,
  mdfes,
  produtos,
  clientes,
  titulos,
  transportadoras = [],
  onNavigateDocumentosTipo,
  onNavigate,
}) => {
  const [visaoFaturamento, setVisaoFaturamento] = useState<'mes' | 'ano'>('mes');
  // Cores dos gráficos seguem o tema (Configurações → Aparência).
  const COR = useCoresTema();
  const eixo = { fontSize: 11, fill: COR.ink400 };

  const d = useMemo(() => {
    const hoje = new Date();
    const hoje0 = inicioDoDia(hoje);
    const diaHoje = hoje.getDate();

    const todas = [
      ...nfes.map((n) => ({ ...n, tipo: 'NFE' as TipoDoc, valor: paraNumero(n.vNF), num: n.numero, data: n.dhEmi || n.dataHoraEmissao })),
      ...nfses.map((n) => ({ ...n, tipo: 'NFSE' as TipoDoc, valor: paraNumero(n.valorTotalServicos), num: n.numeroNfse, data: n.dataHoraEmissao })),
      ...nfces.map((n) => ({ ...n, tipo: 'NFCE' as TipoDoc, valor: paraNumero(n.valorTotalNota), num: n.numero, data: n.dataHoraEmissao })),
      ...ctes.map((n) => ({ ...n, tipo: 'CTE' as TipoDoc, valor: paraNumero(n.vTPrest), num: n.nCT ?? n.numero, data: n.dhEmi || n.dataHoraEmissao })),
      ...nfaes.map((n) => ({ ...n, tipo: 'NFAE' as TipoDoc, valor: paraNumero(n.valorTotalNota), num: n.numero, data: n.dataHoraEmissao })),
      ...mdfes.map((n) => ({ ...n, tipo: 'MDFE' as TipoDoc, valor: paraNumero(n.vCarga), num: n.numero, data: n.dhEmi || n.dataHoraEmissao })),
    ]
      .map((n) => ({ ...n, dt: n.data ? new Date(n.data) : null, contraparte: nomeContraparte(n, n.tipo) }))
      .sort((a, b) => (b.dt?.getTime() ?? 0) - (a.dt?.getTime() ?? 0));

    // Receita = documentos autorizados, exceto MDF-e (valor de carga, não de venda).
    const receita = todas.filter((n) => n.status === 'AUTORIZADA' && n.tipo !== 'MDFE' && n.dt);
    const noPeriodo = (ini: Date, fim: Date) => receita.filter((n) => n.dt! >= ini && n.dt! < fim);
    const soma = (lista: { valor: number }[]) => lista.reduce((a, n) => a + n.valor, 0);
    const mesRel = (i: number) => new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);

    // --- Mês atual x anterior (acumulado por dia) ---
    const iniMes = mesRel(0);
    const iniMesAnt = mesRel(-1);
    const diasMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
    const diasMesAnt = new Date(hoje.getFullYear(), hoje.getMonth(), 0).getDate();
    const porDia = (ini: Date, dias: number) => {
      const arr = Array(dias).fill(0) as number[];
      for (const n of noPeriodo(ini, new Date(ini.getFullYear(), ini.getMonth() + 1, 1))) arr[n.dt!.getDate() - 1] += n.valor;
      return arr;
    };
    const diarioAtual = porDia(iniMes, diasMes);
    const diarioAnt = porDia(iniMesAnt, diasMesAnt);
    let acA = 0;
    let acB = 0;
    const acumulado = Array.from({ length: Math.max(diasMes, diasMesAnt) }, (_, i) => {
      if (i < diasMesAnt) acB += diarioAnt[i];
      if (i < diaHoje) acA += diarioAtual[i] ?? 0;
      return { dia: i + 1, atual: i < diaHoje ? acA : undefined, anterior: i < diasMesAnt ? acB : undefined };
    });
    const docsMes = noPeriodo(iniMes, mesRel(1));
    const faturamentoMes = soma(docsMes);
    const mesmoPeriodoAnt = diarioAnt.slice(0, diaHoje).reduce((a, v) => a + v, 0);
    const varMes = mesmoPeriodoAnt > 0 ? ((faturamentoMes - mesmoPeriodoAnt) / mesmoPeriodoAnt) * 100 : null;

    // --- 12 meses ---
    const doze = Array.from({ length: 12 }, (_, k) => {
      const i = k - 11;
      const ini = mesRel(i);
      return { mes: `${MESES[ini.getMonth()]}${ini.getMonth() === 0 ? `/${String(ini.getFullYear()).slice(2)}` : ''}`, valor: soma(noPeriodo(ini, mesRel(i + 1))), atual: i === 0 };
    });
    const faturamento12m = doze.reduce((a, m) => a + m.valor, 0);
    const dozeAnt = soma(noPeriodo(mesRel(-23), mesRel(-11)));
    const var12m = dozeAnt > 0 ? ((faturamento12m - dozeAnt) / dozeAnt) * 100 : null;

    // --- Ticket médio ---
    const ticketMes = docsMes.length ? faturamentoMes / docsMes.length : 0;
    const docsAnt = noPeriodo(iniMesAnt, iniMes);
    const ticketAnt = docsAnt.length ? soma(docsAnt) / docsAnt.length : 0;
    const varTicket = ticketAnt > 0 ? ((ticketMes - ticketAnt) / ticketAnt) * 100 : null;
    const ticketPorMes = Array.from({ length: 6 }, (_, k) => {
      const lista = noPeriodo(mesRel(k - 5), mesRel(k - 4));
      return lista.length ? soma(lista) / lista.length : 0;
    });

    // --- Títulos em aberto ---
    const abertos = titulos
      .filter((t) => t.status === 'PENDENTE' || t.status === 'VENCIDO')
      .map((t) => ({ tipo: t.tipo, valor: paraNumero(t.valorOriginal), venc: dataLocal(t.dataVencimento) }));
    const receber = abertos.filter((t) => t.tipo === 'RECEBER');
    const pagar = abertos.filter((t) => t.tipo === 'PAGAR');
    const total = (l: { valor: number }[]) => l.reduce((a, t) => a + t.valor, 0);
    const ate = (l: typeof abertos, dias: number) => l.filter((t) => t.venc && t.venc.getTime() - hoje0.getTime() < dias * DIA);
    const vencidoReceber = total(receber.filter((t) => t.venc && t.venc < hoje0));
    const pagar7 = total(ate(pagar, 8));
    const saldo30 = total(ate(receber, 31)) - total(ate(pagar, 31));

    // Aging de recebíveis
    const faixas = [
      { rotulo: 'Vencido há mais de 30 dias', min: -Infinity, max: -30, vencido: true },
      { rotulo: 'Vencido 1–30 dias', min: -30, max: 0, vencido: true },
      { rotulo: 'Vence em até 7 dias', min: 0, max: 8, vencido: false },
      { rotulo: 'Vence em 8–30 dias', min: 8, max: 31, vencido: false },
      { rotulo: 'Vence em 31–60 dias', min: 31, max: 61, vencido: false },
      { rotulo: 'Vence após 60 dias', min: 61, max: Infinity, vencido: false },
    ].map((f) => {
      const itens = receber.filter((t) => {
        if (!t.venc) return false;
        const dias = Math.round((t.venc.getTime() - hoje0.getTime()) / DIA);
        return dias >= f.min && dias < f.max;
      });
      return { ...f, valor: total(itens), qtd: itens.length };
    });

    // Fluxo de caixa: vencidos + 8 semanas a partir de hoje
    let saldoAc = 0;
    const fluxo = Array.from({ length: 9 }, (_, i) => {
      const ini = new Date(hoje0.getTime() + (i - 1) * 7 * DIA);
      const fim = new Date(hoje0.getTime() + i * 7 * DIA);
      const filtra = (l: typeof abertos) => l.filter((t) => t.venc && (i === 0 ? t.venc < hoje0 : t.venc >= ini && t.venc < fim));
      const entradas = total(filtra(receber));
      const saidas = total(filtra(pagar));
      saldoAc += entradas - saidas;
      return {
        semana: i === 0 ? 'Vencidos' : `${String(ini.getDate()).padStart(2, '0')}/${String(ini.getMonth() + 1).padStart(2, '0')}`,
        entradas,
        saidas: -saidas,
        saldo: saldoAc,
      };
    });

    // Maiores clientes (12 meses de receita; consumidor anônimo e CT-e ficam de fora)
    const iniDoze = mesRel(-11);
    const porCliente = new Map<string, number>();
    for (const n of receita) {
      if (n.dt! < iniDoze || n.tipo === 'CTE' || /não informado|Consumidor final/i.test(n.contraparte)) continue;
      porCliente.set(n.contraparte, (porCliente.get(n.contraparte) ?? 0) + n.valor);
    }
    const topClientes = [...porCliente.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([nome, valor]) => ({ nome, valor, share: faturamento12m ? (valor / faturamento12m) * 100 : 0 }));
    const concentracao = topClientes.reduce((a, c) => a + c.share, 0);

    // Mix por tipo
    const mix = (Object.keys(ROTULO_TIPO) as TipoDoc[])
      .map((tipo) => {
        const docs = todas.filter((n) => n.tipo === tipo);
        return { tipo, qtd: docs.length, valor: docs.filter((n) => n.status === 'AUTORIZADA').reduce((a, n) => a + n.valor, 0) };
      })
      .filter((m) => m.qtd > 0);

    return {
      todas,
      mesAnteriorRotulo: `${MESES[iniMesAnt.getMonth()]}.`,
      faturamentoMes,
      varMes,
      diarioAtual: diarioAtual.slice(0, diaHoje),
      acumulado,
      doze,
      faturamento12m,
      var12m,
      ticketMes,
      varTicket,
      ticketPorMes,
      aReceber: total(receber),
      qtdReceber: receber.length,
      vencidoReceber,
      aPagar: total(pagar),
      qtdPagar: pagar.length,
      pagar7,
      saldo30,
      faixas,
      fluxo,
      topClientes,
      concentracao,
      mix,
      status: {
        autorizadas: todas.filter((n) => n.status === 'AUTORIZADA').length,
        processando: todas.filter((n) => n.status === 'PROCESSANDO' || n.status === 'RASCUNHO').length,
        rejeitadas: todas.filter((n) => n.status === 'REJEITADA' || n.status === 'DENEGADA').length,
        canceladas: todas.filter((n) => n.status === 'CANCELADA').length,
      },
      cadastros: {
        clientes: clientes.filter((c) => c.tipo === 'CLIENTE' || c.tipo === 'AMBOS').length,
        fornecedores: clientes.filter((c) => c.tipo === 'FORNECEDOR' || c.tipo === 'AMBOS').length,
        produtos: produtos.filter((p) => p.ativo !== false).length,
        transportadoras: transportadoras.length,
      },
    };
  }, [nfes, nfses, nfces, ctes, nfaes, mdfes, produtos, clientes, titulos, transportadoras]);

  const totalStatus = d.status.autorizadas + d.status.processando + d.status.rejeitadas + d.status.canceladas;
  const maxFaixa = Math.max(1, ...d.faixas.map((f) => f.valor));
  const totalMix = Math.max(1, d.mix.filter((m) => m.tipo !== 'MDFE').reduce((a, m) => a + m.valor, 0));
  const segStatus = [
    { rotulo: 'Autorizadas', qtd: d.status.autorizadas, cor: 'bg-brand-700' },
    { rotulo: 'Processando', qtd: d.status.processando, cor: 'bg-brand-300' },
    { rotulo: 'Rejeitadas', qtd: d.status.rejeitadas, cor: 'bg-ink-600' },
    { rotulo: 'Canceladas', qtd: d.status.canceladas, cor: 'bg-ink-300' },
  ];

  const acumuladoMes = d.diarioAtual.reduce<number[]>((ac, v) => [...ac, (ac[ac.length - 1] ?? 0) + v], []);

  const kpis: Array<{ rotulo: string; valor: React.ReactNode; rodape: React.ReactNode; spark?: number[]; destino?: string; destaque?: boolean }> = [
    {
      rotulo: 'Faturamento no mês',
      valor: <Dinheiro valor={d.faturamentoMes} />,
      rodape: (
        <>
          <Variacao valor={d.varMes} /> {d.varMes !== null && <span title="Comparado ao mesmo período do mês anterior">vs. {d.mesAnteriorRotulo}</span>}
        </>
      ),
      spark: acumuladoMes,
      destaque: true,
    },
    {
      rotulo: 'Últimos 12 meses',
      valor: <Dinheiro valor={d.faturamento12m} />,
      rodape: (
        <>
          <Variacao valor={d.var12m} /> {d.var12m !== null && <span>vs. 12m anteriores</span>}
        </>
      ),
      spark: d.doze.map((m) => m.valor),
    },
    {
      rotulo: 'Ticket médio',
      valor: <Dinheiro valor={d.ticketMes} />,
      rodape: (
        <>
          <Variacao valor={d.varTicket} /> {d.varTicket !== null && <span>vs. mês anterior</span>}
        </>
      ),
      spark: d.ticketPorMes,
    },
    {
      rotulo: 'A receber',
      valor: <Dinheiro valor={d.aReceber} />,
      rodape:
        d.vencidoReceber > 0 ? (
          <span>
            <Dinheiro valor={d.vencidoReceber} className="font-medium text-ink-800" /> vencido
          </span>
        ) : (
          <span>{d.qtdReceber} títulos · nada vencido</span>
        ),
      spark: d.fluxo.slice(1).map((f) => f.entradas),
      destino: 'financeiro',
    },
    {
      rotulo: 'A pagar',
      valor: <Dinheiro valor={d.aPagar} />,
      rodape: (
        <span>
          <Dinheiro valor={d.pagar7} className="font-medium text-ink-800" /> em 7 dias
        </span>
      ),
      spark: d.fluxo.slice(1).map((f) => -f.saidas),
      destino: 'financeiro',
    },
    {
      rotulo: 'Saldo projetado 30d',
      valor: <Dinheiro valor={d.saldo30} className={d.saldo30 >= 0 ? 'text-brand-700' : 'text-ink-950'} />,
      rodape: <span>receber − pagar em 30 dias</span>,
      spark: d.fluxo.map((f) => f.saldo),
      destino: 'financeiro',
    },
  ];

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      {/* ===== Faixa de indicadores ===== */}
      <section className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-ink-200/80 bg-ink-100 shadow-card md:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k, i) => {
          const conteudo = (
            <>
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.07em] text-ink-500">{k.rotulo}</p>
              <p className={`mt-1.5 truncate font-display text-[21px] font-bold leading-tight tracking-[-0.02em] ${k.destaque ? 'text-brand-700' : 'text-ink-950'}`}>
                {k.valor}
              </p>
              <div className="mt-1">{k.spark ? <Sparkline dados={k.spark} id={`k${i}`} cor={COR.brand500} /> : <div className="h-8" />}</div>
              <p className="mt-1 flex min-w-0 items-center gap-1.5 truncate text-[11px] text-ink-500">{k.rodape}</p>
            </>
          );
          return k.destino ? (
            <button key={k.rotulo} onClick={() => onNavigate(k.destino!)} className="min-w-0 cursor-pointer bg-white p-4 text-left transition-colors hover:bg-ink-50">
              {conteudo}
            </button>
          ) : (
            <div key={k.rotulo} className="min-w-0 bg-white p-4">
              {conteudo}
            </div>
          );
        })}
      </section>

      {/* ===== Faturamento + recebíveis ===== */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Cartao
          className="xl:col-span-8"
          titulo={visaoFaturamento === 'mes' ? 'Faturamento acumulado no mês' : 'Faturamento mensal'}
          subtitulo={
            visaoFaturamento === 'mes' ? (
              <>
                Mês atual <Dinheiro valor={d.faturamentoMes} className="font-medium text-ink-800" /> contra o mês anterior · documentos autorizados
              </>
            ) : (
              <>
                12 meses <Dinheiro valor={d.faturamento12m} className="font-medium text-ink-800" /> · média{' '}
                <Dinheiro valor={d.faturamento12m / 12} className="font-medium text-ink-800" />
              </>
            )
          }
          acao={
            <div className="flex shrink-0 rounded-lg bg-ink-100 p-0.5 text-[11px] font-medium" role="tablist">
              {(
                [
                  ['mes', 'Mês'],
                  ['ano', '12 meses'],
                ] as const
              ).map(([id, rotulo]) => (
                <button
                  key={id}
                  role="tab"
                  aria-selected={visaoFaturamento === id}
                  onClick={() => setVisaoFaturamento(id)}
                  className={`cursor-pointer rounded-md px-2.5 py-1 transition-colors ${visaoFaturamento === id ? 'bg-white text-ink-950 shadow-card' : 'text-ink-500 hover:text-ink-800'}`}
                >
                  {rotulo}
                </button>
              ))}
            </div>
          }
        >
          <div className="h-[260px] px-1 pb-1 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {visaoFaturamento === 'mes' ? (
                <AreaChart data={d.acumulado} margin={{ top: 6, right: 16, left: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gAtual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor={COR.brand500} stopOpacity={0.22} />
                      <stop offset="1" stopColor={COR.brand500} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={COR.ink100} vertical={false} />
                  <XAxis dataKey="dia" tick={eixo} axisLine={false} tickLine={false} interval={4} />
                  <YAxis tickFormatter={compacto} tick={eixo} axisLine={false} tickLine={false} width={64} />
                  <Tooltip content={<TooltipValores prefixo="Dia " />} cursor={{ stroke: COR.ink300, strokeDasharray: '3 3' }} />
                  <Area type="monotone" dataKey="anterior" name="Mês anterior" stroke={COR.ink400} strokeDasharray="4 4" strokeWidth={1.5} fill="none" dot={false} />
                  <Area type="monotone" dataKey="atual" name="Mês atual" stroke={COR.brand700} strokeWidth={2} fill="url(#gAtual)" dot={false} activeDot={{ r: 4 }} />
                </AreaChart>
              ) : (
                <BarChart data={d.doze} margin={{ top: 6, right: 16, left: 4, bottom: 0 }} barCategoryGap="22%">
                  <CartesianGrid stroke={COR.ink100} vertical={false} />
                  <XAxis dataKey="mes" tick={eixo} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={compacto} tick={eixo} axisLine={false} tickLine={false} width={64} />
                  <Tooltip content={<TooltipValores />} cursor={{ fill: COR.ink100 }} />
                  <ReferenceLine y={d.faturamento12m / 12} stroke={COR.ink400} strokeDasharray="4 4" />
                  <Bar dataKey="valor" name="Faturamento" radius={[4, 4, 0, 0]}>
                    {d.doze.map((m, i) => (
                      <Cell key={i} fill={m.atual ? COR.brand700 : COR.brand200} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 border-t border-ink-100 px-4 py-2 text-[11px] text-ink-500">
            <span className="flex items-center gap-1.5">
              <span className={visaoFaturamento === 'mes' ? 'h-0.5 w-4 rounded bg-brand-700' : 'h-2 w-2 rounded-sm bg-brand-700'} /> Mês atual
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-0 w-4 border-t border-dashed border-ink-400" /> {visaoFaturamento === 'mes' ? 'Mês anterior' : 'Média mensal'}
            </span>
          </div>
        </Cartao>

        <Cartao
          className="xl:col-span-4"
          titulo="Recebíveis por vencimento"
          subtitulo={
            <>
              <Dinheiro valor={d.aReceber} className="font-medium text-ink-800" /> em {d.qtdReceber} títulos em aberto
            </>
          }
          acao={
            <button onClick={() => onNavigate('financeiro')} className="cursor-pointer text-[11px] font-medium text-brand-700 hover:text-brand-800">
              Abrir
            </button>
          }
        >
          <ul className="flex-1 space-y-3 px-4 pb-4 pt-3">
            {d.faixas.map((f, i) => (
              <li key={f.rotulo}>
                <div className="flex items-baseline justify-between gap-2 text-xs">
                  <span className={f.vencido ? 'font-medium text-ink-800' : 'text-ink-600'}>{f.rotulo}</span>
                  <span className="flex items-baseline gap-2">
                    <span className="font-mono text-[10px] text-ink-400">{f.qtd}</span>
                    <Dinheiro valor={f.valor} className="font-medium text-ink-900" />
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink-100">
                  <div
                    className={`h-full rounded-full ${f.vencido ? 'bg-ink-700' : 'bg-brand-500'}`}
                    style={{ width: `${(f.valor / maxFaixa) * 100}%`, opacity: f.vencido ? 1 : 1 - (i - 2) * 0.15 }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Cartao>
      </div>

      {/* ===== Fluxo de caixa + maiores clientes ===== */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Cartao
          className="xl:col-span-8"
          titulo="Fluxo de caixa projetado"
          subtitulo={
            <>
              Títulos em aberto por semana de vencimento · a pagar <Dinheiro valor={d.aPagar} className="font-medium text-ink-800" /> em {d.qtdPagar} títulos
            </>
          }
          acao={
            <div className="hidden shrink-0 items-center gap-3 text-[11px] text-ink-500 sm:flex">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-brand-500" /> Entradas
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-ink-300" /> Saídas
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-0.5 w-3 rounded bg-ink-900" /> Saldo
              </span>
            </div>
          }
        >
          <div className="h-[240px] px-1 pb-2 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={d.fluxo} margin={{ top: 6, right: 16, left: 4, bottom: 0 }} stackOffset="sign" barCategoryGap="26%">
                <CartesianGrid stroke={COR.ink100} vertical={false} />
                <XAxis dataKey="semana" tick={eixo} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={compacto} tick={eixo} axisLine={false} tickLine={false} width={64} />
                <ReferenceLine y={0} stroke={COR.ink300} />
                <Tooltip content={<TooltipValores prefixo="Semana de " />} cursor={{ fill: COR.ink100 }} />
                <Bar dataKey="entradas" name="Entradas" stackId="f" fill={COR.brand500} radius={[3, 3, 0, 0]} />
                <Bar dataKey="saidas" name="Saídas" stackId="f" fill={COR.ink300} radius={[3, 3, 0, 0]} />
                <Line type="monotone" dataKey="saldo" name="Saldo acumulado" stroke={COR.ink900} strokeWidth={1.75} dot={{ r: 2.5, fill: COR.ink900 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Cartao>

        <Cartao
          className="xl:col-span-4"
          titulo="Maiores clientes"
          subtitulo={
            d.topClientes.length ? (
              <>
                Top {d.topClientes.length} = <span className="font-medium text-ink-800">{pct(d.concentracao)}</span> do faturamento em 12 meses
              </>
            ) : (
              'Últimos 12 meses'
            )
          }
        >
          <ol className="flex-1 px-2 pb-3 pt-2">
            {d.topClientes.length === 0 && <li className="px-2 py-6 text-center text-xs text-ink-400">Sem faturamento identificado por cliente.</li>}
            {d.topClientes.map((c, i) => (
              <li key={c.nome} className="rounded-lg px-2 py-2">
                <div className="flex items-center gap-2.5 text-xs">
                  <span className="w-4 font-mono text-[10px] text-ink-400">{i + 1}</span>
                  <span className="min-w-0 flex-1 truncate font-medium text-ink-800" title={c.nome}>
                    {c.nome}
                  </span>
                  <Dinheiro valor={c.valor} className="text-ink-900" />
                </div>
                <div className="ml-[26px] mt-1.5 flex items-center gap-2">
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-ink-100">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.min(100, c.share)}%` }} />
                  </div>
                  <span className="w-11 text-right font-mono text-[10px] text-ink-500">{pct(c.share)}</span>
                </div>
              </li>
            ))}
          </ol>
        </Cartao>
      </div>

      {/* ===== Últimos documentos + mix ===== */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Cartao
          className="xl:col-span-8"
          titulo="Últimos documentos"
          acao={
            <button onClick={() => onNavigate('documentos-fiscais')} className="flex cursor-pointer items-center gap-1 text-[11px] font-medium text-brand-700 hover:text-brand-800">
              Ver todos <ArrowRight className="h-3 w-3" />
            </button>
          }
        >
          {d.todas.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-ink-400">
              <FileText className="mx-auto mb-2 h-7 w-7 text-ink-300" />
              Nenhum documento emitido ainda.
            </div>
          ) : (
            <div className="overflow-x-auto px-1 pb-1">
              <table className="w-full min-w-[560px] text-left text-xs">
                <thead>
                  <tr className="text-[10px] uppercase tracking-[0.06em] text-ink-400">
                    <th className="px-3 py-2 font-medium">Doc.</th>
                    <th className="px-3 py-2 font-medium">Nº</th>
                    <th className="px-3 py-2 font-medium">Contraparte</th>
                    <th className="px-3 py-2 font-medium">Emissão</th>
                    <th className="px-3 py-2 text-right font-medium">Valor</th>
                    <th className="px-3 py-2 font-medium">Situação</th>
                  </tr>
                </thead>
                <tbody>
                  {d.todas.slice(0, 8).map((doc) => {
                    const cancelada = doc.status === 'CANCELADA';
                    const autorizada = doc.status === 'AUTORIZADA';
                    const status = doc.status ? doc.status.charAt(0) + doc.status.slice(1).toLowerCase() : 'Sem status';
                    return (
                      <tr key={`${doc.tipo}-${doc.id}`} className="border-t border-ink-100 transition-colors hover:bg-ink-50/70">
                        <td className="whitespace-nowrap px-3 py-2 font-mono text-[10px] text-ink-500">{ROTULO_TIPO[doc.tipo]}</td>
                        <td className="whitespace-nowrap px-3 py-2 font-mono text-ink-800">{doc.num ?? 's/n'}</td>
                        <td className="max-w-[240px] truncate px-3 py-2 text-ink-700" title={doc.contraparte}>
                          {doc.contraparte}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 font-mono text-[11px] text-ink-500">
                          {doc.dt ? `${doc.dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} ${doc.dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : 's/ data'}
                        </td>
                        <td className={`whitespace-nowrap px-3 py-2 text-right ${cancelada ? 'text-ink-400 line-through' : 'font-medium text-ink-900'}`}>
                          <Dinheiro valor={doc.valor} />
                        </td>
                        <td className="whitespace-nowrap px-3 py-2">
                          <span className={`inline-flex items-center gap-1.5 ${autorizada ? 'text-brand-700' : 'text-ink-500'}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${autorizada ? 'bg-brand-600' : cancelada ? 'bg-ink-300' : 'bg-ink-500'}`} />
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Cartao>

        <Cartao className="xl:col-span-4" titulo="Mix de documentos" subtitulo={`${totalStatus} emitidos · valores dos autorizados`}>
          <div className="px-4 pt-3">
            <div className="flex h-2 overflow-hidden rounded-full bg-ink-100">
              {segStatus.map(
                (s) => s.qtd > 0 && <div key={s.rotulo} className={s.cor} style={{ width: `${(s.qtd / Math.max(1, totalStatus)) * 100}%` }} title={`${s.rotulo}: ${s.qtd}`} />,
              )}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
              {segStatus.map((s) => (
                <span key={s.rotulo} className="flex items-center justify-between text-ink-500">
                  <span className="flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${s.cor}`} />
                    {s.rotulo}
                  </span>
                  <span className="font-mono text-ink-800">{s.qtd}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="px-2 pt-3">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[10px] uppercase tracking-[0.06em] text-ink-400">
                  <th className="px-2 py-1.5 text-left font-medium">Tipo</th>
                  <th className="px-2 py-1.5 text-right font-medium">Qtd</th>
                  <th className="px-2 py-1.5 text-right font-medium">Valor</th>
                  <th className="px-2 py-1.5 text-right font-medium">%</th>
                </tr>
              </thead>
              <tbody>
                {d.mix.map((m) => (
                  <tr
                    key={m.tipo}
                    onClick={() => onNavigateDocumentosTipo?.(m.tipo as TipoDocumentoFiltro)}
                    className="cursor-pointer border-t border-ink-100 hover:bg-ink-50"
                    title={`Ver documentos ${ROTULO_TIPO[m.tipo]}`}
                  >
                    <td className="whitespace-nowrap px-2 py-1.5 font-medium text-ink-800">{ROTULO_TIPO[m.tipo]}</td>
                    <td className="px-2 py-1.5 text-right font-mono text-ink-600">{m.qtd}</td>
                    <td className="whitespace-nowrap px-2 py-1.5 text-right text-ink-900">
                      {m.tipo === 'MDFE' ? <span className="text-[11px] text-ink-400">valor de carga</span> : <Dinheiro valor={m.valor} />}
                    </td>
                    <td className="px-2 py-1.5 text-right font-mono text-[11px] text-ink-500">{m.tipo === 'MDFE' ? '' : pct((m.valor / totalMix) * 100)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-auto grid grid-cols-4 divide-x divide-ink-100 border-t border-ink-100">
            {[
              { id: 'clientes', rotulo: 'Clientes', qtd: d.cadastros.clientes },
              { id: 'fornecedores', rotulo: 'Fornec.', qtd: d.cadastros.fornecedores },
              { id: 'produtos', rotulo: 'Produtos', qtd: d.cadastros.produtos },
              { id: 'transportadoras', rotulo: 'Transp.', qtd: d.cadastros.transportadoras },
            ].map((c) => (
              <button key={c.id} onClick={() => onNavigate(c.id)} className="cursor-pointer px-2 py-2.5 text-center transition-colors hover:bg-ink-50">
                <p className="font-display text-base font-bold tabular-nums text-ink-950">{c.qtd}</p>
                <p className="text-[10px] text-ink-500">{c.rotulo}</p>
              </button>
            ))}
          </div>
        </Cartao>
      </div>
    </div>
  );
};
