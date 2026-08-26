// C:\emissornfe\backend\src\services\cliente.service.ts

import { ClienteRepository } from '../repositories/cliente.repository.js';

export class ClienteService {
  private clienteRepo: ClienteRepository;

  constructor() {
    this.clienteRepo = new ClienteRepository();
  }

  async listar(empresaId: string, page: number, limit: number, busca: string = '') {
    if (busca) {
      const data = await this.clienteRepo.search(empresaId, busca);
      return { data, total: data.length, page: 1, limit: data.length, totalPages: 1 };
    }
    return this.clienteRepo.findAll(empresaId, page, limit);
  }

  async buscarPorId(id: string) {
    return this.clienteRepo.findById(id);
  }

  async buscarPorDocumento(documento: string) {
    return this.clienteRepo.findByDocumento(documento);
  }

  async buscarPorTipo(empresaId: string, tipo: string) {
    return this.clienteRepo.findByTipo(empresaId, tipo);
  }

  async criar(data: any) {
    // Validações
    if (!data.razaoSocial || data.razaoSocial.trim().length < 3) {
      throw new Error('Razão Social é obrigatória (mínimo 3 caracteres)');
    }
    if (!data.documento || data.documento.replace(/\D/g, '').length < 11) {
      throw new Error('CPF/CNPJ inválido');
    }
    if (!data.endereco) {
      throw new Error('Endereço é obrigatório');
    }

    return this.clienteRepo.create(data);
  }

  async atualizar(id: string, data: any, empresaId: string) {
    const cliente = await this.clienteRepo.findById(id);
    if (!cliente) {
      throw new Error('Cliente não encontrado');
    }
    if (cliente.empresaId !== empresaId) {
      throw new Error('Acesso negado');
    }

    return this.clienteRepo.update(id, data);
  }

  async excluir(id: string, empresaId: string) {
    const cliente = await this.clienteRepo.findById(id);
    if (!cliente) {
      throw new Error('Cliente não encontrado');
    }
    if (cliente.empresaId !== empresaId) {
      throw new Error('Acesso negado');
    }

    return this.clienteRepo.delete(id);
  }
}