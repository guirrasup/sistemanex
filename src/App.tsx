// C:\emissornfe\src\App.tsx
// ✅ VERSÃO COMPLETA E ATUALIZADA - COM MDF-e

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPageView } from './components/landing/LandingPageView';
import { LoginView } from './components/auth/LoginView';
import { DashboardReal } from './components/dashboard/DashboardReal';
import { AlertasSistema } from './components/ui/AlertasSistema';
import { NfseEmissor } from './components/fiscal/NfseEmissor';
import { NfeEmissor } from './components/fiscal/NfeEmissor';
import { NfceEmissor } from './components/fiscal/NfceEmissor';
import { CteEmissor } from './components/fiscal/CteEmissor';
import { NfaeEmissor } from './components/fiscal/NfaeEmissor';
// 🔥 NOVO - MDF-e
import { MdfeEmissor } from './components/fiscal/MdfeEmissor';
import { DamdfeViewer } from './components/fiscal/DamdfeViewer';
import { DocumentosFiscaisList } from './components/fiscal/DocumentosFiscaisList';
import { DanfseViewer } from './components/fiscal/DanfseViewer';
import { DanfeViewer } from './components/fiscal/DanfeViewer';
import { DanfceViewer } from './components/fiscal/DanfceViewer';
import { DacteViewer } from './components/fiscal/DacteViewer';
import { DanfaeViewer } from './components/fiscal/DanfaeViewer';
import { ProdutosView } from './components/cadastros/ProdutosView';
import { ClientesView } from './components/cadastros/ClientesView';
import { FornecedoresView } from './components/cadastros/FornecedoresView';
import { ServicosView } from './components/cadastros/ServicosView';
import { TransportadorasView } from './components/cadastros/TransportadorasView';
import { FinanceiroView } from './components/financeiro/FinanceiroView';
import { ConfiguracoesEmpresaView } from './components/config/ConfiguracoesEmpresaView';
import { ConsultaCnpjView } from './components/tools/ConsultaCnpjView';
import { ToastProvider } from './components/ui/ToastProvider';
import { StorageService } from './utils/storage';
import { NFSeDocumento, NFeDocumento, NFCeDocumento, CTeDocumento, NFAeDocumento } from './types/fiscal';
// 🔥 NOVO - MDF-e types
import { MDFeDocumento } from './types/mdfe';
import { Produto, ClienteFornecedor, ServicoCatalogo, TituloFinanceiro, ConfiguracaoEmpresa, UsuarioAuth } from './types/erp';
import { produtosService } from './services/produtos.service';
import { clientesService } from './services/clientes.service';
import { servicosService } from './services/servicos.service';
import { financeiroService } from './services/financeiro.service';
import { nfeService } from './services/nfe.service';
import { nfseService } from './services/nfse.service';
import { nfceService } from './services/nfce.service';
import { cteService } from './services/cte.service';
import { nfaeService } from './services/nfae.service';
// 🔥 NOVO - MDF-e service
import { mdfeService } from './services/mdfe.service';
import { transportadoraService, Transportadora } from './services/transportadora.service';
import { LoadingDinamico } from './components/ui/LoadingDinamico';
import api from './services/api';

// 🔥 CACHE DE DADOS PARA EVITAR REQUISIÇÕES DUPLICADAS
interface CacheData {
  produtos: Produto[];
  clientes: ClienteFornecedor[];
  servicos: ServicoCatalogo[];
  titulos: TituloFinanceiro[];
  nfses: NFSeDocumento[];
  nfes: NFeDocumento[];
  nfces: NFCeDocumento[];
  ctes: CTeDocumento[];
  nfaes: NFAeDocumento[];
  // 🔥 NOVO - MDF-e
  mdfes: MDFeDocumento[];
  transportadoras: Transportadora[];
  timestamp: number;
}

const CACHE_TTL = 30000; // 30 segundos

export default function App() {
  // 🔥 Autenticação e Sessão
  const [usuarioLogado, setUsuarioLogado] = useState<UsuarioAuth | null>(() => {
    const token = localStorage.getItem('@sup:token');
    const user = localStorage.getItem('@sup:user');
    console.log('🔍 Verificando sessão:');
    console.log('  Token:', token ? '✅ Presente' : '❌ Ausente');
    console.log('  User:', user ? '✅ Presente' : '❌ Ausente');
    
    if (token && user) {
      try {
        const parsed = JSON.parse(user);
        console.log('👤 Usuário restaurado:', parsed.email);
        return parsed;
      } catch {
        console.warn('⚠️ Erro ao parsear user');
        return null;
      }
    }
    return null;
  });

  const [telaNaoLogado, setTelaNaoLogado] = useState<'landing' | 'login'>('landing');
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [carregando, setCarregando] = useState<boolean>(true);

  // App State
  const [empresa, setEmpresa] = useState<ConfiguracaoEmpresa>(StorageService.getConfiguracao());
  const [nfses, setNfses] = useState<NFSeDocumento[]>([]);
  const [nfes, setNfes] = useState<NFeDocumento[]>([]);
  const [nfces, setNfces] = useState<NFCeDocumento[]>([]);
  const [ctes, setCtes] = useState<CTeDocumento[]>([]);
  const [nfaes, setNfaes] = useState<NFAeDocumento[]>([]);
  // 🔥 NOVO - MDF-e
  const [mdfes, setMdfes] = useState<MDFeDocumento[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [clientes, setClientes] = useState<ClienteFornecedor[]>([]);
  const [servicos, setServicos] = useState<ServicoCatalogo[]>([]);
  const [titulos, setTitulos] = useState<TituloFinanceiro[]>([]);
  const [transportadoras, setTransportadoras] = useState<Transportadora[]>([]);

  // Modal Viewers
  const [viewingDanfse, setViewingDanfse] = useState<NFSeDocumento | null>(null);
  const [viewingDanfe, setViewingDanfe] = useState<NFeDocumento | null>(null);
  const [viewingDanfce, setViewingDanfce] = useState<NFCeDocumento | null>(null);
  const [viewingDacte, setViewingDacte] = useState<CTeDocumento | null>(null);
  const [viewingDanfae, setViewingDanfae] = useState<NFAeDocumento | null>(null);
  // 🔥 NOVO - MDF-e Viewer
  const [viewingMdfe, setViewingMdfe] = useState<MDFeDocumento | null>(null);

  // 🔥 CONTROLE DE REQUISIÇÕES
  const isRefreshing = useRef(false);
  const lastRefreshTime = useRef(0);
  const cacheRef = useRef<CacheData | null>(null);

  // ============================================================
  // FUNÇÃO DE REFRESH COM CACHE E CONTROLE DE CONCORRÊNCIA
  // ============================================================

  const refreshData = useCallback(async (forceRefresh: boolean = false) => {
    console.log('🔄 ===== REFRESH DATA INICIADO =====');
    console.log('📌 forceRefresh:', forceRefresh);
    console.log('📌 isRefreshing:', isRefreshing.current);

    if (isRefreshing.current) {
      console.log('⏳ Refresh em andamento, ignorando chamada...');
      return;
    }

    if (!forceRefresh && cacheRef.current) {
      const now = Date.now();
      if (now - cacheRef.current.timestamp < CACHE_TTL) {
        console.log('📦 Usando dados em cache');
        const cache = cacheRef.current;
        setProdutos(cache.produtos);
        setClientes(cache.clientes);
        setServicos(cache.servicos);
        setTitulos(cache.titulos);
        setNfses(cache.nfses);
        setNfes(cache.nfes);
        setNfces(cache.nfces || []);
        setCtes(cache.ctes || []);
        setNfaes(cache.nfaes || []);
        // 🔥 NOVO - MDF-e
        setMdfes(cache.mdfes || []);
        setTransportadoras(cache.transportadoras || []);
        console.log('✅ Cache aplicado com sucesso!');
        return;
      }
    }

    const now = Date.now();
    if (now - lastRefreshTime.current < 2000) {
      console.log('⏳ Aguardando cooldown...');
      return;
    }
    lastRefreshTime.current = now;

    isRefreshing.current = true;

    try {
      setCarregando(true);
      
      const token = localStorage.getItem('@sup:token');
      console.log('🔑 Token:', token ? `✅ Presente` : '❌ Ausente');
      
      if (!token) {
        console.warn('⚠️ Sem token, carregando dados do cache local');
        setProdutos(StorageService.getProdutos());
        setClientes(StorageService.getClientes());
        setServicos(StorageService.getServicos());
        setTitulos(StorageService.getTitulos());
        setNfses(StorageService.getNfses());
        setNfes(StorageService.getNfes());
        setNfces(StorageService.getNfces() || []);
        setCtes(StorageService.getCtes() || []);
        setNfaes(StorageService.getNfaes() || []);
        setMdfes([]);
        setTransportadoras([]);
        setCarregando(false);
        console.log('✅ Dados carregados do cache local');
        return;
      }

      console.log('🔄 Carregando dados do backend...');

      const servicePromises = [
        produtosService.listar(1, 100),
        clientesService.listar(1, 100),
        servicosService.listar(1, 100),
        financeiroService.listar(1, 100),
        nfseService.listar(1, 100),
        nfeService.listar(1, 100),
        nfceService.listar(1, 100),
        cteService.listar(1, 100),
        nfaeService.listar(1, 100),
        // 🔥 NOVO - MDF-e
        mdfeService.listar(1, 100),
        transportadoraService.listar(1, 100),
      ];

      console.log('📡 Enviando', servicePromises.length, 'requisições...');
      
      const results = await Promise.allSettled(servicePromises);

      console.log('📊 ===== RESULTADOS DAS REQUISIÇÕES =====');
      let hasError = false;
      
      const serviceNames = ['produtos', 'clientes', 'servicos', 'financeiro', 'nfse', 'nfe', 'nfce', 'cte', 'nfae', 'mdfe', 'transportadoras'];
      
      results.forEach((result, index) => {
        const name = serviceNames[index];
        if (result.status === 'fulfilled') {
          const data = result.value;
          const count = data?.data?.length || data?.length || 0;
          console.log(`✅ ${name}: OK (${count} itens)`);
        } else {
          hasError = true;
          console.error(`❌ ${name}: FALHOU`);
          console.error(`   Motivo:`, result.reason);
        }
      });

      if (hasError) {
        console.warn('⚠️ Algumas requisições falharam, mas continuando...');
      }

      const getData = (result: PromiseSettledResult<any>, index: number) => {
        if (result.status === 'fulfilled') {
          const value = result.value;
          const data = value?.dados?.data || value?.data || [];
          console.log(`📦 getData ${serviceNames[index]}:`, Array.isArray(data) ? data.length : 0);
          return { data: Array.isArray(data) ? data : [] };
        }
        console.warn(`⚠️ Rota ${serviceNames[index]} falhou, retornando array vazio`);
        return { data: [] };
      };

      const [
        produtosResult,
        clientesResult,
        servicosResult,
        titulosResult,
        nfsesResult,
        nfesResult,
        nfcesResult,
        ctesResult,
        nfaesResult,
        // 🔥 NOVO - MDF-e
        mdfesResult,
        transportadorasResult
      ] = results.map((r, i) => getData(r, i));

      const empresaConfig = StorageService.getConfiguracao();

      const cacheData: CacheData = {
        produtos: produtosResult.data || [],
        clientes: clientesResult.data || [],
        servicos: servicosResult.data || [],
        titulos: titulosResult.data || [],
        nfses: nfsesResult.data || [],
        nfes: nfesResult.data || [],
        nfces: nfcesResult.data || [],
        ctes: ctesResult.data || [],
        nfaes: nfaesResult.data || [],
        // 🔥 NOVO - MDF-e
        mdfes: mdfesResult.data || [],
        transportadoras: transportadorasResult.data || [],
        timestamp: Date.now()
      };

      cacheRef.current = cacheData;

      setProdutos(cacheData.produtos);
      setClientes(cacheData.clientes);
      setServicos(cacheData.servicos);
      setTitulos(cacheData.titulos);
      setNfses(cacheData.nfses);
      setNfes(cacheData.nfes);
      setNfces(cacheData.nfces || []);
      setCtes(cacheData.ctes || []);
      setNfaes(cacheData.nfaes || []);
      // 🔥 NOVO - MDF-e
      setMdfes(cacheData.mdfes || []);
      setTransportadoras(cacheData.transportadoras);
      setEmpresa(empresaConfig);

      StorageService.saveProdutos(cacheData.produtos);
      StorageService.saveClientes(cacheData.clientes);
      StorageService.saveServicos(cacheData.servicos);
      StorageService.saveTitulos(cacheData.titulos);
      
      console.log('✅ Dados carregados do backend com sucesso!');
      console.log('📊 Totais:');
      console.log(`   Produtos: ${cacheData.produtos.length}`);
      console.log(`   Clientes: ${cacheData.clientes.length}`);
      console.log(`   Serviços: ${cacheData.servicos.length}`);
      console.log(`   Títulos: ${cacheData.titulos.length}`);
      console.log(`   NFS-e: ${cacheData.nfses.length}`);
      console.log(`   NF-e: ${cacheData.nfes.length}`);
      console.log(`   NFC-e: ${cacheData.nfces.length}`);
      console.log(`   CT-e: ${cacheData.ctes.length}`);
      console.log(`   NFA-e: ${cacheData.nfaes.length}`);
      console.log(`   MDF-e: ${cacheData.mdfes.length}`); // 🔥 NOVO
      console.log(`   Transportadoras: ${cacheData.transportadoras.length}`);

    } catch (error: any) {
      console.error('❌ ERRO GLOBAL no refreshData:');
      console.error('   Mensagem:', error.message);
      
      console.warn('⚠️ Usando fallback para cache local');
      setProdutos(StorageService.getProdutos());
      setClientes(StorageService.getClientes());
      setServicos(StorageService.getServicos());
      setTitulos(StorageService.getTitulos());
      setNfses(StorageService.getNfses());
      setNfes(StorageService.getNfes());
      setNfces(StorageService.getNfces() || []);
      setCtes(StorageService.getCtes() || []);
      setNfaes(StorageService.getNfaes() || []);
      setMdfes([]);
      setTransportadoras([]);
    } finally {
      setCarregando(false);
      isRefreshing.current = false;
      console.log('🔄 ===== REFRESH DATA FINALIZADO =====');
    }
  }, []);

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleLogin = async (user: UsuarioAuth) => {
    console.log('🔑 ===== HANDLE LOGIN =====');
    console.log('👤 Usuário:', user.email);
    
    StorageService.saveUsuarioLogado(user);
    setUsuarioLogado(user);
    setCurrentView('dashboard');
    
    console.log('🔄 Forçando refresh com limpeza de cache...');
    cacheRef.current = null;
    
    try {
      await refreshData(true);
      console.log('✅ Login e refresh concluídos com sucesso!');
    } catch (error) {
      console.error('❌ Erro no refresh após login:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('@sup:token');
    localStorage.removeItem('@sup:user');
    StorageService.saveUsuarioLogado(null);
    setUsuarioLogado(null);
    setTelaNaoLogado('landing');
    setProdutos([]);
    setClientes([]);
    setServicos([]);
    setTitulos([]);
    setNfses([]);
    setNfes([]);
    setNfces([]);
    setCtes([]);
    setNfaes([]);
    setMdfes([]);
    setTransportadoras([]);
    cacheRef.current = null;
  };

  const handleExportBackup = () => {
    const jsonStr = StorageService.exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_erp_sup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleNfseEmitida = () => {
    cacheRef.current = null;
    refreshData(true);
  };
  const handleNfeEmitida = () => {
    cacheRef.current = null;
    refreshData(true);
  };
  const handleNfceEmitida = () => {
    cacheRef.current = null;
    refreshData(true);
  };
  const handleCteEmitido = () => {
    cacheRef.current = null;
    refreshData(true);
  };
  const handleNfaeEmitida = () => {
    cacheRef.current = null;
    refreshData(true);
  };
  // 🔥 NOVO - MDF-e
  const handleMdfeEmitido = () => {
    cacheRef.current = null;
    refreshData(true);
  };

  // ============================================================
  // EFFECT
  // ============================================================

  useEffect(() => {
    console.log('📌 ===== USEEFFECT =====');
    console.log('📌 usuarioLogado:', usuarioLogado ? usuarioLogado.email : 'NULL');
    
    if (usuarioLogado) {
      console.log('🔄 Usuário logado, chamando refreshData...');
      refreshData(false);
    } else {
      console.log('❌ Usuário não logado, setando carregando=false');
      setCarregando(false);
    }
  }, [usuarioLogado, refreshData]);

  // ============================================================
  // SEPARA CLIENTES E FORNECEDORES
  // ============================================================

  const apenasClientes = clientes.filter(c => c.tipo === 'CLIENTE' || c.tipo === 'AMBOS');
  const apenasFornecedores = clientes.filter(c => c.tipo === 'FORNECEDOR' || c.tipo === 'AMBOS');

  // ============================================================
  // TELA DE LOADING
  // ============================================================

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-slate-600">Carregando dados do sistema...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // TELA DE LOGIN
  // ============================================================

  if (!usuarioLogado) {
    if (telaNaoLogado === 'landing') {
      return (
        <LandingPageView 
          empresa={empresa} 
          onGoToLogin={() => setTelaNaoLogado('login')} 
        />
      );
    }
    return (
      <LoginView 
        empresa={empresa} 
        onLogin={handleLogin} 
        onBackToLanding={() => setTelaNaoLogado('landing')} 
      />
    );
  }

  // ============================================================
  // APP PRINCIPAL COM TOAST PROVIDER
  // ============================================================

  return (
    <ToastProvider>
      <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
        
        <Header
          empresa={empresa}
          usuario={usuarioLogado}
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
          onExportarBackup={handleExportBackup}
          onLogout={handleLogout}
        />

        <div className="flex flex-1 min-h-0 overflow-hidden">
          
          <Sidebar
            currentView={currentView}
            onNavigate={(view) => setCurrentView(view)}
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            contadores={{
              nfseCount: nfses.length,
              nfeCount: nfes.length,
              nfceCount: nfces.length,
              cteCount: ctes.length,
              nfaeCount: nfaes.length,
              // 🔥 NOVO - MDF-e
              mdfeCount: mdfes.length,
              produtosCount: produtos.length,
              clientesCount: apenasClientes.length,
              fornecedoresCount: apenasFornecedores.length,
              servicosCount: servicos.length,
              titulosPendentesCount: titulos.filter(t => t.status === 'PENDENTE').length,
              transportadorasCount: transportadoras.length,
            }}
          />

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
            <div className="max-w-7xl mx-auto">
              
              {currentView === 'dashboard' && (
                <DashboardReal 
                  nfses={nfses}
                  nfes={nfes}
                  nfces={nfces}
                  ctes={ctes}
                  nfaes={nfaes}
                  produtos={produtos}
                  clientes={clientes}
                  servicos={servicos} 
                  titulos={titulos}
                />
              )}

              {currentView === 'nfe-emissor' && (
                <NfeEmissor
                  empresa={empresa}
                  clientes={clientes}
                  produtos={produtos}
                  onNfeEmitida={handleNfeEmitida}
                  onViewDanfe={(doc) => setViewingDanfe(doc)}
                />
              )}

              {currentView === 'nfse-emissor' && (
                <NfseEmissor
                  empresa={empresa}
                  clientes={clientes}
                  servicosCatalogo={servicos}
                  onNfseEmitida={handleNfseEmitida}
                  onViewDanfse={(doc) => setViewingDanfse(doc)}
                />
              )}

              {currentView === 'nfce-emissor' && (
                <NfceEmissor
                  empresa={empresa}
                  clientes={clientes}
                  produtos={produtos}
                  onNfceEmitida={handleNfceEmitida}
                  onViewDanfce={(doc) => setViewingDanfce(doc)}
                />
              )}

              {currentView === 'cte-emissor' && (
                <CteEmissor
                  empresa={empresa}
                  clientes={clientes}
                  transportadoras={transportadoras}
                  onCteEmitido={handleCteEmitido}
                  onViewDacte={(doc) => setViewingDacte(doc)}
                />
              )}

              {currentView === 'nfae-emissor' && (
                <NfaeEmissor
                  empresa={empresa}
                  clientes={clientes}
                  produtos={produtos}
                  onNfaeEmitida={handleNfaeEmitida}
                  onViewDanfae={(doc) => setViewingDanfae(doc)}
                />
              )}

              {/* 🔥 NOVO - MDF-e */}
              {currentView === 'mdfe-emissor' && (
                <MdfeEmissor
                  empresa={empresa}
                  clientes={clientes}
                  onMdfeEmitido={handleMdfeEmitido}
                  onViewMdfe={(doc) => setViewingMdfe(doc)}
                />
              )}

              {currentView === 'documentos-fiscais' && (
                <DocumentosFiscaisList
                  nfses={nfses}
                  nfes={nfes}
                  nfces={nfces}
                  ctes={ctes}
                  nfaes={nfaes}
                  onViewDanfse={(doc) => setViewingDanfse(doc)}
                  onViewDanfe={(doc) => setViewingDanfe(doc)}
                  onViewDanfce={(doc) => setViewingDanfce(doc)}
                  onViewDacte={(doc) => setViewingDacte(doc)}
                  onViewDanfae={(doc) => setViewingDanfae(doc)}
                  onEmitirNovaNfse={() => setCurrentView('nfse-emissor')}
                  onEmitirNovaNfe={() => setCurrentView('nfe-emissor')}
                  onEmitirNovaNfce={() => setCurrentView('nfce-emissor')}
                  onEmitirNovoCte={() => setCurrentView('cte-emissor')}
                  onEmitirNovaNfae={() => setCurrentView('nfae-emissor')}
                  // 🔥 NOVO - MDF-e
                  onEmitirNovoMdfe={() => setCurrentView('mdfe-emissor')}
                />
              )}

              {currentView === 'produtos' && (
                <ProdutosView
                  produtos={produtos}
                  onProdutosChange={() => {
                    cacheRef.current = null;
                    refreshData(true);
                  }}
                />
              )}

              {currentView === 'clientes' && (
                <ClientesView
                  clientes={apenasClientes}
                  onClientesChange={() => {
                    cacheRef.current = null;
                    refreshData(true);
                  }}
                />
              )}

              {currentView === 'fornecedores' && (
                <FornecedoresView
                  fornecedores={apenasFornecedores}
                  onFornecedoresChange={() => {
                    cacheRef.current = null;
                    refreshData(true);
                  }}
                />
              )}

              {currentView === 'servicos' && (
                <ServicosView
                  servicos={servicos}
                  onServicosChange={() => {
                    cacheRef.current = null;
                    refreshData(true);
                  }}
                />
              )}

              {currentView === 'transportadoras' && (
                <TransportadorasView
                  transportadoras={transportadoras}
                  onTransportadorasChange={() => {
                    cacheRef.current = null;
                    refreshData(true);
                  }}
                />
              )}

              {(currentView === 'financeiro' || currentView === 'contas-receber' || currentView === 'contas-pagar') && (
                <FinanceiroView
                  empresa={empresa}
                  titulos={titulos}
                  onTitulosChange={() => {
                    cacheRef.current = null;
                    refreshData(true);
                  }}
                />
              )}

              {currentView === 'configuracoes' && (
                <ConfiguracoesEmpresaView
                  empresa={empresa}
                  onEmpresaChange={() => {
                    cacheRef.current = null;
                    refreshData(true);
                  }}
                />
              )}

              {currentView === 'consulta-cnpj' && (
                <ConsultaCnpjView onNavigate={(view) => setCurrentView(view)} />
              )}

            </div>
          </main>
        </div>

        {/* Alertas do Sistema */}
        <AlertasSistema />

        {/* Visualizadores de Documentos */}
        {viewingDanfse && (
          <DanfseViewer
            nfse={viewingDanfse}
            onClose={() => setViewingDanfse(null)}
          />
        )}

        {viewingDanfe && (
          <DanfeViewer
            nfe={viewingDanfe}
            onClose={() => setViewingDanfe(null)}
          />
        )}

        {viewingDanfce && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 relative">
              <DanfceViewer
                nfce={viewingDanfce}
                onBack={() => setViewingDanfce(null)}
              />
            </div>
          </div>
        )}

        {viewingDacte && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-4 relative">
              <DacteViewer
                cte={viewingDacte}
                onBack={() => setViewingDacte(null)}
              />
            </div>
          </div>
        )}

        {viewingDanfae && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-4 relative">
              <DanfaeViewer
                nfae={viewingDanfae}
                onBack={() => setViewingDanfae(null)}
              />
            </div>
          </div>
        )}

        {/* 🔥 NOVO - MDF-e Viewer */}
        {viewingMdfe && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-4 relative">
              <DamdfeViewer
                mdfe={viewingMdfe}
                onClose={() => setViewingMdfe(null)}
              />
            </div>
          </div>
        )}

      </div>
    </ToastProvider>
  );
}