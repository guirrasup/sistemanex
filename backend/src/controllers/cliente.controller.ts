// backend/src/controllers/cliente.controller.ts
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ClienteService } from '../services/cliente.service.js';

// 🔥 O frontend (ClientesView/FornecedoresView, protótipo antigo) manda o campo
// como `indicadorIE`, mas o schema real do Prisma chama esse mesmo campo de
// `indIEDest` — controller/service/repository daqui pra baixo só repassam
// req.body pro Prisma sem transformar nada, então isso quebrava tanto criar
// quanto editar cliente/fornecedor com "Unknown argument `indicadorIE`".
function mapCorpoCliente(body: Record<string, unknown>): Record<string, unknown> {
  if (!('indicadorIE' in body)) return body;
  const { indicadorIE, ...resto } = body;
  return { ...resto, indIEDest: indicadorIE };
}

// 🔥 Só pro criar(): o frontend manda `endereco` como um objeto de campos
// crus (logradouro/numero/...), não como sintaxe de relação do Prisma
// (`endereco: { create: {...} } }`) — sem isso, o create() do Prisma rejeita
// com "Unknown argument" no endereço, do mesmo jeito que o `indicadorIE`
// quebrava o update(). O form de Clientes/Fornecedores também nunca coleta
// `codigoUF` (código IBGE de 2 dígitos da UF, obrigatório no schema, diferente
// da sigla de 2 letras `uf`) — derivamos dos 2 primeiros dígitos de
// `codigoMunicipio` (código IBGE de 7 dígitos, onde os 2 primeiros SÃO o
// código da UF — mesma técnica já usada em empresaMappers.ts).
function mapCorpoClienteParaCriar(body: Record<string, unknown>, empresaId: string): Record<string, unknown> {
  const { endereco, ...resto } = mapCorpoCliente(body);
  let enderecoCompleto = endereco;
  if (endereco && typeof endereco === 'object') {
    const e = endereco as Record<string, unknown>;
    if (!e.codigoUF && typeof e.codigoMunicipio === 'string' && e.codigoMunicipio.length >= 2) {
      enderecoCompleto = { ...e, codigoUF: e.codigoMunicipio.slice(0, 2) };
    }
  }
  return {
    ...resto,
    empresa: { connect: { id: empresaId } },
    ...(enderecoCompleto ? { endereco: { create: enderecoCompleto } } : {}),
  };
}

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
    } catch (error: unknown) {
      console.error('❌ Erro ao listar clientes:', error);
      return res.status(500).json({ sucesso: false, erro: error instanceof Error ? error.message : 'Erro desconhecido' });
    }
  }

  async buscarPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const empresaId = req.user?.empresaId;

      if (!empresaId) {
        return res.status(401).json({ sucesso: false, erro: 'Empresa não autenticada' });
      }

      const dados = await this.clienteService.buscarPorId(id, empresaId);
      
      if (!dados) {
        return res.status(404).json({ sucesso: false, erro: 'Cliente não encontrado' });
      }
      
      return res.json({ sucesso: true, dados });
    } catch (error: unknown) {
      return res.status(500).json({ sucesso: false, erro: error instanceof Error ? error.message : 'Erro desconhecido' });
    }
  }

  async buscarPorDocumento(req: Request, res: Response) {
    try {
      const { documento } = req.params;
      const empresaId = req.user?.empresaId;

      if (!empresaId) {
        return res.status(401).json({ sucesso: false, erro: 'Empresa não autenticada' });
      }

      const dados = await this.clienteService.buscarPorDocumento(documento, empresaId);
      
      if (!dados) {
        return res.status(404).json({ sucesso: false, erro: 'Cliente não encontrado' });
      }
      
      return res.json({ sucesso: true, dados });
    } catch (error: unknown) {
      return res.status(500).json({ sucesso: false, erro: error instanceof Error ? error.message : 'Erro desconhecido' });
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
    } catch (error: unknown) {
      return res.status(500).json({ sucesso: false, erro: error instanceof Error ? error.message : 'Erro desconhecido' });
    }
  }

  async criar(req: Request, res: Response) {
    try {
      const empresaId = req.user?.empresaId;
      
      if (!empresaId) {
        return res.status(401).json({ sucesso: false, erro: 'Empresa não autenticada' });
      }

      const dados = await this.clienteService.criar(
        mapCorpoClienteParaCriar(req.body, empresaId) as Prisma.ClienteCreateInput
      );
      
      return res.status(201).json({ sucesso: true, dados });
    } catch (error: unknown) {
      console.error('❌ Erro ao criar cliente:', error);
      return res.status(400).json({ sucesso: false, erro: error instanceof Error ? error.message : 'Erro desconhecido' });
    }
  }

  async atualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const empresaId = req.user?.empresaId;

      if (!empresaId) {
        return res.status(401).json({ sucesso: false, erro: 'Empresa não autenticada' });
      }

      const dados = await this.clienteService.atualizar(id, mapCorpoCliente(req.body), empresaId);
      return res.json({ sucesso: true, dados });
    } catch (error: unknown) {
      return res.status(400).json({ sucesso: false, erro: error instanceof Error ? error.message : 'Erro desconhecido' });
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
    } catch (error: unknown) {
      return res.status(400).json({ sucesso: false, erro: error instanceof Error ? error.message : 'Erro desconhecido' });
    }
  }
}