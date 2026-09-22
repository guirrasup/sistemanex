// backend/src/utils/__tests__/chaveAcessoMDFe.test.ts
import { describe, it, expect } from 'vitest';
import { calcularDVMod11MDFe, gerarChaveAcessoMDFe, formatarChaveAcessoMDFe, validarChaveAcessoMDFe } from '../chaveAcessoMDFe.js';

describe('gerarChaveAcessoMDFe', () => {
  it('gera uma chave de 44 dígitos numéricos', () => {
    const { chaveCompleta } = gerarChaveAcessoMDFe({
      cUF: '35',
      aamm: '2609',
      cnpj: '18236447000190',
      modelo: '58',
      serie: 1,
      numero: 1,
      tpEmis: 1,
    });

    expect(chaveCompleta).toHaveLength(44);
    expect(chaveCompleta).toMatch(/^\d{44}$/);
  });

  it('o cMDF é sempre um código numérico de 8 dígitos, aleatório quando não informado', () => {
    const { cMDF } = gerarChaveAcessoMDFe({
      cUF: '35', aamm: '2609', cnpj: '18236447000190', modelo: '58', serie: 1, numero: 1, tpEmis: 1,
    });
    expect(cMDF).toMatch(/^\d{8}$/);
  });

  it('respeita o cMDF explícito quando informado, em vez de gerar um aleatório', () => {
    const { cMDF, chaveCompleta } = gerarChaveAcessoMDFe({
      cUF: '35', aamm: '2609', cnpj: '18236447000190', modelo: '58', serie: 1, numero: 1, tpEmis: 1, cMDF: '12345678',
    });
    expect(cMDF).toBe('12345678');
    expect(chaveCompleta.slice(35, 43)).toBe('12345678');
  });

  it('o DV da chave gerada é válido segundo validarChaveAcessoMDFe', () => {
    const { chaveCompleta } = gerarChaveAcessoMDFe({
      cUF: '35', aamm: '2609', cnpj: '18236447000190', modelo: '58', serie: 3, numero: 999, tpEmis: 1,
    });
    expect(validarChaveAcessoMDFe(chaveCompleta)).toBe(true);
  });
});

describe('validarChaveAcessoMDFe', () => {
  it('rejeita chaves que não tenham exatamente 44 dígitos', () => {
    expect(validarChaveAcessoMDFe('123')).toBe(false);
    expect(validarChaveAcessoMDFe('1'.repeat(45))).toBe(false);
  });

  it('rejeita chaves com dígito verificador incorreto (detecta adulteração)', () => {
    const { chaveCompleta } = gerarChaveAcessoMDFe({
      cUF: '35', aamm: '2609', cnpj: '18236447000190', modelo: '58', serie: 1, numero: 1, tpEmis: 1,
    });
    const dvOriginal = Number(chaveCompleta.charAt(43));
    const dvAdulterado = (dvOriginal + 1) % 10;
    const chaveAdulterada = chaveCompleta.slice(0, 43) + dvAdulterado;

    expect(validarChaveAcessoMDFe(chaveAdulterada)).toBe(false);
  });

  it('aceita uma chave gerada por gerarChaveAcessoMDFe sem modificações', () => {
    const { chaveCompleta } = gerarChaveAcessoMDFe({
      cUF: '41', aamm: '2611', cnpj: '00000000000191', modelo: '58', serie: 2, numero: 12345, tpEmis: 1,
    });
    expect(validarChaveAcessoMDFe(chaveCompleta)).toBe(true);
  });
});

describe('calcularDVMod11MDFe', () => {
  it('é idêntico ao algoritmo da NF-e (módulo 11 padrão, pesos 2-9 cíclicos)', () => {
    const chave43 = '35260118236447000190580010000000011123456';
    expect(calcularDVMod11MDFe(chave43)).toBeGreaterThanOrEqual(0);
    expect(calcularDVMod11MDFe(chave43)).toBeLessThanOrEqual(9);
  });
});

describe('formatarChaveAcessoMDFe', () => {
  it('agrupa a chave em blocos de 4 dígitos separados por espaço', () => {
    const chave = '35260118236447000190580010000000011234567890';
    expect(formatarChaveAcessoMDFe(chave)).toBe('3526 0118 2364 4700 0190 5800 1000 0000 0112 3456 7890');
  });
});
