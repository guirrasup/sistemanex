// src/controllers/nfe.controller.ts

import { Request, Response } from 'express';
import { NfeService } from '../services/nfe.service';
import { StatusDocumento } from '@prisma/client';
import { 
  TChNFe, 
  TJust, 
  TProt, 
  TCnpj, 
  TSerie, 
  TNF,
  TDateTimeUTC 
} from '../types/fiscal';

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
// VALIDAÇÕES DO PL_006h
// ============================================================

/**
 * ✅ Valida TChNFe (44 dígitos)
 */
function validarChaveAcesso(chave: string): boolean {
  return /^[0-9]{44}$/.test(chave);
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

/**
 * ✅ Valida TCnpj (14 dígitos)
 */
function validarTCnpj(cnpj: string): boolean {
  return /^[0-9]{14}$/.test(cnpj.replace(/\D/g, ''));
}

/**
 * ✅ Valida TSerie (0 ou 1-999)
 */
function validarTSerie(serie: number): boolean {
  return serie === 0 || (serie >= 1 && serie <= 999);
}

/**
 * ✅ Valida TNF (1-999999999)
 */
function validarTNF(numero: number): boolean {
  return numero >= 1 && numero <= 999999999;
}

// ============================================================
// CONTROLLER
// ============================================================

export class NfeController {
  private nfeService: NfeService;

  constructor() {
    this.nfeService = new NfeService();
  }

  /**
   * 🔥 EMITIR NF-e
   * POST /api/nfe/emitir
   * 
   * ✅ Valida empresa autenticada
   * ✅ Valida dados obrigatórios
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

      // ✅ VALIDA DADOS OBRIGATÓRIOS
      const { destinatarioId, itens } = req.body;
      
      if (!destinatarioId) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Destinatário é obrigatório'
        });
      }

      if (!itens || itens.length === 0) {
        return res.status(400).json({
          sucesso: false,
          erro: 'NF-e deve ter pelo menos um item'
        });
      }

      // ✅ VALIDA CADA ITEM
      for (const item of itens) {
        if (!item.ncm || item.ncm.length !== 8) {
          return res.status(400).json({
            sucesso: false,
            erro: `Item "${item.descricao || 'sem descrição'}": NCM deve ter 8 dígitos`
          });
        }
        if (!item.cfop || item.cfop.length !== 4) {
          return res.status(400).json({
            sucesso: false,
            erro: `Item "${item.descricao || 'sem descrição'}": CFOP deve ter 4 dígitos`
          });
        }
        if (!item.quantidade || item.quantidade <= 0) {
          return res.status(400).json({
            sucesso: false,
            erro: `Item "${item.descricao || 'sem descrição'}": Quantidade deve ser maior que zero`
          });
        }
      }

      const result = await this.nfeService.emitirNfe({
        empresaId,
        ...req.body,
      });

      return res.status(201).json({
        sucesso: true,
        dados: result,
        mensagem: 'NF-e emitida e autorizada com sucesso'
      });

    } catch (error: any) {
      console.error('❌ Erro ao emitir NF-e:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao emitir NF-e'
      });
    }
  }

  /**
   * ❌ CANCELAR NF-e
   * POST /api/nfe/cancelar/:id
   * 
   * ✅ Valida TJust (15-255 caracteres)
   * ✅ Valida se a NF-e existe e pertence à empresa
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

      if (!id) {
        return res.status(400).json({
          sucesso: false,
          erro: 'ID da NF-e é obrigatório'
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

      const result = await this.nfeService.cancelarNfe(id, motivo, empresaId);

      return res.json({
        sucesso: true,
        dados: result,
        mensagem: 'NF-e cancelada com sucesso'
      });

    } catch (error: any) {
      console.error('❌ Erro ao cancelar NF-e:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao cancelar NF-e'
      });
    }
  }

  /**
   * 📋 LISTAR NF-e COM FILTROS
   * GET /api/nfe
   * 
   * ✅ Filtros: status, dataInicio, dataFim, destinatarioId, numero, serie
   * ✅ Paginação: page, limit
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

      // 🔥 PARÂMETROS DE PAGINAÇÃO
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      // 🔥 PARÂMETROS DE FILTRO
      const status = req.query.status as string;
      const dataInicio = req.query.dataInicio as string;
      const dataFim = req.query.dataFim as string;
      const destinatarioId = req.query.destinatarioId as string;
      const numero = req.query.numero ? parseInt(req.query.numero as string) : undefined;
      const serie = req.query.serie ? parseInt(req.query.serie as string) : undefined;
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

      // ✅ VALIDA TNF (1-999999999)
      if (numero !== undefined && !validarTNF(numero)) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Número inválido: deve ser entre 1 e 999999999 (TNF)'
        });
      }

      // ✅ VALIDA TSerie (0 ou 1-999)
      if (serie !== undefined && !validarTSerie(serie)) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Série inválida: deve ser 0 ou entre 1 e 999 (TSerie)'
        });
      }

      // ✅ VALIDA TChNFe (44 dígitos) - se fornecida
      if (chave && !validarChaveAcesso(chave)) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Chave de acesso inválida: deve ter 44 dígitos (TChNFe)'
        });
      }

      const result = await this.nfeService.listarNfes({
        empresaId,
        page,
        limit,
        status: statusEnum,
        dataInicio: dataInicio ? new Date(dataInicio) : undefined,
        dataFim: dataFim ? new Date(dataFim) : undefined,
        destinatarioId,
        numero,
        serie,
        chave
      });

      return res.json({
        sucesso: true,
        dados: result
      });

    } catch (error: any) {
      console.error('❌ Erro ao listar NF-e:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao listar NF-e'
      });
    }
  }

  /**
   * 🔍 BUSCAR NF-e POR ID
   * GET /api/nfe/:id
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

      if (!id) {
        return res.status(400).json({
          sucesso: false,
          erro: 'ID da NF-e é obrigatório'
        });
      }

      const nfe = await this.nfeService.buscarPorId(id, empresaId);

      if (!nfe) {
        return res.status(404).json({ 
          sucesso: false, 
          erro: 'NF-e não encontrada' 
        });
      }

      return res.json({ 
        sucesso: true, 
        dados: nfe 
      });

    } catch (error: any) {
      console.error('❌ Erro ao buscar NF-e por ID:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao buscar NF-e'
      });
    }
  }

  /**
   * 🔍 BUSCAR NF-e POR CHAVE DE ACESSO (TChNFe - 44 dígitos)
   * GET /api/nfe/chave/:chave
   * 
   * ✅ Valida TChNFe (44 dígitos)
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

      // ✅ VALIDA TChNFe (44 dígitos)
      if (!validarChaveAcesso(chave)) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Chave de acesso inválida: deve ter 44 dígitos (TChNFe)'
        });
      }

      const nfe = await this.nfeService.buscarPorChave(chave, empresaId);

      if (!nfe) {
        return res.status(404).json({ 
          sucesso: false, 
          erro: 'NF-e não encontrada' 
        });
      }

      return res.json({ 
        sucesso: true, 
        dados: nfe 
      });

    } catch (error: any) {
      console.error('❌ Erro ao buscar NF-e por chave:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao buscar NF-e'
      });
    }
  }

  /**
   * 🔍 BUSCAR NF-e POR PROTOCOLO (TProt - 15 ou 17 dígitos)
   * GET /api/nfe/protocolo/:protocolo
   * 
   * ✅ Valida TProt (15 ou 17 dígitos)
   */
  async buscarPorProtocolo(req: RequestComUsuario, res: Response) {
    try {
      const empresaId = req.user?.empresaId;
      const { protocolo } = req.params;

      if (!empresaId) {
        return res.status(401).json({ 
          sucesso: false, 
          erro: 'Empresa não autenticada' 
        });
      }

      // ✅ VALIDA TProt (15 ou 17 dígitos)
      if (!validarProtocolo(protocolo)) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Protocolo inválido: deve ter 15 ou 17 dígitos (TProt)'
        });
      }

      const nfe = await this.nfeService.buscarPorProtocolo(protocolo, empresaId);

      if (!nfe) {
        return res.status(404).json({ 
          sucesso: false, 
          erro: 'NF-e não encontrada' 
        });
      }

      return res.json({ 
        sucesso: true, 
        dados: nfe 
      });

    } catch (error: any) {
      console.error('❌ Erro ao buscar NF-e por protocolo:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao buscar NF-e'
      });
    }
  }

  /**
   * 📊 ESTATÍSTICAS DE NF-e
   * GET /api/nfe/estatisticas
   * 
   * ✅ Retorna contagem por status
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

      const estatisticas = await this.nfeService.getEstatisticas(empresaId);

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
   * 📊 RESUMO MENSAL DE NF-e
   * GET /api/nfe/resumo-mensal?ano=2026&mes=8
   * 
   * ✅ Retorna resumo de vendas por mês
   */
  async getResumoMensal(req: RequestComUsuario, res: Response) {
    try {
      const empresaId = req.user?.empresaId;

      if (!empresaId) {
        return res.status(401).json({ 
          sucesso: false, 
          erro: 'Empresa não autenticada' 
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

      const resumo = await this.nfeService.getResumoMensal(empresaId, ano, mes);

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
   * 📄 BAIXAR XML DA NF-e
   * GET /api/nfe/xml/:id
   * 
   * ✅ Retorna o XML como arquivo para download
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

      const nfe = await this.nfeService.buscarPorId(id, empresaId);

      if (!nfe) {
        return res.status(404).json({ 
          sucesso: false, 
          erro: 'NF-e não encontrada' 
        });
      }

      if (!nfe.xmlAssinado) {
        return res.status(404).json({
          sucesso: false,
          erro: 'XML da NF-e não disponível'
        });
      }

      res.setHeader('Content-Type', 'application/xml');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=NFe_${nfe.numero}_${nfe.chaveAcesso}.xml`
      );
      
      return res.send(nfe.xmlAssinado);

    } catch (error: any) {
      console.error('❌ Erro ao baixar XML:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao baixar XML'
      });
    }
  }

  /**
   * 📄 GERAR DANFE
   * GET /api/nfe/danfe/:id
   * 
   * ✅ Retorna o DANFE em PDF (placeholder)
   */
  async gerarDanfe(req: RequestComUsuario, res: Response) {
    try {
      const empresaId = req.user?.empresaId;
      const { id } = req.params;

      if (!empresaId) {
        return res.status(401).json({ 
          sucesso: false, 
          erro: 'Empresa não autenticada' 
        });
      }

      const nfe = await this.nfeService.buscarPorId(id, empresaId);

      if (!nfe) {
        return res.status(404).json({ 
          sucesso: false, 
          erro: 'NF-e não encontrada' 
        });
      }

      // TODO: Implementar geração real de PDF do DANFE
      // Por enquanto, retorna um placeholder
      return res.json({
        sucesso: true,
        mensagem: 'DANFE gerado com sucesso',
        dados: {
          chaveAcesso: nfe.chaveAcesso,
          numero: nfe.numero,
          serie: nfe.serie,
          valorTotal: nfe.valorTotalNota,
          destinatario: nfe.destinatario.nomeRazaoSocial
        }
      });

    } catch (error: any) {
      console.error('❌ Erro ao gerar DANFE:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao gerar DANFE'
      });
    }
  }

  /**
   * 📝 ENVIAR CARTA DE CORREÇÃO (CC-e)
   * POST /api/nfe/carta-correcao
   * 
   * ✅ Valida TChNFe (44 dígitos)
   * ✅ Valida TJust (15-255 caracteres)
   */
  async enviarCartaCorrecao(req: RequestComUsuario, res: Response) {
    try {
      const empresaId = req.user?.empresaId;
      const { chaveAcesso, cnpjAutor, textoCorrecao } = req.body;

      if (!empresaId) {
        return res.status(401).json({ 
          sucesso: false, 
          erro: 'Empresa não autenticada' 
        });
      }

      // ✅ VALIDA TChNFe (44 dígitos)
      if (!validarChaveAcesso(chaveAcesso)) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Chave de acesso inválida: deve ter 44 dígitos (TChNFe)'
        });
      }

      // ✅ VALIDA TCnpj (14 dígitos)
      if (!validarTCnpj(cnpjAutor)) {
        return res.status(400).json({
          sucesso: false,
          erro: 'CNPJ do autor inválido: deve ter 14 dígitos (TCnpj)'
        });
      }

      // ✅ VALIDA TJust (15-255 caracteres)
      if (!validarTJust(textoCorrecao)) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Texto de correção deve ter entre 15 e 255 caracteres (TJust)'
        });
      }

      const result = await this.nfeService.enviarCartaCorrecao({
        empresaId,
        chaveAcesso,
        cnpjAutor,
        textoCorrecao
      });

      return res.json({
        sucesso: true,
        dados: result,
        mensagem: 'Carta de Correção enviada com sucesso'
      });

    } catch (error: any) {
      console.error('❌ Erro ao enviar Carta de Correção:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao enviar Carta de Correção'
      });
    }
  }

  /**
   * 🔍 CONSULTAR SITUAÇÃO NA SEFAZ
   * GET /api/nfe/consultar/:chave
   * 
   * ✅ Valida TChNFe (44 dígitos)
   */
  async consultarSituacao(req: RequestComUsuario, res: Response) {
    try {
      const empresaId = req.user?.empresaId;
      const { chave } = req.params;

      if (!empresaId) {
        return res.status(401).json({ 
          sucesso: false, 
          erro: 'Empresa não autenticada' 
        });
      }

      // ✅ VALIDA TChNFe (44 dígitos)
      if (!validarChaveAcesso(chave)) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Chave de acesso inválida: deve ter 44 dígitos (TChNFe)'
        });
      }

      const situacao = await this.nfeService.consultarSituacao(chave, empresaId);

      return res.json({
        sucesso: true,
        dados: situacao
      });

    } catch (error: any) {
      console.error('❌ Erro ao consultar situação:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao consultar situação'
      });
    }
  }
}