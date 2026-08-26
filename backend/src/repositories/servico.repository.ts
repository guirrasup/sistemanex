// C:\emissornfe\backend\src\repositories\servico.repository.ts

import { Prisma } from '@prisma/client'
import { BaseRepository } from './base.repository'

export class ServicoRepository extends BaseRepository {
  async findById(id: string) {
    return this.prisma.servico.findUnique({
      where: { id }
    })
  }

  async findAll(empresaId: string, page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit
    const [data, total] = await Promise.all([
      this.prisma.servico.findMany({
        where: { empresaId, ativo: true },
        skip,
        take: limit,
        orderBy: { descricao: 'asc' }
      }),
      this.prisma.servico.count({ where: { empresaId, ativo: true } })
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async search(empresaId: string, term: string) {
    return this.prisma.servico.findMany({
      where: {
        empresaId,
        ativo: true,
        OR: [
          { descricao: { contains: term, mode: 'insensitive' } },
          { codigoInterno: { contains: term, mode: 'insensitive' } }
        ]
      },
      take: 20
    })
  }

  async create(data: Prisma.ServicoCreateInput) {
    return this.prisma.servico.create({ data })
  }

  async update(id: string, data: Prisma.ServicoUpdateInput) {
    return this.prisma.servico.update({
      where: { id },
      data
    })
  }

  async delete(id: string) {
    return this.prisma.servico.delete({
      where: { id }
    })
  }
}