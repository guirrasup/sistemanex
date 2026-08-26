// src/controllers/nfae.controller.ts
import { Request, Response } from 'express';
import { NfaeService } from '../services/nfae.service';

export class NfaeController {
  private nfaeService: NfaeService;

  constructor() {
    this.nfaeService = new NfaeService();
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

      const dados = await this.nfaeService.listarNfaes(empresaId, page, limit);

      return res.json({ sucesso: true, dados });
    } catch (error: any) {
      console.error('❌ Erro no NFA-e listar:', error);
      return res.status(500).json({
        sucesso: false,
        erro: error.message || 'Erro ao listar NFA-e',
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

      const dados = await this.nfaeService.emitirNfae({
        empresaId,
        ...req.body,
      });

      return res.status(201).json({ sucesso: true, dados });
    } catch (error: any) {
      console.error('❌ Erro no NFA-e emitir:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao emitir NFA-e',
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

      const dados = await this.nfaeService.cancelarNfae(id, motivo, empresaId);

      return res.json({ sucesso: true, dados });
    } catch (error: any) {
      console.error('❌ Erro no NFA-e cancelar:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao cancelar NFA-e',
      });
    }
  }
}