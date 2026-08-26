// C:\emissornfe\backend\src\services\estoque.service.ts

import { ProdutoRepository } from '../repositories/produto.repository.js';
import { Prisma } from '@prisma/client';

export class EstoqueService {
  private produtoRepo: ProdutoRepository;

  constructor() {
    this.produtoRepo = new ProdutoRepository();
  }

  async baixarEstoque(params: {
    empresaId: string;
    produtoId: string;
    quantidade: number;
    documentoReferencia: string;
    tipoMovimento: 'SAIDA_VENDA' | 'SAIDA_NFE' | 'SAIDA_NFCE';
    usuarioId: string;
  }) {
    const produto = await this.produtoRepo.findById(params.produtoId);
    if (!produto) throw new Error('Produto não encontrado');

    if (produto.estoqueAtual < params.quantidade) {
      throw new Error(`Estoque insuficiente. Disponível: ${produto.estoqueAtual} ${produto.unidade}`);
    }

    const novoEstoque = produto.estoqueAtual - params.quantidade;
    
    await this.produtoRepo.update(params.produtoId, {
      estoqueAtual: novoEstoque
    });

    // Registra movimentação (opcional - pode ser implementado com uma tabela de movimentações)
    console.log(`✅ Estoque baixado: ${params.quantidade} ${produto.unidade} de ${produto.descricao}`);

    return {
      produto: produto.descricao,
      quantidade: params.quantidade,
      estoqueAnterior: produto.estoqueAtual,
      estoqueAtual: novoEstoque,
      documentoReferencia: params.documentoReferencia
    };
  }

  async reporEstoque(params: {
    empresaId: string;
    produtoId: string;
    quantidade: number;
    documentoReferencia: string;
    usuarioId: string;
  }) {
    const produto = await this.produtoRepo.findById(params.produtoId);
    if (!produto) throw new Error('Produto não encontrado');

    const novoEstoque = produto.estoqueAtual + params.quantidade;

    await this.produtoRepo.update(params.produtoId, {
      estoqueAtual: novoEstoque
    });

    return {
      produto: produto.descricao,
      quantidade: params.quantidade,
      estoqueAnterior: produto.estoqueAtual,
      estoqueAtual: novoEstoque,
      documentoReferencia: params.documentoReferencia
    };
  }

  async verificarDisponibilidade(produtoId: string, quantidade: number): Promise<boolean> {
    const produto = await this.produtoRepo.findById(produtoId);
    if (!produto) return false;
    return produto.estoqueAtual >= quantidade;
  }

  async getEstoqueCritico(empresaId: string) {
    return this.produtoRepo.findEstoqueCritico(empresaId);
  }
}