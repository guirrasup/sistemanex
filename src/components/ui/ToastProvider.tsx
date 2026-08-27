// src/components/ui/ToastProvider.tsx
import React from 'react';
import { Toaster, ToastBar, Toast } from 'react-hot-toast';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X
} from 'lucide-react';

interface ToastProviderProps {
  children: React.ReactNode;
}

// 🔥 CORES POR TIPO DE TOAST
const toastStyles = {
  success: {
    bg: 'bg-emerald-50 border-emerald-200',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
    text: 'text-emerald-800',
    progress: 'bg-emerald-500'
  },
  error: {
    bg: 'bg-rose-50 border-rose-200',
    icon: <AlertCircle className="w-5 h-5 text-rose-600" />,
    text: 'text-rose-800',
    progress: 'bg-rose-500'
  },
  warning: {
    bg: 'bg-amber-50 border-amber-200',
    icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
    text: 'text-amber-800',
    progress: 'bg-amber-500'
  },
  info: {
    bg: 'bg-blue-50 border-blue-200',
    icon: <Info className="w-5 h-5 text-blue-600" />,
    text: 'text-blue-800',
    progress: 'bg-blue-500'
  }
};

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        gutter={8}
        containerClassName="mt-4"
        toastOptions={{
          duration: 5000,
          style: {
            background: 'transparent',
            boxShadow: 'none',
            padding: 0,
            maxWidth: '420px'
          }
        }}
      >
        {(t: Toast) => {
          // 🔥 DETECTA O TIPO PELA MENSAGEM OU ÍCONE
          let type: keyof typeof toastStyles = 'info';
          if (t.icon === '✅' || t.icon === '🎉' || t.icon === '✔️' || String(t.message).includes('sucesso')) {
            type = 'success';
          } else if (t.icon === '❌' || t.icon === '⚠️' || String(t.message).includes('erro') || String(t.message).includes('Erro')) {
            type = 'error';
          } else if (t.icon === '⚠️' || t.icon === '⚡' || String(t.message).includes('atenção')) {
            type = 'warning';
          }

          const style = toastStyles[type];

          return (
            <ToastBar toast={t}>
              {({ icon, message }) => (
                <div className={`
                  relative overflow-hidden rounded-xl border shadow-lg
                  ${style.bg}
                  animate-in slide-in-from-top-full duration-300
                  flex items-start gap-3 p-4 min-w-[300px] max-w-[420px]
                `}>
                  {/* Ícone */}
                  <div className="flex-shrink-0 mt-0.5">
                    {style.icon}
                  </div>

                  {/* Mensagem */}
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${style.text}`}>
                      {message}
                    </div>
                  </div>

                  {/* Botão Fechar */}
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="flex-shrink-0 -mt-1 -mr-1 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Barra de progresso */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200/50">
                    <div 
                      className={`h-full ${style.progress} transition-all duration-[5000ms] ease-linear`}
                      style={{ width: '100%' }}
                      onAnimationEnd={() => toast.dismiss(t.id)}
                    />
                  </div>
                </div>
              )}
            </ToastBar>
          );
        }}
      </Toaster>
    </>
  );
};