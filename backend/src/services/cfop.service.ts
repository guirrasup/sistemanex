// backend/src/services/cfop.service.ts
import { CfopRepository } from '../repositories/cfop.repository.js';

export class CfopService {
  private cfopRepo: CfopRepository;

  constructor() {
    this.cfopRepo = new CfopRepository();
  }

  async listar(busca?: string) {
    return this.cfopRepo.findAll(busca);
  }
}
