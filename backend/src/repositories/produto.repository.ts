// src/repositories/produto.repository.ts
import { Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';

export class ProdutoRepository extends BaseRepository {
  async findById(id: string) {
    return this.prisma.produto.findUnique({
      where: { id },
    });
  }

  async findAll(
    empresaId: string,
    page: number,
    limit: number,
    busca: string = ''
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.ProdutoWhereInput = { empresaId };

    if (busca) {
      where.OR = [
        { descricao: { contains: busca, mode: 'insensitive' } },
        { codigo: { contains: busca, mode: 'insensitive' } },
        { ncm: { contains: busca } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.produto.findMany({
        where,
        skip,
        take: limit,
        orderBy: { descricao: 'asc' },
      }),
      this.prisma.produto.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(data: Prisma.ProdutoCreateInput) {
    return this.prisma.produto.create({ data });
  }

  async update(id: string, data: Prisma.ProdutoUpdateInput) {
    return this.prisma.produto.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.produto.delete({
      where: { id },
    });
  }

  /**
   * Produtos com estoque atual <= estoque mínimo
   * (Prisma não permite comparação direta entre colunas de forma tipada,
   * por isso filtramos em memória após buscar apenas os ativos da empresa)
   */
  async findEstoqueCritico(empresaId: string) {
    const produtos = await this.prisma.produto.findMany({
      where: {
        empresaId,
        ativo: true,
      },
      orderBy: { estoqueAtual: 'asc' },
    });

    return produtos.filter(
      (p) => (p.estoqueAtual ?? 0) <= (p.estoqueMinimo ?? 0)
    );
  }
}