// src/components/landing/LandingPageView.tsx
// Landing pública — direção visual "Livro-razão": fundo claro quente, verde-petróleo
// como cor de marca, cor reservada a estado (status de nota) e o produto real como
// protagonista do hero. Tokens em src/index.css (@theme).
import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, MotionConfig, type Variants } from 'framer-motion';
import {
  ArrowRight,
  Ban,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronDown,
  Clock,
  CloudOff,
  FileArchive,
  FileBadge2,
  FileText,
  Landmark,
  Lock,
  LogIn,
  Mail,
  Package,
  QrCode,
  Receipt,
  Search,
  Send,
  ShieldCheck,
  ShoppingBag,
  Truck,
  UserCheck,
  UserPlus,
  XCircle,
} from 'lucide-react';
import { ConfiguracaoEmpresa } from '../../types/erp';

interface LandingPageViewProps {
  // Mantido por compatibilidade com o App; a landing mostra só dados da SUP Tecnologia,
  // nunca os da empresa (cliente) configurada no sistema.
  empresa?: ConfiguracaoEmpresa;
  onGoToLogin: () => void;
}

const NAV_ITEMS = [
  { id: 'fiscal', label: 'Fiscal' },
  { id: 'fluxo', label: 'Como funciona' },
  { id: 'gestao', label: 'Gestão & Financeiro' },
  { id: 'contadores', label: 'Contadores' },
  { id: 'duvidas', label: 'Dúvidas' },
] as const;

// === Status de documento fiscal (mesmos tokens nf-* usados no app) ===
type StatusNota = 'autorizada' | 'rejeitada' | 'cancelada' | 'pendente' | 'contingencia';

const STATUS_NOTA: Record<StatusNota, { label: string; icon: typeof CheckCircle2; className: string }> = {
  autorizada: { label: 'Autorizada', icon: CheckCircle2, className: 'bg-nf-autorizada-bg text-nf-autorizada' },
  rejeitada: { label: 'Rejeitada', icon: XCircle, className: 'bg-nf-rejeitada-bg text-nf-rejeitada' },
  cancelada: { label: 'Cancelada', icon: Ban, className: 'bg-nf-cancelada-bg text-nf-cancelada' },
  pendente: { label: 'Processando', icon: Clock, className: 'bg-nf-pendente-bg text-nf-pendente' },
  contingencia: { label: 'Contingência', icon: CloudOff, className: 'bg-nf-contingencia-bg text-nf-contingencia' },
};

const StatusBadge: React.FC<{ status: StatusNota }> = ({ status }) => {
  const s = STATUS_NOTA[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${s.className}`}>
      <s.icon className="h-3 w-3" aria-hidden />
      {s.label}
    </span>
  );
};

// === Dados ilustrativos do mockup do hero ===
interface LinhaNota {
  numero: string;
  tipo: string;
  cliente: string;
  valor: string;
  status: StatusNota;
}

const NOTAS_BASE: LinhaNota[] = [
  { numero: '004.812', tipo: 'NF-e', cliente: 'Distribuidora Paraná Ltda', valor: '12.480,00', status: 'autorizada' },
  { numero: '000.391', tipo: 'NFS-e', cliente: 'Clínica Bem Viver', valor: '3.250,00', status: 'autorizada' },
  { numero: '018.204', tipo: 'NFC-e', cliente: 'Consumidor final', valor: '186,90', status: 'contingencia' },
  { numero: '004.811', tipo: 'NF-e', cliente: 'Mercado Bom Preço', valor: '7.912,40', status: 'rejeitada' },
  { numero: '000.127', tipo: 'CT-e', cliente: 'Transportes Rota Sul', valor: '2.140,00', status: 'cancelada' },
];

const NOTAS_NOVAS: LinhaNota[] = [
  { numero: '004.813', tipo: 'NF-e', cliente: 'Atacadão Serra Verde', valor: '9.364,20', status: 'autorizada' },
  { numero: '000.392', tipo: 'NFS-e', cliente: 'Escritório Lima & Costa', valor: '1.800,00', status: 'autorizada' },
  { numero: '018.205', tipo: 'NFC-e', cliente: 'Consumidor final', valor: '74,50', status: 'autorizada' },
  { numero: '004.814', tipo: 'NF-e', cliente: 'Ferragens Horizonte', valor: '4.205,75', status: 'autorizada' },
];

// Passos que o sistema executa sozinho depois que a nota é autorizada.
const PASSOS_AUTOMACAO: Array<{
  id: string;
  titulo: string;
  icon: typeof Receipt;
  detalhe: (c: { nota: LinhaNota; itens: number }) => string;
}> = [
  { id: 'sefaz', titulo: 'Autorizada pela SEFAZ', icon: CheckCircle2, detalhe: () => 'Protocolo recebido em 312 ms' },
  { id: 'danfe', titulo: 'DANFE e XML armazenados', icon: FileText, detalhe: () => 'PDF e XML assinado guardados no sistema' },
  { id: 'estoque', titulo: 'Estoque atualizado', icon: Package, detalhe: (c) => `${c.itens} itens baixados automaticamente` },
  { id: 'receber', titulo: 'Lançado em contas a receber', icon: Landmark, detalhe: (c) => `R$ ${c.nota.valor} · vence em 28 dias` },
  { id: 'pix', titulo: 'Cobrança Pix pronta', icon: QrCode, detalhe: () => 'QR Code disponível no título' },
  { id: 'contador', titulo: 'XML enviado ao contador', icon: Send, detalhe: () => 'Para o e-mail do escritório contábil' },
];

const paraNumero = (valor: string) => Number(valor.replace(/\./g, '').replace(',', '.'));
const formatarReais = (valor: number) => valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const FATURAMENTO_SERIE = [38, 44, 41, 52, 49, 58, 63, 60, 71, 69, 78, 86];

const FLUXO = [
  { icon: Receipt, titulo: 'Emitiu', desc: 'Nota assinada com seu certificado A1 e autorizada pela SEFAZ em segundos.' },
  { icon: Package, titulo: 'Estoque', desc: 'Cada item da nota dá baixa automática no saldo do produto.' },
  { icon: Landmark, titulo: 'Financeiro', desc: 'O título a receber nasce junto com a nota, pronto para cobrança Pix.' },
  { icon: Send, titulo: 'Contador', desc: 'XML enviado automaticamente para o escritório contábil.' },
] as const;

// Imagens reais: geradas pelos próprios componentes de layout do sistema (DanfeLayout,
// DanfseLayout, DanfceLayout, DacteLayout) com dados fictícios — ver scripts/landing-shots.
const DOCUMENTOS_REAIS = [
  {
    id: 'nfe',
    nome: 'NF-e',
    documento: 'DANFE',
    modelo: 'Mod. 55',
    img: '/landing/danfe.webp',
    largura: 'max-w-[720px]',
    desc: 'Venda de mercadorias com ICMS, PIS e COFINS calculados item a item, duplicatas e chave de acesso com código de barras.',
    destaques: ['5 itens · CFOP 5102', 'ICMS R$ 1.019,70', '3 duplicatas'],
  },
  {
    id: 'nfse',
    nome: 'NFS-e',
    documento: 'DANFSE',
    modelo: 'Nacional',
    img: '/landing/danfse.webp',
    largura: 'max-w-[720px]',
    desc: 'Padrão Nacional da Receita Federal, com ISS, retenções federais, QR Code de consulta e os campos de IBS/CBS.',
    destaques: ['ISS 2%', 'Retenções R$ 519,68', 'IBS/CBS informativo'],
  },
  {
    id: 'nfce',
    nome: 'NFC-e',
    documento: 'DANFCE',
    modelo: 'Mod. 65',
    img: '/landing/danfce.webp',
    largura: 'max-w-[340px]',
    desc: 'Cupom para consumidor final em formato de bobina, com QR Code da SEFAZ, forma de pagamento e troco.',
    destaques: ['7 itens', 'QR Code SEFAZ', 'Troco calculado'],
  },
  {
    id: 'cte',
    nome: 'CT-e',
    documento: 'DACTE',
    modelo: 'Mod. 57',
    img: '/landing/dacte.webp',
    largura: 'max-w-[820px]',
    desc: 'Conhecimento de transporte com componentes do frete, ICMS da prestação e as NF-e transportadas.',
    destaques: ['São Paulo → Porto Alegre', 'Frete R$ 2.350,00', '2 NF-e vinculadas'],
  },
  {
    id: 'nfae',
    nome: 'NFA-e',
    documento: 'DANFA-e',
    modelo: 'Avulsa',
    img: '/landing/danfae.webp',
    largura: 'max-w-[720px]',
    desc: 'Nota avulsa para quem não tem inscrição ativa — como o produtor rural — com ICMS recolhido via DAE vinculado.',
    destaques: ['Produtor rural', 'ICMS via DAE', 'Série 890'],
  },
  {
    id: 'mdfe',
    nome: 'MDF-e',
    documento: 'DAMDFE',
    modelo: 'Mod. 58',
    img: '/landing/damdfe.webp',
    largura: 'max-w-[720px]',
    desc: 'Manifesto que reúne os documentos da viagem, com percurso entre UFs, seguro da carga e lacres.',
    destaques: ['Percurso SP → PR → SC → RS', '1.840,5 kg de carga', 'Seguro e lacres'],
  },
] as const;

// Telas reais do app, capturadas com a API simulada e dados fictícios.
const TELAS_SISTEMA = [
  { id: 'dashboard', rotulo: 'Painel', img: '/landing/app-dashboard.webp' },
  { id: 'emissor', rotulo: 'Emissão de NF-e', img: '/landing/app-emissor.webp' },
  { id: 'documentos', rotulo: 'Documentos emitidos', img: '/landing/app-documentos.webp' },
  { id: 'financeiro', rotulo: 'Financeiro', img: '/landing/app-financeiro.webp' },
  { id: 'pix', rotulo: 'Cobrança Pix', img: '/landing/app-pix.webp' },
] as const;

const MODULOS_GESTAO = [
  { icon: Package, nome: 'Produtos e estoque', desc: 'NCM, GTIN e baixa automática por faturamento.' },
  { icon: Briefcase, nome: 'Serviços', desc: 'Código de tributação nacional/municipal e alíquotas.' },
  { icon: UserPlus, nome: 'Clientes', desc: 'Endereço, IE e indicador de contribuinte.' },
  { icon: UserCheck, nome: 'Fornecedores', desc: 'A mesma base, no papel de fornecedor.' },
  { icon: Truck, nome: 'Transportadoras', desc: 'RNTRC e dados usados no CT-e e no MDF-e.' },
  { icon: Search, nome: 'Consulta CNPJ', desc: 'Preenche cadastros a partir da base pública.' },
  { icon: Landmark, nome: 'Contas a pagar e receber', desc: 'Títulos lançados a partir das notas emitidas.' },
  { icon: QrCode, nome: 'Cobrança Pix', desc: 'Cobrança no padrão BACEN gerada direto do título.' },
] as const;

// Itens da faixa em marquee logo abaixo do hero.
const FAIXA_CONFORMIDADE = [
  { icon: Building2, label: 'SEFAZ de todos os estados' },
  { icon: FileText, label: 'NFS-e no Padrão Nacional' },
  { icon: ShieldCheck, label: 'Assinatura ICP-Brasil A1' },
  { icon: Lock, label: 'Certificado com AES-256-GCM' },
  { icon: Landmark, label: 'Reforma Tributária: IBS e CBS' },
  { icon: Receipt, label: 'NF-e · NFS-e · NFC-e · CT-e · NFA-e · MDF-e' },
  { icon: QrCode, label: 'Cobrança Pix padrão BACEN' },
  { icon: Send, label: 'XML automático para o contador' },
  { icon: CloudOff, label: 'NFC-e em contingência offline' },
] as const;

// Dados institucionais da SUP (rodapé). Nunca usar os dados da empresa configurada no
// sistema aqui — essa é a empresa do cliente.
const SUP_EMPRESA = {
  razaoSocial: 'SUP SOLUCOES TECNOLOGICAS LTDA',
  nomeFantasia: 'SUP Tecnologia',
  cnpj: '29.535.022/0001-38',
} as const;

const RODAPE_COLUNAS = [
  {
    titulo: 'Fiscal',
    links: [
      { label: 'NF-e', alvo: 'fiscal' },
      { label: 'NFS-e', alvo: 'fiscal' },
      { label: 'NFC-e', alvo: 'fiscal' },
      { label: 'CT-e e MDF-e', alvo: 'fiscal' },
      { label: 'NFA-e', alvo: 'fiscal' },
    ],
  },
  {
    titulo: 'Gestão',
    links: [
      { label: 'Produtos e estoque', alvo: 'gestao' },
      { label: 'Clientes e fornecedores', alvo: 'gestao' },
      { label: 'Contas a pagar e receber', alvo: 'gestao' },
      { label: 'Cobrança Pix', alvo: 'gestao' },
    ],
  },
  {
    titulo: 'Conheça',
    links: [
      { label: 'Como funciona', alvo: 'fluxo' },
      { label: 'Para contadores', alvo: 'contadores' },
      { label: 'Dúvidas frequentes', alvo: 'duvidas' },
    ],
  },
] as const;

const FAQ = [
  {
    p: 'Preciso de certificado digital?',
    r: 'Sim, um certificado A1 (ICP-Brasil). Você faz o upload uma vez; ele fica armazenado com criptografia AES-256-GCM e o sistema avisa antes do vencimento.',
  },
  {
    p: 'Quais documentos fiscais posso emitir?',
    r: 'NF-e (modelo 55), NFS-e no padrão nacional, NFC-e (modelo 65), CT-e (modelo 57), NFA-e e MDF-e — todos no mesmo painel.',
  },
  {
    p: 'O sistema já está preparado para a Reforma Tributária?',
    r: 'Sim. Os emissores já trazem os campos de IBS e CBS previstos para a transição que começa em 2026.',
  },
  {
    p: 'Meu contador recebe os arquivos?',
    r: 'Recebe. Os XMLs das notas emitidas são enviados automaticamente para o e-mail do escritório contábil cadastrado.',
  },
  {
    p: 'E se a SEFAZ estiver fora do ar na hora da venda?',
    r: 'A NFC-e pode ser emitida em contingência offline e é transmitida assim que a SEFAZ volta a responder.',
  },
] as const;

// Variants curtas (sem spring/bounce), executadas uma única vez por elemento.
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const inView = { initial: 'hidden', whileInView: 'visible', viewport: { once: true, amount: 0.25 } } as const;

const SectionHeader: React.FC<{ numero: string; rotulo: string; titulo: string; descricao: string; escuro?: boolean }> = ({
  numero,
  rotulo,
  titulo,
  descricao,
  escuro,
}) => (
  <motion.div variants={stagger} {...inView} className="max-w-2xl">
    <motion.p variants={fadeUp} className={`flex items-center gap-3 text-sm font-medium ${escuro ? 'text-accent-300' : 'text-brand-700'}`}>
      <span className="font-mono text-xs">{numero}</span>
      <span className={`h-px w-8 ${escuro ? 'bg-accent-300/40' : 'bg-brand-700/30'}`} />
      {rotulo}
    </motion.p>
    <motion.h2
      variants={fadeUp}
      className={`mt-4 font-display text-3xl font-bold tracking-[-0.02em] sm:text-4xl ${escuro ? 'text-white' : 'text-ink-950'}`}
    >
      {titulo}
    </motion.h2>
    <motion.p variants={fadeUp} className={`mt-4 text-base leading-relaxed sm:text-lg ${escuro ? 'text-brand-100/80' : 'text-ink-500'}`}>
      {descricao}
    </motion.p>
  </motion.div>
);

// Gera o path de área/linha do mini gráfico de faturamento (SVG puro, sem lib).
function caminhoSerie(valores: number[], largura: number, altura: number) {
  const max = Math.max(...valores);
  const min = Math.min(...valores) * 0.8;
  const passo = largura / (valores.length - 1);
  const pontos = valores.map((v, i) => [i * passo, altura - ((v - min) / (max - min)) * (altura - 6) - 3] as const);
  const linha = pontos.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  return { linha, area: `${linha} L${largura},${altura} L0,${altura} Z`, ultimo: pontos[pontos.length - 1] };
}

// ---------------------------------------------------------------------------
// Mockup do painel — dados plausíveis em vez de barras "skeleton". Uma nova nota
// "Autorizada" entra no topo da tabela a cada 4s (pausado com movimento reduzido).
// ---------------------------------------------------------------------------
const PainelMockup: React.FC = () => {
  const [notas, setNotas] = useState<LinhaNota[]>(NOTAS_BASE);
  const [faturado, setFaturado] = useState(184320.55);
  const [aReceber, setAReceber] = useState(42910);
  // Uma nota por vez: ela é autorizada e o resto acontece em sequência (passo 1→6).
  const [ciclo, setCiclo] = useState<{ nota: LinhaNota; itens: number; passo: number } | null>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let n = 0;
    let vivo = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const depois = (ms: number, fn: () => void) => timers.push(setTimeout(() => vivo && fn(), ms));

    const rodar = () => {
      const base = NOTAS_NOVAS[n % NOTAS_NOVAS.length];
      n += 1;
      const nota = { ...base, numero: `${base.numero}·${n}` };
      const valor = paraNumero(nota.valor);
      const itens = 2 + (n % 5);
      // 1. autorizada: entra na tabela e soma no faturamento
      setCiclo({ nota, itens, passo: 1 });
      setNotas((prev) => [nota, ...prev].slice(0, 5));
      setFaturado((v) => v + valor);
      // 2..6: o que o sistema faz sozinho em seguida
      for (let passo = 2; passo <= PASSOS_AUTOMACAO.length; passo++) {
        depois((passo - 1) * 1100, () => {
          setCiclo((c) => (c ? { ...c, passo } : c));
          if (PASSOS_AUTOMACAO[passo - 1].id === 'receber') setAReceber((v) => v + valor);
        });
      }
      depois(PASSOS_AUTOMACAO.length * 1100 + 2600, rodar);
    };
    depois(900, rodar);
    return () => {
      vivo = false;
      timers.forEach(clearTimeout);
    };
  }, []);

  const { linha, area, ultimo } = caminhoSerie(FATURAMENTO_SERIE, 320, 72);
  const faturadoFmt = formatarReais(faturado);
  const aReceberFmt = formatarReais(aReceber);

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-float">
        {/* Barra superior do app */}
        <div className="flex items-center justify-between border-b border-ink-200 px-5 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-700 font-display text-xs font-bold text-white">S</div>
            <span className="text-sm font-semibold text-ink-900">Painel</span>
            <span className="hidden text-sm text-ink-400 sm:inline">/ Outubro 2026</span>
          </div>
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-ink-200 px-2.5 py-1 text-[11px] font-medium text-ink-600">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            SEFAZ-SP<span className="hidden sm:inline"> operando</span> · <span className="font-mono">312 ms</span>
          </span>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 divide-x divide-ink-200 border-b border-ink-200">
          <div className="p-4 sm:p-5">
            <p className="text-[11px] font-medium text-ink-500">Faturado no mês</p>
            <p className="mt-1 text-base font-semibold tabular-nums text-ink-950 sm:text-lg">
              <span className="text-ink-400">R$ </span>
              {faturadoFmt}
            </p>
            <p className="mt-0.5 text-[11px] font-medium text-emerald-700">▲ 12,4% vs. set.</p>
          </div>
          <div className="p-4 sm:p-5">
            <p className="text-[11px] font-medium text-ink-500">A receber</p>
            <p className="mt-1 text-base font-semibold tabular-nums text-ink-950 sm:text-lg">
              <span className="text-ink-400">R$ </span>
              {aReceberFmt}
            </p>
            <p className="mt-0.5 text-[11px] font-medium text-ink-500">Títulos em aberto</p>
          </div>
          <div className="p-4 sm:p-5">
            <p className="text-[11px] font-medium text-ink-500">Requer atenção</p>
            <p className="mt-1 text-base font-semibold tabular-nums text-ink-950 sm:text-lg">2</p>
            <p className="mt-0.5 text-[11px] font-medium text-nf-rejeitada">1 rejeitada · 1 contingência</p>
          </div>
        </div>

        {/* Gráfico */}
        <div className="border-b border-ink-200 px-5 pb-3 pt-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-ink-600">Faturamento diário</p>
            <p className="font-mono text-[10px] text-ink-400">01–12/10</p>
          </div>
          <svg viewBox="0 0 320 80" className="mt-2 h-16 w-full" preserveAspectRatio="none" aria-hidden>
            <defs>
              <linearGradient id="mock-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="var(--color-brand-500)" stopOpacity="0.22" />
                <stop offset="1" stopColor="var(--color-brand-500)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <g transform="translate(0,4)">
              <path d={area} fill="url(#mock-area)" />
              <path d={linha} fill="none" stroke="var(--color-brand-600)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
              <circle cx={ultimo[0]} cy={ultimo[1]} r="3" fill="var(--color-brand-700)" />
            </g>
          </svg>
        </div>

        {/* Tabela de notas */}
        <div className="h-[244px] overflow-hidden px-2 pb-2 pt-1 sm:px-3">
          <table className="w-full table-fixed text-left text-xs">
            <thead>
              <tr className="text-[11px] text-ink-400">
                <th className="w-[24%] px-2 py-2 font-medium">Nº</th>
                <th className="px-2 py-2 font-medium">Cliente</th>
                <th className="w-[20%] px-2 py-2 text-right font-medium">Valor</th>
                <th className="w-[28%] px-2 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false} mode="popLayout">
                {notas.map((n) => (
                  <motion.tr
                    key={n.numero}
                    layout
                    initial={{ opacity: 0, backgroundColor: 'rgba(94,217,164,0.18)' }}
                    animate={{ opacity: 1, backgroundColor: 'rgba(94,217,164,0)' }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="border-t border-ink-100"
                  >
                    <td className="whitespace-nowrap px-2 py-2.5">
                      <span className="font-mono text-ink-700">{n.numero.split('·')[0]}</span>
                      <span className="ml-1.5 hidden text-[10px] text-ink-400 sm:inline">{n.tipo}</span>
                    </td>
                    <td className="truncate px-2 py-2.5 text-ink-700">{n.cliente}</td>
                    <td
                      className={`whitespace-nowrap px-2 py-2.5 text-right tabular-nums text-ink-900 ${
                        n.status === 'cancelada' ? 'text-ink-400 line-through' : ''
                      }`}
                    >
                      {n.valor}
                    </td>
                    <td className="px-2 py-2.5">
                      <StatusBadge status={n.status} />
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Cartão "o resto acontece sozinho": a nota recém-autorizada e cada etapa
          automática marcando em sequência. Absoluto, fora do fluxo — nada na
          página se move quando ele atualiza. */}
      <div className="pointer-events-none absolute -left-6 top-[24%] hidden w-[290px] lg:block xl:-left-10" aria-live="polite">
        <AnimatePresence mode="wait">
          {ciclo && (
            <motion.div
              key={ciclo.nota.numero}
              initial={{ opacity: 0, y: -14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98, transition: { duration: 0.25 } }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-float"
            >
              <div className="flex items-center gap-3 border-b border-ink-100 px-3.5 py-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-700 text-white">
                  <Receipt className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-ink-950">
                    {ciclo.nota.tipo} {ciclo.nota.numero.split('·')[0]} emitida
                  </p>
                  <p className="truncate text-[11px] text-ink-500">{ciclo.nota.cliente}</p>
                </div>
                <p className="shrink-0 text-xs font-semibold tabular-nums text-ink-900">
                  <span className="text-ink-400">R$ </span>
                  {ciclo.nota.valor}
                </p>
              </div>
              <ol className="space-y-0.5 px-3.5 py-2.5">
                {PASSOS_AUTOMACAO.map((p, i) => {
                  const feito = ciclo.passo > i;
                  const atual = ciclo.passo === i + 1;
                  return (
                    <li key={p.id} className={`flex items-center gap-2.5 py-1 transition-opacity duration-300 ${feito ? 'opacity-100' : 'opacity-35'}`}>
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
                          feito ? 'bg-brand-700 text-white' : 'border border-ink-300 text-ink-400'
                        }`}
                      >
                        {feito ? <CheckCircle2 className="h-3.5 w-3.5" /> : <p.icon className="h-3 w-3" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block truncate text-[12px] ${atual ? 'font-semibold text-ink-950' : 'text-ink-700'}`}>{p.titulo}</span>
                        <span className="block truncate text-[10.5px] text-ink-400">{p.detalhe(ciclo)}</span>
                      </span>
                    </li>
                  );
                })}
              </ol>
              <div className="flex items-center justify-between border-t border-ink-100 bg-ink-50 px-3.5 py-1.5 text-[10.5px] text-ink-500">
                <span>Automático, sem digitar nada</span>
                <span className="font-mono tabular-nums">
                  {Math.min(ciclo.passo, PASSOS_AUTOMACAO.length)}/{PASSOS_AUTOMACAO.length}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Lightbox simples para ver uma imagem inteira (fecha no Esc ou clicando fora).
const Lightbox: React.FC<{ src: string | null; alt: string; estreito?: boolean; onClose: () => void }> = ({ src, alt, estreito, onClose }) => {
  useEffect(() => {
    if (!src) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [src, onClose]);

  return (
    <AnimatePresence>
      {src && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[60] overflow-y-auto bg-ink-950/70 p-4 backdrop-blur-sm sm:p-10"
          role="dialog"
          aria-modal="true"
          aria-label={alt}
        >
          <button onClick={onClose} className="fixed right-4 top-4 z-10 cursor-pointer rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-ink-800 shadow-card">
            Fechar
          </button>
          <motion.img
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            src={src}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            className={`mx-auto w-full ${estreito ? 'max-w-[420px]' : 'max-w-[1200px]'} rounded-md bg-white shadow-float`}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ---------------------------------------------------------------------------
// Vitrine de documentos reais — abas à esquerda, documento recortado à direita.
// ---------------------------------------------------------------------------
const VITRINE_INTERVALO_MS = 6000;

const VitrineDocumentos: React.FC = () => {
  const [ativo, setAtivo] = useState(0);
  const [ampliado, setAmpliado] = useState(false);
  const [emFoco, setEmFoco] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  const doc = DOCUMENTOS_REAIS[ativo];
  const pausado = emFoco || ampliado;

  // Sem autoplay para quem pediu movimento reduzido.
  useEffect(() => {
    setAutoplay(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  // O próprio fim da animação da barra de progresso avança o slide — assim a
  // pausa (hover/foco/lightbox) congela barra e timer juntos.
  const avancar = () => setAtivo((i) => (i + 1) % DOCUMENTOS_REAIS.length);

  return (
    <div
      className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-12"
      onMouseEnter={() => setEmFoco(true)}
      onMouseLeave={() => setEmFoco(false)}
      onFocusCapture={() => setEmFoco(true)}
      onBlurCapture={() => setEmFoco(false)}
    >
      <div className="flex gap-2 overflow-x-auto pb-1 lg:col-span-4 lg:flex-col lg:overflow-visible lg:pb-0" role="tablist">
        {DOCUMENTOS_REAIS.map((d, i) => {
          const sel = i === ativo;
          return (
            <button
              key={d.id}
              role="tab"
              aria-selected={sel}
              onClick={() => setAtivo(i)}
              className={`relative shrink-0 cursor-pointer overflow-hidden rounded-xl border p-4 text-left transition-colors lg:p-5 ${
                sel ? 'border-brand-700 bg-white shadow-card' : 'border-transparent hover:border-ink-200 hover:bg-white/60'
              }`}
            >
              {sel && autoplay && (
                <span
                  key={`progresso-${ativo}`}
                  aria-hidden
                  onAnimationEnd={avancar}
                  className="absolute bottom-0 left-0 h-0.5 w-full origin-left bg-brand-600"
                  style={{
                    animation: `vitrine-progresso ${VITRINE_INTERVALO_MS}ms linear forwards`,
                    animationPlayState: pausado ? 'paused' : 'running',
                  }}
                />
              )}
              <div className="flex items-center justify-between gap-4">
                <span className={`font-display text-lg font-bold ${sel ? 'text-ink-950' : 'text-ink-600'}`}>{d.nome}</span>
                <span className="rounded-md border border-ink-200 px-2 py-0.5 font-mono text-[11px] text-ink-500">{d.modelo}</span>
              </div>
              <div className={`hidden overflow-hidden transition-all duration-300 lg:block ${sel ? 'mt-2 max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="text-sm leading-relaxed text-ink-500">{d.desc}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {d.destaques.map((t) => (
                    <span key={t} className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-medium text-brand-800">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="lg:col-span-8">
        <div className="relative overflow-hidden rounded-2xl border border-ink-200 bg-ink-100">
          <div className="flex items-center justify-between gap-3 border-b border-ink-200 bg-white px-5 py-3">
            <div className="flex min-w-0 items-center gap-2 text-sm">
              <FileText className="h-4 w-4 shrink-0 text-ink-400" />
              <span className="font-semibold text-ink-900">{doc.documento}</span>
              <span className="truncate text-ink-400">· gerado pelo sistema</span>
            </div>
            <StatusBadge status="autorizada" />
          </div>

          <div className="relative h-[460px] overflow-hidden px-4 pt-6 sm:h-[560px] sm:px-8 sm:pt-8">
            <AnimatePresence mode="wait">
              <motion.img
                key={doc.id}
                src={doc.img}
                alt={`${doc.documento} de exemplo gerado pelo sistema (dados fictícios)`}
                loading="lazy"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className={`mx-auto w-full ${doc.largura} rounded-md bg-white shadow-float`}
              />
            </AnimatePresence>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ink-100 via-ink-100/80 to-transparent" />
            <button
              onClick={() => setAmpliado(true)}
              className="absolute bottom-5 left-1/2 inline-flex -translate-x-1/2 cursor-pointer items-center gap-2 rounded-lg border border-ink-300 bg-white px-4 py-2 text-sm font-medium text-ink-800 shadow-card transition-colors hover:bg-ink-50"
            >
              <Search className="h-4 w-4" />
              Ver documento inteiro
            </button>
          </div>
        </div>
        <p className="mt-3 text-xs text-ink-400">Documento de exemplo com dados fictícios, renderizado pelo mesmo layout usado na emissão.</p>
      </div>

      <Lightbox
        src={ampliado ? doc.img : null}
        alt={`${doc.documento} completo`}
        estreito={doc.id === 'nfce'}
        onClose={() => setAmpliado(false)}
      />
    </div>
  );
};

// ---------------------------------------------------------------------------
// Telas reais do app numa moldura de navegador, com abas.
// ---------------------------------------------------------------------------
const TelasDoSistema: React.FC = () => {
  const [ativo, setAtivo] = useState(0);
  const [ampliado, setAmpliado] = useState(false);
  const tela = TELAS_SISTEMA[ativo];

  return (
    <div>
      <div className="mb-4 flex gap-1 overflow-x-auto rounded-xl bg-ink-100 p-1" role="tablist">
        {TELAS_SISTEMA.map((t, i) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={i === ativo}
            onClick={() => setAtivo(i)}
            className={`shrink-0 cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              i === ativo ? 'bg-white text-ink-950 shadow-card' : 'text-ink-500 hover:text-ink-800'
            }`}
          >
            {t.rotulo}
          </button>
        ))}
      </div>
      <button
        onClick={() => setAmpliado(true)}
        className="group block w-full cursor-zoom-in overflow-hidden rounded-2xl border border-ink-200 bg-white text-left shadow-float"
        aria-label={`Ampliar tela: ${tela.rotulo}`}
      >
        <div className="flex items-center gap-3 border-b border-ink-200 bg-ink-50 px-4 py-2.5">
          <div className="flex gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-ink-200" />
            <span className="h-2.5 w-2.5 rounded-full bg-ink-200" />
            <span className="h-2.5 w-2.5 rounded-full bg-ink-200" />
          </div>
          <span className="truncate rounded-md bg-white px-3 py-0.5 font-mono text-[11px] text-ink-400">app.suptecnologia.com.br</span>
        </div>
        {/* Área com altura fixa (proporção das capturas, 1600×1111) e todas as
            telas empilhadas: trocar de aba só cruza a opacidade — nada colapsa
            nem empurra a página, e as imagens já estão carregadas. */}
        <div className="relative aspect-[1600/1111] w-full bg-ink-50">
          {TELAS_SISTEMA.map((t, i) => (
            <img
              key={t.id}
              src={t.img}
              alt={i === ativo ? `Tela real do sistema: ${t.rotulo} (dados fictícios)` : ''}
              aria-hidden={i !== ativo}
              width={1600}
              height={1111}
              loading="lazy"
              decoding="async"
              className={`absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-300 ${i === ativo ? 'opacity-100' : 'opacity-0'}`}
            />
          ))}
        </div>
      </button>
      <p className="mt-3 text-xs text-ink-400">Telas reais do sistema, com dados fictícios. Clique para ampliar.</p>
      <Lightbox src={ampliado ? tela.img : null} alt={tela.rotulo} onClose={() => setAmpliado(false)} />
    </div>
  );
};

export const LandingPageView: React.FC<LandingPageViewProps> = ({ onGoToLogin }) => {
  const [rolou, setRolou] = useState(false);
  const [faqAberto, setFaqAberto] = useState<number | null>(0);

  useEffect(() => {
    const onScroll = () => setRolou(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-ink-50 font-sans text-ink-950 selection:bg-brand-700 selection:text-white">
        {/* ============================== HEADER ============================== */}
        <header
          className={`sticky top-0 z-50 w-full transition-[background-color,border-color,box-shadow] duration-300 ${
            rolou ? 'border-b border-ink-200 bg-ink-50/85 shadow-card backdrop-blur-md' : 'border-b border-transparent bg-ink-50'
          }`}
        >
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex cursor-pointer items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-700 font-display text-base font-bold text-white">S</div>
              <span className="font-display text-lg font-bold tracking-tight text-ink-950">SUP Tecnologia</span>
            </button>

            <nav className="hidden items-center gap-7 text-sm text-ink-600 lg:flex">
              {NAV_ITEMS.map((item) => (
                <button key={item.id} onClick={() => scrollToSection(item.id)} className="cursor-pointer transition-colors hover:text-ink-950">
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <button
                onClick={onGoToLogin}
                id="btn-landing-entrar"
                className="hidden cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-100 sm:flex"
              >
                <LogIn className="h-4 w-4" />
                Entrar
              </button>
              <button
                onClick={onGoToLogin}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-800"
              >
                <span className="sm:hidden">Entrar</span>
                <span className="hidden sm:inline">Começar agora</span>
              </button>
            </div>
          </div>
        </header>

        {/* =============================== HERO =============================== */}
        <section id="hero" className="relative overflow-hidden">
          {/* Grade pontilhada sutil, que some nas bordas */}
          <div
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              backgroundImage: 'radial-gradient(var(--color-ink-300) 1px, transparent 1px)',
              backgroundSize: '22px 22px',
              maskImage: 'radial-gradient(ellipse 70% 60% at 70% 40%, black 30%, transparent 75%)',
              WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 70% 40%, black 30%, transparent 75%)',
            }}
          />

          <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-5 pb-24 pt-14 sm:px-8 sm:pt-20 lg:grid-cols-12 lg:gap-12 lg:px-10 lg:pb-36 lg:pt-24">
            <motion.div variants={stagger} initial="hidden" animate="visible" className="lg:col-span-6">
              <motion.div variants={fadeUp}>
                <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
                  Pronto para a Reforma Tributária · IBS e CBS
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="mt-6 font-display text-[40px] font-bold leading-[1.05] tracking-[-0.03em] text-ink-950 sm:text-6xl lg:text-[64px]"
              >
                Emita suas notas.
                <br />
                <span className="text-brand-700">O resto se organiza sozinho.</span>
              </motion.h1>

              <motion.p variants={fadeUp} className="mt-6 max-w-xl text-lg leading-relaxed text-ink-500">
                NF-e, NFS-e, NFC-e, CT-e, MDF-e e NFA-e num só painel — com estoque, contas a receber e o seu
                contador atualizados a cada emissão.
              </motion.p>

              <motion.div variants={fadeUp} className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  onClick={onGoToLogin}
                  id="btn-hero-simplificar"
                  className="group flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-700 px-6 py-3.5 text-base font-medium text-white shadow-card transition-colors hover:bg-brand-800"
                >
                  Começar agora
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
                <button
                  onClick={() => scrollToSection('fluxo')}
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-ink-300 bg-white px-6 py-3.5 text-base font-medium text-ink-800 transition-colors hover:border-ink-400 hover:bg-ink-100"
                >
                  Ver como funciona
                </button>
              </motion.div>

              <motion.p variants={fadeUp} className="mt-5 text-sm text-ink-500">
                A partir de <strong className="font-semibold tabular-nums text-ink-900">R$ 3,99/dia</strong> · certificado A1 ·
                suporte em horário comercial
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-6"
            >
              <PainelMockup />
            </motion.div>
          </div>

          {/* Faixa de conformidade — marquee infinito (direita → esquerda), pausa no hover.
              A lista é renderizada duas vezes e a animação desloca -50%, então o laço não tem emenda. */}
          <div className="group relative overflow-hidden border-y border-ink-200 bg-white py-5 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
            <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
              {[0, 1].map((copia) => (
                <ul key={copia} className="flex shrink-0 items-center" aria-hidden={copia === 1}>
                  {FAIXA_CONFORMIDADE.map((item) => (
                    <li key={item.label} className="flex shrink-0 items-center gap-2.5 px-7 text-sm text-ink-600">
                      <item.icon className="h-4 w-4 shrink-0 text-brand-600" />
                      <span className="whitespace-nowrap">{item.label}</span>
                      <span className="ml-7 h-1 w-1 rounded-full bg-ink-300" aria-hidden />
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </section>

        {/* ============================== 01 FISCAL ============================== */}
        <section id="fiscal" className="scroll-mt-16 py-24 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <SectionHeader
              numero="01"
              rotulo="Fiscal"
              titulo="Todo documento fiscal que a sua empresa precisa."
              descricao="Seis emissores no mesmo lugar. Veja documentos de verdade gerados pelo sistema — o mesmo layout que o seu cliente recebe."
            />

            <VitrineDocumentos />

            {/* Legenda de status — a mesma linguagem do painel */}
            <motion.div variants={fadeUp} {...inView} className="mt-8 flex flex-wrap items-center gap-2 text-sm text-ink-500">
              <span className="mr-1">Cada nota mostra exatamente onde está:</span>
              {(Object.keys(STATUS_NOTA) as StatusNota[]).map((s) => (
                <StatusBadge key={s} status={s} />
              ))}
            </motion.div>
          </div>
        </section>

        {/* ============================== 02 FLUXO ============================== */}
        <section id="fluxo" className="scroll-mt-16 border-t border-ink-200 bg-white py-24 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <SectionHeader
              numero="02"
              rotulo="Como funciona"
              titulo="Uma nota, quatro áreas atualizadas."
              descricao="Você emite. O sistema cuida do que vem depois — sem planilha, sem digitar a mesma informação duas vezes."
            />

            <motion.ol variants={stagger} {...inView} className="relative mt-16 grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-6">
              {/* Linha que liga os passos */}
              <div className="absolute left-5 right-5 top-5 hidden h-px bg-gradient-to-r from-brand-300 via-brand-200 to-brand-300 md:block" aria-hidden />
              {FLUXO.map((passo, i) => (
                <motion.li key={passo.titulo} variants={fadeUp} className="relative flex gap-4 md:block">
                  <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-200 bg-white text-brand-700 shadow-card">
                    <passo.icon className="h-4 w-4" />
                  </div>
                  <div className="md:mt-6">
                    <p className="font-mono text-xs text-ink-400">Passo {i + 1}</p>
                    <h3 className="mt-1 font-display text-lg font-bold text-ink-950">{passo.titulo}</h3>
                    <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-ink-500">{passo.desc}</p>
                  </div>
                </motion.li>
              ))}
            </motion.ol>
          </div>
        </section>

        {/* ========================= 03 GESTÃO & FINANCEIRO ========================= */}
        <section id="gestao" className="scroll-mt-16 border-t border-ink-200 py-24 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <SectionHeader
                  numero="03"
                  rotulo="Gestão & Financeiro"
                  titulo="Da emissão ao recebimento."
                  descricao="Cadastros únicos alimentam todos os emissores. As duplicatas das notas viram contas a receber, e a cobrança sai por Pix."
                />
              </div>
              <motion.ul variants={stagger} {...inView} className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:col-span-7 lg:pt-10">
                {MODULOS_GESTAO.map((mod) => (
                  <motion.li key={mod.nome} variants={fadeUp} className="flex gap-3">
                    <mod.icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
                    <div>
                      <p className="text-sm font-semibold text-ink-900">{mod.nome}</p>
                      <p className="mt-0.5 text-sm text-ink-500">{mod.desc}</p>
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
            </div>

            <motion.div variants={fadeUp} {...inView} className="mt-14">
              <TelasDoSistema />
            </motion.div>
          </div>
        </section>

        {/* ============================ 04 CONTADORES ============================ */}
        <section id="contadores" className="scroll-mt-16 bg-brand-950 py-24 sm:py-28">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:px-10">
            <div>
              <SectionHeader
                numero="04"
                rotulo="Para contadores"
                escuro
                titulo="Seus clientes emitem. Você recebe tudo organizado."
                descricao="XML de cada nota emitida chega automaticamente ao escritório. Sem cobrar arquivo por WhatsApp no fim do mês."
              />
              <motion.div variants={fadeUp} {...inView} className="mt-9">
                <button
                  onClick={onGoToLogin}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-accent-400 px-6 py-3.5 text-base font-medium text-brand-950 transition-colors hover:bg-accent-300"
                >
                  Acessar o painel
                  <ArrowRight className="h-4 w-4" />
                </button>
              </motion.div>
            </div>

            <motion.div variants={stagger} {...inView} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { icon: Mail, t: 'XML automático', d: 'Enviado ao e-mail do escritório a cada emissão.' },
                { icon: Clock, t: 'Fechamento sem atraso', d: 'Os documentos do mês já estão com você no dia 1º.' },
                { icon: ShieldCheck, t: 'Conformidade', d: 'Layouts SEFAZ e NFS-e Nacional sempre atualizados.' },
                { icon: Receipt, t: 'Impostos calculados', d: 'ICMS, IPI, PIS, COFINS, ISS e retenções na própria nota.' },
              ].map((c) => (
                <motion.div key={c.t} variants={fadeUp} className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
                  <c.icon className="h-5 w-5 text-accent-300" />
                  <p className="mt-4 font-display text-base font-bold text-white">{c.t}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-brand-100/70">{c.d}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ============================== 05 DÚVIDAS ============================== */}
        <section id="duvidas" className="scroll-mt-16 py-24 sm:py-28">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:px-10">
            <div className="lg:col-span-4">
              <SectionHeader
                numero="05"
                rotulo="Dúvidas"
                titulo="Perguntas frequentes."
                descricao="Não encontrou o que procurava? Fale com a gente pelo e-mail de suporte."
              />
            </div>
            <div className="divide-y divide-ink-200 border-y border-ink-200 lg:col-span-8">
              {FAQ.map((item, i) => {
                const aberto = faqAberto === i;
                return (
                  <div key={item.p}>
                    <button
                      onClick={() => setFaqAberto(aberto ? null : i)}
                      aria-expanded={aberto}
                      className="flex w-full cursor-pointer items-center justify-between gap-6 py-5 text-left"
                    >
                      <span className="font-display text-base font-semibold text-ink-950 sm:text-lg">{item.p}</span>
                      <ChevronDown className={`h-5 w-5 shrink-0 text-ink-400 transition-transform duration-300 ${aberto ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence initial={false}>
                      {aberto && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <p className="max-w-2xl pb-6 text-base leading-relaxed text-ink-500">{item.r}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================== CTA FINAL ============================== */}
        <section className="px-5 pb-24 sm:px-8 lg:px-10">
          <motion.div
            variants={stagger}
            {...inView}
            className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-ink-200 bg-white px-6 py-16 text-center sm:px-12 sm:py-20"
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-60"
              style={{
                backgroundImage: 'radial-gradient(var(--color-ink-300) 1px, transparent 1px)',
                backgroundSize: '22px 22px',
                maskImage: 'radial-gradient(ellipse 60% 70% at 50% 100%, black, transparent 70%)',
                WebkitMaskImage: 'radial-gradient(ellipse 60% 70% at 50% 100%, black, transparent 70%)',
              }}
            />
            <motion.h2 variants={fadeUp} className="relative font-display text-3xl font-bold tracking-[-0.02em] text-ink-950 sm:text-5xl">
              Sua próxima nota pode sair daqui.
            </motion.h2>
            <motion.p variants={fadeUp} className="relative mx-auto mt-5 max-w-xl text-lg text-ink-500">
              Fiscal, estoque, financeiro e contador numa única plataforma, a partir de{' '}
              <strong className="font-semibold tabular-nums text-ink-900">R$ 3,99/dia</strong>.
            </motion.p>
            <motion.div variants={fadeUp} className="relative mt-9 flex justify-center">
              <button
                onClick={onGoToLogin}
                className="group inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-700 px-7 py-3.5 text-base font-medium text-white shadow-card transition-colors hover:bg-brand-800"
              >
                Começar agora
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </motion.div>
          </motion.div>
        </section>

        {/* ================================ RODAPÉ ================================ */}
        <footer className="relative overflow-hidden bg-brand-950 text-brand-100/70">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            {/* Marca + navegação */}
            <div className="grid grid-cols-1 gap-12 border-b border-white/10 py-16 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-400 font-display text-lg font-bold text-brand-950">S</div>
                  <span className="font-display text-xl font-bold tracking-tight text-white">SUP Tecnologia</span>
                </div>
                <p className="mt-5 max-w-sm text-sm leading-relaxed">
                  Emissão fiscal, cadastros, estoque e financeiro integrados para pequenas e médias empresas e
                  escritórios de contabilidade.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <button
                    onClick={onGoToLogin}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-accent-400 px-4 py-2.5 text-sm font-medium text-brand-950 transition-colors hover:bg-accent-300"
                  >
                    <LogIn className="h-4 w-4" />
                    Acessar o painel
                  </button>
                  <a
                    href="mailto:contato@suptecnologia.com.br"
                    className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/5"
                  >
                    <Mail className="h-4 w-4" />
                    Fale com a gente
                  </a>
                </div>
              </div>

              <nav className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4 lg:col-span-8" aria-label="Rodapé">
                {RODAPE_COLUNAS.map((col) => (
                  <div key={col.titulo}>
                    <h4 className="text-xs font-semibold uppercase tracking-[0.08em] text-white">{col.titulo}</h4>
                    <ul className="mt-5 space-y-3 text-sm">
                      {col.links.map((l) => (
                        <li key={l.label}>
                          <button onClick={() => scrollToSection(l.alvo)} className="cursor-pointer text-left transition-colors hover:text-white">
                            {l.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-[0.08em] text-white">Suporte</h4>
                  <ul className="mt-5 space-y-3 text-sm">
                    <li>
                      <a href="mailto:contato@suptecnologia.com.br" className="transition-colors hover:text-white">
                        contato@<wbr />suptecnologia.com.br
                      </a>
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 shrink-0 text-accent-300" />
                      Seg a sex, 8h às 18h
                    </li>
                  </ul>
                </div>
              </nav>
            </div>

            {/* Conformidade */}
            <div className="flex flex-wrap items-center gap-2 border-b border-white/10 py-6">
              {[
                { icon: ShieldCheck, label: 'ICP-Brasil A1' },
                { icon: Building2, label: 'SEFAZ · NF-e 4.00' },
                { icon: FileText, label: 'NFS-e Padrão Nacional' },
                { icon: Landmark, label: 'Reforma Tributária IBS/CBS' },
                { icon: Lock, label: 'LGPD · dados criptografados' },
              ].map((selo) => (
                <span key={selo.label} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs">
                  <selo.icon className="h-3.5 w-3.5 text-accent-300" />
                  {selo.label}
                </span>
              ))}
            </div>

            {/* Identificação legal */}
            <div className="flex flex-col gap-4 py-8 text-xs sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-1.5">
                <p className="font-semibold uppercase tracking-wide text-white">{SUP_EMPRESA.razaoSocial}</p>
                <p>
                  CNPJ <span className="font-mono text-brand-100">{SUP_EMPRESA.cnpj}</span>
                  <span className="mx-2 text-white/20">|</span>
                  {SUP_EMPRESA.nomeFantasia} é marca de {SUP_EMPRESA.razaoSocial}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <span>Termos de uso</span>
                <span>Política de privacidade</span>
                <span>© {new Date().getFullYear()} {SUP_EMPRESA.nomeFantasia}</span>
              </div>
            </div>
          </div>

          {/* Assinatura gráfica: wordmark gigante recortado na base */}
          <div aria-hidden className="pointer-events-none -mb-[2.6vw] select-none overflow-hidden px-5 text-center sm:px-8 lg:px-10">
            <span className="block whitespace-nowrap font-display text-[12.5vw] font-bold leading-none tracking-[-0.05em] xl:text-[11.5rem] text-white/[0.04]">
              SUP Tecnologia
            </span>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
};
