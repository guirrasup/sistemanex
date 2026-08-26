// src/controllers/nfse.controller.ts
import { Request, Response } from 'express';
import { NfseService } from '../services/nfse.service';

export class NfseController {
  private nfseService: NfseService;

  constructor() {
    this.nfseService = new NfseService();
  }

  async emitir(req: Request, res: Response) {
    try {
      const empresaId = req.user?.empresaId;
      if (!empresaId) {
        return res.status(401).json({ sucesso: false, erro: 'Empresa não autenticada' });
      }

      const result = await this.nfseService.emitirNfse({
        empresaId,
        ...req.body,
      });

      return res.status(201).json({
        sucesso: true,
        dados: result,
      });
    } catch (error: any) {
      return res.status(400).json({
        sucesso: false,
        erro: error.message,
      });
    }
  }

  async cancelar(req: Request, res: Response) {
    try {
      const empresaId = req.user?.empresaId;
      const { id } = req.params;
      const { motivo } = req.body;

      if (!empresaId) {
        return res.status(401).json({ sucesso: false, erro: 'Empresa não autenticada' });
      }

      if (!motivo) {
        return res.status(400).json({ sucesso: false, erro: 'Motivo do cancelamento é obrigatório' });
      }

      const result = await this.nfseService.cancelarNfse(id, motivo, empresaId);

      return res.json({
        sucesso: true,
        dados: result,
      });
    } catch (error: any) {
      return res.status(400).json({
        sucesso: false,
        erro: error.message,
      });
    }
  }

  async listar(req: Request, res: Response) {
    try {
      const empresaId = req.user?.empresaId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      if (!empresaId) {
        return res.status(401).json({ sucesso: false, erro: 'Empresa não autenticada' });
      }

      const result = await this.nfseService.listarNfses(empresaId, page, limit);

      // Envelope padronizado
      return res.json({
        sucesso: true,
        dados: result,
      });
    } catch (error: any) {
      return res.status(400).json({
        sucesso: false,
        erro: error.message,
      });
    }
  }

  async buscarPorChave(req: Request, res: Response) {
    try {
      const { chave } = req.params;

      const nfse = await this.nfseService.buscarPorChave(chave);

      if (!nfse) {
        return res.status(404).json({ sucesso: false, erro: 'NFS-e não encontrada' });
      }

      return res.json({ sucesso: true, dados: nfse });
    } catch (error: any) {
      return res.status(400).json({
        sucesso: false,
        erro: error.message,
      });
    }
  }
}