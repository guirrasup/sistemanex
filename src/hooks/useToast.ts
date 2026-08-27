// src/hooks/useToast.ts
import toast from 'react-hot-toast';

export const useToast = () => {
  const showSuccess = (message: string) => {
    toast.success(message, {
      icon: '✅',
      duration: 5000
    });
  };

  const showError = (message: string) => {
    toast.error(message, {
      icon: '❌',
      duration: 6000
    });
  };

  const showWarning = (message: string) => {
    toast(message, {
      icon: '⚠️',
      duration: 5000
    });
  };

  const showInfo = (message: string) => {
    toast(message, {
      icon: 'ℹ️',
      duration: 4000
    });
  };

  const showCustom = (message: string, icon: string = '📢', duration: number = 5000) => {
    toast(message, {
      icon,
      duration
    });
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showCustom
  };
};

// 🔥 EXPORTA DIRETO TAMBÉM PARA USO RÁPIDO
export const toastHelpers = {
  success: (msg: string) => toast.success(msg, { icon: '✅' }),
  error: (msg: string) => toast.error(msg, { icon: '❌' }),
  warning: (msg: string) => toast(msg, { icon: '⚠️' }),
  info: (msg: string) => toast(msg, { icon: 'ℹ️' }),
};