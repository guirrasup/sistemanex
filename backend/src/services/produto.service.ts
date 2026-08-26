// C:\emissornfe\backend\src\services\produto.service.ts

import { ProdutoRepository } from '../repositories/produto.repository.js';

export class ProdutoService {
  private produtoRepo: ProdutoRepository;

  constructor() {
    this.produtoRepo = new ProdutoRepository();
  }

  async listar(empresaId: string, page: number, limit: number, busca: string = '') {
    return this.produtoRepo.findAll(empresaId, page, limit, busca);
  }

  async buscarPorId(id: string) {
    return this.produtoRepo.findById(id);
  }

  async criar(data: any) {
    // Validações
    if (!data.descricao || data.descricao.trim().length < 3) {
      throw new Error('Descrição do produto é obrigatória (mínimo 3 caracteres)');
    }
    if (!data.precoVenda || data.precoVenda <= 0) {
      throw new Error('Preço de venda deve ser maior que zero');
    }
    if (!data.ncm || data.ncm.length !== 8) {
      throw new Error('NCM deve ter 8 dígitos');
    }

    return this.produtoRepo.create(data);
  }

  async atualizar(id: string, data: any, empresaId: string) {
    // Verifica se o produto existe e pertence à empresa
    const produto = await this.produtoRepo.findById(id);
    if (!produto) {
      throw new Error('Produto não encontrado');
    }
    if (produto.empresaId !== empresaId) {
      throw new Error('Acesso negado');
    }

    return this.produtoRepo.update(id, data);
  }

  async excluir(id: string, empresaId: string) {
    const produto = await this.produtoRepo.findById(id);
    if (!produto) {
      throw new Error('Produto não encontrado');
    }
    if (produto.empresaId !== empresaId) {
      throw new Error('Acesso negado');
    }

    return this.produtoRepo.delete(id);
  }

  async buscarEstoqueCritico(empresaId: string) {
    return this.produtoRepo.findEstoqueCritico(empresaId);
  }
}