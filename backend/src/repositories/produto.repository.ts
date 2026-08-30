// C:\sistemanex\backend\src\repositories\produto.repository.ts

import { PrismaClient } from '@prisma/client';
import { BaseRepository } from './base.repository';

const prisma = new PrismaClient();

export class ProdutoRepository extends BaseRepository {
  async findAll(empresaId: string, page: number, limit: number, busca: string = '') {
    const skip = (page - 1) * limit;
    const where: any = {
      empresaId,
      ativo: true,
    };

    if (busca) {
      where.OR = [
        { descricao: { contains: busca, mode: 'insensitive' } },
        { codigo: { contains: busca, mode: 'insensitive' } },
      ];
    }

    const [produtos, total] = await Promise.all([
      prisma.produto.findMany({
        where,
        skip,
        take: limit,
        orderBy: { descricao: 'asc' },
      }),
      prisma.produto.count({ where }),
    ]);

    // 🔥 CORREÇÃO: Retorna no formato esperado pelo Service
    return {
      data: produtos,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findById(id: string) {
    return prisma.produto.findUnique({
      where: { id },
    });
  }

  async create(data: any) {
    return prisma.produto.create({
      data,
    });
  }

  async update(id: string, data: any) {
    return prisma.produto.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.produto.update({
      where: { id },
      data: { ativo: false },
    });
  }

  // 🔥 CORRIGIDO: SÓ RETORNA PRODUTOS COM ESTOQUE CRÍTICO
  async findEstoqueCritico(empresaId: string) {
    return prisma.produto.findMany({
      where: {
        empresaId,
        ativo: true,
        estoqueAtual: {
          lte: prisma.produto.fields.estoqueMinimo,
        },
      },
      orderBy: {
        estoqueAtual: 'asc',
      },
    });
  }
}