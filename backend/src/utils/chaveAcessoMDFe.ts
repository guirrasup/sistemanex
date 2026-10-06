// backend/src/utils/chaveAcessoMDFe.ts
import { limparCpfCnpj, valorCaractereFiscal } from './cpfCnpjValidator.js';
import { isChaveAcesso44, limparChaveAcesso } from './chaveAcesso.js';

export function calcularDVMod11MDFe(chave43: string): number {
  let soma = 0;
  let peso = 2;
  for (let i = chave43.length - 1; i >= 0; i--) {
    soma += valorCaractereFiscal(chave43.charAt(i)) * peso;
    peso++;
    if (peso > 9) peso = 2;
  }
  const resto = soma % 11;
  const dv = 11 - resto;
  if (dv === 0 || dv === 10 || dv === 11) return 0;
  return dv;
}

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
  const cnpj = limparCpfCnpj(params.cnpj).padStart(14, '0');
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

export function formatarChaveAcessoMDFe(chave: string): string {
  return limparChaveAcesso(chave).replace(/(.{4})/g, '$1 ').trim();
}

export function validarChaveAcessoMDFe(chave: string): boolean {
  if (!isChaveAcesso44(chave)) return false;

  const chave43 = chave.slice(0, 43);
  const dvInformado = parseInt(chave.charAt(43), 10);
  const dvCalculado = calcularDVMod11MDFe(chave43);

  return dvInformado === dvCalculado;
}
