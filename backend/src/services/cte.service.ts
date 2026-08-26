// src/services/cte.service.ts
import { CteRepository } from '../repositories/cte.repository';

export class CteService {
  private cteRepo: CteRepository;

  constructor() {
    this.cteRepo = new CteRepository();
  }

  async listarCtes(empresaId: string, page: number = 1, limit: number = 50) {
    return this.cteRepo.findAll(empresaId, page, limit);
  }

  async buscarPorId(id: string) {
    return this.cteRepo.findById(id);
  }

  async buscarPorChave(chave: string) {
    return this.cteRepo.findByChave(chave);
  }

  async emitirCte(data: any) {
    // Implementação real (XML + SEFAZ) virá depois
    // Por enquanto apenas persiste um registro básico
    const cte = await this.cteRepo.create({
      ...data,
      status: 'PROCESSANDO',
      dataHoraEmissao: new Date(),
    });

    return cte;
  }

  async cancelarCte(id: string, motivo: string, empresaId: string) {
    const cte = await this.cteRepo.findById(id);

    if (!cte) {
      throw new Error('CT-e não encontrado');
    }

    if (cte.empresaId !== empresaId) {
      throw new Error('Acesso negado');
    }

    if (cte.status === 'CANCELADA') {
      throw new Error('CT-e já está cancelado');
    }

    return this.cteRepo.updateStatus(id, 'CANCELADA', motivo);
  }
}