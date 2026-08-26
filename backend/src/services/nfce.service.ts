// src/services/nfce.service.ts
import { NfceRepository } from '../repositories/nfce.repository';

export class NfceService {
  private nfceRepo: NfceRepository;

  constructor() {
    this.nfceRepo = new NfceRepository();
  }

  async listarNfces(empresaId: string, page: number = 1, limit: number = 50) {
    return this.nfceRepo.findAll(empresaId, page, limit);
  }

  async buscarPorId(id: string) {
    return this.nfceRepo.findById(id);
  }

  async buscarPorChave(chave: string) {
    return this.nfceRepo.findByChave(chave);
  }

  async emitirNfce(data: any) {
    // Implementação real (XML + SEFAZ) virá depois
    // Por enquanto apenas persiste um registro básico
    const nfce = await this.nfceRepo.create({
      ...data,
      status: 'PROCESSANDO',
      dataHoraEmissao: new Date(),
    });

    return nfce;
  }

  async cancelarNfce(id: string, motivo: string, empresaId: string) {
    const nfce = await this.nfceRepo.findById(id);

    if (!nfce) {
      throw new Error('NFC-e não encontrada');
    }

    if (nfce.empresaId !== empresaId) {
      throw new Error('Acesso negado');
    }

    if (nfce.status === 'CANCELADA') {
      throw new Error('NFC-e já está cancelada');
    }

    return this.nfceRepo.updateStatus(id, 'CANCELADA', motivo);
  }
}