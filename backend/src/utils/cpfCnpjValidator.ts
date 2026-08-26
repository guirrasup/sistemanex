// C:\emissornfe\backend\src\utils\cpfCnpjValidator.ts

/**
 * Validador e Formatador de CPF e CNPJ
 * Implementação matemática rigorosa do algoritmo de Módulo 11
 * SUP TECNOLOGIA - BACKEND
 */

export function limparDocumento(doc: string): string {
  return doc.replace(/\D/g, '');
}

export function formatarCpfCnpj(doc: string): string {
  const limpo = limparDocumento(doc);
  if (limpo.length === 11) {
    return limpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (limpo.length === 14) {
    return limpo.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  return doc;
}

export function validarCPF(cpf: string): boolean {
  const limpo = limparDocumento(cpf);
  if (limpo.length !== 11) return false;
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

export function validarCNPJ(cnpj: string): boolean {
  const limpo = limparDocumento(cnpj);
  if (limpo.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(limpo)) return false;

  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let soma = 0;
  for (let i = 0; i < 12; i++) {
    soma += parseInt(limpo.charAt(i), 10) * pesos1[i];
  }
  let resto = soma % 11;
  let dv1 = resto < 2 ? 0 : 11 - resto;
  if (dv1 !== parseInt(limpo.charAt(12), 10)) return false;

  const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  soma = 0;
  for (let i = 0; i < 13; i++) {
    soma += parseInt(limpo.charAt(i), 10) * pesos2[i];
  }
  resto = soma % 11;
  let dv2 = resto < 2 ? 0 : 11 - resto;
  return dv2 === parseInt(limpo.charAt(13), 10);
}

export function validarCpfOuCnpj(doc: string): { valido: boolean; tipo: 'CPF' | 'CNPJ' | 'INVALIDO'; formatado: string } {
  const limpo = limparDocumento(doc);
  if (limpo.length === 11) {
    const valido = validarCPF(limpo);
    return { valido, tipo: valido ? 'CPF' : 'INVALIDO', formatado: formatarCpfCnpj(limpo) };
  } else if (limpo.length === 14) {
    const valido = validarCNPJ(limpo);
    return { valido, tipo: valido ? 'CNPJ' : 'INVALIDO', formatado: formatarCpfCnpj(limpo) };
  }
  return { valido: false, tipo: 'INVALIDO', formatado: doc };
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