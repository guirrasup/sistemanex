// C:\emissornfe\backend\src\controllers\produto.controller.ts

import { Request, Response } from 'express';
import { ProdutoService } from '../services/produto.service';

export class ProdutoController {
  private produtoService: ProdutoService;

  constructor() {
    this.produtoService = new ProdutoService();
  }

  async listar(req: Request, res: Response) {
    try {
      const empresaId = req.user?.empresaId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const busca = req.query.busca as string || '';

      if (!empresaId) {
        return res.status(401).json({ sucesso: false, erro: 'Empresa não autenticada' });
      }

      const dados = await this.produtoService.listar(empresaId, page, limit, busca);
      return res.json({ sucesso: true, dados });
    } catch (error: any) {
      return res.status(500).json({ sucesso: false, erro: error.message });
    }
  }

  async buscarPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const dados = await this.produtoService.buscarPorId(id);
      
      if (!dados) {
        return res.status(404).json({ sucesso: false, erro: 'Produto não encontrado' });
      }
      
      return res.json({ sucesso: true, dados });
    } catch (error: any) {
      return res.status(500).json({ sucesso: false, erro: error.message });
    }
  }

  async criar(req: Request, res: Response) {
    try {
      const empresaId = req.user?.empresaId;
      
      if (!empresaId) {
        return res.status(401).json({ sucesso: false, erro: 'Empresa não autenticada' });
      }

      const dados = await this.produtoService.criar({
        ...req.body,
        empresaId,
      });
      
      return res.status(201).json({ sucesso: true, dados });
    } catch (error: any) {
      return res.status(400).json({ sucesso: false, erro: error.message });
    }
  }

  async atualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const empresaId = req.user?.empresaId;

      if (!empresaId) {
        return res.status(401).json({ sucesso: false, erro: 'Empresa não autenticada' });
      }

      const dados = await this.produtoService.atualizar(id, req.body, empresaId);
      return res.json({ sucesso: true, dados });
    } catch (error: any) {
      return res.status(400).json({ sucesso: false, erro: error.message });
    }
  }

  async excluir(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const empresaId = req.user?.empresaId;

      if (!empresaId) {
        return res.status(401).json({ sucesso: false, erro: 'Empresa não autenticada' });
      }

      await this.produtoService.excluir(id, empresaId);
      return res.json({ sucesso: true, mensagem: 'Produto excluído com sucesso' });
    } catch (error: any) {
      return res.status(400).json({ sucesso: false, erro: error.message });
    }
  }

async buscarEstoqueCritico(req: Request, res: Response) {
  try {
    const empresaId = req.user?.empresaId;
    if (!empresaId) {
      return res.status(401).json({ sucesso: false, erro: 'Empresa não autenticada' });
    }
    const dados = await this.produtoService.buscarEstoqueCritico(empresaId);
    return res.json({ sucesso: true, dados });
  } catch (error: any) {
    return res.status(500).json({ sucesso: false, erro: error.message });
  }
}
}