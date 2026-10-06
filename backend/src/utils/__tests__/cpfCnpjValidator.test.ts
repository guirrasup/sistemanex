// backend/src/utils/__tests__/cpfCnpjValidator.test.ts
import { describe, it, expect } from 'vitest';
import {
  limparCpfCnpj,
  validarCNPJ,
  validarCPF,
  validarCpfOuCnpj,
  formatarCpfCnpj,
  isCnpj,
  exigirCpfCnpjValido,
} from '../cpfCnpjValidator.js';

describe('validarCNPJ', () => {
  it('aceita CNPJ numérico válido, com ou sem máscara', () => {
    expect(validarCNPJ('11222333000181')).toBe(true);
    expect(validarCNPJ('11.222.333/0001-81')).toBe(true);
  });

  it('aceita o CNPJ alfanumérico do exemplo oficial da Receita (12.ABC.345/01DE-35)', () => {
    expect(validarCNPJ('12ABC34501DE35')).toBe(true);
    expect(validarCNPJ('12.ABC.345/01DE-35')).toBe(true);
  });

  it('aceita letras minúsculas (normaliza para maiúsculas)', () => {
    expect(validarCNPJ('12.abc.345/01de-35')).toBe(true);
  });

  it('rejeita dígito verificador errado, numérico ou alfanumérico', () => {
    expect(validarCNPJ('11222333000182')).toBe(false);
    expect(validarCNPJ('12ABC34501DE36')).toBe(false);
  });

  it('rejeita letra nos dígitos verificadores (posições 13 e 14 são sempre numéricas)', () => {
    expect(validarCNPJ('12ABC34501DEA5')).toBe(false);
  });

  it('rejeita tamanho errado e sequências repetidas', () => {
    expect(validarCNPJ('1122233300018')).toBe(false);
    expect(validarCNPJ('00000000000000')).toBe(false);
    expect(validarCNPJ('AAAAAAAAAAAAAA')).toBe(false);
  });
});

describe('validarCPF', () => {
  it('continua aceitando só números', () => {
    expect(validarCPF('123.456.789-09')).toBe(true);
    expect(validarCPF('1234567890A')).toBe(false);
  });
});

describe('validarCpfOuCnpj', () => {
  it('identifica CPF, CNPJ numérico e CNPJ alfanumérico', () => {
    expect(validarCpfOuCnpj('12345678909')).toMatchObject({ valido: true, tipo: 'CPF' });
    expect(validarCpfOuCnpj('11222333000181')).toMatchObject({ valido: true, tipo: 'CNPJ' });
    expect(validarCpfOuCnpj('12ABC34501DE35')).toMatchObject({ valido: true, tipo: 'CNPJ', formatado: '12.ABC.345/01DE-35' });
  });
});

describe('limparCpfCnpj / formatarCpfCnpj / isCnpj', () => {
  it('mantém as letras e remove a pontuação', () => {
    expect(limparCpfCnpj('12.abc.345/01de-35')).toBe('12ABC34501DE35');
    expect(limparCpfCnpj(undefined)).toBe('');
  });

  it('formata CNPJ alfanumérico com a mesma máscara do numérico', () => {
    expect(formatarCpfCnpj('12ABC34501DE35')).toBe('12.ABC.345/01DE-35');
    expect(formatarCpfCnpj('11222333000181')).toBe('11.222.333/0001-81');
    expect(formatarCpfCnpj('12345678909')).toBe('123.456.789-09');
  });

  it('isCnpj confere só o formato', () => {
    expect(isCnpj('12ABC34501DE35')).toBe(true);
    expect(isCnpj('12345678909')).toBe(false);
  });
});

describe('exigirCpfCnpjValido', () => {
  it('lança erro dizendo qual participante está errado', () => {
    expect(() => exigirCpfCnpjValido('11222333000182', 'Destinatário')).toThrow(/Destinatário: CPF\/CNPJ inválido/);
    expect(() => exigirCpfCnpjValido(undefined, 'Tomador')).toThrow(/não informado/);
    expect(() => exigirCpfCnpjValido('12ABC34501DE35', 'Destinatário')).not.toThrow();
  });
});
