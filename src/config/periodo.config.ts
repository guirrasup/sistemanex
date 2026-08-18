// src/config/periodo.config.ts
export interface PeriodoConfig {
  ano: number;
  mes_inicio: number;
  mes_fim: number;
  data_inicio: string;
  data_fim: string;
}

export function getPeriodoAtual(tipo: 'ecd' | 'ecf' | 'apuracao'): PeriodoConfig {
  const now = new Date();
  const ano = now.getFullYear();
  const mes = now.getMonth() + 1;

  // ECD: ano completo
  if (tipo === 'ecd') {
    return {
      ano,
      mes_inicio: 1,
      mes_fim: 12,
      data_inicio: `${ano}-01-01`,
      data_fim: `${ano}-12-31`,
    };
  }

  // ECF: ano completo (mesmo período do ECD)
  if (tipo === 'ecf') {
    return {
      ano,
      mes_inicio: 1,
      mes_fim: 12,
      data_inicio: `${ano}-01-01`,
      data_fim: `${ano}-12-31`,
    };
  }

  // Apuração: mês atual
  return {
    ano,
    mes_inicio: mes,
    mes_fim: mes,
    data_inicio: `${ano}-${String(mes).padStart(2, '0')}-01`,
    data_fim: `${ano}-${String(mes).padStart(2, '0')}-${new Date(ano, mes, 0).getDate()}`,
  };
}

export function getPeriodoCustomizado(
  ano: number,
  mesInicio: number,
  mesFim: number
): PeriodoConfig {
  return {
    ano,
    mes_inicio: mesInicio,
    mes_fim: mesFim,
    data_inicio: `${ano}-${String(mesInicio).padStart(2, '0')}-01`,
    data_fim: `${ano}-${String(mesFim).padStart(2, '0')}-${new Date(ano, mesFim, 0).getDate()}`,
  };
}