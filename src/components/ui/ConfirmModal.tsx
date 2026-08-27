// src/components/ui/ConfirmModal.tsx
import React from 'react';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
  X,
  Trash2,
  Loader2
} from 'lucide-react';

export type ConfirmModalType = 'danger' | 'warning' | 'success' | 'info';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: ConfirmModalType;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

const modalStyles = {
  danger: {
    icon: <Trash2 className="w-8 h-8 text-rose-600" />,
    iconBg: 'bg-rose-100',
    iconBorder: 'border-rose-200',
    confirmBg: 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500',
    confirmTextColor: 'text-rose-600',
    titleColor: 'text-rose-800',
    messageColor: 'text-rose-700',
  },
  warning: {
    icon: <AlertTriangle className="w-8 h-8 text-amber-600" />,
    iconBg: 'bg-amber-100',
    iconBorder: 'border-amber-200',
    confirmBg: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
    confirmTextColor: 'text-amber-600',
    titleColor: 'text-amber-800',
    messageColor: 'text-amber-700',
  },
  success: {
    icon: <CheckCircle2 className="w-8 h-8 text-emerald-600" />,
    iconBg: 'bg-emerald-100',
    iconBorder: 'border-emerald-200',
    confirmBg: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500',
    confirmTextColor: 'text-emerald-600',
    titleColor: 'text-emerald-800',
    messageColor: 'text-emerald-700',
  },
  info: {
    icon: <Info className="w-8 h-8 text-blue-600" />,
    iconBg: 'bg-blue-100',
    iconBorder: 'border-blue-200',
    confirmBg: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    confirmTextColor: 'text-blue-600',
    titleColor: 'text-blue-800',
    messageColor: 'text-blue-700',
  },
};

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'warning',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  loading = false,
}) => {
  if (!isOpen) return null;

  const style = modalStyles[type];

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        
        {/* 🔥 BOTÃO FECHAR */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 🔥 ÍCONE */}
        <div className="flex justify-center mb-4">
          <div className={`
            w-16 h-16 rounded-full flex items-center justify-center
            ${style.iconBg} border-2 ${style.iconBorder}
          `}>
            {style.icon}
          </div>
        </div>

        {/* 🔥 TÍTULO */}
        <h3 className={`text-lg font-bold text-center ${style.titleColor}`}>
          {title}
        </h3>

        {/* 🔥 MENSAGEM */}
        <p className={`text-sm text-center ${style.messageColor} mt-2`}>
          {message}
        </p>

        {/* 🔥 BOTÕES */}
        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`
              flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-xl
              transition-all duration-200 shadow-sm
              ${style.confirmBg}
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-2
            `}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processando...</span>
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>

      </div>
    </div>
  );
};