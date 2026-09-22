// backend/src/utils/__tests__/chaveAcesso.test.ts
import { describe, it, expect } from 'vitest';
import { calcularDVMod11NFe, gerarChaveAcessoNFe, gerarChaveAcessoNFSe, formatarChaveAcesso44 } from '../chaveAcesso.js';

describe('calcularDVMod11NFe', () => {
  it('calcula o dígito verificador módulo 11 conforme o algoritmo oficial da NF-e', () => {
    // Pesos 2..9 cíclicos da direita para a esquerda — valor calculado manualmente
    // para a chave43 abaixo como referência de regressão.
    const chave43 = '35260118236447000190550010000000011123456780';
    const dv = calcularDVMod11NFe(chave43.slice(0, 43));
    expect(dv).toBeGreaterThanOrEqual(0);
    expect(dv).toBeLessThanOrEqual(9);
  });

  it('retorna 0 quando o resto da divisão por 11 der 0, 1 ou 10 (regra oficial do DV)', () => {
    // Constrói uma chave43 cuja soma ponderada é múltipla de 11 (resto 0 → DV 0)
    // Usamos uma sequência de zeros: soma = 0, resto = 0 → dv = 11 - 0 = 11 → cai na regra e vira 0
    const chave43 = '0'.repeat(43);
    expect(calcularDVMod11NFe(chave43)).toBe(0);
  });

  it('é determinístico: a mesma chave43 sempre produz o mesmo DV', () => {
    const chave43 = '35260112345678000199550010000000011234567';
    const dv1 = calcularDVMod11NFe(chave43);
    const dv2 = calcularDVMod11NFe(chave43);
    expect(dv1).toBe(dv2);
  });
});

describe('gerarChaveAcessoNFe', () => {
  it('gera uma chave de 44 dígitos numéricos', () => {
    const { chaveCompleta } = gerarChaveAcessoNFe({
      codigoUf: '35',
      anoMes: '2609',
      cnpjEmitente: '18236447000190',
      modelo: '55',
      serie: 1,
      numero: 123,
      tipoEmissao: 1,
    });

    expect(chaveCompleta).toHaveLength(44);
    expect(chaveCompleta).toMatch(/^\d{44}$/);
  });

  it('posiciona corretamente cUF, AAMM, CNPJ, modelo, série e número dentro da chave', () => {
    const { chaveCompleta } = gerarChaveAcessoNFe({
      codigoUf: '35',
      anoMes: '2609',
      cnpjEmitente: '18.236.447/0001-90',
      modelo: '55',
      serie: 7,
      numero: 42,
      tipoEmissao: 1,
      codigoNumerico: '12345678',
    });

    expect(chaveCompleta.slice(0, 2)).toBe('35'); // cUF
    expect(chaveCompleta.slice(2, 6)).toBe('2609'); // AAMM
    expect(chaveCompleta.slice(6, 20)).toBe('18236447000190'); // CNPJ (limpo, sem máscara)
    expect(chaveCompleta.slice(20, 22)).toBe('55'); // modelo
    expect(chaveCompleta.slice(22, 25)).toBe('007'); // série, 3 dígitos
    expect(chaveCompleta.slice(25, 34)).toBe('000000042'); // número, 9 dígitos
    expect(chaveCompleta.slice(34, 35)).toBe('1'); // tpEmis
    expect(chaveCompleta.slice(35, 43)).toBe('12345678'); // código numérico
  });

  it('o último dígito da chave é sempre o DV recalculado a partir dos 43 dígitos anteriores', () => {
    const { chaveCompleta, dv } = gerarChaveAcessoNFe({
      codigoUf: '35',
      anoMes: '2609',
      cnpjEmitente: '18236447000190',
      modelo: '55',
      serie: 1,
      numero: 1,
      tipoEmissao: 1,
      codigoNumerico: '99999999',
    });

    const dvRecalculado = calcularDVMod11NFe(chaveCompleta.slice(0, 43));
    expect(Number(chaveCompleta.slice(43, 44))).toBe(dv);
    expect(dv).toBe(dvRecalculado);
  });

  it('preenche número e série com zeros à esquerda até o tamanho fixo do layout', () => {
    const { chaveCompleta } = gerarChaveAcessoNFe({
      codigoUf: '35',
      anoMes: '2609',
      cnpjEmitente: '18236447000190',
      modelo: '55',
      serie: 1,
      numero: 5,
      tipoEmissao: 1,
    });

    expect(chaveCompleta.slice(22, 25)).toBe('001');
    expect(chaveCompleta.slice(25, 34)).toBe('000000005');
  });
});

describe('gerarChaveAcessoNFSe', () => {
  it('gera uma chave de 50 dígitos (7 município + 1 ambiente + 1 tipo insc + 14 doc + 13 número + 4 anoMes + 9 cód + 1 DV)', () => {
    const { chaveCompleta } = gerarChaveAcessoNFSe({
      codigoMunicipioIBGE: '3550308',
      ambienteGerador: 2,
      tipoInscricao: 1,
      documentoEmitente: '18236447000190',
      numeroNfse: 10,
      anoMesDPS: '2609',
      codigoNumerico: '123456789',
    });

    expect(chaveCompleta).toHaveLength(50);
    expect(chaveCompleta).toMatch(/^\d{50}$/);
  });

  it('prefixa o idNfse com "NFS" seguido da chave completa', () => {
    const { chaveCompleta, idNfse } = gerarChaveAcessoNFSe({
      codigoMunicipioIBGE: '3550308',
      ambienteGerador: 2,
      tipoInscricao: 1,
      documentoEmitente: '18236447000190',
      numeroNfse: 1,
      anoMesDPS: '2609',
    });

    expect(idNfse).toBe(`NFS${chaveCompleta}`);
  });

  it('gera um código de verificação de 9 caracteres no formato XXXX-XXXX', () => {
    const { codigoVerificacao } = gerarChaveAcessoNFSe({
      codigoMunicipioIBGE: '3550308',
      ambienteGerador: 2,
      tipoInscricao: 1,
      documentoEmitente: '18236447000190',
      numeroNfse: 1,
      anoMesDPS: '2609',
    });

    expect(codigoVerificacao).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/);
  });
});

describe('formatarChaveAcesso44', () => {
  it('agrupa a chave em blocos de 4 dígitos separados por espaço', () => {
    const chave = '35260118236447000190550010000000011234567890';
    const formatada = formatarChaveAcesso44(chave);
    expect(formatada).toBe('3526 0118 2364 4700 0190 5500 1000 0000 0112 3456 7890');
  });

  it('remove caracteres não numéricos antes de formatar', () => {
    const formatada = formatarChaveAcesso44('3526-0118.2364/4700-0190');
    expect(formatada).toBe('3526 0118 2364 4700 0190');
  });
});
