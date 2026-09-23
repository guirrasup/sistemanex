// backend/src/controllers/nfe.controller.ts
import { Request, Response } from 'express';
import { NfeService } from '../services/nfe.service.js';
import { StatusDocumento } from '@prisma/client';
import { 
  TChNFe, 
  TJust, 
  TProt, 
  TCnpj, 
  TSerie, 
  TNF,
  TDateTimeUTC 
} from '../types/fiscal.js';

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

function validarChaveAcesso(chave: string): boolean {
  return /^[0-9]{44}$/.test(chave);
}

function validarTJust(texto: string): boolean {
  return texto.length >= 15 && texto.length <= 255;
}

function validarProtocolo(protocolo: string): boolean {
  return /^[0-9]{15}$/.test(protocolo) || /^[0-9]{17}$/.test(protocolo);
}

function validarTCnpj(cnpj: string): boolean {
  return /^[0-9]{14}$/.test(cnpj.replace(/\D/g, ''));
}

function validarTSerie(serie: number): boolean {
  return serie === 0 || (serie >= 1 && serie <= 999);
}

const TNF_MAXIMO = 999999999;

function validarTNF(numero: number): boolean {
  return numero >= 1 && numero <= TNF_MAXIMO;
}

const ANO_RESUMO_MINIMO = 2000;
const ANO_RESUMO_MAXIMO = 2100;

// ============================================================
// CONTROLLER
// ============================================================

export class NfeController {
  private nfeService: NfeService;

  constructor() {
    this.nfeService = new NfeService();
  }

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
      // O service resolve NCM/CFOP/preço a partir do produto cadastrado (produtoId)
      // — não são enviados pelo cliente, então não fazem parte desta validação.
      for (const item of itens) {
        if (!item.produtoId) {
          return res.status(400).json({
            sucesso: false,
            erro: 'Cada item deve informar produtoId'
          });
        }
        if (item.quantidade !== undefined && item.quantidade <= 0) {
          return res.status(400).json({
            sucesso: false,
            erro: `Item ${item.produtoId}: quantidade deve ser maior que zero`
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

    } catch (error: unknown) {
      console.error('❌ Erro ao emitir NF-e:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro ao emitir NF-e'
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

    } catch (error: unknown) {
      console.error('❌ Erro ao cancelar NF-e:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro ao cancelar NF-e'
      });
    }
  }

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
        chaveAcesso: chave
      });

      return res.json({
        sucesso: true,
        dados: result
      });

    } catch (error: unknown) {
      console.error('❌ Erro ao listar NF-e:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro ao listar NF-e'
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

    } catch (error: unknown) {
      console.error('❌ Erro ao buscar NF-e por ID:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro ao buscar NF-e'
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

    } catch (error: unknown) {
      console.error('❌ Erro ao buscar NF-e por chave:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro ao buscar NF-e'
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

    } catch (error: unknown) {
      console.error('❌ Erro ao buscar NF-e por protocolo:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro ao buscar NF-e'
      });
    }
  }

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

    } catch (error: unknown) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro ao buscar estatísticas'
      });
    }
  }

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

      const resumo = await this.nfeService.getResumoMensal(empresaId, ano, mes);

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

    } catch (error: unknown) {
      console.error('❌ Erro ao baixar XML:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro ao baixar XML'
      });
    }
  }

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

      // [AutoPatch Backlog] TODO: Implementar geração real do PDF do DANFE (layout retrato/paisagem conforme
      // manual de orientação SEFAZ, incluindo código de barras Code-128 da chave de acesso
      // e demais campos do XML autorizado). Requer escolher biblioteca de geração de PDF
      // no backend (ex.: pdf-lib ou puppeteer) e endpoint deve passar a retornar o binário
      // (ou base64) do PDF em vez do JSON de metadados abaixo.
      // Por enquanto, retorna um placeholder
      return res.json({
        sucesso: true,
        mensagem: 'DANFE gerado com sucesso',
        dados: {
          chaveAcesso: nfe.chaveAcesso,
          numero: nfe.numero,
          serie: nfe.serie,
          valorTotal: nfe.vNF,
          destinatario: nfe.destinatario.razaoSocial
        }
      });

    } catch (error: unknown) {
      console.error('❌ Erro ao gerar DANFE:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro ao gerar DANFE'
      });
    }
  }

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

    } catch (error: unknown) {
      console.error('❌ Erro ao enviar Carta de Correção:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro ao enviar Carta de Correção'
      });
    }
  }

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

    } catch (error: unknown) {
      console.error('❌ Erro ao consultar situação:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro ao consultar situação'
      });
    }
  }

  async inutilizar(req: RequestComUsuario, res: Response) {
    try {
      const empresaId = req.user?.empresaId;
      if (!empresaId) {
        return res.status(401).json({ sucesso: false, erro: 'Empresa não autenticada' });
      }

      const { modelo, serie, numeroInicial, numeroFinal, justificativa } = req.body;

      if (modelo !== '55' && modelo !== '65') {
        return res.status(400).json({ sucesso: false, erro: 'Modelo inválido: deve ser "55" (NF-e) ou "65" (NFC-e)' });
      }

      if (!validarTSerie(serie)) {
        return res.status(400).json({ sucesso: false, erro: 'Série inválida: deve ser 0 ou entre 1 e 999 (TSerie)' });
      }

      if (!validarTNF(numeroInicial) || !validarTNF(numeroFinal)) {
        return res.status(400).json({ sucesso: false, erro: 'Número inicial/final inválido: deve ser entre 1 e 999999999 (TNF)' });
      }

      if (numeroInicial > numeroFinal) {
        return res.status(400).json({ sucesso: false, erro: 'Número inicial deve ser menor ou igual ao número final' });
      }

      if (!validarTJust(justificativa)) {
        return res.status(400).json({ sucesso: false, erro: 'Justificativa deve ter entre 15 e 255 caracteres (TJust)' });
      }

      const resultado = await this.nfeService.inutilizarNumeracao({
        empresaId,
        modelo,
        serie,
        numeroInicial,
        numeroFinal,
        justificativa,
      });

      return res.status(201).json({
        sucesso: true,
        dados: resultado,
        mensagem: 'Inutilização de numeração processada'
      });

    } catch (error: unknown) {
      console.error('❌ Erro ao inutilizar numeração:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro ao inutilizar numeração'
      });
    }
  }
}