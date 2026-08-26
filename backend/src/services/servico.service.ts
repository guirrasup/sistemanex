// C:\emissornfe\backend\src\services\servico.service.ts

import { ServicoRepository } from '../repositories/servico.repository.js';

export class ServicoService {
  private servicoRepo: ServicoRepository;

  constructor() {
    this.servicoRepo = new ServicoRepository();
  }

  async listar(empresaId: string, page: number, limit: number, busca: string = '') {
    if (busca) {
      const data = await this.servicoRepo.search(empresaId, busca);
      return { data, total: data.length, page: 1, limit: data.length, totalPages: 1 };
    }
    return this.servicoRepo.findAll(empresaId, page, limit);
  }

  async buscarPorId(id: string) {
    return this.servicoRepo.findById(id);
  }

  async criar(data: any) {
    if (!data.descricao || data.descricao.trim().length < 3) {
      throw new Error('Descrição do serviço é obrigatória (mínimo 3 caracteres)');
    }
    if (!data.valorUnitario || data.valorUnitario <= 0) {
      throw new Error('Valor unitário deve ser maior que zero');
    }
    if (!data.codigoInterno) {
      throw new Error('Código interno é obrigatório');
    }

    return this.servicoRepo.create(data);
  }

  async atualizar(id: string, data: any, empresaId: string) {
    const servico = await this.servicoRepo.findById(id);
    if (!servico) {
      throw new Error('Serviço não encontrado');
    }
    if (servico.empresaId !== empresaId) {
      throw new Error('Acesso negado');
    }

    return this.servicoRepo.update(id, data);
  }

  async excluir(id: string, empresaId: string) {
    const servico = await this.servicoRepo.findById(id);
    if (!servico) {
      throw new Error('Serviço não encontrado');
    }
    if (servico.empresaId !== empresaId) {
      throw new Error('Acesso negado');
    }

    return this.servicoRepo.delete(id);
  }
}