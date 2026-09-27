// backend/src/repositories/cfop.repository.ts
import { BaseRepository } from './base.repository.js';

export class CfopRepository extends BaseRepository {
  // 🔥 CFOP é catálogo nacional estável (Ajuste SINIEF 07/2001), não um dado
  // por empresa — por isso não filtra por empresaId como os outros cadastros.
  async findAll(busca?: string) {
    const termo = busca?.trim();
    if (!termo) {
      return this.prisma.cfop.findMany({ orderBy: { codigo: 'asc' } });
    }

    return this.prisma.cfop.findMany({
      where: {
        OR: [
          { codigo: { contains: termo } },
          { descricao: { contains: termo, mode: 'insensitive' } },
        ],
      },
      orderBy: { codigo: 'asc' },
    });
  }
}
