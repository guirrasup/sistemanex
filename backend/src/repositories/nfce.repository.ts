// src/repositories/nfce.repository.ts
import { BaseRepository } from './base.repository';

export class NfceRepository extends BaseRepository {
  async findAll(empresaId: string, page: number = 1, limit: number = 50) {
    try {
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.prisma.nFCe.findMany({
          where: { empresaId },
          skip,
          take: limit,
          orderBy: { dataHoraEmissao: 'desc' },
        }),
        this.prisma.nFCe.count({ where: { empresaId } }),
      ]);

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.warn('⚠️ Tabela nFCe não encontrada ou erro:', error);
      return { data: [], total: 0, page, limit, totalPages: 0 };
    }
  }

  async findById(id: string) {
    try {
      return await this.prisma.nFCe.findUnique({ where: { id } });
    } catch {
      return null;
    }
  }

  async findByChave(chaveAcesso: string) {
    try {
      return await this.prisma.nFCe.findUnique({ where: { chaveAcesso } });
    } catch {
      return null;
    }
  }

  async create(data: any) {
    return this.prisma.nFCe.create({ data });
  }

  async updateStatus(id: string, status: string, motivo?: string) {
    return this.prisma.nFCe.update({
      where: { id },
      data: {
        status,
        motivoCancelamento: motivo,
        dataHoraCancelamento: status === 'CANCELADA' ? new Date() : undefined,
      },
    });
  }
}