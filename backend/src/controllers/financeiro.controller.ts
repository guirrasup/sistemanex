// C:\emissornfe\backend\src\controllers\financeiro.controller.ts

import { Request, Response } from 'express';
import { FinanceiroService } from '../services/financeiro.service';

export class FinanceiroController {
  private financeiroService: FinanceiroService;

  constructor() {
    this.financeiroService = new FinanceiroService();
  }

  async listarTitulos(req: Request, res: Response) {
    try {
      const empresaId = req.user?.empresaId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      if (!empresaId) {
        return res.status(401).json({ sucesso: false, erro: 'Empresa não autenticada' });
      }

      const result = await this.financeiroService.listarTitulos(empresaId, page, limit);
      return res.json({ sucesso: true, dados: result });
    } catch (error: any) {
      return res.status(500).json({ sucesso: false, erro: error.message });
    }
  }

  async listarPendentes(req: Request, res: Response) {
    try {
      const empresaId = req.user?.empresaId;

      if (!empresaId) {
        return res.status(401).json({ sucesso: false, erro: 'Empresa não autenticada' });
      }

      const result = await this.financeiroService.listarPendentes(empresaId);
      return res.json({ sucesso: true, dados: result });
    } catch (error: any) {
      return res.status(500).json({ sucesso: false, erro: error.message });
    }
  }

  async baixarTitulo(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const empresaId = req.user?.empresaId;

      if (!empresaId) {
        return res.status(401).json({ sucesso: false, erro: 'Empresa não autenticada' });
      }

      const result = await this.financeiroService.baixarTitulo(id, empresaId);
      return res.json({ sucesso: true, dados: result });
    } catch (error: any) {
      return res.status(400).json({ sucesso: false, erro: error.message });
    }
  }

  async resumo(req: Request, res: Response) {
    try {
      const empresaId = req.user?.empresaId;

      if (!empresaId) {
        return res.status(401).json({ sucesso: false, erro: 'Empresa não autenticada' });
      }

      const result = await this.financeiroService.resumo(empresaId);
      return res.json({ sucesso: true, dados: result });
    } catch (error: any) {
      return res.status(500).json({ sucesso: false, erro: error.message });
    }
  }
}