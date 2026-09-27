// backend/src/repositories/ncm.repository.ts
import { BaseRepository } from './base.repository.js';

const LIMITE_RESULTADOS = 25;

export class NcmRepository extends BaseRepository {
  // 🔥 NCM tem ~10.400 linhas — ao contrário do Cfop (~60), nunca devolve a
  // tabela inteira; exige um termo de busca e sempre limita o resultado.
  async buscar(termo: string) {
    const q = termo.trim();
    if (!q) return [];

    const soDigitos = /^\d+$/.test(q);

    return this.prisma.ncm.findMany({
      where: soDigitos
        ? { codigo: { startsWith: q } }
        : { descricao: { contains: q, mode: 'insensitive' } },
      orderBy: { codigo: 'asc' },
      take: LIMITE_RESULTADOS,
    });
  }

  async buscarPorCodigo(codigo: string) {
    return this.prisma.ncm.findUnique({ where: { codigo } });
  }
}
