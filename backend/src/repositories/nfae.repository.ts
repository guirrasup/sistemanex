// src/repositories/nfae.repository.ts
import { BaseRepository } from './base.repository';

export class NfaeRepository extends BaseRepository {
  async findAll(empresaId: string, page: number = 1, limit: number = 50) {
    try {
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.prisma.nFAe.findMany({
          where: { empresaId },
          skip,
          take: limit,
          orderBy: { dataHoraEmissao: 'desc' },
        }),
        this.prisma.nFAe.count({ where: { empresaId } }),
      ]);

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.warn('⚠️ Tabela nFAe não encontrada ou erro:', error);
      return { data: [], total: 0, page, limit, totalPages: 0 };
    }
  }

  async findById(id: string) {
    try {
      return await this.prisma.nFAe.findUnique({ where: { id } });
    } catch {
      return null;
    }
  }

  async create(data: any) {
    return this.prisma.nFAe.create({ data });
  }

  async updateStatus(id: string, status: string, motivo?: string) {
    return this.prisma.nFAe.update({
      where: { id },
      data: {
        status,
        motivoCancelamento: motivo,
        dataHoraCancelamento: status === 'CANCELADA' ? new Date() : undefined,
      },
    });
  }
}