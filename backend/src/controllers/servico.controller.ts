// C:\emissornfe\backend\src\controllers\servico.controller.ts

import { Request, Response } from 'express';
import { ServicoService } from '../services/servico.service';

export class ServicoController {
  private servicoService: ServicoService;

  constructor() {
    this.servicoService = new ServicoService();
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

      const dados = await this.servicoService.listar(empresaId, page, limit, busca);
      return res.json({ sucesso: true, dados });
    } catch (error: any) {
      return res.status(500).json({ sucesso: false, erro: error.message });
    }
  }

  async buscarPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const dados = await this.servicoService.buscarPorId(id);
      
      if (!dados) {
        return res.status(404).json({ sucesso: false, erro: 'Serviço não encontrado' });
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

      const dados = await this.servicoService.criar({
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

      const dados = await this.servicoService.atualizar(id, req.body, empresaId);
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

      await this.servicoService.excluir(id, empresaId);
      return res.json({ sucesso: true, mensagem: 'Serviço excluído com sucesso' });
    } catch (error: any) {
      return res.status(400).json({ sucesso: false, erro: error.message });
    }
  }
}