// src/controllers/nfse.controller.ts

import { Request, Response } from 'express';
import { NfseService } from '../services/nfse.service';
import { StatusDocumento } from '@prisma/client';

// ============================================================
// INTERFACES
// ============================================================

interface RequestComUsuario extends Request {
  user?: {
    id: string;
    email: string;
    empresaId: string;
    perfil?: string;
  };
}

// ============================================================
// VALIDAÇÕES
// ============================================================

/**
 * ✅ Valida TChNFSe (53 dígitos)
 */
function validarChaveAcesso(chave: string): boolean {
  return /^[0-9]{53}$/.test(chave);
}

/**
 * ✅ Valida TJust (15-255 caracteres)
 */
function validarTJust(texto: string): boolean {
  return texto.length >= 15 && texto.length <= 255;
}

/**
 * ✅ Valida TProt (15 ou 17 dígitos)
 */
function validarProtocolo(protocolo: string): boolean {
  return /^[0-9]{15}$/.test(protocolo) || /^[0-9]{17}$/.test(protocolo);
}

// ============================================================
// CONTROLLER
// ============================================================

export class NfseController {
  private nfseService: NfseService;

  constructor() {
    this.nfseService = new NfseService();
  }

  /**
   * 📋 LISTAR NFS-e COM FILTROS
   * GET /api/nfse
   * 
   * Query params:
   * - page: number (default: 1)
   * - limit: number (default: 50)
   * - status: string (ex: AUTORIZADA,CANCELADA)
   * - dataInicio: string (YYYY-MM-DD)
   * - dataFim: string (YYYY-MM-DD)
   * - tomadorId: string
   * - numeroNfse: number
   * - serieDPS: number
   * - chave: string (TChNFSe - 53 dígitos)
   */
  async listar(req: RequestComUsuario, res: Response) {
    try {
      const empresaId = req.user?.empresaId;
      
      if (!empresaId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Empresa não autenticada',
        });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      // 🔥 PARÂMETROS DE FILTRO
      const status = req.query.status as string;
      const dataInicio = req.query.dataInicio as string;
      const dataFim = req.query.dataFim as string;
      const tomadorId = req.query.tomadorId as string;
      const numeroNfse = req.query.numeroNfse ? parseInt(req.query.numeroNfse as string) : undefined;
      const serieDPS = req.query.serieDPS ? parseInt(req.query.serieDPS as string) : undefined;
      const chave = req.query.chave as string;

      // ✅ VALIDA STATUS (se fornecido)
      let statusEnum: StatusDocumento | StatusDocumento[] | undefined;
      if (status) {
        const statusList = status.split(',');
        if (statusList.length === 1) {
          statusEnum = statusList[0] as StatusDocumento;
        } else {
          statusEnum = statusList as StatusDocumento[];
        }
      }

      // ✅ VALIDA TChNFSe (53 dígitos) - se fornecida
      if (chave && !validarChaveAcesso(chave)) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Chave de acesso inválida: deve ter 53 dígitos (TChNFSe)'
        });
      }

      const result = await this.nfseService.listarNfses(
        empresaId,
        page,
        limit,
        {
          status: statusEnum,
          dataInicio: dataInicio ? new Date(dataInicio) : undefined,
          dataFim: dataFim ? new Date(dataFim) : undefined,
          tomadorId,
          numeroNfse,
          serieDPS,
          chave
        }
      );

      return res.json({
        sucesso: true,
        dados: result,
      });

    } catch (error: any) {
      console.error('❌ Erro no NFS-e listar:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao listar NFS-e',
      });
    }
  }

  /**
   * 🔍 BUSCAR NFS-e POR ID
   * GET /api/nfse/:id
   */
  async buscarPorId(req: RequestComUsuario, res: Response) {
    try {
      const empresaId = req.user?.empresaId;
      const { id } = req.params;

      if (!empresaId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Empresa não autenticada',
        });
      }

      if (!id) {
        return res.status(400).json({
          sucesso: false,
          erro: 'ID da NFS-e é obrigatório'
        });
      }

      const nfse = await this.nfseService.buscarPorId(id);

      if (!nfse) {
        return res.status(404).json({
          sucesso: false,
          erro: 'NFS-e não encontrada'
        });
      }

      if (nfse.empresaId !== empresaId) {
        return res.status(403).json({
          sucesso: false,
          erro: 'Acesso negado'
        });
      }

      return res.json({
        sucesso: true,
        dados: nfse,
      });

    } catch (error: any) {
      console.error('❌ Erro ao buscar NFS-e por ID:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao buscar NFS-e'
      });
    }
  }

  /**
   * 🔍 BUSCAR NFS-e POR CHAVE DE ACESSO (TChNFSe - 53 dígitos)
   * GET /api/nfse/chave/:chave
   */
  async buscarPorChave(req: RequestComUsuario, res: Response) {
    try {
      const empresaId = req.user?.empresaId;
      const { chave } = req.params;

      if (!empresaId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Empresa não autenticada',
        });
      }

      // ✅ VALIDA TChNFSe (53 dígitos)
      if (!validarChaveAcesso(chave)) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Chave de acesso inválida: deve ter 53 dígitos (TChNFSe)'
        });
      }

      const nfse = await this.nfseService.buscarPorChave(chave);

      if (!nfse) {
        return res.status(404).json({
          sucesso: false,
          erro: 'NFS-e não encontrada'
        });
      }

      if (nfse.empresaId !== empresaId) {
        return res.status(403).json({
          sucesso: false,
          erro: 'Acesso negado'
        });
      }

      return res.json({
        sucesso: true,
        dados: nfse,
      });

    } catch (error: any) {
      console.error('❌ Erro ao buscar NFS-e por chave:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao buscar NFS-e'
      });
    }
  }

  /**
   * 🔍 BUSCAR NFS-e POR PROTOCOLO (TProt - 15 ou 17 dígitos)
   * GET /api/nfse/protocolo/:protocolo
   */
  async buscarPorProtocolo(req: RequestComUsuario, res: Response) {
    try {
      const empresaId = req.user?.empresaId;
      const { protocolo } = req.params;

      if (!empresaId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Empresa não autenticada',
        });
      }

      // ✅ VALIDA TProt (15 ou 17 dígitos)
      if (!validarProtocolo(protocolo)) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Protocolo inválido: deve ter 15 ou 17 dígitos (TProt)'
        });
      }

      const nfse = await this.nfseService.buscarPorProtocolo(protocolo);

      if (!nfse) {
        return res.status(404).json({
          sucesso: false,
          erro: 'NFS-e não encontrada'
        });
      }

      if (nfse.empresaId !== empresaId) {
        return res.status(403).json({
          sucesso: false,
          erro: 'Acesso negado'
        });
      }

      return res.json({
        sucesso: true,
        dados: nfse,
      });

    } catch (error: any) {
      console.error('❌ Erro ao buscar NFS-e por protocolo:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao buscar NFS-e'
      });
    }
  }

  /**
   * 📝 EMITIR NFS-e
   * POST /api/nfse/emitir
   * 
   * Body:
   * - tomadorId: string (obrigatório)
   * - servicoId: string (opcional)
   * - servico: {
   *     valorServico: number
   *     descricao: string
   *     aliquotaISS: number
   *     codigoTributacaoNacional: string
   *     codigoTributacaoMunicipal: string
   *     codigoNBS: string
   *     descontoIncondicionado: number
   *     deducoesMateriais: number
   *     tributacaoISSQN: 1|2|3|4
   *     tipoRetencaoISS: 1|2|3
   *     aliquotaPIS: number
   *     retidoPIS: boolean
   *     aliquotaCOFINS: number
   *     retidoCOFINS: boolean
   *     aliquotaIRRF: number
   *     aliquotaCSLL: number
   *     aliquotaINSS: number
   *   }
   * - formaPagamento: string
   * - informacoesComplementares: string
   * - numeroPedido: string
   */
  async emitir(req: RequestComUsuario, res: Response) {
    try {
      const empresaId = req.user?.empresaId;
      
      if (!empresaId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Empresa não autenticada',
        });
      }

      // ✅ VALIDA DADOS OBRIGATÓRIOS
      if (!req.body.tomadorId) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Tomador é obrigatório'
        });
      }

      // Valida valor do serviço
      const valorServico = req.body.servico?.valorServico || 0;
      if (valorServico <= 0) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Valor do serviço deve ser maior que zero'
        });
      }

      // Valida descrição do serviço
      if (!req.body.servico?.descricao && !req.body.servicoId) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Descrição do serviço é obrigatória ou selecione um serviço do catálogo'
        });
      }

      // Valida alíquota ISS
      const aliquotaISS = req.body.servico?.aliquotaISS || 5;
      if (aliquotaISS < 2 || aliquotaISS > 5) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Alíquota de ISSQN deve estar entre 2% e 5% (LC 116/2003)'
        });
      }

      const result = await this.nfseService.emitirNfse({
        empresaId,
        usuario: req.user?.email || 'SISTEMA',
        ...req.body,
      });

      return res.status(201).json({
        sucesso: true,
        dados: result,
        mensagem: 'NFS-e emitida e autorizada com sucesso'
      });

    } catch (error: any) {
      console.error('❌ Erro no NFS-e emitir:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao emitir NFS-e',
      });
    }
  }

  /**
   * ❌ CANCELAR NFS-e
   * POST /api/nfse/cancelar/:id
   * 
   * Body:
   * - motivo: string (TJust - 15-255 caracteres)
   */
  async cancelar(req: RequestComUsuario, res: Response) {
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

      if (!id) {
        return res.status(400).json({
          sucesso: false,
          erro: 'ID da NFS-e é obrigatório'
        });
      }

      // ✅ VALIDA TJust (15-255 caracteres)
      if (!motivo) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Motivo do cancelamento é obrigatório'
        });
      }

      if (!validarTJust(motivo)) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Motivo deve ter entre 15 e 255 caracteres (TJust)'
        });
      }

      const result = await this.nfseService.cancelarNfse(id, motivo, empresaId);

      return res.json({
        sucesso: true,
        dados: result,
        mensagem: 'NFS-e cancelada com sucesso'
      });

    } catch (error: any) {
      console.error('❌ Erro no NFS-e cancelar:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao cancelar NFS-e',
      });
    }
  }

  /**
   * 📄 BAIXAR XML DA NFS-e
   * GET /api/nfse/xml/:id
   */
  async baixarXml(req: RequestComUsuario, res: Response) {
    try {
      const empresaId = req.user?.empresaId;
      const { id } = req.params;

      if (!empresaId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Empresa não autenticada',
        });
      }

      const xml = await this.nfseService.baixarXml(id, empresaId);

      res.setHeader('Content-Type', 'application/xml');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=NFSe_${id}_SUP.xml`
      );

      return res.send(xml);

    } catch (error: any) {
      console.error('❌ Erro ao baixar XML:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao baixar XML'
      });
    }
  }

  /**
   * 📄 GERAR DANFSe
   * GET /api/nfse/danfse/:id
   */
  async gerarDanfse(req: RequestComUsuario, res: Response) {
    try {
      const empresaId = req.user?.empresaId;
      const { id } = req.params;

      if (!empresaId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Empresa não autenticada',
        });
      }

      const dados = await this.nfseService.gerarDanfse(id, empresaId);

      return res.json({
        sucesso: true,
        dados
      });

    } catch (error: any) {
      console.error('❌ Erro ao gerar DANFSe:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao gerar DANFSe'
      });
    }
  }

  /**
   * 📊 ESTATÍSTICAS DE NFS-e
   * GET /api/nfse/estatisticas
   */
  async getEstatisticas(req: RequestComUsuario, res: Response) {
    try {
      const empresaId = req.user?.empresaId;

      if (!empresaId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Empresa não autenticada',
        });
      }

      const estatisticas = await this.nfseService.getEstatisticas(empresaId);

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
   * 💰 TOTAL FATURADO POR PERÍODO
   * GET /api/nfse/total-faturado
   * 
   * Query params:
   * - dataInicio: string (YYYY-MM-DD)
   * - dataFim: string (YYYY-MM-DD)
   */
  async getTotalFaturado(req: RequestComUsuario, res: Response) {
    try {
      const empresaId = req.user?.empresaId;

      if (!empresaId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Empresa não autenticada',
        });
      }

      const dataInicio = req.query.dataInicio ? new Date(req.query.dataInicio as string) : undefined;
      const dataFim = req.query.dataFim ? new Date(req.query.dataFim as string) : undefined;

      const result = await this.nfseService.getTotalFaturado(empresaId, dataInicio, dataFim);

      return res.json({
        sucesso: true,
        dados: result
      });

    } catch (error: any) {
      console.error('❌ Erro ao buscar total faturado:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao buscar total faturado'
      });
    }
  }

  /**
   * 📊 RESUMO MENSAL
   * GET /api/nfse/resumo-mensal
   * 
   * Query params:
   * - ano: number
   * - mes: number (1-12)
   */
  async getResumoMensal(req: RequestComUsuario, res: Response) {
    try {
      const empresaId = req.user?.empresaId;

      if (!empresaId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Empresa não autenticada',
        });
      }

      const ano = parseInt(req.query.ano as string) || new Date().getFullYear();
      const mes = parseInt(req.query.mes as string) || new Date().getMonth() + 1;

      // ✅ VALIDA ANO E MÊS
      if (ano < 2000 || ano > 2100) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Ano inválido'
        });
      }
      if (mes < 1 || mes > 12) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Mês inválido (1-12)'
        });
      }

      const resumo = await this.nfseService.getResumoMensal(empresaId, ano, mes);

      return res.json({
        sucesso: true,
        dados: resumo
      });

    } catch (error: any) {
      console.error('❌ Erro ao buscar resumo mensal:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao buscar resumo mensal'
      });
    }
  }

  /**
   * 📊 SERVIÇOS MAIS PRESTADOS
   * GET /api/nfse/servicos-mais-prestados
   * 
   * Query params:
   * - dataInicio: string (YYYY-MM-DD)
   * - dataFim: string (YYYY-MM-DD)
   * - limit: number (default: 10)
   */
  async getServicosMaisPrestados(req: RequestComUsuario, res: Response) {
    try {
      const empresaId = req.user?.empresaId;

      if (!empresaId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Empresa não autenticada',
        });
      }

      const dataInicio = req.query.dataInicio ? new Date(req.query.dataInicio as string) : undefined;
      const dataFim = req.query.dataFim ? new Date(req.query.dataFim as string) : undefined;
      const limit = parseInt(req.query.limit as string) || 10;

      const servicos = await this.nfseService.getServicosMaisPrestados(
        empresaId,
        dataInicio,
        dataFim,
        limit
      );

      return res.json({
        sucesso: true,
        dados: servicos
      });

    } catch (error: any) {
      console.error('❌ Erro ao buscar serviços mais prestados:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao buscar serviços mais prestados'
      });
    }
  }

  /**
   * 📊 NFS-e POR TOMADOR
   * GET /api/nfse/tomador/:tomadorId
   * 
   * Query params:
   * - dataInicio: string (YYYY-MM-DD)
   * - dataFim: string (YYYY-MM-DD)
   */
  async findByTomador(req: RequestComUsuario, res: Response) {
    try {
      const empresaId = req.user?.empresaId;
      const { tomadorId } = req.params;

      if (!empresaId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Empresa não autenticada',
        });
      }

      const dataInicio = req.query.dataInicio ? new Date(req.query.dataInicio as string) : undefined;
      const dataFim = req.query.dataFim ? new Date(req.query.dataFim as string) : undefined;

      const nfses = await this.nfseService.findByTomador(tomadorId, dataInicio, dataFim);

      // Filtra pela empresa
      const nfsesFiltradas = nfses.filter(n => n.empresaId === empresaId);

      return res.json({
        sucesso: true,
        dados: nfsesFiltradas
      });

    } catch (error: any) {
      console.error('❌ Erro ao buscar NFS-e por tomador:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao buscar NFS-e por tomador'
      });
    }
  }

  /**
   * 📊 NFS-e POR SERVIÇO
   * GET /api/nfse/servico/:servicoId
   * 
   * Query params:
   * - dataInicio: string (YYYY-MM-DD)
   * - dataFim: string (YYYY-MM-DD)
   */
  async findByServico(req: RequestComUsuario, res: Response) {
    try {
      const empresaId = req.user?.empresaId;
      const { servicoId } = req.params;

      if (!empresaId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Empresa não autenticada',
        });
      }

      const dataInicio = req.query.dataInicio ? new Date(req.query.dataInicio as string) : undefined;
      const dataFim = req.query.dataFim ? new Date(req.query.dataFim as string) : undefined;

      const nfses = await this.nfseService.findByServico(servicoId, dataInicio, dataFim);

      // Filtra pela empresa
      const nfsesFiltradas = nfses.filter(n => n.empresaId === empresaId);

      return res.json({
        sucesso: true,
        dados: nfsesFiltradas
      });

    } catch (error: any) {
      console.error('❌ Erro ao buscar NFS-e por serviço:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao buscar NFS-e por serviço'
      });
    }
  }
}