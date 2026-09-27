// backend/src/services/ncm.service.ts
import { NcmRepository } from '../repositories/ncm.repository.js';

export class NcmService {
  private ncmRepo: NcmRepository;

  constructor() {
    this.ncmRepo = new NcmRepository();
  }

  async buscar(termo: string) {
    return this.ncmRepo.buscar(termo);
  }
}
