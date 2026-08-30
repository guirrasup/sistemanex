// C:\sistemanex\backend\src\controllers\produto.controller.ts

import { Request, Response } from 'express';
import { ProdutoService } from '../services/produto.service.js';

const produtoService = new ProdutoService();

export class ProdutoController {
  async listar(req: Request, res: Response) {
    try {
      const { page = 1, limit = 20, busca = '' } = req.query;
      const empresaId = req.user?.empresaId;

      if (!empresaId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Empresa não autenticada'
        });
      }

      // 🔥 CHAMA O SERVICE E PEGA O RESULTADO
      const result = await produtoService.listar(
        empresaId,
        Number(page),
        Number(limit),
        busca as string
      );

      // 🔥 EXTRAI OS DADOS CORRETAMENTE
      // O service já retorna { data, total, page, limit, totalPages }
      const data = result?.data || [];
      const total = result?.total || 0;

      console.log(`✅ Produtos encontrados: ${data.length} de ${total}`);

      // 🔥 RETORNA NO FORMATO QUE O FRONTEND ESPERA
      return res.json({
        sucesso: true,
        dados: {
          data: data,
          total: total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error: any) {
      console.error('❌ Erro ao listar produtos:', error);
      return res.status(500).json({
        sucesso: false,
        erro: error.message || 'Erro ao listar produtos'
      });
    }
  }

  async buscarPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const produto = await produtoService.buscarPorId(id);

      if (!produto) {
        return res.status(404).json({
          sucesso: false,
          erro: 'Produto não encontrado'
        });
      }

      return res.json({
        sucesso: true,
        dados: produto
      });
    } catch (error: any) {
      return res.status(500).json({
        sucesso: false,
        erro: error.message || 'Erro ao buscar produto'
      });
    }
  }

  async criar(req: Request, res: Response) {
    try {
      const empresaId = req.user?.empresaId;

      if (!empresaId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Empresa não autenticada'
        });
      }

      const data = { ...req.body, empresaId };
      const produto = await produtoService.criar(data);

      return res.status(201).json({
        sucesso: true,
        dados: produto,
        mensagem: 'Produto criado com sucesso'
      });
    } catch (error: any) {
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao criar produto'
      });
    }
  }

  async atualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const empresaId = req.user?.empresaId;

      if (!empresaId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Empresa não autenticada'
        });
      }

      const produto = await produtoService.atualizar(id, req.body, empresaId);

      return res.json({
        sucesso: true,
        dados: produto,
        mensagem: 'Produto atualizado com sucesso'
      });
    } catch (error: any) {
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao atualizar produto'
      });
    }
  }

  async excluir(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const empresaId = req.user?.empresaId;

      if (!empresaId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Empresa não autenticada'
        });
      }

      await produtoService.excluir(id, empresaId);

      return res.json({
        sucesso: true,
        mensagem: 'Produto excluído com sucesso'
      });
    } catch (error: any) {
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao excluir produto'
      });
    }
  }

  async buscarEstoqueCritico(req: Request, res: Response) {
    try {
      const empresaId = req.user?.empresaId;

      if (!empresaId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Empresa não autenticada'
        });
      }

      const produtos = await produtoService.buscarEstoqueCritico(empresaId);

      return res.json({
        sucesso: true,
        dados: produtos || []
      });
    } catch (error: any) {
      return res.status(500).json({
        sucesso: false,
        erro: error.message || 'Erro ao buscar estoque crítico'
      });
    }
  }
}