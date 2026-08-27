// C:\emissornfe\backend\src\repositories\cliente.repository.ts
// ✅ CORREÇÃO - MÉTODO UPDATE

import { Prisma } from '@prisma/client'
import { BaseRepository } from './base.repository'

export class ClienteRepository extends BaseRepository {
  async findById(id: string) {
    return this.prisma.cliente.findUnique({
      where: { id },
      include: {
        endereco: true
      }
    })
  }

  async findByDocumento(documento: string) {
    return this.prisma.cliente.findUnique({
      where: { documento },
      include: {
        endereco: true
      }
    })
  }

  async findAll(empresaId: string, page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit
    const [data, total] = await Promise.all([
      this.prisma.cliente.findMany({
        where: { empresaId },
        include: { endereco: true },
        skip,
        take: limit,
        orderBy: { razaoSocial: 'asc' }
      }),
      this.prisma.cliente.count({ where: { empresaId } })
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async search(empresaId: string, term: string) {
    return this.prisma.cliente.findMany({
      where: {
        empresaId,
        OR: [
          { razaoSocial: { contains: term, mode: 'insensitive' } },
          { documento: { contains: term } },
          { nomeFantasia: { contains: term, mode: 'insensitive' } }
        ]
      },
      include: { endereco: true },
      take: 20
    })
  }

  async findByTipo(empresaId: string, tipo: string) {
    return this.prisma.cliente.findMany({
      where: {
        empresaId,
        tipo: tipo as any
      },
      include: { endereco: true },
      orderBy: { razaoSocial: 'asc' }
    })
  }

  async create(data: Prisma.ClienteCreateInput) {
    return this.prisma.cliente.create({
      data,
      include: { endereco: true }
    })
  }

  // 🔥 CORREÇÃO: UPDATE COM ENDERECO
  async update(id: string, data: any) {
    // 🔥 SEPARA ENDERECO DO RESTO
    const { endereco, ...clienteData } = data;

    // 🔥 PREPARA OS DADOS DO CLIENTE
    const updateData: Prisma.ClienteUpdateInput = {
      ...clienteData,
    };

    // 🔥 SE TIVER ENDERECO, ATUALIZA OU CRIA
    if (endereco) {
      updateData.endereco = {
        upsert: {
          create: endereco,
          update: endereco
        }
      };
    }

    return this.prisma.cliente.update({
      where: { id },
      data: updateData,
      include: { endereco: true }
    })
  }

  async delete(id: string) {
    // Verifica se o cliente tem notas vinculadas
    const hasNotas = await this.prisma.nFe.count({
      where: { destinatarioId: id }
    })

    if (hasNotas > 0) {
      throw new Error('Cliente possui notas fiscais vinculadas. Não pode ser excluído.')
    }

    return this.prisma.cliente.delete({
      where: { id }
    })
  }
}