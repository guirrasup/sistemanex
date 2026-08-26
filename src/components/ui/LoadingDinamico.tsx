// C:\emissornfe\src\components\ui\LoadingDinamico.tsx

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Users, 
  Package, 
  DollarSign, 
  Receipt, 
  Database, 
  ShieldCheck, 
  RefreshCw,
  Truck,
  FileBadge2
} from 'lucide-react';

export const LoadingDinamico: React.FC = () => {
  const [fraseAtual, setFraseAtual] = useState(0);
  const [exibindo, setExibindo] = useState(true);

  const frases = [
    { 
      texto: 'Conectando ao servidor SEFAZ...', 
      icone: <ShieldCheck className="w-5 h-5 text-blue-400" />,
      detalhe: 'Estabelecendo comunicação com o ambiente de produção'
    },
    { 
      texto: 'Carregando módulo fiscal...', 
      icone: <Receipt className="w-5 h-5 text-emerald-400" />,
      detalhe: 'Preparando NF-e, NFS-e, NFC-e, CT-e e NFA-e'
    },
    { 
      texto: 'Lendo tabela de produtos...', 
      icone: <Package className="w-5 h-5 text-amber-400" />,
      detalhe: 'Carregando catálogo de mercadorias e estoque'
    },
    { 
      texto: 'Carregando cadastro de clientes...', 
      icone: <Users className="w-5 h-5 text-blue-400" />,
      detalhe: 'Buscando tomadores e fornecedores'
    },
    { 
      texto: 'Importando catálogo de serviços...', 
      icone: <FileText className="w-5 h-5 text-purple-400" />,
      detalhe: 'Carregando serviços e tributações municipais'
    },
    { 
      texto: 'Processando dados financeiros...', 
      icone: <DollarSign className="w-5 h-5 text-emerald-400" />,
      detalhe: 'Calculando títulos a pagar e a receber'
    },
    { 
      texto: 'Carregando documentos fiscais emitidos...', 
      icone: <FileBadge2 className="w-5 h-5 text-amber-400" />,
      detalhe: 'Buscando NF-es, NFS-es e cupons emitidos'
    },
    { 
      texto: 'Carregando CT-es de transporte...', 
      icone: <Truck className="w-5 h-5 text-cyan-400" />,
      detalhe: 'Buscando conhecimentos de frete'
    },
    { 
      texto: 'Validando certificado digital...', 
      icone: <ShieldCheck className="w-5 h-5 text-green-400" />,
      detalhe: 'Verificando assinatura ICP-Brasil'
    },
    { 
      texto: 'Atualizando cache local...', 
      icone: <Database className="w-5 h-5 text-indigo-400" />,
      detalhe: 'Sincronizando dados para acesso offline'
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setExibindo(false);
      setTimeout(() => {
        setFraseAtual((prev) => (prev + 1) % frases.length);
        setExibindo(true);
      }, 300);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const frase = frases[fraseAtual];

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      
      <div className="relative mb-8">
        <div className="w-24 h-24 relative">
          <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
          <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-purple-200"></div>
          <div className="absolute inset-2 rounded-full border-4 border-purple-500 border-b-transparent animate-spin-slow"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
              S
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          SUP TECNOLOGIA
        </h1>
        <p className="text-sm text-slate-500 font-medium">
          Sistema ERP & Emissor Fiscal
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-md w-full mx-4">
        <div className={`flex items-center gap-4 transition-all duration-300 ${
          exibindo ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-2'
        }`}>
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
            {frase.icone}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">
              {frase.texto}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {frase.detalhe}
            </p>
          </div>
        </div>

        <div className="mt-4 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 rounded-full transition-all duration-1000"
            style={{ 
              width: `${((fraseAtual + 1) / frases.length) * 100}%`
            }}
          ></div>
        </div>

        <div className="flex items-center justify-between mt-3">
          <span className="text-[10px] font-medium text-slate-400">
            {fraseAtual + 1} de {frases.length}
          </span>
          <span className="text-[10px] font-medium text-blue-600 flex items-center gap-1">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Carregando...
          </span>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-[11px] text-slate-400 font-mono">
          v2026.1 • Ambiente SEFAZ Produção
        </p>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[10px] text-slate-400">Sistema online</span>
        </div>
      </div>
    </div>
  );
};