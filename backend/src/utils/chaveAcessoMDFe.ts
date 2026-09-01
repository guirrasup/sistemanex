// src/utils/chaveAcessoMDFe.ts

/**
 * Gerador de Chave de Acesso para MDF-e (44 dígitos)
 * Conforme Schema XSD MDF-e 3.00
 * SUP TECNOLOGIA - BACKEND
 */

import { limparDocumento } from './cpfCnpjValidator';

/**
 * Calcula Dígito Verificador Módulo 11 (Pesos de 2 a 9)
 */
export function calcularDVMod11MDFe(chave43: string): number {
  let soma = 0;
  let peso = 2;
  for (let i = chave43.length - 1; i >= 0; i--) {
    soma += parseInt(chave43.charAt(i), 10) * peso;
    peso++;
    if (peso > 9) peso = 2;
  }
  const resto = soma % 11;
  const dv = 11 - resto;
  if (dv === 0 || dv === 10 || dv === 11) return 0;
  return dv;
}

/**
 * Gera Chave de Acesso Oficial de MDF-e (44 dígitos)
 * 
 * Formato: UF + AAMM + CNPJ + MOD + SERIE + NNF + TP_EMIS + CMDF + DV
 * 
 * @param params - Parâmetros para geração
 * @returns Objeto com chave completa, cMDF e DV
 */
export function gerarChaveAcessoMDFe(params: {
  cUF: string;
  aamm: string;
  cnpj: string;
  modelo: string;
  serie: number;
  numero: number;
  tpEmis: number;
  cMDF?: string;
}): { chaveCompleta: string; cMDF: string; cDV: number } {
  const cUF = params.cUF.padStart(2, '0');
  const aamm = params.aamm;
  const cnpj = limparDocumento(params.cnpj).padStart(14, '0');
  const mod = params.modelo.padStart(2, '0');
  const serie = params.serie.toString().padStart(3, '0');
  const nNF = params.numero.toString().padStart(9, '0');
  const tpEmis = params.tpEmis.toString();
  
  // Gera cMDF aleatório (8 dígitos)
  const cMDF = params.cMDF || Math.floor(10000000 + Math.random() * 90000000).toString();

  const chave43 = `${cUF}${aamm}${cnpj}${mod}${serie}${nNF}${tpEmis}${cMDF}`;
  const cDV = calcularDVMod11MDFe(chave43);
  const chaveCompleta = `${chave43}${cDV}`;

  return { chaveCompleta, cMDF, cDV };
}

/**
 * Formata Chave de Acesso em grupos de 4 dígitos para leitura
 */
export function formatarChaveAcessoMDFe(chave: string): string {
  const limpa = chave.replace(/\D/g, '');
  return limpa.replace(/(\d{4})/g, '$1 ').trim();
}

/**
 * Valida Chave de Acesso do MDF-e (44 dígitos)
 */
export function validarChaveAcessoMDFe(chave: string): boolean {
  if (!/^[0-9]{44}$/.test(chave)) return false;
  
  const chave43 = chave.slice(0, 43);
  const dvInformado = parseInt(chave.charAt(43), 10);
  const dvCalculado = calcularDVMod11MDFe(chave43);
  
  return dvInformado === dvCalculado;
}