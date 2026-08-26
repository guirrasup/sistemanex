// src/controllers/nfce.controller.ts
import { Request, Response } from 'express';
import { NfceService } from '../services/nfce.service';

export class NfceController {
  private nfceService: NfceService;

  constructor() {
    this.nfceService = new NfceService();
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

      const dados = await this.nfceService.listarNfces(empresaId, page, limit);

      return res.json({ sucesso: true, dados });
    } catch (error: any) {
      console.error('❌ Erro no NFC-e listar:', error);
      return res.status(500).json({
        sucesso: false,
        erro: error.message || 'Erro ao listar NFC-e',
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

      const dados = await this.nfceService.emitirNfce({
        empresaId,
        ...req.body,
      });

      return res.status(201).json({ sucesso: true, dados });
    } catch (error: any) {
      console.error('❌ Erro no NFC-e emitir:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao emitir NFC-e',
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

      const dados = await this.nfceService.cancelarNfce(id, motivo, empresaId);

      return res.json({ sucesso: true, dados });
    } catch (error: any) {
      console.error('❌ Erro no NFC-e cancelar:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao cancelar NFC-e',
      });
    }
  }
}