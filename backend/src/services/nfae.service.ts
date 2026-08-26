// src/services/nfae.service.ts
import { NfaeRepository } from '../repositories/nfae.repository';

export class NfaeService {
  private nfaeRepo: NfaeRepository;

  constructor() {
    this.nfaeRepo = new NfaeRepository();
  }

  async listarNfaes(empresaId: string, page: number = 1, limit: number = 50) {
    return this.nfaeRepo.findAll(empresaId, page, limit);
  }

  async emitirNfae(data: any) {
    // Implementação real virá depois (XML + SEFAZ)
    // Por enquanto apenas persiste um registro básico
    const nfae = await this.nfaeRepo.create({
      ...data,
      status: 'PROCESSANDO',
      dataHoraEmissao: new Date(),
    });

    return nfae;
  }

  async cancelarNfae(id: string, motivo: string, empresaId: string) {
    const nfae = await this.nfaeRepo.findById(id);

    if (!nfae) {
      throw new Error('NFA-e não encontrada');
    }

    if (nfae.empresaId !== empresaId) {
      throw new Error('Acesso negado');
    }

    if (nfae.status === 'CANCELADA') {
      throw new Error('NFA-e já está cancelada');
    }

    return this.nfaeRepo.updateStatus(id, 'CANCELADA', motivo);
  }
}