// src/components/ThemeToggle.tsx

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
        isDark 
          ? 'hover:bg-white/10 text-amber-400' 
          : 'hover:bg-slate-100 text-indigo-500'
      }`}
      aria-label="Alternar tema"
      title={isDark ? 'Modo Claro' : 'Modo Escuro'}
    >
      {isDark ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
};