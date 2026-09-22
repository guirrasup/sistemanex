// backend/src/controllers/nfae.controller.ts
import { Request, Response } from 'express';
import { NFAeService } from '../services/nfae.service.js';

interface RequestComUsuario extends Request {
  user?: {
    id: string;
    email: string;
    empresaId: string;
    perfil?: string;
  };
}

export class NFAeController {
  private service: NFAeService;

  constructor() {
    this.service = new NFAeService();
  }

  private validarAcesso(req: RequestComUsuario): { empresaId: string } | null {
    const empresaId = req.user?.empresaId;
    if (!empresaId) {
      return null;
    }
    return { empresaId };
  }

  async listar(req: RequestComUsuario, res: Response) {
    try {
      const acesso = this.validarAcesso(req);
      if (!acesso) {
        return res.status(401).json({ sucesso: false, erro: 'Empresa não autenticada' });
      }

      const { page, limit, ...filtros } = req.query;
      const result = await this.service.listar(
        acesso.empresaId,
        page ? Number(page) : 1,
        limit ? Number(limit) : 50,
        filtros
      );

      res.json(result);
    } catch (error: unknown) {
      res.status(500).json({ sucesso: false, erro: error instanceof Error ? error.message : 'Erro desconhecido' });
    }
  }

  async getEstatisticas(req: RequestComUsuario, res: Response) {
    try {
      const acesso = this.validarAcesso(req);
      if (!acesso) {
        return res.status(401).json({ sucesso: false, erro: 'Empresa não autenticada' });
      }

      const stats = await this.service.getEstatisticas(acesso.empresaId);
      res.json(stats);
    } catch (error: unknown) {
      res.status(500).json({ sucesso: false, erro: error instanceof Error ? error.message : 'Erro desconhecido' });
    }
  }

  async getTotalPeriodo(req: RequestComUsuario, res: Response) {
    try {
      const acesso = this.validarAcesso(req);
      if (!acesso) {
        return res.status(401).json({ sucesso: false, erro: 'Empresa não autenticada' });
      }

      const { dataInicio, dataFim } = req.query;
      const result = await this.service.getTotalPeriodo(
        acesso.empresaId,
        dataInicio ? new Date(dataInicio as string) : undefined,
        dataFim ? new Date(dataFim as string) : undefined
      );

      res.json(result);
    } catch (error: unknown) {
      res.status(500).json({ sucesso: false, erro: error instanceof Error ? error.message : 'Erro desconhecido' });
    }
  }

  async getResumoMensal(req: RequestComUsuario, res: Response) {
    try {
      const acesso = this.validarAcesso(req);
      if (!acesso) {
        return res.status(401).json({ sucesso: false, erro: 'Empresa não autenticada' });
      }

      const { ano, mes } = req.query;
      const result = await this.service.getResumoMensal(
        acesso.empresaId,
        ano ? Number(ano) : new Date().getFullYear(),
        mes ? Number(mes) : new Date().getMonth() + 1
      );

      res.json(result);
    } catch (error: unknown) {
      res.status(500).json({ sucesso: false, erro: error instanceof Error ? error.message : 'Erro desconhecido' });
    }
  }

  async buscarPorChave(req: RequestComUsuario, res: Response) {
    try {
      const acesso = this.validarAcesso(req);
      if (!acesso) {
        return res.status(401).json({ sucesso: false, erro: 'Empresa não autenticada' });
      }

      const { chave } = req.params;
      const nfae = await this.service.buscarPorChave(chave, acesso.empresaId);

      if (!nfae) {
        return res.status(404).json({ sucesso: false, erro: 'NFA-e não encontrada' });
      }

      res.json(nfae);
    } catch (error: unknown) {
      res.status(500).json({ sucesso: false, erro: error instanceof Error ? error.message : 'Erro desconhecido' });
    }
  }

  async findByDestinatario(req: RequestComUsuario, res: Response) {
    try {
      const acesso = this.validarAcesso(req);
      if (!acesso) {
        return res.status(401).json({ sucesso: false, erro: 'Empresa não autenticada' });
      }

      const { destinatarioId } = req.params;
      const nfae = await this.service.findByDestinatario(
        destinatarioId,
        acesso.empresaId
      );

      res.json(nfae);
    } catch (error: unknown) {
      res.status(500).json({ sucesso: false, erro: error instanceof Error ? error.message : 'Erro desconhecido' });
    }
  }

  async buscarPorId(req: RequestComUsuario, res: Response) {
    try {
      const acesso = this.validarAcesso(req);
      if (!acesso) {
        return res.status(401).json({ sucesso: false, erro: 'Empresa não autenticada' });
      }

      const { id } = req.params;
      const nfae = await this.service.buscarPorId(id, acesso.empresaId);

      if (!nfae) {
        return res.status(404).json({ sucesso: false, erro: 'NFA-e não encontrada' });
      }

      res.json(nfae);
    } catch (error: unknown) {
      res.status(500).json({ sucesso: false, erro: error instanceof Error ? error.message : 'Erro desconhecido' });
    }
  }

  async emitir(req: RequestComUsuario, res: Response) {
    try {
      const acesso = this.validarAcesso(req);
      if (!acesso) {
        return res.status(401).json({ sucesso: false, erro: 'Empresa não autenticada' });
      }

      const data = { ...req.body, empresaId: acesso.empresaId };
      const nfae = await this.service.emitir(data);
      res.status(201).json(nfae);
    } catch (error: unknown) {
      res.status(500).json({ sucesso: false, erro: error instanceof Error ? error.message : 'Erro desconhecido' });
    }
  }

  async cancelar(req: RequestComUsuario, res: Response) {
    try {
      const acesso = this.validarAcesso(req);
      if (!acesso) {
        return res.status(401).json({ sucesso: false, erro: 'Empresa não autenticada' });
      }

      const { id } = req.params;
      const { motivo } = req.body;

      if (!motivo || motivo.length < 15) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Motivo é obrigatório e deve ter no mínimo 15 caracteres'
        });
      }

      const nfae = await this.service.cancelar(id, motivo, acesso.empresaId);
      res.json(nfae);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : '';
      if (msg === 'NFA-e não encontrada' || msg === 'Acesso negado') {
        return res.status(404).json({ sucesso: false, erro: 'NFA-e não encontrada' });
      }
      if (
        msg === 'NFA-e já está cancelada' ||
        msg === 'Apenas NFA-e autorizadas podem ser canceladas'
      ) {
        return res.status(400).json({ sucesso: false, erro: msg });
      }
      res.status(500).json({ sucesso: false, erro: error instanceof Error ? error.message : 'Erro desconhecido' });
    }
  }

  async excluir(req: RequestComUsuario, res: Response) {
    try {
      const acesso = this.validarAcesso(req);
      if (!acesso) {
        return res.status(401).json({ sucesso: false, erro: 'Empresa não autenticada' });
      }

      const { id } = req.params;
      await this.service.excluir(id, acesso.empresaId);
      res.json({ sucesso: true, message: 'NFA-e excluída com sucesso' });
    } catch (error: unknown) {
      res.status(500).json({ sucesso: false, erro: error instanceof Error ? error.message : 'Erro desconhecido' });
    }
  }

  async baixarXml(req: RequestComUsuario, res: Response) {
    try {
      const acesso = this.validarAcesso(req);
      if (!acesso) {
        return res.status(401).json({ sucesso: false, erro: 'Empresa não autenticada' });
      }

      const { id } = req.params;
      const xml = await this.service.baixarXml(id, acesso.empresaId);
      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Content-Disposition', `attachment; filename="NFAe-${id}.xml"`);
      res.send(xml);
    } catch (error: unknown) {
      res.status(500).json({ sucesso: false, erro: error instanceof Error ? error.message : 'Erro desconhecido' });
    }
  }
}
