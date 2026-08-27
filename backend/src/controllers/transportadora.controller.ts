// backend/src/controllers/transportadora.controller.ts
// ✅ VERSÃO COMPLETA CORRIGIDA

import { Request, Response } from 'express';
import { TransportadoraService } from '../services/transportadora.service';

export class TransportadoraController {
  private transportadoraService: TransportadoraService;

  constructor() {
    this.transportadoraService = new TransportadoraService();
  }

  async listar(req: Request, res: Response) {
    try {
      const empresaId = req.user?.empresaId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const busca = req.query.busca as string || '';

      if (!empresaId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Empresa não autenticada'
        });
      }

      const dados = await this.transportadoraService.listar(
        empresaId,
        page,
        limit,
        busca
      );

      return res.json({ sucesso: true, dados });
    } catch (error: any) {
      console.error('❌ Erro ao listar transportadoras:', error);
      return res.status(500).json({
        sucesso: false,
        erro: error.message || 'Erro ao listar transportadoras'
      });
    }
  }

  async buscarPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const empresaId = req.user?.empresaId;

      if (!empresaId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Empresa não autenticada'
        });
      }

      const dados = await this.transportadoraService.buscarPorId(id, empresaId);

      if (!dados) {
        return res.status(404).json({
          sucesso: false,
          erro: 'Transportadora não encontrada'
        });
      }

      return res.json({ sucesso: true, dados });
    } catch (error: any) {
      return res.status(500).json({
        sucesso: false,
        erro: error.message || 'Erro ao buscar transportadora'
      });
    }
  }

  async buscarPorCnpj(req: Request, res: Response) {
    try {
      const { cnpj } = req.params;
      const empresaId = req.user?.empresaId;

      if (!empresaId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Empresa não autenticada'
        });
      }

      const dados = await this.transportadoraService.buscarPorCnpj(cnpj, empresaId);

      if (!dados) {
        return res.status(404).json({
          sucesso: false,
          erro: 'Transportadora não encontrada'
        });
      }

      return res.json({ sucesso: true, dados });
    } catch (error: any) {
      return res.status(500).json({
        sucesso: false,
        erro: error.message || 'Erro ao buscar transportadora por CNPJ'
      });
    }
  }

  async buscarAtivos(req: Request, res: Response) {
    try {
      const empresaId = req.user?.empresaId;

      if (!empresaId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Empresa não autenticada'
        });
      }

      const dados = await this.transportadoraService.buscarAtivos(empresaId);
      return res.json({ sucesso: true, dados });
    } catch (error: any) {
      return res.status(500).json({
        sucesso: false,
        erro: error.message || 'Erro ao buscar transportadoras ativas'
      });
    }
  }

  async buscarPorTipo(req: Request, res: Response) {
    try {
      const { tipo } = req.params;
      const empresaId = req.user?.empresaId;

      if (!empresaId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Empresa não autenticada'
        });
      }

      const dados = await this.transportadoraService.buscarPorTipo(empresaId, tipo);
      return res.json({ sucesso: true, dados });
    } catch (error: any) {
      return res.status(500).json({
        sucesso: false,
        erro: error.message || 'Erro ao buscar transportadoras por tipo'
      });
    }
  }

  async criar(req: Request, res: Response) {
    try {
      const empresaId = req.user?.empresaId;

      if (!empresaId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Empresa não autenticada'
        });
      }

      const dados = await this.transportadoraService.criar({
        ...req.body,
        empresaId
      });

      return res.status(201).json({
        sucesso: true,
        dados,
        mensagem: 'Transportadora criada com sucesso'
      });
    } catch (error: any) {
      console.error('❌ Erro ao criar transportadora:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao criar transportadora'
      });
    }
  }

  async atualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const empresaId = req.user?.empresaId;

      if (!empresaId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Empresa não autenticada'
        });
      }

      const dados = await this.transportadoraService.atualizar(id, req.body, empresaId);

      return res.json({
        sucesso: true,
        dados,
        mensagem: 'Transportadora atualizada com sucesso'
      });
    } catch (error: any) {
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao atualizar transportadora'
      });
    }
  }

  async excluir(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const empresaId = req.user?.empresaId;

      if (!empresaId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Empresa não autenticada'
        });
      }

      if (!id) {
        return res.status(400).json({
          sucesso: false,
          erro: 'ID da transportadora não informado'
        });
      }

      // 🔥 DELEGA PARA O SERVICE (NÃO USA REPO DIRETAMENTE)
      await this.transportadoraService.excluir(id, empresaId);

      return res.json({
        sucesso: true,
        mensagem: 'Transportadora excluída com sucesso'
      });

    } catch (error: any) {
      console.error('❌ Erro ao excluir transportadora:', error);

      if (error.message.includes('não encontrada')) {
        return res.status(404).json({
          sucesso: false,
          erro: error.message
        });
      }

      if (error.message.includes('vínculo') || error.message.includes('CT-e')) {
        return res.status(409).json({
          sucesso: false,
          erro: error.message
        });
      }

      return res.status(500).json({
        sucesso: false,
        erro: error.message || 'Erro interno ao excluir transportadora'
      });
    }
  }
}