// backend/src/repositories/produto.repository.ts
import { Prisma, PrismaClient } from '@prisma/client';
import { BaseRepository } from './base.repository.js';

const prisma = new PrismaClient();

// 🔥 LIMITES DE RECURSOS (mitigação CWE-770 / CWE-400)
const MAX_PAGE_SIZE = 100;
const MAX_ESTOQUE_CRITICO = 500;
const MAX_IDS_BATCH = 500;

export class ProdutoRepository extends BaseRepository {
  async findAll(empresaId: string, page: number, limit: number, busca: string = '') {
    // 🔥 Clamp de paginação (evita page=0/negativa e limit descontrolado)
    const pageSegura = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
    const limitSeguro = Number.isFinite(limit) && limit > 0
      ? Math.min(Math.floor(limit), MAX_PAGE_SIZE)
      : 50;

    const skip = (pageSegura - 1) * limitSeguro;

    // 🔥 Sanitiza busca (limita tamanho para evitar payloads abusivos em ILIKE)
    const buscaSanitizada = typeof busca === 'string'
      ? busca.trim().slice(0, 200)
      : '';

    const where: Prisma.ProdutoWhereInput = {
      empresaId,
      ativo: true,
      ...(buscaSanitizada && {
        OR: [
          { descricao: { contains: buscaSanitizada, mode: 'insensitive' } },
          { codigo: { contains: buscaSanitizada, mode: 'insensitive' } },
        ]
      })
    };

    const [produtos, total] = await Promise.all([
      prisma.produto.findMany({
        where,
        skip,
        take: limitSeguro,
        orderBy: { descricao: 'asc' },
      }),
      prisma.produto.count({ where }),
    ]);

    return {
      data: produtos,
      total,
      page: pageSegura,
      limit: limitSeguro,
      totalPages: Math.ceil(total / limitSeguro)
    };
  }

  // 🔒 IDOR: empresaId agora é OBRIGATÓRIO (antes era opcional e permitia bypass)
  async findById(id: string, empresaId: string) {
    return prisma.produto.findFirst({
      where: { id, empresaId },
    });
  }

  // 🔒 IDOR: exige empresaId e valida posse
  async create(data: Prisma.ProdutoCreateInput) {
    if (!data.empresa) {
      throw new Error('empresaId é obrigatório');
    }
    return prisma.produto.create({ data });
  }

  // 🔒 IDOR: valida posse antes de mutar
  async update(id: string, empresaId: string, data: Prisma.ProdutoUpdateInput) {
    const existente = await prisma.produto.findFirst({
      where: { id, empresaId },
      select: { id: true },
    });

    if (!existente) {
      throw new Error('Produto não encontrado');
    }

    return prisma.produto.update({
      where: { id },
      data,
    });
  }

  // 🔒 IDOR: valida posse antes de mutar (soft delete)
  async delete(id: string, empresaId: string) {
    const existente = await prisma.produto.findFirst({
      where: { id, empresaId },
      select: { id: true },
    });

    if (!existente) {
      throw new Error('Produto não encontrado');
    }

    return prisma.produto.update({
      where: { id },
      data: { ativo: false },
    });
  }

  // 🔥 CORREÇÃO CRÍTICA: usar Prisma.sql para comparar colunas do mesmo registro
  async findEstoqueCritico(empresaId: string) {
    // Antes: `estoqueAtual: { lte: prisma.produto.fields.estoqueMinimo }` — INVÁLIDO no Prisma.
    // O objeto `prisma.produto.fields` não existe na API do Prisma Client.
    // Solução: usar query raw parametrizada.
    const produtos = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM "produtos"
      WHERE "empresaId" = ${empresaId}
        AND "ativo" = true
        AND "estoqueAtual" <= "estoqueMinimo"
      ORDER BY "estoqueAtual" ASC
      LIMIT ${MAX_ESTOQUE_CRITICO}
    `;

    if (produtos.length === 0) {
      return [];
    }

    // 🔥 Limita o IN para evitar payloads gigantes (CWE-770)
    const ids = produtos.map(p => p.id).slice(0, MAX_ESTOQUE_CRITICO);

    return prisma.produto.findMany({
      where: { id: { in: ids } },
      orderBy: { estoqueAtual: 'asc' },
    });
  }

  // 🔒 IDOR: exige empresaId e limita lote de IDs
  async findByIds(ids: string[], empresaId: string) {
    if (!Array.isArray(ids) || ids.length === 0) {
      return [];
    }

    // 🔥 Limita o número de IDs para evitar IN com milhares de valores
    const idsSeguros = ids
      .filter(id => typeof id === 'string' && id.length > 0)
      .slice(0, MAX_IDS_BATCH);

    if (idsSeguros.length === 0) {
      return [];
    }

    return prisma.produto.findMany({
      where: {
        id: { in: idsSeguros },
        empresaId,
      },
    });
  }
}