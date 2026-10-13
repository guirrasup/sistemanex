// src/components/layout/EmpresaAtual.tsx
// Identificação da empresa emissora no Header (nome, CNPJ, ambiente) e o selo vivo
// do certificado A1 — um anel que esvazia conforme a validade (dados reais).
import React from 'react';
import { motion } from 'framer-motion';
import { usePermissoes } from '../../hooks/usePermissoes';
import { ConfiguracaoEmpresa } from '../../types/erp';
import { formatarCpfCnpj } from '../../utils/cpfCnpjValidator';

function iniciais(nome: string) {
  const partes = nome.replace(/\b(LTDA|ME|EPP|S\/?A|EIRELI)\b/gi, '').trim().split(/\s+/).filter(Boolean);
  return ((partes[0]?.[0] || 'S') + (partes[1]?.[0] || '')).toUpperCase();
}

function diasDoCertificado(empresa: ConfiguracaoEmpresa): number | null {
  const cert = empresa?.certificado;
  if (!cert?.instalado) return null;
  if (cert.dataValidadeFim) {
    const fim = new Date(cert.dataValidadeFim as unknown as string).getTime();
    if (!Number.isNaN(fim)) return Math.ceil((fim - Date.now()) / 86_400_000);
  }
  return typeof cert.diasRestantes === 'number' ? cert.diasRestantes : null;
}

const SeloCertificado: React.FC<{ empresa: ConfiguracaoEmpresa; onClick?: () => void }> = ({ empresa, onClick }) => {
  const dias = diasDoCertificado(empresa);
  const instalado = !!empresa?.certificado?.instalado;
  const vencido = dias !== null && dias <= 0;
  const alerta = dias !== null && dias > 0 && dias <= 30;

  const progresso = dias === null ? 0 : Math.max(0, Math.min(1, dias / 365));
  const raio = 9;
  const circ = 2 * Math.PI * raio;
  const cor = !instalado || vencido ? 'var(--color-danger)' : alerta ? 'var(--color-warning)' : 'var(--color-brand-600)';
  const tom = !instalado || vencido ? 'text-danger' : alerta ? 'text-warning' : 'text-ink-600';

  const texto = !instalado ? 'A1 não configurado' : vencido ? 'A1 vencido' : `A1 · ${dias} ${dias === 1 ? 'dia' : 'dias'}`;
  const titulo = !instalado
    ? 'Certificado digital A1 não configurado'
    : vencido
      ? 'Certificado digital A1 vencido — renove para continuar emitindo'
      : `Certificado digital A1 válido por mais ${dias} dias`;

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      title={titulo}
      className={`flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-1 transition-colors ${
        !instalado || vencido ? 'border-nf-rejeitada-bg bg-nf-rejeitada-bg/60' : alerta ? 'border-nf-pendente-bg bg-nf-pendente-bg/60' : 'border-ink-200 bg-white'
      } ${onClick ? 'cursor-pointer hover:border-ink-300' : 'cursor-default'}`}
    >
      <svg viewBox="0 0 24 24" className={`h-5 w-5 -rotate-90 ${alerta || vencido ? 'animate-soft-pulse' : ''}`} aria-hidden>
        <circle cx="12" cy="12" r={raio} fill="none" stroke="var(--color-ink-200)" strokeWidth="3" />
        <motion.circle
          cx="12"
          cy="12"
          r={raio}
          fill="none"
          stroke={cor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - progresso) }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        />
      </svg>
      <span className={`whitespace-nowrap font-mono text-[11px] font-medium ${tom}`}>{texto}</span>
    </button>
  );
};

export const EmpresaAtual: React.FC<{ empresa: ConfiguracaoEmpresa; onNavigate: (view: string) => void }> = ({ empresa, onNavigate }) => {
  const { podeVerView } = usePermissoes();
  const irConfig = podeVerView('configuracoes') ? () => onNavigate('configuracoes') : undefined;
  const nome = empresa?.nomeFantasia || empresa?.razaoSocial || 'Sua empresa';
  // O tipo diz 1|2, mas o backend manda 'PRODUCAO'/'HOMOLOGACAO'.
  const amb = empresa?.ambienteEmissao as unknown;
  const producao = amb === 1 || amb === '1' || amb === 'PRODUCAO';

  return (
    <div className="flex min-w-0 items-center gap-3">
      <button
        onClick={irConfig}
        disabled={!irConfig}
        title={`${empresa?.razaoSocial || nome} · Ambiente de ${producao ? 'produção' : 'homologação'}`}
        className={`flex min-w-0 items-center gap-2.5 rounded-lg py-1 pl-1 pr-2 text-left transition-colors ${irConfig ? 'cursor-pointer hover:bg-ink-100' : 'cursor-default'}`}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-800 font-display text-xs font-bold text-white">
          {iniciais(nome)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold leading-tight text-ink-950">{nome}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-[11px] leading-tight text-ink-500">
            <span className="truncate font-mono">{empresa?.cnpj ? formatarCpfCnpj(empresa.cnpj) : '—'}</span>
            <span className="text-ink-300">·</span>
            <span className="flex shrink-0 items-center gap-1">
              <span className={`h-1.5 w-1.5 rounded-full ${producao ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              {producao ? 'Produção' : 'Homologação'}
            </span>
          </p>
        </div>
      </button>
      <div className="hidden md:block">
        <SeloCertificado empresa={empresa} onClick={irConfig} />
      </div>
    </div>
  );
};
