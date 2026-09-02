// src/controllers/nfae.controller.ts

import { Request, Response } from 'express';
import { NFAeService } from '../services/nfae.service';

export class NFAeController {
  private service: NFAeService;

  constructor() {
    this.service = new NFAeService();
  }

  /**
   * 📋 LISTAR NFA-e
   */
  async listar(req: Request, res: Response) {
    try {
      const { empresaId } = req.params;
      const { page, limit, ...filtros } = req.query;
      
      const result = await this.service.listar(
        empresaId,
        page ? Number(page) : 1,
        limit ? Number(limit) : 50,
        filtros
      );
      
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * 📊 ESTATÍSTICAS
   */
  async getEstatisticas(req: Request, res: Response) {
    try {
      const { empresaId } = req.params;
      const stats = await this.service.getEstatisticas(empresaId);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * 📊 TOTAL POR PERÍODO
   */
  async getTotalPeriodo(req: Request, res: Response) {
    try {
      const { empresaId } = req.params;
      const { dataInicio, dataFim } = req.query;
      
      const result = await this.service.getTotalPeriodo(
        empresaId,
        dataInicio ? new Date(dataInicio as string) : undefined,
        dataFim ? new Date(dataFim as string) : undefined
      );
      
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * 📊 RESUMO MENSAL
   */
  async getResumoMensal(req: Request, res: Response) {
    try {
      const { empresaId } = req.params;
      const { ano, mes } = req.query;
      
      const result = await this.service.getResumoMensal(
        empresaId,
        ano ? Number(ano) : new Date().getFullYear(),
        mes ? Number(mes) : new Date().getMonth() + 1
      );
      
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * 🔍 BUSCAR POR CHAVE
   */
  async buscarPorChave(req: Request, res: Response) {
    try {
      const { chave } = req.params;
      const nfae = await this.service.buscarPorChave(chave);
      
      if (!nfae) {
        return res.status(404).json({ error: 'NFA-e não encontrada' });
      }
      
      res.json(nfae);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * 🔍 BUSCAR POR DESTINATÁRIO
   */
  async findByDestinatario(req: Request, res: Response) {
    try {
      const { destinatarioId } = req.params;
      const { empresaId } = req.query;
      
      const nfae = await this.service.findByDestinatario(
        destinatarioId,
        empresaId as string
      );
      
      res.json(nfae);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * 🔍 BUSCAR POR ID
   */
  async buscarPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const nfae = await this.service.buscarPorId(id);
      
      if (!nfae) {
        return res.status(404).json({ error: 'NFA-e não encontrada' });
      }
      
      res.json(nfae);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * 📝 EMITIR NFA-e
   */
  async emitir(req: Request, res: Response) {
    try {
      const data = req.body;
      const nfae = await this.service.emitir(data);
      res.status(201).json(nfae);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * ❌ CANCELAR NFA-e
   */
  async cancelar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { motivo, empresaId } = req.body;
      
      const nfae = await this.service.cancelar(id, motivo, empresaId);
      res.json(nfae);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * 🗑️ EXCLUIR NFA-e (apenas rascunho)
   */
  async excluir(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { empresaId } = req.body;
      
      await this.service.excluir(id, empresaId);
      res.json({ message: 'NFA-e excluída com sucesso' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * 📄 BAIXAR XML
   */
  async baixarXml(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { empresaId } = req.query;
      
      const xml = await this.service.baixarXml(id, empresaId as string);
      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Content-Disposition', `attachment; filename="NFAe-${id}.xml"`);
      res.send(xml);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}