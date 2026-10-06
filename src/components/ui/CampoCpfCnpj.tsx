// src/components/ui/CampoCpfCnpj.tsx
// Input de CPF/CNPJ (numérico ou alfanumérico) que fica com a borda vermelha
// ao sair do campo quando o documento está incompleto ou com DV errado, em vez
// de só acusar o erro ao gravar/emitir. Depois de marcado, volta ao normal
// assim que o usuário corrige.
import React, { useState } from 'react';
import { validarCPF, validarCNPJ, validarCpfOuCnpj } from '../../utils/cpfCnpjValidator';

type TipoDocumento = 'AMBOS' | 'CPF' | 'CNPJ';

function documentoValido(valor: string, tipo: TipoDocumento): boolean {
  if (tipo === 'CPF') return validarCPF(valor);
  if (tipo === 'CNPJ') return validarCNPJ(valor);
  return validarCpfOuCnpj(valor).valido;
}

const MENSAGEM_INVALIDO: Record<TipoDocumento, string> = {
  AMBOS: 'CPF/CNPJ inválido — confira os dígitos',
  CPF: 'CPF inválido — confira os dígitos',
  CNPJ: 'CNPJ inválido — confira os dígitos verificadores',
};

interface CampoCpfCnpjProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: string;
  onChange: (valor: string) => void;
  tipo?: TipoDocumento;
}

export const CampoCpfCnpj: React.FC<CampoCpfCnpjProps> = ({ value, onChange, tipo = 'AMBOS', className = '', onBlur, ...resto }) => {
  const [saiuDoCampo, setSaiuDoCampo] = useState(false);
  const invalido = saiuDoCampo && value.trim() !== '' && !documentoValido(value, tipo);

  return (
    <input
      type="text"
      {...resto}
      value={value}
      onChange={(e) => onChange(tipo === 'CPF' ? e.target.value : e.target.value.toUpperCase())}
      onBlur={(e) => { setSaiuDoCampo(true); onBlur?.(e); }}
      aria-invalid={invalido}
      title={invalido ? MENSAGEM_INVALIDO[tipo] : resto.title}
      // O "!" vence a borda/fundo neutros que cada tela já declara.
      className={invalido ? `${className} border-rose-400! bg-rose-50! focus:ring-rose-500!` : className}
    />
  );
};
