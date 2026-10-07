// backend/src/services/__tests__/acesso.service.test.ts
import { describe, it, expect, vi } from 'vitest';
import type { Request, Response } from 'express';
import { calcularPermissoesEfetivas } from '../acesso.service.js';
import {
  CATALOGO_PERMISSOES,
  PERMISSOES_PADRAO_POR_NIVEL,
  TODAS_PERMISSOES,
  normalizarPermissoes,
} from '../../config/permissoes.js';
import { exigirPermissao, exigirAdmin } from '../../middlewares/permissao.middleware.js';

describe('catálogo de permissões', () => {
  it('não tem chaves duplicadas', () => {
    expect(new Set(TODAS_PERMISSOES).size).toBe(TODAS_PERMISSOES.length);
  });

  it('padrões por nível só usam chaves do catálogo', () => {
    for (const lista of Object.values(PERMISSOES_PADRAO_POR_NIVEL)) {
      expect(normalizarPermissoes(lista).length).toBe(new Set(lista).size);
    }
  });

  it('todo módulo tem pelo menos uma permissão de nível "ver"', () => {
    for (const modulo of CATALOGO_PERMISSOES) {
      expect(modulo.permissoes.some((p) => p.nivel === 'ver')).toBe(true);
    }
  });

  it('normalizarPermissoes descarta lixo e duplicadas', () => {
    expect(normalizarPermissoes(['nfe.ver', 'nfe.ver', 'admin.tudo', 42, null])).toEqual(['nfe.ver']);
    expect(normalizarPermissoes('nfe.ver')).toEqual([]);
  });
});

describe('calcularPermissoesEfetivas', () => {
  it('ADMIN recebe todas, ignorando perfil e negações', () => {
    const efetivas = calcularPermissoesEfetivas({
      perfil: 'ADMIN',
      perfilAcessoPermissoes: [],
      permissoesNegadas: ['nfe.emitir'],
    });
    expect(efetivas).toEqual(TODAS_PERMISSOES);
  });

  it('sem perfil de acesso usa o padrão do nível base', () => {
    const efetivas = calcularPermissoesEfetivas({ perfil: 'OPERADOR' });
    expect(new Set(efetivas)).toEqual(new Set(PERMISSOES_PADRAO_POR_NIVEL.OPERADOR));
    expect(efetivas).not.toContain('nfe.cancelar');
  });

  it('perfil de acesso substitui o padrão do nível (inclusive vazio)', () => {
    expect(calcularPermissoesEfetivas({ perfil: 'FISCAL', perfilAcessoPermissoes: ['nfce.emitir'] })).toEqual(['nfce.emitir']);
    expect(calcularPermissoesEfetivas({ perfil: 'FISCAL', perfilAcessoPermissoes: [] })).toEqual([]);
  });

  it('concedidas somam e negadas removem — negar sempre vence', () => {
    const efetivas = calcularPermissoesEfetivas({
      perfil: 'OPERADOR',
      perfilAcessoPermissoes: ['nfe.ver', 'nfe.emitir'],
      permissoesConcedidas: ['nfe.cancelar', 'financeiro.ver'],
      permissoesNegadas: ['nfe.emitir', 'financeiro.ver'],
    });
    expect(efetivas).toEqual(['nfe.ver', 'nfe.cancelar']);
  });

  it('ignora chaves que não existem mais no catálogo', () => {
    expect(calcularPermissoesEfetivas({ perfil: 'OPERADOR', perfilAcessoPermissoes: ['modulo.removido', 'nfe.ver'] })).toEqual(['nfe.ver']);
  });
});

function executar(middleware: (req: Request, res: Response, next: () => void) => unknown, user: Request['user']) {
  const res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() };
  const next = vi.fn();
  middleware({ user, method: 'GET', originalUrl: '/teste' } as Request, res as unknown as Response, next);
  return { res, next };
}

describe('exigirPermissao', () => {
  const usuario = (perms: string[]) => ({ id: 'u1', email: 'a@b.com', empresaId: 'e1', perfil: 'OPERADOR', permissoes: new Set(perms) });

  it('libera quando tem pelo menos uma das permissões', () => {
    const { next, res } = executar(exigirPermissao('nfe.ver', 'nfe.emitir'), usuario(['nfe.emitir']));
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('responde 403 SEM_PERMISSAO quando não tem nenhuma', () => {
    const { next, res } = executar(exigirPermissao('nfe.cancelar'), usuario(['nfe.ver']));
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ codigo: 'SEM_PERMISSAO' }));
  });

  it('nega quando não há usuário autenticado', () => {
    const { next, res } = executar(exigirPermissao('nfe.ver'), undefined);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('falha ao montar a rota com chave inexistente (erro de digitação)', () => {
    expect(() => exigirPermissao('nfe.emitr')).toThrow(/inexistente/);
  });
});

describe('exigirAdmin', () => {
  it('libera apenas o nível ADMIN', () => {
    const base = { id: 'u1', email: 'a@b.com', empresaId: 'e1' };
    expect(executar(exigirAdmin, { ...base, perfil: 'ADMIN' }).next).toHaveBeenCalled();
    expect(executar(exigirAdmin, { ...base, perfil: 'FISCAL', permissoes: new Set(TODAS_PERMISSOES) }).next).not.toHaveBeenCalled();
  });
});
