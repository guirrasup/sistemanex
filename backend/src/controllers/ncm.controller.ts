// backend/src/controllers/ncm.controller.ts
import { Request, Response } from 'express';
import { NcmService } from '../services/ncm.service.js';

export class NcmController {
  private ncmService: NcmService;

  constructor() {
    this.ncmService = new NcmService();
  }

  async buscar(req: Request, res: Response) {
    try {
      const busca = (req.query.busca as string) || '';
      const dados = await this.ncmService.buscar(busca);
      return res.json({ sucesso: true, dados });
    } catch (error: unknown) {
      return res.status(500).json({ sucesso: false, erro: error instanceof Error ? error.message : 'Erro desconhecido' });
    }
  }
}
