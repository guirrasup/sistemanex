// src/controllers/mdfe.controller.ts

import { Request, Response } from 'express';
import { MdfeService } from '../services/mdfe.service';
import { StatusMDFe } from '@prisma/client';

interface RequestComUsuario extends Request {
  user?: {
    id: string;
    email: string;
    empresaId: string;
    perfil?: string;
  };
}

export class MdfeController {
  private mdfeService: MdfeService;

  constructor() {
    this.mdfeService = new MdfeService();
  }

  /**
   * 📋 LISTAR MDF-e
   * GET /api/mdfe
   */
  async listar(req: RequestComUsuario, res: Response) {
    try {
      const empresaId = req.user?.empresaId;
      if (!empresaId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Empresa não autenticada'
        });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const filtros: any = {};
      if (req.query.status) {
        const statusList = (req.query.status as string).split(',');
        filtros.status = statusList.length === 1 ? statusList[0] : statusList;
      }
      if (req.query.dataInicio) filtros.dataInicio = new Date(req.query.dataInicio as string);
      if (req.query.dataFim) filtros.dataFim = new Date(req.query.dataFim as string);
      if (req.query.modal) filtros.modal = req.query.modal as string;
      if (req.query.numero) filtros.numero = parseInt(req.query.numero as string);
      if (req.query.serie) filtros.serie = parseInt(req.query.serie as string);
      if (req.query.chave) filtros.chave = req.query.chave as string;

      const result = await this.mdfeService.listarMdfes(
        empresaId,
        page,
        limit,
        filtros
      );

      return res.json({
        sucesso: true,
        dados: result
      });

    } catch (error: any) {
      console.error('❌ Erro ao listar MDF-e:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao listar MDF-e'
      });
    }
  }

  /**
   * 🔍 BUSCAR MDF-e POR ID
   * GET /api/mdfe/:id
   */
  async buscarPorId(req: RequestComUsuario, res: Response) {
    try {
      const empresaId = req.user?.empresaId;
      const { id } = req.params;

      if (!empresaId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Empresa não autenticada'
        });
      }

      const mdfe = await this.mdfeService.buscarPorId(id);

      if (!mdfe) {
        return res.status(404).json({
          sucesso: false,
          erro: 'MDF-e não encontrado'
        });
      }

      if (mdfe.empresaId !== empresaId) {
        return res.status(403).json({
          sucesso: false,
          erro: 'Acesso negado'
        });
      }

      return res.json({
        sucesso: true,
        dados: mdfe
      });

    } catch (error: any) {
      console.error('❌ Erro ao buscar MDF-e:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao buscar MDF-e'
      });
    }
  }

  /**
   * 🔍 BUSCAR MDF-e POR CHAVE
   * GET /api/mdfe/chave/:chave
   */
  async buscarPorChave(req: RequestComUsuario, res: Response) {
    try {
      const empresaId = req.user?.empresaId;
      const { chave } = req.params;

      if (!empresaId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Empresa não autenticada'
        });
      }

      if (!/^[0-9]{44}$/.test(chave)) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Chave de acesso inválida: deve ter 44 dígitos'
        });
      }

      const mdfe = await this.mdfeService.buscarPorChave(chave);

      if (!mdfe) {
        return res.status(404).json({
          sucesso: false,
          erro: 'MDF-e não encontrado'
        });
      }

      if (mdfe.empresaId !== empresaId) {
        return res.status(403).json({
          sucesso: false,
          erro: 'Acesso negado'
        });
      }

      return res.json({
        sucesso: true,
        dados: mdfe
      });

    } catch (error: any) {
      console.error('❌ Erro ao buscar MDF-e por chave:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao buscar MDF-e'
      });
    }
  }

  /**
   * 📝 EMITIR MDF-e
   * POST /api/mdfe/emitir
   */
  async emitir(req: RequestComUsuario, res: Response) {
    try {
      const empresaId = req.user?.empresaId;
      if (!empresaId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Empresa não autenticada'
        });
      }

      // Valida campos obrigatórios
      const requiredFields = [
        'emitenteId', 'modal', 'tpEmit', 'UFIni', 'UFFim',
        'municipiosCarrega', 'municipiosDescarga',
        'tpCarga', 'xProd', 'vCarga', 'qCarga'
      ];

      for (const field of requiredFields) {
        if (!req.body[field]) {
          return res.status(400).json({
            sucesso: false,
            erro: `Campo "${field}" é obrigatório`
          });
        }
      }

      const mdfe = await this.mdfeService.emitirMdfe({
        empresaId,
        usuario: req.user?.email || 'SISTEMA',
        ...req.body
      });

      return res.status(201).json({
        sucesso: true,
        dados: mdfe,
        mensagem: 'MDF-e emitido com sucesso'
      });

    } catch (error: any) {
      console.error('❌ Erro ao emitir MDF-e:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao emitir MDF-e'
      });
    }
  }

  /**
   * ❌ CANCELAR MDF-e
   * POST /api/mdfe/cancelar/:id
   */
  async cancelar(req: RequestComUsuario, res: Response) {
    try {
      const empresaId = req.user?.empresaId;
      const { id } = req.params;
      const { motivo } = req.body;

      if (!empresaId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Empresa não autenticada'
        });
      }

      if (!motivo) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Motivo do cancelamento é obrigatório'
        });
      }

      if (motivo.length < 15) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Motivo deve ter no mínimo 15 caracteres'
        });
      }

      if (motivo.length > 255) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Motivo deve ter no máximo 255 caracteres'
        });
      }

      const result = await this.mdfeService.cancelarMdfe(id, motivo, empresaId);

      return res.json({
        sucesso: true,
        dados: result,
        mensagem: 'MDF-e cancelado com sucesso'
      });

    } catch (error: any) {
      console.error('❌ Erro ao cancelar MDF-e:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao cancelar MDF-e'
      });
    }
  }

  /**
   * 🚩 ENCERRAR MDF-e
   * POST /api/mdfe/encerrar/:id
   */
  async encerrar(req: RequestComUsuario, res: Response) {
    try {
      const empresaId = req.user?.empresaId;
      const { id } = req.params;
      const { protocolo, municipioEncerramento } = req.body;

      if (!empresaId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Empresa não autenticada'
        });
      }

      if (!protocolo) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Protocolo de autorização é obrigatório'
        });
      }

      if (!municipioEncerramento) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Município de encerramento é obrigatório'
        });
      }

      const result = await this.mdfeService.encerrarMdfe(
        id,
        protocolo,
        municipioEncerramento,
        empresaId
      );

      return res.json({
        sucesso: true,
        dados: result,
        mensagem: 'MDF-e encerrado com sucesso'
      });

    } catch (error: any) {
      console.error('❌ Erro ao encerrar MDF-e:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao encerrar MDF-e'
      });
    }
  }

  /**
   * 📊 ESTATÍSTICAS DE MDF-e
   * GET /api/mdfe/estatisticas
   */
  async getEstatisticas(req: RequestComUsuario, res: Response) {
    try {
      const empresaId = req.user?.empresaId;
      if (!empresaId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Empresa não autenticada'
        });
      }

      const estatisticas = await this.mdfeService.getEstatisticas(empresaId);

      return res.json({
        sucesso: true,
        dados: estatisticas
      });

    } catch (error: any) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao buscar estatísticas'
      });
    }
  }

  /**
   * 💰 TOTAL DE CARGA TRANSPORTADA
   * GET /api/mdfe/total-carga
   */
  async getTotalCarga(req: RequestComUsuario, res: Response) {
    try {
      const empresaId = req.user?.empresaId;
      if (!empresaId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Empresa não autenticada'
        });
      }

      const dataInicio = req.query.dataInicio ? new Date(req.query.dataInicio as string) : undefined;
      const dataFim = req.query.dataFim ? new Date(req.query.dataFim as string) : undefined;

      const result = await this.mdfeService.getTotalCarga(empresaId, dataInicio, dataFim);

      return res.json({
        sucesso: true,
        dados: result
      });

    } catch (error: any) {
      console.error('❌ Erro ao buscar total de carga:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao buscar total de carga'
      });
    }
  }

  /**
   * 📄 BAIXAR XML DO MDF-e
   * GET /api/mdfe/xml/:id
   */
  async baixarXml(req: RequestComUsuario, res: Response) {
    try {
      const empresaId = req.user?.empresaId;
      const { id } = req.params;

      if (!empresaId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Empresa não autenticada'
        });
      }

      const mdfe = await this.mdfeService.buscarPorId(id);

      if (!mdfe) {
        return res.status(404).json({
          sucesso: false,
          erro: 'MDF-e não encontrado'
        });
      }

      if (mdfe.empresaId !== empresaId) {
        return res.status(403).json({
          sucesso: false,
          erro: 'Acesso negado'
        });
      }

      if (!mdfe.xmlAssinado) {
        return res.status(404).json({
          sucesso: false,
          erro: 'XML do MDF-e não disponível'
        });
      }

      res.setHeader('Content-Type', 'application/xml');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=MDFe_${mdfe.numero}_${mdfe.chaveAcesso}.xml`
      );

      return res.send(mdfe.xmlAssinado);

    } catch (error: any) {
      console.error('❌ Erro ao baixar XML:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao baixar XML'
      });
    }
  }
}