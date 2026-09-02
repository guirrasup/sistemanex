// C:\emissornfe\backend\src\controllers\cte.controller.ts

import { Request, Response } from 'express';
import { CteService } from '../services/cte.service';
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

function validarChaveAcesso(chave: string): boolean {
  return /^[0-9]{44}$/.test(chave);
}

function validarTJust(texto: string): boolean {
  return texto.length >= 15 && texto.length <= 255;
}

function validarProtocolo(protocolo: string): boolean {
  return /^[0-9]{15}$/.test(protocolo) || /^[0-9]{17}$/.test(protocolo);
}

function validarTSerie(serie: number): boolean {
  return serie === 0 || (serie >= 1 && serie <= 999);
}

function validarTNF(numero: number): boolean {
  return numero >= 1 && numero <= 999999999;
}

// ============================================================
// CONTROLLER
// ============================================================

export class CteController {
  private cteService: CteService;

  constructor() {
    this.cteService = new CteService();
  }

  /**
   * 📋 LISTAR CT-e COM FILTROS
   * GET /api/cte
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

      const status = req.query.status as string;
      const dataInicio = req.query.dataInicio as string;
      const dataFim = req.query.dataFim as string;
      const remetenteId = req.query.remetenteId as string;
      const destinatarioId = req.query.destinatarioId as string;
      const numero = req.query.numero ? parseInt(req.query.numero as string) : undefined;
      const serie = req.query.serie ? parseInt(req.query.serie as string) : undefined;
      const chave = req.query.chave as string;
      const modal = req.query.modal as string;
      const tpCTe = req.query.tpCTe as string;

      if (chave && !validarChaveAcesso(chave)) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Chave de acesso inválida: deve ter 44 dígitos (TChNFe)'
        });
      }

      if (serie !== undefined && !validarTSerie(serie)) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Série inválida: deve ser 0 ou entre 1 e 999 (TSerie)'
        });
      }

      if (numero !== undefined && !validarTNF(numero)) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Número inválido: deve ser entre 1 e 999999999 (TNF)'
        });
      }

      let statusEnum: StatusDocumento | StatusDocumento[] | undefined;
      if (status) {
        const statusList = status.split(',');
        if (statusList.length === 1) {
          statusEnum = statusList[0] as StatusDocumento;
        } else {
          statusEnum = statusList as StatusDocumento[];
        }
      }

      const result = await this.cteService.listarCtes(
        empresaId,
        page,
        limit,
        {
          status: statusEnum,
          dataInicio: dataInicio ? new Date(dataInicio) : undefined,
          dataFim: dataFim ? new Date(dataFim) : undefined,
          remetenteId,
          destinatarioId,
          numero,
          serie,
          chave,
          modal,
          tpCTe
        }
      );

      return res.json({
        sucesso: true,
        dados: result,
      });

    } catch (error: any) {
      console.error('❌ Erro no CT-e listar:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao listar CT-e',
      });
    }
  }

  /**
   * 🔍 BUSCAR CT-e POR ID
   * GET /api/cte/:id
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
          erro: 'ID do CT-e é obrigatório'
        });
      }

      const cte = await this.cteService.buscarPorId(id);

      if (!cte) {
        return res.status(404).json({
          sucesso: false,
          erro: 'CT-e não encontrado'
        });
      }

      if (cte.empresaId !== empresaId) {
        return res.status(403).json({
          sucesso: false,
          erro: 'Acesso negado'
        });
      }

      return res.json({
        sucesso: true,
        dados: cte,
      });

    } catch (error: any) {
      console.error('❌ Erro ao buscar CT-e por ID:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao buscar CT-e'
      });
    }
  }

  /**
   * 🔍 BUSCAR CT-e POR CHAVE DE ACESSO
   * GET /api/cte/chave/:chave
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

      if (!validarChaveAcesso(chave)) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Chave de acesso inválida: deve ter 44 dígitos'
        });
      }

      const cte = await this.cteService.buscarPorChave(chave);

      if (!cte) {
        return res.status(404).json({
          sucesso: false,
          erro: 'CT-e não encontrado'
        });
      }

      if (cte.empresaId !== empresaId) {
        return res.status(403).json({
          sucesso: false,
          erro: 'Acesso negado'
        });
      }

      return res.json({
        sucesso: true,
        dados: cte,
      });

    } catch (error: any) {
      console.error('❌ Erro ao buscar CT-e por chave:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao buscar CT-e'
      });
    }
  }

  /**
   * 🔍 BUSCAR CT-e POR PROTOCOLO
   * GET /api/cte/protocolo/:protocolo
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

      if (!validarProtocolo(protocolo)) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Protocolo inválido: deve ter 15 ou 17 dígitos'
        });
      }

      const cte = await this.cteService.buscarPorProtocolo(protocolo);

      if (!cte) {
        return res.status(404).json({
          sucesso: false,
          erro: 'CT-e não encontrado'
        });
      }

      if (cte.empresaId !== empresaId) {
        return res.status(403).json({
          sucesso: false,
          erro: 'Acesso negado'
        });
      }

      return res.json({
        sucesso: true,
        dados: cte,
      });

    } catch (error: any) {
      console.error('❌ Erro ao buscar CT-e por protocolo:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao buscar CT-e'
      });
    }
  }

  /**
   * 📝 EMITIR CT-e
   * POST /api/cte/emitir
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

      // ✅ VALIDAÇÕES
      if (!req.body.remetenteId) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Remetente é obrigatório'
        });
      }

      if (!req.body.destinatarioId) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Destinatário é obrigatório'
        });
      }

      if (req.body.cfop && !/^[0-9]{3}$/.test(req.body.cfop)) {
        return res.status(400).json({
          sucesso: false,
          erro: 'CFOP inválido: deve ter 3 dígitos'
        });
      }

      const serie = req.body.serie || 1;
      if (!validarTSerie(serie)) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Série inválida: deve ser 0 ou entre 1 e 999'
        });
      }

      if (req.body.cMunIni && !/^[0-9]{7}$/.test(req.body.cMunIni)) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Código do município de início inválido: deve ter 7 dígitos'
        });
      }

      if (req.body.cMunFim && !/^[0-9]{7}$/.test(req.body.cMunFim)) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Código do município de fim inválido: deve ter 7 dígitos'
        });
      }

      if (req.body.valorCargaAverbada <= 0) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Valor da carga deve ser maior que zero'
        });
      }

      if (!req.body.rntrc) {
        return res.status(400).json({
          sucesso: false,
          erro: 'RNTRC é obrigatório'
        });
      }

      if (!req.body.veiculo?.placa) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Placa do veículo é obrigatória'
        });
      }

      if (!req.body.motorista?.nome || !req.body.motorista?.cpf) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Nome e CPF do motorista são obrigatórios'
        });
      }

      if (!/^[0-9]{11}$/.test(req.body.motorista.cpf.replace(/\D/g, ''))) {
        return res.status(400).json({
          sucesso: false,
          erro: 'CPF do motorista inválido: deve ter 11 dígitos'
        });
      }

      const tpCTe = req.body.tpCTe || 'NORMAL';
      if (!['NORMAL', 'COMPLEMENTO_VALORES', 'SUBSTITUICAO'].includes(tpCTe)) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Tipo de CT-e inválido'
        });
      }

      if (tpCTe === 'SUBSTITUICAO') {
        if (!req.body.chCteSub) {
          return res.status(400).json({
            sucesso: false,
            erro: 'Chave do CT-e substituído é obrigatória'
          });
        }
        if (!validarChaveAcesso(req.body.chCteSub)) {
          return res.status(400).json({
            sucesso: false,
            erro: 'Chave do CT-e substituído inválida'
          });
        }
      }

      if (tpCTe === 'COMPLEMENTO_VALORES') {
        if (!req.body.chCteComplementado) {
          return res.status(400).json({
            sucesso: false,
            erro: 'Chave do CT-e complementado é obrigatória'
          });
        }
        if (!validarChaveAcesso(req.body.chCteComplementado)) {
          return res.status(400).json({
            sucesso: false,
            erro: 'Chave do CT-e complementado inválida'
          });
        }
      }

      const result = await this.cteService.emitirCte({
        empresaId,
        usuario: req.user?.email || 'SISTEMA',
        ...req.body,
      });

      return res.status(201).json({
        sucesso: true,
        dados: result,
        mensagem: 'CT-e emitido e autorizado com sucesso'
      });

    } catch (error: any) {
      console.error('❌ Erro no CT-e emitir:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao emitir CT-e',
      });
    }
  }

  /**
   * ❌ CANCELAR CT-e
   * POST /api/cte/cancelar/:id
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
          erro: 'ID do CT-e é obrigatório'
        });
      }

      if (!motivo) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Motivo do cancelamento é obrigatório'
        });
      }

      if (!validarTJust(motivo)) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Motivo deve ter entre 15 e 255 caracteres'
        });
      }

      const result = await this.cteService.cancelarCte(id, motivo, empresaId);

      return res.json({
        sucesso: true,
        dados: result,
        mensagem: 'CT-e cancelado com sucesso'
      });

    } catch (error: any) {
      console.error('❌ Erro no CT-e cancelar:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao cancelar CT-e',
      });
    }
  }

  /**
   * 📄 BAIXAR XML DO CT-e
   * GET /api/cte/xml/:id
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

      const xml = await this.cteService.baixarXml(id, empresaId);

      res.setHeader('Content-Type', 'application/xml');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=CTe_${id}_SUP.xml`
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
   * 📄 GERAR DACTE
   * GET /api/cte/dacte/:id
   */
  async gerarDacte(req: RequestComUsuario, res: Response) {
    try {
      const empresaId = req.user?.empresaId;
      const { id } = req.params;

      if (!empresaId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Empresa não autenticada',
        });
      }

      const dados = await this.cteService.gerarDacte(id, empresaId);

      return res.json({
        sucesso: true,
        dados
      });

    } catch (error: any) {
      console.error('❌ Erro ao gerar DACTE:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao gerar DACTE'
      });
    }
  }

  /**
   * 📊 ESTATÍSTICAS DE CT-e
   * GET /api/cte/estatisticas
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

      const estatisticas = await this.cteService.getEstatisticas(empresaId);

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
   * 💰 TOTAL DE FRETE POR PERÍODO
   * GET /api/cte/total-frete
   */
  async getTotalFrete(req: RequestComUsuario, res: Response) {
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

      const result = await this.cteService.getTotalFrete(empresaId, dataInicio, dataFim);

      return res.json({
        sucesso: true,
        dados: result
      });

    } catch (error: any) {
      console.error('❌ Erro ao buscar total de frete:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao buscar total de frete'
      });
    }
  }

  /**
   * 📊 RESUMO MENSAL DE CT-e
   * GET /api/cte/resumo-mensal
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

      const resumo = await this.cteService.getResumoMensal(empresaId, ano, mes);

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
   * 📊 CT-e POR CLIENTE
   * GET /api/cte/cliente/:clienteId
   */
  async findByCliente(req: RequestComUsuario, res: Response) {
    try {
      const empresaId = req.user?.empresaId;
      const { clienteId } = req.params;
      const tipo = req.query.tipo as string || 'AMBOS';

      if (!empresaId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Empresa não autenticada',
        });
      }

      const dataInicio = req.query.dataInicio ? new Date(req.query.dataInicio as string) : undefined;
      const dataFim = req.query.dataFim ? new Date(req.query.dataFim as string) : undefined;

      const ctes = await this.cteService.findByCliente(clienteId, tipo, dataInicio, dataFim);
      const ctesFiltrados = ctes.filter(c => c.empresaId === empresaId);

      return res.json({
        sucesso: true,
        dados: ctesFiltrados
      });

    } catch (error: any) {
      console.error('❌ Erro ao buscar CT-e por cliente:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao buscar CT-e por cliente'
      });
    }
  }

  /**
   * 📊 CT-e POR TRANSPORTADORA
   * GET /api/cte/transportadora/:transportadoraId
   */
  async findByTransportadora(req: RequestComUsuario, res: Response) {
    try {
      const empresaId = req.user?.empresaId;
      const { transportadoraId } = req.params;

      if (!empresaId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Empresa não autenticada',
        });
      }

      const dataInicio = req.query.dataInicio ? new Date(req.query.dataInicio as string) : undefined;
      const dataFim = req.query.dataFim ? new Date(req.query.dataFim as string) : undefined;

      const ctes = await this.cteService.findByTransportadora(transportadoraId, dataInicio, dataFim);
      const ctesFiltrados = ctes.filter(c => c.empresaId === empresaId);

      return res.json({
        sucesso: true,
        dados: ctesFiltrados
      });

    } catch (error: any) {
      console.error('❌ Erro ao buscar CT-e por transportadora:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao buscar CT-e por transportadora'
      });
    }
  }

  /**
   * 📊 CT-e POR MODAL
   * GET /api/cte/modal/:modal
   */
  async findByModal(req: RequestComUsuario, res: Response) {
    try {
      const empresaId = req.user?.empresaId;
      const { modal } = req.params;

      if (!empresaId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Empresa não autenticada',
        });
      }

      const modaisValidos = ['RODOVIARIO', 'AEREO', 'AQUAVIARIO', 'FERROVIARIO', 'DUTOVIARIO', 'MULTIMODAL'];
      if (!modaisValidos.includes(modal)) {
        return res.status(400).json({
          sucesso: false,
          erro: `Modal inválido: deve ser ${modaisValidos.join(', ')}`
        });
      }

      const dataInicio = req.query.dataInicio ? new Date(req.query.dataInicio as string) : undefined;
      const dataFim = req.query.dataFim ? new Date(req.query.dataFim as string) : undefined;

      const ctes = await this.cteService.findByModal(modal, dataInicio, dataFim);
      const ctesFiltrados = ctes.filter(c => c.empresaId === empresaId);

      return res.json({
        sucesso: true,
        dados: ctesFiltrados
      });

    } catch (error: any) {
      console.error('❌ Erro ao buscar CT-e por modal:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao buscar CT-e por modal'
      });
    }
  }

  /**
   * 📊 CT-e POR STATUS
   * GET /api/cte/status/:status
   */
  async findByStatus(req: RequestComUsuario, res: Response) {
    try {
      const empresaId = req.user?.empresaId;
      const { status } = req.params;

      if (!empresaId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Empresa não autenticada',
        });
      }

      const statusValidos = ['AUTORIZADA', 'CANCELADA', 'SUBSTITUIDA', 'PROCESSANDO', 'REJEITADA', 'RASCUNHO'];
      if (!statusValidos.includes(status)) {
        return res.status(400).json({
          sucesso: false,
          erro: `Status inválido: deve ser ${statusValidos.join(', ')}`
        });
      }

      const dataInicio = req.query.dataInicio ? new Date(req.query.dataInicio as string) : undefined;
      const dataFim = req.query.dataFim ? new Date(req.query.dataFim as string) : undefined;

      const ctes = await this.cteService.findByStatus(status as any, dataInicio, dataFim);
      const ctesFiltrados = ctes.filter(c => c.empresaId === empresaId);

      return res.json({
        sucesso: true,
        dados: ctesFiltrados
      });

    } catch (error: any) {
      console.error('❌ Erro ao buscar CT-e por status:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao buscar CT-e por status'
      });
    }
  }

  /**
   * 🔄 CT-e DE SUBSTITUIÇÃO - BUSCAR ORIGINAL
   * GET /api/cte/substituicao/:chave
   */
  async buscarCteSubstituido(req: RequestComUsuario, res: Response) {
    try {
      const empresaId = req.user?.empresaId;
      const { chave } = req.params;

      if (!empresaId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Empresa não autenticada',
        });
      }

      if (!validarChaveAcesso(chave)) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Chave de acesso inválida: deve ter 44 dígitos'
        });
      }

      const cte = await this.cteService.buscarCteSubstituido(chave);

      if (!cte) {
        return res.status(404).json({
          sucesso: false,
          erro: 'CT-e substituído não encontrado'
        });
      }

      if (cte.empresaId !== empresaId) {
        return res.status(403).json({
          sucesso: false,
          erro: 'Acesso negado'
        });
      }

      return res.json({
        sucesso: true,
        dados: cte,
      });

    } catch (error: any) {
      console.error('❌ Erro ao buscar CT-e substituído:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao buscar CT-e substituído'
      });
    }
  }

  /**
   * 🔄 CT-e DE COMPLEMENTO - BUSCAR ORIGINAL
   * GET /api/cte/complemento/:chave
   */
  async buscarCteComplementado(req: RequestComUsuario, res: Response) {
    try {
      const empresaId = req.user?.empresaId;
      const { chave } = req.params;

      if (!empresaId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Empresa não autenticada',
        });
      }

      if (!validarChaveAcesso(chave)) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Chave de acesso inválida: deve ter 44 dígitos'
        });
      }

      const cte = await this.cteService.buscarCteComplementado(chave);

      if (!cte) {
        return res.status(404).json({
          sucesso: false,
          erro: 'CT-e complementado não encontrado'
        });
      }

      if (cte.empresaId !== empresaId) {
        return res.status(403).json({
          sucesso: false,
          erro: 'Acesso negado'
        });
      }

      return res.json({
        sucesso: true,
        dados: cte,
      });

    } catch (error: any) {
      console.error('❌ Erro ao buscar CT-e complementado:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao buscar CT-e complementado'
      });
    }
  }
}