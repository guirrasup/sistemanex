// backend/src/controllers/cfop.controller.ts
import { Request, Response } from 'express';
import { CfopService } from '../services/cfop.service.js';

export class CfopController {
  private cfopService: CfopService;

  constructor() {
    this.cfopService = new CfopService();
  }

  async listar(req: Request, res: Response) {
    try {
      const busca = req.query.busca as string | undefined;
      const dados = await this.cfopService.listar(busca);
      return res.json({ sucesso: true, dados });
    } catch (error: unknown) {
      return res.status(500).json({ sucesso: false, erro: error instanceof Error ? error.message : 'Erro desconhecido' });
    }
  }
}
