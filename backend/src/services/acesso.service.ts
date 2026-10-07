// backend/src/services/acesso.service.ts
//
// Resolve o que cada usuário pode fazer. Consultado a cada request pelo
// authMiddleware — por isso o cache curto em memória: mudanças feitas pelo
// ADMIN invalidam a entrada na hora (mesmo processo) e, em outras instâncias,
// valem no máximo após CACHE_TTL_MS.
import { prisma } from '../lib/prisma.js';
import {
  PERMISSOES_PADRAO_POR_NIVEL,
  TODAS_PERMISSOES,
  normalizarPermissoes,
} from '../config/permissoes.js';

export interface AcessoUsuario {
  id: string;
  empresaId: string;
  perfil: string;
  ativo: boolean;
  sessaoVersao: number;
  permissoes: Set<string>;
}

export interface DadosAcesso {
  perfil: string;
  perfilAcessoPermissoes?: string[] | null;
  permissoesConcedidas?: string[];
  permissoesNegadas?: string[];
}

/**
 * Regra única de permissões efetivas:
 *   ADMIN → todas.
 *   Demais → (permissões do perfil de acesso, ou o padrão do nível base)
 *            + concedidas − negadas. Negar sempre vence.
 */
export function calcularPermissoesEfetivas(dados: DadosAcesso): string[] {
  if (dados.perfil === 'ADMIN') return [...TODAS_PERMISSOES];

  const base = dados.perfilAcessoPermissoes
    ?? PERMISSOES_PADRAO_POR_NIVEL[dados.perfil as keyof typeof PERMISSOES_PADRAO_POR_NIVEL]
    ?? [];

  const efetivas = new Set(normalizarPermissoes([...base, ...(dados.permissoesConcedidas || [])]));
  for (const negada of dados.permissoesNegadas || []) efetivas.delete(negada);

  return TODAS_PERMISSOES.filter((c) => efetivas.has(c));
}

const CACHE_TTL_MS = 15_000;
const cache = new Map<string, { acesso: AcessoUsuario | null; expiraEm: number }>();

export function invalidarAcesso(usuarioId?: string) {
  if (usuarioId) cache.delete(usuarioId);
  else cache.clear();
}

export async function carregarAcesso(usuarioId: string): Promise<AcessoUsuario | null> {
  const emCache = cache.get(usuarioId);
  if (emCache && emCache.expiraEm > Date.now()) return emCache.acesso;

  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: {
      id: true,
      empresaId: true,
      perfil: true,
      ativo: true,
      sessaoVersao: true,
      permissoesConcedidas: true,
      permissoesNegadas: true,
      perfilAcesso: { select: { permissoes: true } },
    },
  });

  const acesso: AcessoUsuario | null = usuario
    ? {
        id: usuario.id,
        empresaId: usuario.empresaId,
        perfil: usuario.perfil,
        ativo: usuario.ativo,
        sessaoVersao: usuario.sessaoVersao,
        permissoes: new Set(
          calcularPermissoesEfetivas({
            perfil: usuario.perfil,
            perfilAcessoPermissoes: usuario.perfilAcesso?.permissoes ?? null,
            permissoesConcedidas: usuario.permissoesConcedidas,
            permissoesNegadas: usuario.permissoesNegadas,
          })
        ),
      }
    : null;

  cache.set(usuarioId, { acesso, expiraEm: Date.now() + CACHE_TTL_MS });
  return acesso;
}
