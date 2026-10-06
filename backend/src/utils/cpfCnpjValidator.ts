// backend/src/utils/cpfCnpjValidator.ts

// Só dígitos — para CEP, telefone, NCM etc. Para CPF/CNPJ use limparCpfCnpj,
// que preserva as letras do CNPJ alfanumérico.
export function limparDocumento(doc: string): string {
  return (doc ?? '').replace(/\D/g, '');
}

// CNPJ alfanumérico (IN RFB 2.229/2024, a partir de jul/2026): os 12 primeiros
// caracteres podem ser [0-9A-Z]; os 2 dígitos verificadores continuam numéricos.
// CNPJs antigos (só números) continuam válidos no mesmo formato.
export const REGEX_CNPJ = /^[0-9A-Z]{12}[0-9]{2}$/;

export function limparCpfCnpj(doc: string | null | undefined): string {
  return (doc ?? '').toUpperCase().replace(/[^0-9A-Z]/g, '');
}

// Valor de um caractere no cálculo dos DVs (CNPJ e chave de acesso): código
// ASCII menos 48. Para dígitos dá o próprio número; 'A' vale 17, 'Z' vale 42.
export function valorCaractereFiscal(caractere: string): number {
  return caractere.charCodeAt(0) - 48;
}

export function isCnpj(doc: string | null | undefined): boolean {
  return REGEX_CNPJ.test(limparCpfCnpj(doc));
}

export function formatarCpfCnpj(doc: string): string {
  const limpo = limparCpfCnpj(doc);
  if (/^\d{11}$/.test(limpo)) {
    return limpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (limpo.length === 14) {
    return limpo.replace(/(.{2})(.{3})(.{3})(.{4})(.{2})/, '$1.$2.$3/$4-$5');
  }
  return doc;
}

export function validarCPF(cpf: string): boolean {
  const limpo = limparCpfCnpj(cpf);
  if (!/^\d{11}$/.test(limpo)) return false;
  if (/^(\d)\1{10}$/.test(limpo)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(limpo.charAt(i), 10) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  let dv1 = (resto === 10 || resto === 11) ? 0 : resto;
  if (dv1 !== parseInt(limpo.charAt(9), 10)) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(limpo.charAt(i), 10) * (11 - i);
  }
  resto = 11 - (soma % 11);
  let dv2 = (resto === 10 || resto === 11) ? 0 : resto;
  return dv2 === parseInt(limpo.charAt(10), 10);
}

function calcularDVCnpj(base: string, pesos: number[]): number {
  let soma = 0;
  for (let i = 0; i < pesos.length; i++) {
    soma += valorCaractereFiscal(base.charAt(i)) * pesos[i];
  }
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

export function validarCNPJ(cnpj: string): boolean {
  const limpo = limparCpfCnpj(cnpj);
  if (!REGEX_CNPJ.test(limpo)) return false;
  if (/^(.)\1{13}$/.test(limpo)) return false;

  const dv1 = calcularDVCnpj(limpo, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  if (dv1 !== parseInt(limpo.charAt(12), 10)) return false;

  const dv2 = calcularDVCnpj(limpo, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return dv2 === parseInt(limpo.charAt(13), 10);
}

export function validarCpfOuCnpj(doc: string): { valido: boolean; tipo: 'CPF' | 'CNPJ' | 'INVALIDO'; formatado: string } {
  const limpo = limparCpfCnpj(doc);
  if (limpo.length === 11) {
    const valido = validarCPF(limpo);
    return { valido, tipo: valido ? 'CPF' : 'INVALIDO', formatado: formatarCpfCnpj(limpo) };
  } else if (limpo.length === 14) {
    const valido = validarCNPJ(limpo);
    return { valido, tipo: valido ? 'CNPJ' : 'INVALIDO', formatado: formatarCpfCnpj(limpo) };
  }
  return { valido: false, tipo: 'INVALIDO', formatado: doc };
}

// Usado pelos serviços de emissão: barra o documento antes de gerar XML/chave,
// com uma mensagem que já diz qual participante da nota está errado.
export function exigirCpfCnpjValido(doc: string | null | undefined, rotulo: string): void {
  if (!validarCpfOuCnpj(doc ?? '').valido) {
    throw new Error(`${rotulo}: CPF/CNPJ inválido (${doc || 'não informado'})`);
  }
}

export function formatarCEP(cep: string): string {
  const limpo = limparDocumento(cep);
  if (limpo.length === 8) {
    return limpo.replace(/(\d{5})(\d{3})/, '$1-$2');
  }
  return cep;
}

export function formatarMoeda(valor: number | undefined | null): string {
  if (valor === undefined || valor === null || isNaN(valor)) return 'R$ 0,00';
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
