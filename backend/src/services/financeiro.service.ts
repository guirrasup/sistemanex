// C:\emissornfe\backend\src\services\financeiro.service.ts

import { FinanceiroRepository } from '../repositories/financeiro.repository.js';

export class FinanceiroService {
  private financeiroRepo: FinanceiroRepository;

  constructor() {
    this.financeiroRepo = new FinanceiroRepository();
  }

  async listarTitulos(empresaId: string, page: number, limit: number) {
    return this.financeiroRepo.findAll(empresaId, page, limit);
  }

  async listarPendentes(empresaId: string) {
    return this.financeiroRepo.findPendentes(empresaId);
  }

  async baixarTitulo(id: string, empresaId: string) {
    const titulo = await this.financeiroRepo.findTituloById(id);
    if (!titulo) throw new Error('Título não encontrado');
    if (titulo.empresaId !== empresaId) throw new Error('Acesso negado');
    if (titulo.status === 'PAGO') throw new Error('Título já está pago');

    return this.financeiroRepo.baixarTitulo(
      id, 
      new Date(), 
      titulo.valorOriginal
    );
  }

  async resumo(empresaId: string) {
    return this.financeiroRepo.getResumoFinanceiro(empresaId);
  }

  async getTitulosVencidos(empresaId: string) {
    const titulos = await this.financeiroRepo.findPendentes(empresaId);
    const hoje = new Date();
    
    return titulos.filter(t => {
      const vencimento = new Date(t.dataVencimento);
      return vencimento < hoje;
    });
  }
}