// src/controllers/cte.controller.ts
import { Request, Response } from 'express';
import { CteService } from '../services/cte.service';

export class CteController {
  private cteService: CteService;

  constructor() {
    this.cteService = new CteService();
  }

  async listar(req: Request, res: Response) {
    try {
      const empresaId = req.user?.empresaId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      if (!empresaId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Empresa não autenticada',
        });
      }

      const dados = await this.cteService.listarCtes(empresaId, page, limit);

      return res.json({ sucesso: true, dados });
    } catch (error: any) {
      console.error('❌ Erro no CT-e listar:', error);
      return res.status(500).json({
        sucesso: false,
        erro: error.message || 'Erro ao listar CT-e',
      });
    }
  }

  async emitir(req: Request, res: Response) {
    try {
      const empresaId = req.user?.empresaId;

      if (!empresaId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Empresa não autenticada',
        });
      }

      const dados = await this.cteService.emitirCte({
        empresaId,
        ...req.body,
      });

      return res.status(201).json({ sucesso: true, dados });
    } catch (error: any) {
      console.error('❌ Erro no CT-e emitir:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao emitir CT-e',
      });
    }
  }

  async cancelar(req: Request, res: Response) {
    try {
      const empresaId = req.user?.empresaId;
      const { id } = req.params;
      const { motivo } = req.body;

      if (!empresaId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Empresa não autenticada',
        });
      }

      if (!motivo) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Motivo do cancelamento é obrigatório',
        });
      }

      const dados = await this.cteService.cancelarCte(id, motivo, empresaId);

      return res.json({ sucesso: true, dados });
    } catch (error: any) {
      console.error('❌ Erro no CT-e cancelar:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao cancelar CT-e',
      });
    }
  }
}