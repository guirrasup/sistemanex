// C:\emissornfe\backend\src\repositories\nfe.repository.ts

import { Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';

export class NfeRepository extends BaseRepository {
  async findById(id: string) {
    return this.prisma.nFe.findUnique({
      where: { id },
      include: {
        empresa: {
          include: { endereco: true }
        },
        destinatario: {
          include: { endereco: true }
        },
        itens: true,
        duplicatas: true,
        transporte: true
      }
    });
  }

  async findByChave(chaveAcesso: string) {
    return this.prisma.nFe.findUnique({
      where: { chaveAcesso },
      include: {
        empresa: {
          include: { endereco: true }
        },
        destinatario: {
          include: { endereco: true }
        },
        itens: true,
        duplicatas: true,
        transporte: true
      }
    });
  }

  async findAll(empresaId: string, page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.nFe.findMany({
        where: { empresaId },
        include: {
          destinatario: {
            include: { endereco: true }
          },
          itens: true,
          duplicatas: true
        },
        skip,
        take: limit,
        orderBy: { dataHoraEmissao: 'desc' }
      }),
      this.prisma.nFe.count({ where: { empresaId } })
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async create(data: Prisma.NFeCreateInput) {
    return this.prisma.nFe.create({
      data,
      include: {
        empresa: true,
        destinatario: true,
        itens: true,
        duplicatas: true,
        transporte: true
      }
    });
  }

  async updateStatus(id: string, status: string, protocolo?: string) {
    return this.prisma.nFe.update({
      where: { id },
      data: {
        status,
        protocoloAutorizacao: protocolo,
        dataHoraAutorizacao: protocolo ? new Date() : undefined
      }
    });
  }

  async cancelar(id: string, motivo: string) {
    return this.prisma.nFe.update({
      where: { id },
      data: {
        status: 'CANCELADA',
        motivoCancelamento: motivo,
        dataHoraCancelamento: new Date()
      }
    });
  }

  async getTotalVendas(empresaId: string, startDate?: Date, endDate?: Date) {
    const where: any = {
      empresaId,
      status: 'AUTORIZADA'
    };

    if (startDate && endDate) {
      where.dataHoraEmissao = {
        gte: startDate,
        lte: endDate
      };
    }

    const result = await this.prisma.nFe.aggregate({
      where,
      _sum: {
        valorTotalProdutos: true,
        valorTotalNota: true,
        valorTotalICMS: true,
        valorTotalPIS: true,
        valorTotalCOFINS: true
      }
    });

    return {
      totalProdutos: result._sum.valorTotalProdutos || 0,
      totalNota: result._sum.valorTotalNota || 0,
      totalICMS: result._sum.valorTotalICMS || 0,
      totalPIS: result._sum.valorTotalPIS || 0,
      totalCOFINS: result._sum.valorTotalCOFINS || 0
    };
  }
}