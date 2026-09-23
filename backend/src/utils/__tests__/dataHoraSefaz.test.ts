// backend/src/utils/__tests__/dataHoraSefaz.test.ts
import { describe, it, expect } from 'vitest';
import { formatarDataHoraSefaz } from '../dataHoraSefaz.js';

describe('formatarDataHoraSefaz', () => {
  it('formata no padrão AAAA-MM-DDTHH:mm:ss±HH:mm, sem milissegundos e sem "Z"', () => {
    const resultado = formatarDataHoraSefaz(new Date('2026-09-22T23:50:04.703Z'));
    expect(resultado).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[-+]\d{2}:\d{2}$/);
    expect(resultado).not.toContain('.');
    expect(resultado).not.toContain('Z');
  });

  it('usa UTC-3 (Brasília) por padrão, deslocando a hora UTC corretamente', () => {
    // 23:50 UTC - 3h = 20:50 no fuso de Brasília
    const resultado = formatarDataHoraSefaz(new Date('2026-09-22T23:50:04.000Z'));
    expect(resultado).toBe('2026-09-22T20:50:04-03:00');
  });

  it('rola a data para o dia anterior quando o deslocamento cruza a meia-noite UTC', () => {
    // 01:00 UTC - 3h = 22:00 do dia anterior
    const resultado = formatarDataHoraSefaz(new Date('2026-09-23T01:00:00.000Z'));
    expect(resultado).toBe('2026-09-22T22:00:00-03:00');
  });

  it('aceita um offset diferente do padrão (ex.: UTC-4, Amazonas/Acre)', () => {
    const resultado = formatarDataHoraSefaz(new Date('2026-09-22T23:50:04.000Z'), -240);
    expect(resultado).toBe('2026-09-22T19:50:04-04:00');
  });

  it('usa a hora atual quando nenhuma data é informada', () => {
    const resultado = formatarDataHoraSefaz();
    expect(resultado).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}-03:00$/);
  });
});
