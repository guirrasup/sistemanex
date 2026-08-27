// backend/src/repositories/transportadora.repository.ts

import { Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';

export class TransportadoraRepository extends BaseRepository {
  async findById(id: string) {
    return this.prisma.transportadora.findUnique({
      where: { id },
      include: {
        endereco: true
      }
    });
  }

  async findByCnpj(cnpj: string, empresaId: string) {
    return this.prisma.transportadora.findFirst({
      where: {
        cnpj,
        empresaId
      },
      include: {
        endereco: true
      }
    });
  }

  async findAll(
    empresaId: string,
    page: number = 1,
    limit: number = 50,
    busca: string = ''
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.TransportadoraWhereInput = { empresaId };

    if (busca) {
      where.OR = [
        { razaoSocial: { contains: busca, mode: 'insensitive' } },
        { nomeFantasia: { contains: busca, mode: 'insensitive' } },
        { cnpj: { contains: busca } },
        { rntrc: { contains: busca } }
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.transportadora.findMany({
        where,
        include: {
          endereco: true
        },
        skip,
        take: limit,
        orderBy: { razaoSocial: 'asc' }
      }),
      this.prisma.transportadora.count({ where })
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findByTipoTransportador(empresaId: string, tipo: string) {
    return this.prisma.transportadora.findMany({
      where: {
        empresaId,
        tipoTransportador: tipo,
        ativo: true
      },
      include: {
        endereco: true
      },
      orderBy: { razaoSocial: 'asc' }
    });
  }

  async findAtivos(empresaId: string) {
    return this.prisma.transportadora.findMany({
      where: {
        empresaId,
        ativo: true
      },
      include: {
        endereco: true
      },
      orderBy: { razaoSocial: 'asc' }
    });
  }

  async create(data: Prisma.TransportadoraCreateInput) {
    return this.prisma.transportadora.create({
      data,
      include: {
        endereco: true
      }
    });
  }

  async update(id: string, data: Prisma.TransportadoraUpdateInput) {
    return this.prisma.transportadora.update({
      where: { id },
      data,
      include: {
        endereco: true
      }
    });
  }

  async delete(id: string) {
    // Verifica se tem vínculos com TransporteNFe ou CTe
    const hasVinculo = await this.prisma.transporteNFe.count({
      where: { transportadoraId: id }
    });

    if (hasVinculo > 0) {
      throw new Error('Transportadora possui vínculos com CT-e ou NFe. Não pode ser excluída.');
    }

    return this.prisma.transportadora.delete({
      where: { id }
    });
  }
}