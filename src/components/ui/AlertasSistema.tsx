// C:\sistemanex\src\components\ui\AlertasSistema.tsx

import React, { useState, useEffect, useRef } from 'react';
import {
  AlertTriangle,
  Bell,
  BellDot,
  X,
  Package,
  ShieldAlert,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { produtosService } from '../../services/produtos.service';
import { financeiroService } from '../../services/financeiro.service';
import { StorageService } from '../../utils/storage';

interface Alerta {
  id: string;
  tipo: 'ESTOQUE' | 'CERTIFICADO' | 'TITULO' | 'NFE';
  nivel: 'CRITICO' | 'ATENCAO' | 'INFO';
  mensagem: string;
  data: string;
  destino?: string;
  acaoTexto?: string;
}

interface AlertCache {
  alertas: Alerta[];
  timestamp: number;
}

const CACHE_TTL = 60000;
const DEBOUNCE_DELAY = 500;

interface AlertasSistemaProps {
  className?: string;
  onNavigate?: (view: string) => void;
}

export const AlertasSistema: React.FC<AlertasSistemaProps> = ({ 
  className = '',
  onNavigate 
}) => {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [expandido, setExpandido] = useState(false);
  const [notificacoes, setNotificacoes] = useState<Alerta[]>([]);
  const [totalAlertas, setTotalAlertas] = useState(0);
  
  const isLoading = useRef(false);
  const cacheRef = useRef<AlertCache | null>(null);
  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  const carregarAlertas = async () => {
    if (isLoading.current) {
      console.log('⏳ Carregamento de alertas em andamento...');
      return;
    }

    if (cacheRef.current) {
      const now = Date.now();
      if (now - cacheRef.current.timestamp < CACHE_TTL) {
        console.log('📦 Usando cache de alertas');
        setAlertas(cacheRef.current.alertas);
        setTotalAlertas(cacheRef.current.alertas.length);
        setNotificacoes(cacheRef.current.alertas.filter(a => a.nivel === 'CRITICO'));
        return;
      }
    }

    isLoading.current = true;

    try {
      const novosAlertas: Alerta[] = [];

      // 🔥 1. Busca APENAS produtos com estoque crítico (estoqueAtual <= estoqueMinimo)
      try {
        const response = await produtosService.buscarEstoqueCritico();
        
        // 🔥 CORREÇÃO: Extrai os dados corretamente
        // A API retorna { sucesso: true, dados: [...] }
        // O service pode retornar diretamente o array ou o objeto com dados
        let produtos: any[] = [];
        
        if (Array.isArray(response)) {
          produtos = response;
        } else if (response?.dados && Array.isArray(response.dados)) {
          produtos = response.dados;
        } else if (response?.data && Array.isArray(response.data)) {
          produtos = response.data;
        } else if (response && typeof response === 'object') {
          // Tenta encontrar qualquer propriedade que seja um array
          for (const key of Object.keys(response)) {
            if (Array.isArray(response[key])) {
              produtos = response[key];
              break;
            }
          }
        }

        // 🔥 GARANTE QUE É UM ARRAY ANTES DE USAR forEach
        if (Array.isArray(produtos) && produtos.length > 0) {
          produtos.forEach(p => {
            novosAlertas.push({
              id: `estoque-${p.id}`,
              tipo: 'ESTOQUE',
              nivel: p.estoqueAtual === 0 ? 'CRITICO' : 'ATENCAO',
              mensagem: `${p.descricao}: estoque em ${p.estoqueAtual} ${p.unidade} (mínimo ${p.estoqueMinimo})`,
              data: new Date().toISOString(),
              destino: 'produtos',
              acaoTexto: 'Ver Estoque',
            });
          });
        }
      } catch (e) {
        console.warn('Erro ao buscar estoque crítico:', e);
      }

      // 🔥 2. Verifica certificado
      const empresa = StorageService.getEmpresa();
      if (empresa?.certificado?.diasRestantes !== undefined) {
        if (empresa.certificado.diasRestantes < 15 && empresa.certificado.diasRestantes > 0) {
          novosAlertas.push({
            id: 'certificado-vencendo',
            tipo: 'CERTIFICADO',
            nivel: empresa.certificado.diasRestantes < 5 ? 'CRITICO' : 'ATENCAO',
            mensagem: `Certificado Digital vence em ${empresa.certificado.diasRestantes} dias. Renove para não interromper as emissões.`,
            data: new Date().toISOString(),
            destino: 'configuracoes',
            acaoTexto: 'Renovar',
          });
        }
      }

      // 🔥 3. Busca títulos vencidos
      try {
        const titulos = await financeiroService.listarPendentes();
        const hoje = new Date();
        
        // 🔥 GARANTE QUE É UM ARRAY
        const listaTitulos = Array.isArray(titulos) ? titulos : (titulos?.dados?.data || titulos?.data || []);
        
        if (Array.isArray(listaTitulos) && listaTitulos.length > 0) {
          listaTitulos.forEach(t => {
            const venc = new Date(t.dataVencimento + 'T00:00:00');
            if (venc < hoje) {
              const dias = Math.ceil((hoje.getTime() - venc.getTime()) / (1000 * 60 * 60 * 24));
              novosAlertas.push({
                id: `titulo-${t.id}`,
                tipo: 'TITULO',
                nivel: dias > 30 ? 'CRITICO' : 'ATENCAO',
                mensagem: `${t.descricao} - ${t.pessoaNome}: vencido há ${dias} dias (R$ ${t.valorOriginal.toFixed(2)})`,
                data: t.dataVencimento,
                destino: 'financeiro',
                acaoTexto: 'Regularizar',
              });
            }
          });
        }
      } catch (e) {
        console.warn('Erro ao buscar títulos vencidos:', e);
      }

      cacheRef.current = {
        alertas: novosAlertas,
        timestamp: Date.now()
      };

      setAlertas(novosAlertas);
      setTotalAlertas(novosAlertas.length);
      setNotificacoes(novosAlertas.filter(a => a.nivel === 'CRITICO'));

    } catch (error) {
      console.error('Erro ao carregar alertas:', error);
    } finally {
      isLoading.current = false;
    }
  };

  useEffect(() => {
    const loadWithDebounce = () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
      timeoutId.current = setTimeout(() => {
        carregarAlertas();
      }, DEBOUNCE_DELAY);
    };

    loadWithDebounce();
    
    const interval = setInterval(() => {
      cacheRef.current = null;
      carregarAlertas();
    }, 300000);

    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
      clearInterval(interval);
    };
  }, []);

  const handleAcaoClick = (destino?: string) => {
    if (destino && onNavigate) {
      onNavigate(destino);
      setExpandido(false);
    }
  };

  const totalCriticos = alertas.filter(a => a.nivel === 'CRITICO').length;
  const totalAlertasCount = alertas.length;

  return (
    <div className={className}>
      <div className="relative">
        <button
          onClick={() => setExpandido(!expandido)}
          className={`relative bg-white hover:bg-slate-50 rounded-full border border-slate-200 p-1.5 transition-all hover:shadow-sm ${
            expandido ? 'scale-95 bg-slate-50' : ''
          }`}
          title={totalAlertasCount > 0 ? `${totalAlertasCount} alerta(s) pendente(s)` : 'Nenhum alerta'}
        >
          {totalAlertasCount > 0 ? (
            <BellDot className="w-5 h-5 text-slate-600" />
          ) : (
            <Bell className="w-5 h-5 text-slate-400" />
          )}
          
          {totalAlertasCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-md ring-2 ring-white">
              {totalAlertasCount > 99 ? '99+' : totalAlertasCount}
            </span>
          )}
          
          {totalCriticos > 0 && totalAlertasCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-600 rounded-full animate-pulse ring-2 ring-white"></span>
          )}
        </button>

        {expandido && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden max-h-96 overflow-y-auto z-50">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">Alertas do Sistema</span>
                {totalAlertasCount > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {totalAlertasCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setExpandido(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {alertas.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">Tudo certo!</p>
                <p className="text-xs text-slate-500">Nenhum alerta pendente no sistema.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {alertas.map(alerta => {
                  const cores = {
                    CRITICO: 'bg-rose-50 border-rose-200 text-rose-800',
                    ATENCAO: 'bg-amber-50 border-amber-200 text-amber-800',
                    INFO: 'bg-blue-50 border-blue-200 text-blue-800',
                  };
                  const icones = {
                    ESTOQUE: <Package className="w-4 h-4" />,
                    CERTIFICADO: <ShieldAlert className="w-4 h-4" />,
                    TITULO: <Clock className="w-4 h-4" />,
                    NFE: <AlertTriangle className="w-4 h-4" />,
                  };

                  return (
                    <div key={alerta.id} className={`p-3 ${cores[alerta.nivel]}`}>
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5 shrink-0">{icones[alerta.tipo]}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium leading-relaxed">{alerta.mensagem}</p>
                          {alerta.destino && onNavigate && (
                            <button
                              onClick={() => handleAcaoClick(alerta.destino)}
                              className="text-xs font-bold mt-1 underline hover:no-underline transition-colors"
                            >
                              {alerta.acaoTexto || 'Ver'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};