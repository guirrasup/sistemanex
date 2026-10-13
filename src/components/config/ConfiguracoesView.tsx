// src/components/config/ConfiguracoesView.tsx
// Configurações em abas: dados da empresa/certificado A1 e aparência do sistema.
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Palette } from 'lucide-react';
import { ConfiguracaoEmpresa } from '../../types/erp';
import { ConfiguracoesEmpresaView } from './ConfiguracoesEmpresaView';
import { AparenciaView } from './AparenciaView';

type Aba = 'empresa' | 'aparencia';

const ABAS: Array<{ id: Aba; rotulo: string; icon: typeof Building2 }> = [
  { id: 'empresa', rotulo: 'Empresa e certificado', icon: Building2 },
  { id: 'aparencia', rotulo: 'Aparência', icon: Palette },
];

export const ConfiguracoesView: React.FC<{ empresa: ConfiguracaoEmpresa; onEmpresaChange: () => void }> = ({ empresa, onEmpresaChange }) => {
  const [aba, setAba] = useState<Aba>('empresa');

  return (
    <div className="space-y-5">
      <div className="flex gap-1 border-b border-ink-200" role="tablist">
        {ABAS.map((a) => {
          const sel = a.id === aba;
          return (
            <button
              key={a.id}
              role="tab"
              aria-selected={sel}
              onClick={() => setAba(a.id)}
              className={`relative flex cursor-pointer items-center gap-2 px-3.5 pb-2.5 pt-1 text-[13px] font-medium transition-colors ${
                sel ? 'text-ink-950' : 'text-ink-500 hover:text-ink-800'
              }`}
            >
              <a.icon className={`h-4 w-4 ${sel ? 'text-brand-700' : 'text-ink-400'}`} />
              {a.rotulo}
              {sel && <motion.span layoutId="config-aba" className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand-700" />}
            </button>
          );
        })}
      </div>

      {aba === 'empresa' ? <ConfiguracoesEmpresaView empresa={empresa} onEmpresaChange={onEmpresaChange} /> : <AparenciaView />}
    </div>
  );
};
