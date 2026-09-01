// src/controllers/nfce.controller.ts

import { Request, Response } from 'express';
import { NfceService } from '../services/nfce.service';
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
 * ✅ Valida TNF (1-999999999)
 */
function validarTNF(numero: number): boolean {
  return numero >= 1 && numero <= 999999999;
}

/**
 * ✅ Valida TSerie (0 ou 1-999)
 */
function validarTSerie(serie: number): boolean {
  return serie === 0 || (serie >= 1 && serie <= 999);
}

// ============================================================
// CONTROLLER
// ============================================================

export class NfceController {
  private nfceService: NfceService;

  constructor() {
    this.nfceService = new NfceService();
  }

  /**
   * 📋 LISTAR NFC-e COM FILTROS
   * GET /api/nfce
   * 
   * Query params:
   * - page: number (default: 1)
   * - limit: number (default: 50)
   * - status: string (ex: AUTORIZADA,CANCELADA)
   * - dataInicio: string (YYYY-MM-DD)
   * - dataFim: string (YYYY-MM-DD)
   * - consumidorId: string
   * - numero: number (TNF - 1-999999999)
   * - serie: number (TSerie - 0 ou 1-999)
   * - chave: string (TChNFe - 44 dígitos)
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
      const consumidorId = req.query.consumidorId as string;
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

      const dados = await this.nfceService.listarNfces(
        empresaId,
        page,
        limit,
        {
          status: statusEnum,
          dataInicio: dataInicio ? new Date(dataInicio) : undefined,
          dataFim: dataFim ? new Date(dataFim) : undefined,
          consumidorId,
          numero,
          serie,
          chave
        }
      );

      return res.json({
        sucesso: true,
        dados
      });

    } catch (error: any) {
      console.error('❌ Erro no NFC-e listar:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao listar NFC-e',
      });
    }
  }

  /**
   * 🔍 BUSCAR NFC-e POR ID
   * GET /api/nfce/:id
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
          erro: 'ID da NFC-e é obrigatório'
        });
      }

      const nfce = await this.nfceService.buscarPorId(id);

      if (!nfce) {
        return res.status(404).json({
          sucesso: false,
          erro: 'NFC-e não encontrada'
        });
      }

      if (nfce.empresaId !== empresaId) {
        return res.status(403).json({
          sucesso: false,
          erro: 'Acesso negado'
        });
      }

      return res.json({
        sucesso: true,
        dados: nfce
      });

    } catch (error: any) {
      console.error('❌ Erro ao buscar NFC-e por ID:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao buscar NFC-e'
      });
    }
  }

  /**
   * 🔍 BUSCAR NFC-e POR CHAVE DE ACESSO (TChNFe - 44 dígitos)
   * GET /api/nfce/chave/:chave
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

      // ✅ VALIDA TChNFe (44 dígitos)
      if (!validarChaveAcesso(chave)) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Chave de acesso inválida: deve ter 44 dígitos (TChNFe)'
        });
      }

      const nfce = await this.nfceService.buscarPorChave(chave);

      if (!nfce) {
        return res.status(404).json({
          sucesso: false,
          erro: 'NFC-e não encontrada'
        });
      }

      if (nfce.empresaId !== empresaId) {
        return res.status(403).json({
          sucesso: false,
          erro: 'Acesso negado'
        });
      }

      return res.json({
        sucesso: true,
        dados: nfce
      });

    } catch (error: any) {
      console.error('❌ Erro ao buscar NFC-e por chave:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao buscar NFC-e'
      });
    }
  }

  /**
   * 🔍 BUSCAR NFC-e POR PROTOCOLO (TProt - 15 ou 17 dígitos)
   * GET /api/nfce/protocolo/:protocolo
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

      const nfce = await this.nfceService.buscarPorProtocolo(protocolo);

      if (!nfce) {
        return res.status(404).json({
          sucesso: false,
          erro: 'NFC-e não encontrada'
        });
      }

      if (nfce.empresaId !== empresaId) {
        return res.status(403).json({
          sucesso: false,
          erro: 'Acesso negado'
        });
      }

      return res.json({
        sucesso: true,
        dados: nfce
      });

    } catch (error: any) {
      console.error('❌ Erro ao buscar NFC-e por protocolo:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao buscar NFC-e'
      });
    }
  }

  /**
   * 📝 EMITIR NFC-e
   * POST /api/nfce/emitir
   * 
   * Body:
   * - itens: ItemNfe[]
   * - naturezaOperacao: string
   * - consumidorIdentificado: boolean
   * - consumidorDoc: string (opcional)
   * - consumidorNome: string (opcional)
   * - consumidorEmail: string (opcional)
   * - consumidorTelefone: string (opcional)
   * - consumidorEndereco: EnderecoFiscal (opcional)
   * - formaPagamento: string (01-99)
   * - valorPago: number
   * - valorRecebido: number (para dinheiro)
   * - valorDesconto: number
   * - valorAcrescimo: number
   * - tpNF: 0|1 (opcional)
   * - idDest: 1|2|3 (opcional)
   * - finNFe: 1|2|3|4 (opcional)
   * - indFinal: 0|1 (opcional)
   * - indPres: 0|1|2|3|4|5|9 (opcional)
   * - procEmi: string (opcional)
   * - verProc: string (opcional)
   * - tpEmis: TipoEmissao (opcional)
   * - pagamentos: PagamentoNFCe[] (opcional)
   * - infAdFisco: string (opcional)
   * - infCpl: string (opcional)
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
      const { itens } = req.body;

      if (!itens || itens.length === 0) {
        return res.status(400).json({
          sucesso: false,
          erro: 'NFC-e deve ter pelo menos um item'
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
        if (item.valorUnitario <= 0) {
          return res.status(400).json({
            sucesso: false,
            erro: `Item "${item.descricao || 'sem descrição'}": Valor unitário deve ser maior que zero`
          });
        }
      }

      // ✅ VALIDA CONSUMIDOR IDENTIFICADO
      if (req.body.consumidorIdentificado) {
        if (!req.body.consumidorDoc) {
          return res.status(400).json({
            sucesso: false,
            erro: 'CPF/CNPJ do consumidor é obrigatório quando identificado'
          });
        }
        if (!req.body.consumidorNome) {
          return res.status(400).json({
            sucesso: false,
            erro: 'Nome do consumidor é obrigatório quando identificado'
          });
        }
      }

      // ✅ VALIDA FORMA DE PAGAMENTO
      if (req.body.formaPagamento === '01' && req.body.valorRecebido) {
        const total = req.body.valorTotalNota || 0;
        if (req.body.valorRecebido < total) {
          return res.status(400).json({
            sucesso: false,
            erro: `Valor recebido (R$ ${req.body.valorRecebido.toFixed(2)}) é inferior ao total (R$ ${total.toFixed(2)})`
          });
        }
      }

      const dados = await this.nfceService.emitirNfce({
        empresaId,
        usuario: req.user?.email || 'SISTEMA',
        ...req.body,
      });

      return res.status(201).json({
        sucesso: true,
        dados,
        mensagem: 'NFC-e emitida e autorizada com sucesso'
      });

    } catch (error: any) {
      console.error('❌ Erro no NFC-e emitir:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao emitir NFC-e',
      });
    }
  }

  /**
   * ❌ CANCELAR NFC-e
   * POST /api/nfce/cancelar/:id
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
          erro: 'ID da NFC-e é obrigatório'
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

      const dados = await this.nfceService.cancelarNfce(id, motivo, empresaId);

      return res.json({
        sucesso: true,
        dados,
        mensagem: 'NFC-e cancelada com sucesso'
      });

    } catch (error: any) {
      console.error('❌ Erro no NFC-e cancelar:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao cancelar NFC-e',
      });
    }
  }

  /**
   * 📄 BAIXAR XML DA NFC-e
   * GET /api/nfce/xml/:id
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

      const xml = await this.nfceService.baixarXml(id, empresaId);

      res.setHeader('Content-Type', 'application/xml');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=NFCe_${id}_SUP.xml`
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
   * 📄 GERAR DANFE NFC-e (Cupom)
   * GET /api/nfce/danfe/:id
   */
  async gerarDanfce(req: RequestComUsuario, res: Response) {
    try {
      const empresaId = req.user?.empresaId;
      const { id } = req.params;

      if (!empresaId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Empresa não autenticada',
        });
      }

      const dados = await this.nfceService.gerarDanfce(id, empresaId);

      return res.json({
        sucesso: true,
        dados
      });

    } catch (error: any) {
      console.error('❌ Erro ao gerar DANFE NFC-e:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao gerar DANFE'
      });
    }
  }

  /**
   * 📊 ESTATÍSTICAS DE NFC-e
   * GET /api/nfce/estatisticas
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

      const estatisticas = await this.nfceService.getEstatisticas(empresaId);

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
   * 💰 TOTAL DE VENDAS POR PERÍODO
   * GET /api/nfce/total-vendas
   * 
   * Query params:
   * - dataInicio: string (YYYY-MM-DD)
   * - dataFim: string (YYYY-MM-DD)
   */
  async getTotalVendas(req: RequestComUsuario, res: Response) {
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

      const result = await this.nfceService.getTotalVendas(empresaId, dataInicio, dataFim);

      return res.json({
        sucesso: true,
        dados: result
      });

    } catch (error: any) {
      console.error('❌ Erro ao buscar total de vendas:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao buscar total de vendas'
      });
    }
  }

  /**
   * 📊 RESUMO MENSAL
   * GET /api/nfce/resumo-mensal
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

      const resumo = await this.nfceService.getResumoMensal(empresaId, ano, mes);

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
   * 📊 PRODUTOS MAIS VENDIDOS
   * GET /api/nfce/produtos-mais-vendidos
   * 
   * Query params:
   * - dataInicio: string (YYYY-MM-DD)
   * - dataFim: string (YYYY-MM-DD)
   * - limit: number (default: 10)
   */
  async getProdutosMaisVendidos(req: RequestComUsuario, res: Response) {
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

      const produtos = await this.nfceService.getProdutosMaisVendidos(
        empresaId,
        dataInicio,
        dataFim,
        limit
      );

      return res.json({
        sucesso: true,
        dados: produtos
      });

    } catch (error: any) {
      console.error('❌ Erro ao buscar produtos mais vendidos:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao buscar produtos mais vendidos'
      });
    }
  }
}