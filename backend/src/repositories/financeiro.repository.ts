// src/repositories/financeiro.repository.ts
import { Prisma } from '@prisma/client'
import { BaseRepository } from './base.repository'

export class FinanceiroRepository extends BaseRepository {
  async findTituloById(id: string) {
    return this.prisma.tituloFinanceiro.findUnique({
      where: { id },
      include: {
        cliente: {
          include: { endereco: true }
        }
      }
    })
  }

  async findAll(empresaId: string, page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit
    const [data, total] = await Promise.all([
      this.prisma.tituloFinanceiro.findMany({
        where: { empresaId },
        include: {
          cliente: true
        },
        skip,
        take: limit,
        orderBy: { dataVencimento: 'asc' }
      }),
      this.prisma.tituloFinanceiro.count({ where: { empresaId } })
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findPendentes(empresaId: string) {
    return this.prisma.tituloFinanceiro.findMany({
      where: {
        empresaId,
        status: { in: ['PENDENTE', 'VENCIDO'] }
      },
      include: {
        cliente: true
      },
      orderBy: { dataVencimento: 'asc' }
    })
  }

  async findByCliente(clienteId: string) {
    return this.prisma.tituloFinanceiro.findMany({
      where: {
        clienteId,
        status: { in: ['PENDENTE', 'VENCIDO'] }
      },
      orderBy: { dataVencimento: 'asc' }
    })
  }

  async create(data: Prisma.TituloFinanceiroCreateInput) {
    return this.prisma.tituloFinanceiro.create({ data })
  }

  async baixarTitulo(id: string, dataPagamento: Date, valorPago: number) {
    return this.prisma.tituloFinanceiro.update({
      where: { id },
      data: {
        status: 'PAGO',
        dataPagamento,
        valorPago
      }
    })
  }

  async getResumoFinanceiro(empresaId: string) {
    const [receber, pagar] = await Promise.all([
      this.prisma.tituloFinanceiro.aggregate({
        where: {
          empresaId,
          tipo: 'RECEBER',
          status: { in: ['PENDENTE', 'VENCIDO'] }
        },
        _sum: { valorOriginal: true }
      }),
      this.prisma.tituloFinanceiro.aggregate({
        where: {
          empresaId,
          tipo: 'PAGAR',
          status: { in: ['PENDENTE', 'VENCIDO'] }
        },
        _sum: { valorOriginal: true }
      })
    ])

    return {
      totalAReceber: receber._sum.valorOriginal || 0,
      totalAPagar: pagar._sum.valorOriginal || 0
    }
  }
}