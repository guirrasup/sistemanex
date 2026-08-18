// src/utils/themeUtils.ts

import { useTheme } from '../contexts/ThemeContext';

export const getThemeClasses = (theme: 'dark' | 'light') => {
  const isDark = theme === 'dark';
  
  return {
    // Backgrounds
    bgPrimary: isDark ? 'bg-slate-950' : 'bg-slate-50',
    bgSecondary: isDark ? 'bg-slate-900' : 'bg-slate-100',
    bgCard: isDark ? 'bg-slate-900/80' : 'bg-white/90',
    bgCardSolid: isDark ? 'bg-slate-900' : 'bg-white',
    bgHover: isDark ? 'hover:bg-white/5' : 'hover:bg-black/5',
    bgInput: isDark ? 'bg-slate-950' : 'bg-white',
    
    // Textos
    textPrimary: isDark ? 'text-white' : 'text-slate-900',
    textSecondary: isDark ? 'text-slate-400' : 'text-slate-600',
    textMuted: isDark ? 'text-slate-500' : 'text-slate-400',
    
    // Bordas
    borderDefault: isDark ? 'border-white/5' : 'border-slate-200',
    borderLight: isDark ? 'border-white/10' : 'border-slate-300',
    
    // Sombras
    shadowCard: isDark ? 'shadow-xl' : 'shadow-lg',
    
    // Cores de destaque (permanecem iguais)
    accent: {
      cyan: 'text-cyan-400',
      emerald: 'text-emerald-400',
      amber: 'text-amber-400',
      rose: 'text-rose-400',
      indigo: 'text-indigo-400',
    },
    bgAccent: {
      cyan: 'bg-cyan-500/10',
      emerald: 'bg-emerald-500/10',
      amber: 'bg-amber-500/10',
      rose: 'bg-rose-500/10',
      indigo: 'bg-indigo-500/10',
    },
    borderAccent: {
      cyan: 'border-cyan-500/20',
      emerald: 'border-emerald-500/20',
      amber: 'border-amber-500/20',
      rose: 'border-rose-500/20',
      indigo: 'border-indigo-500/20',
    },
  };
};

// Helper para usar em componentes
export const useThemeClasses = () => {
  const { theme } = useTheme();
  return getThemeClasses(theme);
};