// backend/src/controllers/nfce.controller.ts
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

function validarChaveAcesso(chave: string): boolean {
  return /^[0-9]{44}$/.test(chave);
}

function validarTJust(texto: string): boolean {
  return texto.length >= 15 && texto.length <= 255;
}

function validarProtocolo(protocolo: string): boolean {
  return /^[0-9]{15}$/.test(protocolo) || /^[0-9]{17}$/.test(protocolo);
}

const TNF_MAXIMO = 999999999;

function validarTNF(numero: number): boolean {
  return numero >= 1 && numero <= TNF_MAXIMO;
}

function validarTSerie(serie: number): boolean {
  return serie === 0 || (serie >= 1 && serie <= 999);
}

const ANO_RESUMO_MINIMO = 2000;
const ANO_RESUMO_MAXIMO = 2100;

// ============================================================
// CONTROLLER
// ============================================================

export class NfceController {
  private nfceService: NfceService;

  constructor() {
    this.nfceService = new NfceService();
  }

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

    } catch (error: unknown) {
      console.error('❌ Erro no NFC-e listar:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro ao listar NFC-e',
      });
    }
  }

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

      const nfce = await this.nfceService.buscarPorId(id, empresaId);

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

    } catch (error: unknown) {
      console.error('❌ Erro ao buscar NFC-e por ID:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro ao buscar NFC-e'
      });
    }
  }

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

      const nfce = await this.nfceService.buscarPorChave(chave, empresaId);

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

    } catch (error: unknown) {
      console.error('❌ Erro ao buscar NFC-e por chave:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro ao buscar NFC-e'
      });
    }
  }

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

    } catch (error: unknown) {
      console.error('❌ Erro ao buscar NFC-e por protocolo:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro ao buscar NFC-e'
      });
    }
  }

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

    } catch (error: unknown) {
      console.error('❌ Erro no NFC-e emitir:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro ao emitir NFC-e',
      });
    }
  }

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

    } catch (error: unknown) {
      console.error('❌ Erro no NFC-e cancelar:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro ao cancelar NFC-e',
      });
    }
  }

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

    } catch (error: unknown) {
      console.error('❌ Erro ao baixar XML:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro ao baixar XML'
      });
    }
  }

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

    } catch (error: unknown) {
      console.error('❌ Erro ao gerar DANFE NFC-e:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro ao gerar DANFE'
      });
    }
  }

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

    } catch (error: unknown) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro ao buscar estatísticas'
      });
    }
  }

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

    } catch (error: unknown) {
      console.error('❌ Erro ao buscar total de vendas:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro ao buscar total de vendas'
      });
    }
  }

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
      if (ano < ANO_RESUMO_MINIMO || ano > ANO_RESUMO_MAXIMO) {
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

    } catch (error: unknown) {
      console.error('❌ Erro ao buscar resumo mensal:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro ao buscar resumo mensal'
      });
    }
  }

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

    } catch (error: unknown) {
      console.error('❌ Erro ao buscar produtos mais vendidos:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro ao buscar produtos mais vendidos'
      });
    }
  }
}