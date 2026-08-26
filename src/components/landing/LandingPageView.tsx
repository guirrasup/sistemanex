// C:\emissornfe\src\components\landing\LandingPageView.tsx

import React from 'react';
import { 
  LogIn, 
  Receipt, 
  FileText, 
  Boxes, 
  TrendingUp, 
  QrCode, 
  ShieldCheck, 
  CheckCircle2, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowRight,
  Sparkles,
  Lock,
  Clock,
  ExternalLink,
  ChevronRight,
  Database
} from 'lucide-react';
import { ConfiguracaoEmpresa } from '../../types/erp';

interface LandingPageViewProps {
  empresa: ConfiguracaoEmpresa;
  onGoToLogin: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({ empresa, onGoToLogin }) => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 🔥 VALORES SEGUROS COM FALLBACK
  const razaoSocial = empresa?.razaoSocial || 'SUP TECNOLOGIA';
  const cnpj = empresa?.cnpj || '00.000.000/0000-00';
  const logradouro = empresa?.endereco?.logradouro || 'Av. Paulista';
  const numero = empresa?.endereco?.numero || '1374';
  const municipio = empresa?.endereco?.nomeMunicipio || 'São Paulo';
  const uf = empresa?.endereco?.uf || 'SP';

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between font-sans selection:bg-blue-600 selection:text-white scroll-smooth">
      
      {/* 1. Header Superior com Links e Botão Entrar */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 shadow-2xs">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 h-20 flex items-center justify-between">
          
          {/* Logo S + SUP TECNOLOGIA */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection('hero')}>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-xs">
              S
            </div>
            <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-blue-950">
              SUP TECNOLOGIA
            </span>
          </div>

          {/* Menus e Botão Entrar */}
          <div className="flex items-center gap-6 sm:gap-10">
            <nav className="hidden md:flex items-center gap-8 text-xs font-bold tracking-wider text-slate-700 uppercase">
              <button 
                onClick={() => scrollToSection('fiscal')} 
                className="hover:text-blue-600 transition-colors cursor-pointer"
              >
                Fiscal
              </button>
              <button 
                onClick={() => scrollToSection('estoque')} 
                className="hover:text-blue-600 transition-colors cursor-pointer"
              >
                Estoque
              </button>
              <button 
                onClick={() => scrollToSection('financeiro')} 
                className="hover:text-blue-600 transition-colors cursor-pointer"
              >
                Financeiro
              </button>
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

        </div>
      </header>

      {/* 2. Hero Section */}
      <section id="hero" className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-10 sm:py-16 w-full flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center w-full">
          
          {/* Coluna Esquerda: Textos, Título, Bullet points e CTA */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Pill / Tag: SISTEMA COMPLETO DE GESTÃO */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/80 border border-blue-100">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span className="text-[11px] sm:text-xs font-bold text-blue-900 tracking-wider uppercase">
                SISTEMA COMPLETO DE GESTÃO
              </span>
            </div>

            {/* Título Principal */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black tracking-tight text-slate-900 leading-[1.12]">
              Emissor de NF-e <br />
              <span className="text-blue-600">Simples, Rápido</span> e <br />
              Integrado
            </h1>

            {/* Subtítulo Descritivo */}
            <p className="text-base sm:text-lg text-slate-600 max-w-xl font-normal leading-relaxed">
              Organize sua empresa em um só lugar: Emissão de NF-e, DANFE, XML, controle de estoque e financeiro conectado.
            </p>

            {/* Itens com Check Azul */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-3">
                <div className="text-blue-600 font-black text-base flex items-center justify-center">
                  ✓
                </div>
                <span className="text-sm sm:text-base font-medium text-slate-800">
                  Menos digitação manual, mais tempo para vender
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-blue-600 font-black text-base flex items-center justify-center">
                  ✓
                </div>
                <span className="text-sm sm:text-base font-medium text-slate-800">
                  Envio automático de XML para contador
                </span>
              </div>
            </div>

            {/* Botão Escuro + Preço ao Lado */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 pt-4">
              
              <button
                onClick={onGoToLogin}
                id="btn-hero-simplificar"
                className="bg-[#0b132b] hover:bg-slate-900 text-white font-bold text-sm sm:text-base px-8 py-4 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer text-center flex items-center justify-center gap-2"
              >
                <span>Quero Simplificar Minha Rotina</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex flex-col justify-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  A PARTIR DE
                </span>
                <span className="text-lg sm:text-xl font-extrabold text-blue-600 leading-tight">
                  R$ 3,99/dia
                </span>
              </div>

            </div>

          </div>

          {/* Coluna Direita: Mockup da Janela do Painel */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200/90 shadow-2xl overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
              
              {/* Barra superior do Browser Mockup */}
              <div className="bg-slate-50 border-b border-slate-200/80 px-4 py-3 flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                </div>
                <div className="flex-1 mx-2">
                  <div className="bg-white border border-slate-200 rounded-md px-3 py-1 text-[11px] text-slate-400 font-mono text-center truncate">
                    painel.suptecnologia.com.br
                  </div>
                </div>
              </div>

              {/* Conteúdo visual interno do mockup */}
              <div className="p-6 space-y-4 bg-slate-50/50">
                
                {/* Linha de topo no mockup */}
                <div className="flex items-center justify-between">
                  <div className="h-5 w-32 bg-slate-200 rounded-md"></div>
                  <div className="w-8 h-8 rounded-full bg-blue-100"></div>
                </div>

                {/* 3 mini cards ilustrativos */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white p-3 rounded-lg border border-slate-200/80 shadow-2xs space-y-2">
                    <div className="h-2 w-10 bg-blue-200 rounded"></div>
                    <div className="h-5 w-full bg-blue-600 rounded"></div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200/80 shadow-2xs space-y-2">
                    <div className="h-2 w-10 bg-slate-200 rounded"></div>
                    <div className="h-5 w-full bg-slate-400 rounded"></div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200/80 shadow-2xs space-y-2">
                    <div className="h-2 w-10 bg-slate-200 rounded"></div>
                    <div className="h-5 w-full bg-slate-300 rounded"></div>
                  </div>
                </div>

                {/* Bloco de tabela / formulário ilustrado */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
                  <div className="h-2.5 w-3/4 bg-slate-200 rounded"></div>
                  <div className="h-2 w-1/2 bg-slate-100 rounded"></div>
                  
                  <div className="pt-2 flex gap-2">
                    <div className="h-8 w-24 bg-blue-600 rounded-lg"></div>
                    <div className="h-8 w-24 bg-slate-200 rounded-lg"></div>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 3. Seção FISCAL */}
      <section id="fiscal" className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-2">
                <FileText className="w-3.5 h-3.5" />
                <span>Módulo Fiscal Completo</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Emissão Fiscal Sem Complicações
              </h2>
              <p className="text-sm text-slate-600 max-w-2xl mt-1">
                Conformidade total com a Receita Federal, SEFAZ estaduais e municípios. Pronto para o padrão nacional e a Reforma Tributária.
              </p>
            </div>

            <button
              onClick={onGoToLogin}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              <span>Acessar Módulo Fiscal</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: NF-e */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 hover:border-blue-300 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">NF-e (Modelo 55 - Produtos)</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Emissão rápida com cálculo automático de ICMS, IPI, PIS, COFINS, NCM e geração instantânea de DANFE em PDF e XML.
                </p>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Cálculo tributário automatizado por CFOP</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Impressão de DANFE com código de barras</span>
                </li>
              </ul>
            </div>

            {/* Card 2: NFS-e */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 hover:border-blue-300 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">NFS-e (Padrão Nacional)</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Geração de DPS conforme o layout oficial da Receita Federal com retenções automáticas (ISS, IRRF, CSLL, PIS/COFINS).
                </p>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Padrão Nacional Receita Federal</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>DANFSe com QR Code de autenticação</span>
                </li>
              </ul>
            </div>

            {/* Card 3: Certificado e Segurança */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 hover:border-blue-300 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Certificado Digital A1</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Assinatura digital padrão ICP-Brasil com criptografia SHA256 e monitoramento de validade com alerta de renovação.
                </p>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>Assinatura XMLDSig em tempo real</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>Reforma Tributária 2026 (IBS / CBS)</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* 4. Seção ESTOQUE */}
      <section id="estoque" className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
                <Boxes className="w-3.5 h-3.5" />
                <span>Gestão de Estoque & Produtos</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Controle Físico e Fiscal Sincronizado
              </h2>
              <p className="text-sm text-slate-600 max-w-2xl mt-1">
                Ao emitir uma nota fiscal, seu estoque é atualizado instantaneamente, evitando furos e retrabalho.
              </p>
            </div>

            <button
              onClick={onGoToLogin}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              <span>Acessar Módulo Estoque</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h3 className="text-sm font-bold text-slate-900">Baixa Automática por Faturamento</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Cada item faturado na NF-e abate a quantidade em estoque com registro de data, hora e número da nota vinculada.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h3 className="text-sm font-bold text-slate-900">Cadastro de Itens com NCM e EAN</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Catálogo estruturado com tributação padrão, código de barras (GTIN/EAN), unidade de medida e preço de venda.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h3 className="text-sm font-bold text-slate-900">Alerta de Estoque Mínimo</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Indicadores visuais de itens com estoque baixo para planejar reposição com fornecedores sem interromper vendas.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 5. Seção FINANCEIRO */}
      <section id="financeiro" className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Financeiro & Cobrança Pix</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Fluxo de Caixa e Liquidação Imediata
              </h2>
              <p className="text-sm text-slate-600 max-w-2xl mt-1">
                Contas a pagar e a receber integradas diretamente com suas notas fiscais de venda e prestação de serviços.
              </p>
            </div>

            <button
              onClick={onGoToLogin}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              <span>Acessar Módulo Financeiro</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="w-10 h-10 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">QR Code Pix Instantâneo</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Gere cobranças Pix padrão Banco Central (BACEN) com chave Pix oficial, Copia e Cola e liquidação em tempo real.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Contas a Receber Automático</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ao autorizar notas fiscais a prazo, os títulos são lançados no contas a receber com vencimentos e valores calculados.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Relatórios & Conciliação</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Visão detalhada de faturamento diário, contas pendentes, valores recebidos e histórico consolidado por cliente.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 6. Rodapé Institucional Completo */}
      <footer className="w-full bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
          
          {/* Grade Institucional */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-slate-800">
            
            {/* Coluna 1 e 2: Marca, Apresentação e Dados da Empresa */}
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
                Plataforma corporativa especializada em emissão fiscal inteligente, gestão integrada de faturamento, controle de estoque e fluxo financeiro automatizado.
              </p>

              {/* 🔥 DADOS DA EMPRESA COM FALLBACK */}
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

            {/* Coluna 3: Módulos do Sistema */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Módulos do Sistema
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <button onClick={() => scrollToSection('fiscal')} className="hover:text-white transition-colors cursor-pointer">
                    NF-e Modelo 55 (Produtos)
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('fiscal')} className="hover:text-white transition-colors cursor-pointer">
                    NFS-e Padrão Nacional
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('estoque')} className="hover:text-white transition-colors cursor-pointer">
                    Gestão de Estoque
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

            {/* Coluna 4: Conformidade & Fiscal */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Conformidade Fiscal
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
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Receita Federal (DPS)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Reforma 2026 (IBS / CBS)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Segurança SSL / TLS</span>
                </li>
              </ul>
            </div>

            {/* Coluna 5: Atendimento & Acesso */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Atendimento & Suporte
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2">
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

          {/* Linha Final de Copyright */}
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
  );
};