// backend/src/services/estoque.service.ts
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
    const produto = await this.produtoRepo.findById(params.produtoId, params.empresaId);
    if (!produto) throw new Error('Produto não encontrado');

    const estoqueAnterior = Number(produto.estoqueAtual);
    if (estoqueAnterior < params.quantidade) {
      throw new Error(`Estoque insuficiente. Disponível: ${estoqueAnterior} ${produto.unidade}`);
    }

    const novoEstoque = estoqueAnterior - params.quantidade;

    await this.produtoRepo.update(params.produtoId, params.empresaId, {
      estoqueAtual: novoEstoque
    });

    // Registra movimentação (opcional - pode ser implementado com uma tabela de movimentações)

    return {
      produto: produto.descricao,
      quantidade: params.quantidade,
      estoqueAnterior,
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
    const produto = await this.produtoRepo.findById(params.produtoId, params.empresaId);
    if (!produto) throw new Error('Produto não encontrado');

    const estoqueAnterior = Number(produto.estoqueAtual);
    const novoEstoque = estoqueAnterior + params.quantidade;

    await this.produtoRepo.update(params.produtoId, params.empresaId, {
      estoqueAtual: novoEstoque
    });

    return {
      produto: produto.descricao,
      quantidade: params.quantidade,
      estoqueAnterior,
      estoqueAtual: novoEstoque,
      documentoReferencia: params.documentoReferencia
    };
  }

  async verificarDisponibilidade(produtoId: string, empresaId: string, quantidade: number): Promise<boolean> {
    const produto = await this.produtoRepo.findById(produtoId, empresaId);
    if (!produto) return false;
    return Number(produto.estoqueAtual) >= quantidade;
  }

  async getEstoqueCritico(empresaId: string) {
    return this.produtoRepo.findEstoqueCritico(empresaId);
  }
}