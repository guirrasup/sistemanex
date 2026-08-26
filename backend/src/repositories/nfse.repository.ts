// src/repositories/nfse.repository.ts
import { Prisma } from '@prisma/client'
import { BaseRepository } from './base.repository'

export class NfseRepository extends BaseRepository {
  async findById(id: string) {
    return this.prisma.nFSe.findUnique({
      where: { id },
      include: {
        empresa: {
          include: { endereco: true }
        },
        tomador: {
          include: { endereco: true }
        },
        servico: true
      }
    })
  }

  async findByChave(chaveAcesso: string) {
    return this.prisma.nFSe.findUnique({
      where: { chaveAcesso },
      include: {
        empresa: {
          include: { endereco: true }
        },
        tomador: {
          include: { endereco: true }
        },
        servico: true
      }
    })
  }

  async findAll(empresaId: string, page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit
    const [data, total] = await Promise.all([
      this.prisma.nFSe.findMany({
        where: { empresaId },
        include: {
          tomador: {
            include: { endereco: true }
          },
          servico: true
        },
        skip,
        take: limit,
        orderBy: { dataHoraEmissao: 'desc' }
      }),
      this.prisma.nFSe.count({ where: { empresaId } })
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findByPeriodo(empresaId: string, startDate: Date, endDate: Date) {
    return this.prisma.nFSe.findMany({
      where: {
        empresaId,
        dataHoraEmissao: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        tomador: {
          include: { endereco: true }
        },
        servico: true
      },
      orderBy: { dataHoraEmissao: 'desc' }
    })
  }

  async create(data: Prisma.NFSeCreateInput) {
    return this.prisma.nFSe.create({
      data,
      include: {
        empresa: true,
        tomador: true,
        servico: true
      }
    })
  }

  async updateStatus(id: string, status: string, protocolo?: string) {
    return this.prisma.nFSe.update({
      where: { id },
      data: {
        status,
        protocoloAutorizacao: protocolo,
        dataHoraAutorizacao: protocolo ? new Date() : undefined
      }
    })
  }

  async cancelar(id: string, motivo: string) {
    return this.prisma.nFSe.update({
      where: { id },
      data: {
        status: 'CANCELADA',
        motivoCancelamento: motivo,
        dataHoraCancelamento: new Date()
      }
    })
  }

  async getTotalFaturado(empresaId: string, startDate?: Date, endDate?: Date) {
    const where: any = {
      empresaId,
      status: 'AUTORIZADA'
    }

    if (startDate && endDate) {
      where.dataHoraEmissao = {
        gte: startDate,
        lte: endDate
      }
    }

    const result = await this.prisma.nFSe.aggregate({
      where,
      _sum: {
        valorTotalServicos: true,
        valorTotalISS: true,
        valorTotalIBS: true,
        valorTotalCBS: true
      }
    })

    return {
      totalServicos: result._sum.valorTotalServicos || 0,
      totalISS: result._sum.valorTotalISS || 0,
      totalIBS: result._sum.valorTotalIBS || 0,
      totalCBS: result._sum.valorTotalCBS || 0
    }
  }
}