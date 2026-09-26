// src/components/landing/LandingPageView.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  MotionConfig,
  useMotionTemplate,
  useScroll,
  useTransform,
  type Variants,
} from 'framer-motion';
import {
  LogIn,
  Receipt,
  FileText,
  ShoppingBag,
  Truck,
  FileBadge2,
  FileArchive,
  Package,
  Briefcase,
  UserPlus,
  UserCheck,
  DollarSign,
  ShieldCheck,
  Search,
  QrCode,
  CheckCircle2,
  Building2,
  Mail,
  MapPin,
  ArrowRight,
  Sparkles,
  Lock,
  Clock,
  ChevronRight,
  Layers,
  Zap,
} from 'lucide-react';
import { ConfiguracaoEmpresa } from '../../types/erp';

interface LandingPageViewProps {
  empresa: ConfiguracaoEmpresa;
  onGoToLogin: () => void;
}

// 🔥 Respeita a preferência de "reduzir movimento" do sistema operacional.
// O MotionConfig (reducedMotion="user") já cobre animações declarativas
// (whileInView/variants) dos elementos `motion.*`, mas valores manuais
// derivados de useScroll/useTransform e aplicados via `style` (backgroundColor,
// backdropFilter, e os transforms do hero) não passam pelo mecanismo interno
// do MotionConfig — por isso precisamos colapsá-los manualmente aqui.
function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

// Colapsa um range de useTransform para um valor único (o primeiro) quando o
// usuário prefere movimento reduzido, mantendo a mesma quantidade de "stops".
function reducedRange<T>(prefersReducedMotion: boolean, output: T[]): T[] {
  return prefersReducedMotion ? output.map(() => output[0]) : output;
}

const NAV_ITEMS = [
  { id: 'fiscal', label: 'Fiscal' },
  { id: 'gestao', label: 'Gestão' },
  { id: 'financeiro', label: 'Financeiro' },
] as const;

// === CATÁLOGO REAL DOS MÓDULOS (mesmo conjunto do menu lateral do sistema) ===

const MODULOS_FISCAIS = [
  {
    icon: Receipt,
    modelo: 'Modelo 55',
    nome: 'NF-e',
    desc: 'Nota fiscal de produtos com cálculo automático de ICMS, IPI, PIS e COFINS, e DANFE em PDF/XML.',
    accent: 'from-emerald-500/15 text-emerald-600 border-emerald-500/20',
    big: true,
  },
  {
    icon: FileText,
    modelo: 'Padrão Nacional',
    nome: 'NFS-e',
    desc: 'DPS no layout oficial da Receita Federal, com retenções automáticas de ISS, IRRF, CSLL e PIS/COFINS.',
    accent: 'from-blue-500/15 text-blue-600 border-blue-500/20',
    big: true,
  },
  {
    icon: ShoppingBag,
    modelo: 'Modelo 65',
    nome: 'NFC-e',
    desc: 'Cupom fiscal eletrônico para consumidor final, com QR Code de consulta e contingência offline.',
    accent: 'from-purple-500/15 text-purple-600 border-purple-500/20',
  },
  {
    icon: Truck,
    modelo: 'Modelo 57',
    nome: 'CT-e',
    desc: 'Conhecimento de transporte eletrônico com DACTE, integração de transportadora e modal rodoviário.',
    accent: 'from-cyan-500/15 text-cyan-600 border-cyan-500/20',
  },
  {
    icon: FileBadge2,
    modelo: 'Avulsa',
    nome: 'NFA-e',
    desc: 'Nota fiscal avulsa eletrônica para operações sem inscrição estadual ou municipal ativa.',
    accent: 'from-amber-500/15 text-amber-600 border-amber-500/20',
  },
  {
    icon: FileArchive,
    modelo: 'Manifesto',
    nome: 'MDF-e',
    desc: 'Manifesto eletrônico que vincula múltiplos documentos fiscais a uma viagem e veículo.',
    accent: 'from-orange-500/15 text-orange-600 border-orange-500/20',
  },
] as const;

const MODULOS_GESTAO = [
  { icon: Package, nome: 'Produtos / Estoque', desc: 'Catálogo com NCM, GTIN e baixa automática por faturamento.' },
  { icon: Briefcase, nome: 'Serviços', desc: 'Catálogo com código de tributação nacional/municipal e alíquotas.' },
  { icon: UserPlus, nome: 'Clientes', desc: 'Cadastro completo com endereço, IE e indicador de contribuinte.' },
  { icon: UserCheck, nome: 'Fornecedores', desc: 'Mesma base de cadastro, papel de fornecedor da operação.' },
  { icon: Truck, nome: 'Transportadoras', desc: 'RNTRC e dados usados na emissão de CT-e e MDF-e.' },
] as const;

const MODULOS_FINANCEIRO = [
  {
    icon: QrCode,
    nome: 'Financeiro & Pix',
    desc: 'Contas a pagar e a receber lançadas automaticamente a partir das notas emitidas, com cobrança Pix instantânea (BACEN).',
  },
  {
    icon: ShieldCheck,
    nome: 'Certificado Digital A1',
    desc: 'Upload criptografado (AES-256-GCM), assinatura ICP-Brasil em tempo real e alerta de validade.',
  },
  {
    icon: Search,
    nome: 'Consulta CNPJ',
    desc: 'Busca pública de dados cadastrais para preencher clientes e fornecedores automaticamente.',
  },
] as const;

// Variants reutilizadas (staggerChildren + fade/translate curto, sem spring/bounce)
const sectionHeaderVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const sectionHeaderItemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const gridVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const checklistContainerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const checklistItemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

// === HERO — slides do carrossel fullscreen ===
interface HeroSlide {
  id: string;
  eyebrow: string;
  titulo: string;
  tituloGradiente: string;
  descricao: string;
  variante: 'painel' | 'icones';
  icones: (typeof Receipt)[];
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'plataforma',
    eyebrow: 'Sistema completo de gestão fiscal',
    titulo: 'Todo o seu fiscal,',
    tituloGradiente: 'numa só plataforma',
    descricao:
      'NF-e, NFS-e, NFC-e, CT-e, NFA-e e MDF-e emitidos em segundos, com estoque, clientes, fornecedores e financeiro conectados — e certificado digital assinando tudo automaticamente.',
    variante: 'painel',
    icones: [],
  },
  {
    id: 'fiscal',
    eyebrow: 'Módulo Fiscal Completo',
    titulo: 'Emita qualquer nota',
    tituloGradiente: 'em poucos cliques',
    descricao:
      'Cálculo automático de impostos, DANFE, DACTE e DAMDFE prontos, e XML assinado enviado direto para o seu contador.',
    variante: 'icones',
    icones: [Receipt, FileText, ShoppingBag, Truck, FileBadge2, FileArchive],
  },
  {
    id: 'gestao',
    eyebrow: 'Cadastros & Estoque',
    titulo: 'Uma base única',
    tituloGradiente: 'pra sua operação inteira',
    descricao:
      'Produtos, serviços, clientes, fornecedores e transportadoras conectados automaticamente a cada nota emitida.',
    variante: 'icones',
    icones: [Package, Briefcase, UserPlus, UserCheck, Truck],
  },
  {
    id: 'financeiro',
    eyebrow: 'Financeiro & Ferramentas',
    titulo: 'Da emissão',
    tituloGradiente: 'ao recebimento, sem planilha',
    descricao:
      'Cobrança Pix instantânea, certificado digital criptografado e consulta pública de CNPJ, tudo dentro do mesmo painel.',
    variante: 'icones',
    icones: [QrCode, ShieldCheck, Search],
  },
];

const HERO_AUTOPLAY_MS = 7000;

const heroSlideVariants: Variants = {
  enter: { opacity: 0, y: 16 },
  center: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.35, ease: 'easeOut' } },
};

export const LandingPageView: React.FC<LandingPageViewProps> = ({ empresa, onGoToLogin }) => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const prefersReducedMotion = usePrefersReducedMotion();

  // ---------------------------------------------------------------------
  // Header: encolhe (80px -> 60px), aumenta o blur e o shadow conforme o
  // scroll da página inteira avança pelos primeiros 120px.
  // ---------------------------------------------------------------------
  const { scrollY } = useScroll();
  const headerHeight = useTransform(scrollY, [0, 120], reducedRange(prefersReducedMotion, [80, 60]));
  const headerBlurValue = useTransform(scrollY, [0, 120], reducedRange(prefersReducedMotion, [8, 16]));
  const headerShadowOpacity = useTransform(scrollY, [0, 120], [0, 1]);
  const headerBackdropFilter = useMotionTemplate`blur(${headerBlurValue}px)`;
  const headerBoxShadow = useMotionTemplate`0 10px 30px -12px rgba(15, 23, 42, ${headerShadowOpacity})`;

  // ---------------------------------------------------------------------
  // Indicador de navegação ativa (scrollspy via IntersectionObserver)
  // ---------------------------------------------------------------------
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const elements = NAV_ITEMS.map((item) => document.getElementById(item.id)).filter(
      (el): el is HTMLElement => el !== null
    );

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length > 0) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // ---------------------------------------------------------------------
  // Hero: "camera dolly" — texto sobe suave e mantém opacidade quase total,
  // card do mockup sobe mais rápido com leve scale/rotate (parallax oposto).
  // ---------------------------------------------------------------------
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });

  const textY = useTransform(heroProgress, [0, 1], reducedRange(prefersReducedMotion, [0, -40]));
  const textOpacity = useTransform(heroProgress, [0, 0.4, 1], [1, 1, 0.85]);
  const cardY = useTransform(heroProgress, [0, 1], reducedRange(prefersReducedMotion, [0, -90]));
  const cardScale = useTransform(heroProgress, [0, 1], reducedRange(prefersReducedMotion, [1, 1.03]));
  const cardRotate = useTransform(heroProgress, [0, 1], reducedRange(prefersReducedMotion, [0, -1.5]));

  // ---------------------------------------------------------------------
  // Hero: slider fullscreen com autoplay + dots (pausa com movimento reduzido)
  // ---------------------------------------------------------------------
  const [activeSlide, setActiveSlide] = useState(0);
  const slide = HERO_SLIDES[activeSlide];

  useEffect(() => {
    if (prefersReducedMotion) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, HERO_AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [prefersReducedMotion]);

  // ---------------------------------------------------------------------
  // Seções de conteúdo (fiscal/gestão/financeiro): fundo compartilhado que
  // "respira" entre slate-50 e white conforme o scroll atravessa o bloco.
  // ---------------------------------------------------------------------
  const featuresRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: featuresProgress } = useScroll({ target: featuresRef, offset: ['start start', 'end end'] });
  const bgColor = useTransform(
    featuresProgress,
    [0, 0.33, 0.5, 0.66, 1],
    reducedRange(prefersReducedMotion, ['#f8fafc', '#f8fafc', '#ffffff', '#f8fafc', '#f8fafc'])
  );

  // 🔥 VALORES SEGUROS COM FALLBACK
  const razaoSocial = empresa?.razaoSocial || 'SUP TECNOLOGIA';
  const cnpj = empresa?.cnpj || '00.000.000/0000-00';
  const logradouro = empresa?.endereco?.logradouro || 'Av. Paulista';
  const numero = empresa?.endereco?.numero || '1374';
  const municipio = empresa?.endereco?.nomeMunicipio || 'São Paulo';
  const uf = empresa?.endereco?.uf || 'SP';

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between font-sans selection:bg-blue-600 selection:text-white scroll-smooth">

        <motion.header
          style={{ backdropFilter: headerBackdropFilter, WebkitBackdropFilter: headerBackdropFilter, boxShadow: headerBoxShadow }}
          className="w-full bg-white/95 border-b border-slate-100 sticky top-0 z-50"
        >
          <motion.div
            style={{ height: headerHeight }}
            className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 flex items-center justify-between"
          >

            <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection('hero')}>
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-xs">
                S
              </div>
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-blue-950">
                SUP TECNOLOGIA
              </span>
            </div>

            <div className="flex items-center gap-6 sm:gap-10">
              <nav className="hidden md:flex items-center gap-8 text-xs font-bold tracking-wider text-slate-700 uppercase">
                {NAV_ITEMS.map((item) => (
                  <div key={item.id} className="relative pb-2">
                    <button
                      onClick={() => scrollToSection(item.id)}
                      className={`hover:text-blue-600 transition-colors cursor-pointer ${
                        activeSection === item.id ? 'text-blue-600' : ''
                      }`}
                    >
                      {item.label}
                    </button>
                    {activeSection === item.id && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute left-0 right-0 -bottom-0.5 h-0.5 bg-blue-600 rounded-full"
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                      />
                    )}
                  </div>
                ))}
              </nav>

              <button
                onClick={onGoToLogin}
                id="btn-landing-entrar"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-lg transition-all shadow-sm shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Entrar</span>
              </button>
            </div>

          </motion.div>
        </motion.header>

        {/* ============================================================
            HERO — fundo escuro com gradiente/aurora, slider fullscreen com
            dots, card de mockup em vidro (glass) flutuando sobre a malha
            de gradiente.
            ============================================================ */}
        <section
          id="hero"
          ref={heroRef}
          className="relative w-full min-h-screen flex flex-col bg-slate-950 overflow-hidden"
        >
          {/* Malha de gradientes (aurora) + grão sutil — puramente decorativo */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(60% 50% at 15% 10%, rgba(37,99,235,0.35), transparent 60%),' +
                'radial-gradient(50% 45% at 85% 15%, rgba(139,92,246,0.28), transparent 60%),' +
                'radial-gradient(55% 50% at 50% 100%, rgba(6,182,212,0.18), transparent 60%)',
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            }}
          />

          <div className="relative flex-1 max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-16 sm:py-24 w-full flex items-center">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center w-full">

              <motion.div style={{ y: textY, opacity: textOpacity }} className="lg:col-span-7 space-y-6">

                <AnimatePresence mode="wait">
                  <motion.div
                    key={slide.id}
                    variants={heroSlideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="space-y-6 min-h-[260px] sm:min-h-[240px]"
                  >
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
                      <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                      <span className="text-[11px] sm:text-xs font-bold text-blue-200 tracking-wider uppercase">
                        {slide.eyebrow}
                      </span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-black tracking-tight text-white leading-[1.1]">
                      {slide.titulo} <br />
                      <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-violet-400 bg-clip-text text-transparent">
                        {slide.tituloGradiente}
                      </span>
                    </h1>

                    <p className="text-base sm:text-lg text-slate-300 max-w-xl font-normal leading-relaxed">
                      {slide.descricao}
                    </p>

                    {slide.id === 'plataforma' && (
                      <motion.div
                        variants={checklistContainerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-3 pt-1"
                      >
                        <motion.div variants={checklistItemVariants} className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
                          <span className="text-sm sm:text-base font-medium text-slate-200">
                            6 tipos de documento fiscal, um único painel
                          </span>
                        </motion.div>

                        <motion.div variants={checklistItemVariants} className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
                          <span className="text-sm sm:text-base font-medium text-slate-200">
                            Envio automático de XML para o contador
                          </span>
                        </motion.div>

                        <motion.div variants={checklistItemVariants} className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
                          <span className="text-sm sm:text-base font-medium text-slate-200">
                            Estoque e financeiro atualizados a cada nota emitida
                          </span>
                        </motion.div>
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="flex flex-col sm:flex-row sm:items-center gap-5 pt-4">

                  <button
                    onClick={onGoToLogin}
                    id="btn-hero-simplificar"
                    className="bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm sm:text-base px-8 py-4 rounded-xl transition-all shadow-lg shadow-blue-950/40 hover:shadow-xl cursor-pointer text-center flex items-center justify-center gap-2"
                  >
                    <span>Quero Simplificar Minha Rotina</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex flex-col justify-center">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      A PARTIR DE
                    </span>
                    <span className="text-lg sm:text-xl font-extrabold text-blue-300 leading-tight">
                      R$ 3,99/dia
                    </span>
                  </div>

                </div>

              </motion.div>

              <motion.div
                style={{ y: cardY, scale: cardScale, rotate: cardRotate }}
                className="lg:col-span-5 flex justify-center lg:justify-end"
              >
                <div className="w-full max-w-lg min-h-[320px] bg-white/[0.06] backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl shadow-black/40 overflow-hidden">

                  <div className="bg-white/5 border-b border-white/10 px-4 py-3 flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-400/80"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80"></div>
                    </div>
                    <div className="flex-1 mx-2">
                      <div className="bg-white/10 border border-white/10 rounded-md px-3 py-1 text-[11px] text-slate-300 font-mono text-center truncate">
                        painel.suptecnologia.com.br
                      </div>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {slide.variante === 'painel' ? (
                      <motion.div
                        key={slide.id}
                        variants={heroSlideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="p-6 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="h-5 w-32 bg-white/10 rounded-md"></div>
                          <div className="w-8 h-8 rounded-full bg-blue-400/20 border border-blue-300/20"></div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-white/[0.04] p-3 rounded-lg border border-white/10 space-y-2">
                            <div className="h-2 w-10 bg-blue-300/30 rounded"></div>
                            <div className="h-5 w-full bg-blue-400 rounded"></div>
                          </div>
                          <div className="bg-white/[0.04] p-3 rounded-lg border border-white/10 space-y-2">
                            <div className="h-2 w-10 bg-white/15 rounded"></div>
                            <div className="h-5 w-full bg-white/25 rounded"></div>
                          </div>
                          <div className="bg-white/[0.04] p-3 rounded-lg border border-white/10 space-y-2">
                            <div className="h-2 w-10 bg-white/15 rounded"></div>
                            <div className="h-5 w-full bg-white/15 rounded"></div>
                          </div>
                        </div>

                        <div className="bg-white/[0.04] p-4 rounded-xl border border-white/10 space-y-3">
                          <div className="h-2.5 w-3/4 bg-white/15 rounded"></div>
                          <div className="h-2 w-1/2 bg-white/10 rounded"></div>

                          <div className="pt-2 flex gap-2">
                            <div className="h-8 w-24 bg-blue-500 rounded-lg"></div>
                            <div className="h-8 w-24 bg-white/10 rounded-lg"></div>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key={slide.id}
                        variants={heroSlideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="p-8 grid grid-cols-3 gap-4 place-items-center"
                      >
                        {slide.icones.map((Icon, i) => (
                          <div
                            key={i}
                            className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-blue-300"
                          >
                            <Icon className="w-7 h-7" />
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              </motion.div>

            </div>
          </div>

          {/* Dots do slider + faixa de confiança, ainda dentro do hero escuro */}
          <div className="relative border-t border-white/10">
            <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-5">

              <div className="flex items-center gap-2 order-2 sm:order-1">
                {HERO_SLIDES.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveSlide(i)}
                    aria-label={`Ir para o slide ${i + 1}: ${s.eyebrow}`}
                    aria-current={activeSlide === i}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      activeSlide === i ? 'w-8 bg-blue-400' : 'w-2 bg-white/25 hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-slate-300 order-1 sm:order-2">
                {[
                  { icon: Layers, label: '6 documentos fiscais' },
                  { icon: ShieldCheck, label: 'ICP-Brasil A1' },
                  { icon: Zap, label: 'Emissão em segundos' },
                  { icon: Sparkles, label: 'Reforma 2026 pronta' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
                    <item.icon className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </section>

        <motion.div ref={featuresRef} style={{ backgroundColor: bgColor }}>

          {/* ============================================================
              FISCAL — bento grid com os 6 módulos reais (NF-e, NFS-e, NFC-e,
              CT-e, NFA-e, MDF-e). Os dois primeiros ganham destaque (big).
              ============================================================ */}
          <section id="fiscal" className="py-20 border-t border-slate-200">
            <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">

              <motion.div
                variants={sectionHeaderVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.3 }}
                className="max-w-2xl mb-10"
              >
                <motion.div
                  variants={sectionHeaderItemVariants}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-2"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Módulo Fiscal Completo</span>
                </motion.div>
                <motion.h2 variants={sectionHeaderItemVariants} className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Todos os documentos fiscais, sem complicação
                </motion.h2>
                <motion.p variants={sectionHeaderItemVariants} className="text-sm text-slate-600 mt-1">
                  Conformidade total com a Receita Federal, SEFAZ estaduais e municípios. Pronto para o
                  padrão nacional e a Reforma Tributária (IBS/CBS).
                </motion.p>
              </motion.div>

              <motion.div
                variants={gridVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {MODULOS_FISCAIS.map((mod) => (
                  <motion.div
                    key={mod.nome}
                    variants={cardVariants}
                    className={`group relative overflow-hidden bg-white p-6 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all ${
                      'big' in mod && mod.big ? 'lg:col-span-2' : ''
                    }`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${mod.accent.split(' ')[0]} to-transparent opacity-40`} />
                    <div className="relative space-y-4">
                      <div className="flex items-center justify-between">
                        <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${mod.accent}`}>
                          <mod.icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                          {mod.modelo}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{mod.nome}</h3>
                        <p className="text-sm text-slate-600 mt-1 leading-relaxed">{mod.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              <div className="mt-8">
                <button
                  onClick={onGoToLogin}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  <span>Acessar o Módulo Fiscal</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </section>

          {/* ============================================================
              GESTÃO — cadastros reais (Produtos/Estoque, Serviços, Clientes,
              Fornecedores, Transportadoras).
              ============================================================ */}
          <section id="gestao" className="py-20 border-t border-slate-200">
            <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">

              <motion.div
                variants={sectionHeaderVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.3 }}
                className="max-w-2xl mb-10"
              >
                <motion.div
                  variants={sectionHeaderItemVariants}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2"
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Cadastros & Estoque</span>
                </motion.div>
                <motion.h2 variants={sectionHeaderItemVariants} className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Uma base única para todo mundo da sua operação
                </motion.h2>
                <motion.p variants={sectionHeaderItemVariants} className="text-sm text-slate-600 mt-1">
                  Produtos, serviços, clientes, fornecedores e transportadoras — cadastrados uma vez,
                  usados em todos os módulos fiscais e financeiros automaticamente.
                </motion.p>
              </motion.div>

              <motion.div
                variants={gridVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.2 }}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
              >
                {MODULOS_GESTAO.map((mod) => (
                  <motion.div
                    key={mod.nome}
                    variants={cardVariants}
                    className="bg-slate-50 hover:bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all space-y-3"
                  >
                    <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center">
                      <mod.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{mod.nome}</h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{mod.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              <div className="mt-8">
                <button
                  onClick={onGoToLogin}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  <span>Acessar Cadastros & Estoque</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </section>

          {/* ============================================================
              FINANCEIRO & FERRAMENTAS — Financeiro/Pix, Certificado A1,
              Consulta CNPJ.
              ============================================================ */}
          <section id="financeiro" className="py-20 border-t border-slate-200">
            <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">

              <motion.div
                variants={sectionHeaderVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.3 }}
                className="max-w-2xl mb-10"
              >
                <motion.div
                  variants={sectionHeaderItemVariants}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Financeiro & Ferramentas</span>
                </motion.div>
                <motion.h2 variants={sectionHeaderItemVariants} className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Da emissão ao recebimento, sem planilha
                </motion.h2>
                <motion.p variants={sectionHeaderItemVariants} className="text-sm text-slate-600 mt-1">
                  Cobrança, certificado digital e consulta pública de CNPJ — o essencial para manter a
                  operação em dia, dentro do mesmo painel.
                </motion.p>
              </motion.div>

              <motion.div
                variants={gridVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {MODULOS_FINANCEIRO.map((mod) => (
                  <motion.div
                    key={mod.nome}
                    variants={cardVariants}
                    className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 hover:border-emerald-300 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <mod.icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{mod.nome}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{mod.desc}</p>
                  </motion.div>
                ))}
              </motion.div>

              <div className="mt-8">
                <button
                  onClick={onGoToLogin}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  <span>Acessar Financeiro</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </section>

        </motion.div>

        {/* ============================================================
            CTA final — antes do rodapé
            ============================================================ */}
        <section className="relative bg-slate-950 overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(50% 60% at 50% 0%, rgba(37,99,235,0.30), transparent 65%)',
            }}
          />
          <motion.div
            variants={sectionHeaderVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.4 }}
            className="relative max-w-4xl mx-auto px-6 sm:px-10 lg:px-12 py-20 text-center space-y-6"
          >
            <motion.h2 variants={sectionHeaderItemVariants} className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Pronto para simplificar sua rotina fiscal?
            </motion.h2>
            <motion.p variants={sectionHeaderItemVariants} className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto">
              NF-e, NFS-e, NFC-e, CT-e, NFA-e, MDF-e, estoque, cadastros e financeiro — em uma única
              plataforma, a partir de R$ 3,99/dia.
            </motion.p>
            <motion.div variants={sectionHeaderItemVariants}>
              <button
                onClick={onGoToLogin}
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm sm:text-base px-8 py-4 rounded-xl transition-all shadow-lg cursor-pointer"
              >
                <span>Começar Agora</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        </section>

        <footer className="w-full bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-slate-800">

              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-extrabold text-lg">
                    S
                  </div>
                  <span className="font-extrabold text-xl text-white tracking-tight">
                    SUP TECNOLOGIA
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                  Plataforma corporativa especializada em emissão fiscal inteligente (NF-e, NFS-e, NFC-e,
                  CT-e, NFA-e e MDF-e), gestão integrada de estoque, cadastros e fluxo financeiro automatizado.
                </p>

                <div className="space-y-1.5 text-xs text-slate-400 pt-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span><strong>Razão Social:</strong> {razaoSocial}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 text-center text-blue-400 font-bold shrink-0">#</span>
                    <span><strong>CNPJ:</strong> {cnpj}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>{logradouro}, {numero} - {municipio}/{uf}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Módulo Fiscal
                </h4>
                <ul className="space-y-2 text-xs text-slate-400">
                  <li>
                    <button onClick={() => scrollToSection('fiscal')} className="hover:text-white transition-colors cursor-pointer">
                      NF-e — Modelo 55
                    </button>
                  </li>
                  <li>
                    <button onClick={() => scrollToSection('fiscal')} className="hover:text-white transition-colors cursor-pointer">
                      NFS-e — Padrão Nacional
                    </button>
                  </li>
                  <li>
                    <button onClick={() => scrollToSection('fiscal')} className="hover:text-white transition-colors cursor-pointer">
                      NFC-e — Modelo 65
                    </button>
                  </li>
                  <li>
                    <button onClick={() => scrollToSection('fiscal')} className="hover:text-white transition-colors cursor-pointer">
                      CT-e — Modelo 57
                    </button>
                  </li>
                  <li>
                    <button onClick={() => scrollToSection('fiscal')} className="hover:text-white transition-colors cursor-pointer">
                      NFA-e & MDF-e
                    </button>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Gestão & Financeiro
                </h4>
                <ul className="space-y-2 text-xs text-slate-400">
                  <li>
                    <button onClick={() => scrollToSection('gestao')} className="hover:text-white transition-colors cursor-pointer">
                      Produtos / Estoque
                    </button>
                  </li>
                  <li>
                    <button onClick={() => scrollToSection('gestao')} className="hover:text-white transition-colors cursor-pointer">
                      Clientes & Fornecedores
                    </button>
                  </li>
                  <li>
                    <button onClick={() => scrollToSection('gestao')} className="hover:text-white transition-colors cursor-pointer">
                      Transportadoras
                    </button>
                  </li>
                  <li>
                    <button onClick={() => scrollToSection('financeiro')} className="hover:text-white transition-colors cursor-pointer">
                      Contas a Pagar & Receber
                    </button>
                  </li>
                  <li>
                    <button onClick={() => scrollToSection('financeiro')} className="hover:text-white transition-colors cursor-pointer">
                      Cobrança Pix Instantâneo
                    </button>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Conformidade & Suporte
                </h4>
                <ul className="space-y-2 text-xs text-slate-400">
                  <li className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>ICP-Brasil A1</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>SEFAZ / NF-e v4.0</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Reforma 2026 (IBS / CBS)</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Segurança SSL / TLS</span>
                  </li>
                  <li className="flex items-center gap-2 pt-1">
                    <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>contato@suptecnologia.com.br</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Seg a Sex: 08h às 18h</span>
                  </li>
                </ul>

                <div className="pt-2">
                  <button
                    onClick={onGoToLogin}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Acessar o Painel</span>
                  </button>
                </div>
              </div>

            </div>

            <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
              <div>
                © {new Date().getFullYear()} SUP TECNOLOGIA. Todos os direitos reservados.
              </div>
              <div className="flex items-center gap-4 text-[11px]">
                <span>Termos de Uso</span>
                <span>•</span>
                <span>Privacidade & LGPD</span>
                <span>•</span>
                <span>Padrão Fiscal SEFAZ / Receita Federal</span>
              </div>
            </div>

          </div>
        </footer>

      </div>
    </MotionConfig>
  );
};
