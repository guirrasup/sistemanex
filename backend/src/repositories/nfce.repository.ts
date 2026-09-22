// backend/src/repositories/nfce.repository.ts
import { Prisma, StatusDocumento } from '@prisma/client';
import { BaseRepository } from './base.repository.js';

// ============================================================
// INTERFACES
// ============================================================

export interface FiltroNFCe {
  empresaId: string;
  status?: StatusDocumento | StatusDocumento[];
  dataInicio?: Date;
  dataFim?: Date;
  consumidorId?: string;
  numero?: number;
  serie?: number;
  chaveAcesso?: string;
  page?: number;
  limit?: number;
}

export interface TotalVendasNFCeResult {
  totalProdutos: number;
  totalNota: number;
  totalTributosAprox: number;
  quantidade: number;
}

// ============================================================
// REPOSITÓRIO
// ============================================================

export class NfceRepository extends BaseRepository {

  async findById(id: string) {
    if (!id) {
      throw new Error('ID da NFC-e é obrigatório');
    }

    return this.prisma.nFCe.findUnique({
      where: { id },
      include: {
        empresa: {
          include: { endereco: true }
        },
        consumidor: {
          include: { endereco: true }
        },
        itens: true,
        pagamentos: true
      }
    });
  }

  async findByChave(chaveAcesso: string) {
    if (!/^[0-9]{44}$/.test(chaveAcesso)) {
      throw new Error('Chave de acesso inválida: deve ter 44 dígitos');
    }

    return this.prisma.nFCe.findUnique({
      where: { chaveAcesso },
      include: {
        empresa: {
          include: { endereco: true }
        },
        consumidor: {
          include: { endereco: true }
        },
        itens: true,
        pagamentos: true
      }
    });
  }

  async findByProtocolo(protocolo: string) {
    if (!/^[0-9]{15}$/.test(protocolo) && !/^[0-9]{17}$/.test(protocolo)) {
      throw new Error('Protocolo inválido: deve ter 15 ou 17 dígitos (TProt)');
    }

    return this.prisma.nFCe.findFirst({
      where: { protocoloAutorizacao: protocolo },
      include: {
        empresa: {
          include: { endereco: true }
        },
        consumidor: {
          include: { endereco: true }
        },
        itens: true,
        pagamentos: true
      }
    });
  }

  async findAll(filtros: FiltroNFCe) {
    const {
      empresaId,
      status,
      dataInicio,
      dataFim,
      consumidorId,
      numero,
      serie,
      chaveAcesso,
      page = 1,
      limit = 50
    } = filtros;

    const skip = (page - 1) * limit;

    // 🔥 CONSTRÓI WHERE DINÂMICO
    const where: Prisma.NFCeWhereInput = { empresaId };

    // ✅ Filtro por status (múltiplos)
    if (status) {
      if (Array.isArray(status)) {
        where.status = { in: status };
      } else {
        where.status = status;
      }
    }

    // ✅ Filtro por período
    if (dataInicio || dataFim) {
      where.dataHoraEmissao = {};
      if (dataInicio) {
        where.dataHoraEmissao.gte = dataInicio;
      }
      if (dataFim) {
        where.dataHoraEmissao.lte = dataFim;
      }
    }

    // ✅ Filtro por consumidor
    if (consumidorId) {
      where.consumidorId = consumidorId;
    }

    // ✅ Filtro por número (TNF - 1-999999999)
    if (numero !== undefined) {
      where.numero = numero;
    }

    // ✅ Filtro por série (TSerie - 0 ou 1-999)
    if (serie !== undefined) {
      where.serie = serie;
    }

    // ✅ Filtro por chave de acesso (TChNFe - 44 dígitos)
    if (chaveAcesso) {
      if (!/^[0-9]{44}$/.test(chaveAcesso)) {
        throw new Error('Chave de acesso inválida: deve ter 44 dígitos');
      }
      where.chaveAcesso = chaveAcesso;
    }

    // 🔥 EXECUTA CONSULTA
    const [data, total] = await Promise.all([
      this.prisma.nFCe.findMany({
        where,
        include: {
          empresa: {
            include: { endereco: true }
          },
          consumidor: {
            include: { endereco: true }
          },
          itens: true,
          pagamentos: true
        },
        skip,
        take: limit,
        orderBy: { dataHoraEmissao: 'desc' }
      }),
      this.prisma.nFCe.count({ where })
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async create(data: Prisma.NFCeUncheckedCreateInput) {
    // ✅ VALIDA DADOS OBRIGATÓRIOS
    if (!data.chaveAcesso) {
      throw new Error('Chave de acesso é obrigatória');
    }
    if (!/^[0-9]{44}$/.test(data.chaveAcesso)) {
      throw new Error('Chave de acesso inválida: deve ter 44 dígitos');
    }
    if (!data.empresaId) {
      throw new Error('Empresa é obrigatória');
    }

    return this.prisma.nFCe.create({
      data,
      include: {
        empresa: {
          include: { endereco: true }
        },
        consumidor: {
          include: { endereco: true }
        },
        itens: true,
        pagamentos: true
      }
    });
  }

  async createItem(nfceId: string, data: Omit<Prisma.ItemNFCeUncheckedCreateInput, 'nfceId'>) {
    return this.prisma.itemNFCe.create({
      data: { ...data, nfceId }
    });
  }

  async createPagamento(nfceId: string, data: Omit<Prisma.PagamentoNFCeUncheckedCreateInput, 'nfceId'>) {
    return this.prisma.pagamentoNFCe.create({
      data: { ...data, nfceId }
    });
  }

  async updateStatus(id: string, status: StatusDocumento, protocolo?: string, xmlAssinado?: string, motivoRejeicao?: string) {
    if (!id) {
      throw new Error('ID da NFC-e é obrigatório');
    }

    const data: Prisma.NFCeUpdateInput = {
      status: status
    };

    if (protocolo) {
      data.protocoloAutorizacao = protocolo;
      data.dataHoraAutorizacao = new Date();
    }

    if (xmlAssinado) {
      data.xmlAssinado = xmlAssinado;
    }

    if (motivoRejeicao) {
      data.motivoRejeicao = motivoRejeicao;
      data.dataHoraRejeicao = new Date();
    }

    return this.prisma.nFCe.update({
      where: { id },
      data,
      include: {
        empresa: {
          include: { endereco: true }
        },
        consumidor: {
          include: { endereco: true }
        },
        itens: true,
        pagamentos: true
      }
    });
  }

  async cancelar(id: string, motivo: string) {
    if (!id) {
      throw new Error('ID da NFC-e é obrigatório');
    }

    // ✅ VALIDA TJust (15-255 caracteres)
    if (motivo.length < 15) {
      throw new Error('Motivo deve ter no mínimo 15 caracteres (TJust)');
    }
    if (motivo.length > 255) {
      throw new Error('Motivo deve ter no máximo 255 caracteres (TJust)');
    }

    // 🔥 VERIFICA SE A NFC-e EXISTE E NÃO ESTÁ CANCELADA
    const nfceExistente = await this.prisma.nFCe.findUnique({
      where: { id },
      select: { status: true }
    });

    if (!nfceExistente) {
      throw new Error('NFC-e não encontrada');
    }

    if (nfceExistente.status === 'CANCELADA') {
      throw new Error('NFC-e já está cancelada');
    }

    return this.prisma.nFCe.update({
      where: { id },
      data: {
        status: 'CANCELADA',
        motivoCancelamento: motivo,
        dataHoraCancelamento: new Date()
      },
      include: {
        empresa: {
          include: { endereco: true }
        },
        consumidor: {
          include: { endereco: true }
        },
        itens: true,
        pagamentos: true
      }
    });
  }

  async getTotalVendas(empresaId: string, startDate?: Date, endDate?: Date): Promise<TotalVendasNFCeResult> {
    const where: Prisma.NFCeWhereInput = {
      empresaId,
      status: 'AUTORIZADA'
    };

    if (startDate && endDate) {
      where.dataHoraEmissao = {
        gte: startDate,
        lte: endDate
      };
    }

    const [result, count] = await Promise.all([
      this.prisma.nFCe.aggregate({
        where,
        _sum: {
          valorTotalProdutos: true,
          valorTotalNota: true,
          valorTotalTributosAprox: true
        }
      }),
      this.prisma.nFCe.count({ where })
    ]);

    return {
      totalProdutos: Number(result._sum.valorTotalProdutos) || 0,
      totalNota: Number(result._sum.valorTotalNota) || 0,
      totalTributosAprox: Number(result._sum.valorTotalTributosAprox) || 0,
      quantidade: count
    };
  }

  async getEstatisticas(empresaId: string) {
    const statusCounts = await this.prisma.nFCe.groupBy({
      by: ['status'],
      where: { empresaId },
      _count: true
    });

    const total = statusCounts.reduce((acc, curr) => acc + curr._count, 0);

    const resultado: Record<string, number> = {};
    statusCounts.forEach(item => {
      resultado[item.status] = item._count;
    });

    return {
      total,
      porStatus: resultado
    };
  }

  async getResumoMensal(empresaId: string, ano: number, mes: number) {
    const inicio = new Date(ano, mes - 1, 1);
    const fim = new Date(ano, mes, 0);

    const where: Prisma.NFCeWhereInput = {
      empresaId,
      status: 'AUTORIZADA',
      dataHoraEmissao: {
        gte: inicio,
        lte: fim
      }
    };

    const [result, count] = await Promise.all([
      this.prisma.nFCe.aggregate({
        where,
        _sum: {
          valorTotalNota: true,
          valorTotalTributosAprox: true
        }
      }),
      this.prisma.nFCe.count({ where })
    ]);

    return {
      mes,
      ano,
      totalNotas: count,
      valorTotal: Number(result._sum.valorTotalNota) || 0,
      totalTributosAprox: Number(result._sum.valorTotalTributosAprox) || 0
    };
  }

  async findByNumeroSerie(empresaId: string, numero: number, serie: number) {
    return this.prisma.nFCe.findFirst({
      where: {
        empresaId,
        numero,
        serie,
        NOT: {
          status: 'CANCELADA'
        }
      }
    });
  }

  async getUltimaNFCe(empresaId: string) {
    return this.prisma.nFCe.findFirst({
      where: { empresaId },
      orderBy: { numero: 'desc' },
      select: {
        numero: true,
        serie: true,
        chaveAcesso: true,
        dataHoraEmissao: true,
        status: true
      }
    });
  }

  async findByDateRange(empresaId: string, startDate: Date, endDate: Date) {
    return this.prisma.nFCe.findMany({
      where: {
        empresaId,
        dataHoraEmissao: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        consumidor: {
          include: { endereco: true }
        },
        itens: true,
        pagamentos: true
      },
      take: 500,
      orderBy: { dataHoraEmissao: 'desc' }
    });
  }

  async getProdutosMaisVendidos(empresaId: string, startDate?: Date, endDate?: Date, limit: number = 10) {
    const where: Prisma.NFCeWhereInput = {
      empresaId,
      status: 'AUTORIZADA'
    };

    if (startDate && endDate) {
      where.dataHoraEmissao = {
        gte: startDate,
        lte: endDate
      };
    }

    // Busca todas as NFC-e com itens no período
    const nfces = await this.prisma.nFCe.findMany({
      where,
      include: {
        itens: true
      },
      take: 500
    });

    // Agrupa por produto
    const produtoMap: Record<string, { descricao: string; quantidade: number; valor: number; codigo: string }> = {};

    for (const nfce of nfces) {
      for (const item of nfce.itens) {
        if (!produtoMap[item.codigoProduto]) {
          produtoMap[item.codigoProduto] = {
            descricao: item.descricao,
            codigo: item.codigoProduto,
            quantidade: 0,
            valor: 0
          };
        }
        produtoMap[item.codigoProduto].quantidade += Number(item.quantidade);
        produtoMap[item.codigoProduto].valor += Number(item.valorTotalBruto);
      }
    }

    // Converte para array e ordena
    const resultados = Object.values(produtoMap)
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, limit);

    return resultados;
  }
}