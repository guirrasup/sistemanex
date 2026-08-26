// C:\emissornfe\backend\src\controllers\cliente.controller.ts

import { Request, Response } from 'express';
import { ClienteService } from '../services/cliente.service';

export class ClienteController {
  private clienteService: ClienteService;

  constructor() {
    this.clienteService = new ClienteService();
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

      const dados = await this.clienteService.listar(empresaId, page, limit, busca);
      return res.json({ sucesso: true, dados });
    } catch (error: any) {
      console.error('❌ Erro ao listar clientes:', error);
      return res.status(500).json({ sucesso: false, erro: error.message });
    }
  }

  async buscarPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const dados = await this.clienteService.buscarPorId(id);
      
      if (!dados) {
        return res.status(404).json({ sucesso: false, erro: 'Cliente não encontrado' });
      }
      
      return res.json({ sucesso: true, dados });
    } catch (error: any) {
      return res.status(500).json({ sucesso: false, erro: error.message });
    }
  }

  async buscarPorDocumento(req: Request, res: Response) {
    try {
      const { documento } = req.params;
      const dados = await this.clienteService.buscarPorDocumento(documento);
      
      if (!dados) {
        return res.status(404).json({ sucesso: false, erro: 'Cliente não encontrado' });
      }
      
      return res.json({ sucesso: true, dados });
    } catch (error: any) {
      return res.status(500).json({ sucesso: false, erro: error.message });
    }
  }

  async buscarPorTipo(req: Request, res: Response) {
    try {
      const { tipo } = req.params;
      const empresaId = req.user?.empresaId;

      if (!empresaId) {
        return res.status(401).json({ sucesso: false, erro: 'Empresa não autenticada' });
      }

      const dados = await this.clienteService.buscarPorTipo(empresaId, tipo);
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

      const dados = await this.clienteService.criar({
        ...req.body,
        empresaId,
      });
      
      return res.status(201).json({ sucesso: true, dados });
    } catch (error: any) {
      console.error('❌ Erro ao criar cliente:', error);
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

      const dados = await this.clienteService.atualizar(id, req.body, empresaId);
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

      await this.clienteService.excluir(id, empresaId);
      return res.json({ sucesso: true, mensagem: 'Cliente excluído com sucesso' });
    } catch (error: any) {
      return res.status(400).json({ sucesso: false, erro: error.message });
    }
  }
}