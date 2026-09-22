// backend/src/repositories/nfse.repository.ts
import { Prisma, StatusDocumento } from '@prisma/client';
import { BaseRepository } from './base.repository.js';

// ============================================================
// INTERFACES
// ============================================================

export interface FiltroNFSe {
  empresaId: string;
  status?: StatusDocumento | StatusDocumento[];
  dataInicio?: Date;
  dataFim?: Date;
  tomadorId?: string;
  numeroNfse?: number;
  serieDPS?: number;
  chaveAcesso?: string;
  page?: number;
  limit?: number;
}

export interface TotalFaturadoNFSeResult {
  totalServicos: number;
  totalISS: number;
  totalIBS: number;
  totalCBS: number;
  totalRetencoesFederais: number;
  quantidade: number;
}

// ============================================================
// REPOSITÓRIO
// ============================================================

export class NfseRepository extends BaseRepository {

  async findById(id: string) {
    if (!id) {
      throw new Error('ID da NFS-e é obrigatório');
    }

    return this.prisma.nFSe.findUnique({
      where: { id },
      include: {
        empresa: {
          include: { endereco: true }
        },
        tomador: {
          include: { endereco: true }
        },
        servico: true,
        historicoStatus: true
      }
    });
  }

  async findByChave(chaveAcesso: string) {
    if (!/^[0-9]{53}$/.test(chaveAcesso)) {
      throw new Error('Chave de acesso inválida: deve ter 53 dígitos');
    }

    return this.prisma.nFSe.findUnique({
      where: { chaveAcesso },
      include: {
        empresa: {
          include: { endereco: true }
        },
        tomador: {
          include: { endereco: true }
        },
        servico: true,
        historicoStatus: true
      }
    });
  }

  async findByProtocolo(protocolo: string) {
    if (!/^[0-9]{15}$/.test(protocolo) && !/^[0-9]{17}$/.test(protocolo)) {
      throw new Error('Protocolo inválido: deve ter 15 ou 17 dígitos');
    }

    return this.prisma.nFSe.findFirst({
      where: { protocoloAutorizacao: protocolo },
      include: {
        empresa: {
          include: { endereco: true }
        },
        tomador: {
          include: { endereco: true }
        },
        servico: true,
        historicoStatus: true
      }
    });
  }

  async findAll(filtros: FiltroNFSe) {
    const {
      empresaId,
      status,
      dataInicio,
      dataFim,
      tomadorId,
      numeroNfse,
      serieDPS,
      chaveAcesso,
      page = 1,
      limit = 50
    } = filtros;

    const skip = (page - 1) * limit;

    // 🔥 CONSTRÓI WHERE DINÂMICO
    const where: Prisma.NFSeWhereInput = { empresaId };

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

    // ✅ Filtro por tomador
    if (tomadorId) {
      where.tomadorId = tomadorId;
    }

    // ✅ Filtro por número da NFS-e
    if (numeroNfse !== undefined) {
      where.numeroNfse = numeroNfse;
    }

    // ✅ Filtro por série DPS
    if (serieDPS !== undefined) {
      where.serieDPS = serieDPS;
    }

    // ✅ Filtro por chave de acesso (53 dígitos)
    if (chaveAcesso) {
      if (!/^[0-9]{53}$/.test(chaveAcesso)) {
        throw new Error('Chave de acesso inválida: deve ter 53 dígitos');
      }
      where.chaveAcesso = chaveAcesso;
    }

    // 🔥 EXECUTA CONSULTA
    const [data, total] = await Promise.all([
      this.prisma.nFSe.findMany({
        where,
        include: {
          empresa: {
            include: { endereco: true }
          },
          tomador: {
            include: { endereco: true }
          },
          servico: true
        },
        skip,
        take: limit,
        orderBy: { dataHoraEmissao: 'desc' }
      }),
      this.prisma.nFSe.count({ where })
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findByPeriodo(empresaId: string, startDate: Date, endDate: Date) {
    return this.prisma.nFSe.findMany({
      where: {
        empresaId,
        dataHoraEmissao: {
          gte: startDate,
          lte: endDate
        },
        status: 'AUTORIZADA'
      },
      include: {
        tomador: {
          include: { endereco: true }
        },
        servico: true
      },
      take: 500,
      orderBy: { dataHoraEmissao: 'desc' }
    });
  }

  async create(data: Prisma.NFSeUncheckedCreateInput) {
    // ✅ VALIDA DADOS OBRIGATÓRIOS
    if (!data.chaveAcesso) {
      throw new Error('Chave de acesso é obrigatória');
    }
    if (!/^[0-9]{53}$/.test(data.chaveAcesso)) {
      throw new Error('Chave de acesso inválida: deve ter 53 dígitos');
    }
    if (!data.empresaId) {
      throw new Error('Empresa é obrigatória');
    }
    if (!data.tomadorId) {
      throw new Error('Tomador é obrigatório');
    }

    return this.prisma.nFSe.create({
      data,
      include: {
        empresa: {
          include: { endereco: true }
        },
        tomador: {
          include: { endereco: true }
        },
        servico: true
      }
    });
  }

  async updateStatus(id: string, status: StatusDocumento, protocolo?: string, xmlRetorno?: string, motivoRejeicao?: string) {
    if (!id) {
      throw new Error('ID da NFS-e é obrigatório');
    }

    const data: Prisma.NFSeUpdateInput = {
      status: status
    };

    if (protocolo) {
      data.protocoloAutorizacao = protocolo;
      data.dataHoraAutorizacao = new Date();
    }

    if (xmlRetorno) {
      data.xmlRetorno = xmlRetorno;
    }

    if (motivoRejeicao) {
      data.motivoRejeicao = motivoRejeicao;
    }

    return this.prisma.nFSe.update({
      where: { id },
      data,
      include: {
        empresa: {
          include: { endereco: true }
        },
        tomador: {
          include: { endereco: true }
        },
        servico: true
      }
    });
  }

  async cancelar(id: string, motivo: string) {
    if (!id) {
      throw new Error('ID da NFS-e é obrigatório');
    }

    // ✅ VALIDA TJust (15-255 caracteres)
    if (motivo.length < 15) {
      throw new Error('Motivo deve ter no mínimo 15 caracteres');
    }
    if (motivo.length > 255) {
      throw new Error('Motivo deve ter no máximo 255 caracteres');
    }

    // 🔥 VERIFICA SE A NFS-e EXISTE E NÃO ESTÁ CANCELADA
    const nfseExistente = await this.prisma.nFSe.findUnique({
      where: { id },
      select: { status: true }
    });

    if (!nfseExistente) {
      throw new Error('NFS-e não encontrada');
    }

    if (nfseExistente.status === 'CANCELADA') {
      throw new Error('NFS-e já está cancelada');
    }

    return this.prisma.nFSe.update({
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
        tomador: {
          include: { endereco: true }
        },
        servico: true
      }
    });
  }

  async getTotalFaturado(empresaId: string, startDate?: Date, endDate?: Date): Promise<TotalFaturadoNFSeResult> {
    const where: Prisma.NFSeWhereInput = {
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
      this.prisma.nFSe.aggregate({
        where,
        _sum: {
          valorTotalServicos: true,
          valorTotalISS: true,
          valorTotalIBS: true,
          valorCBS: true,
          valorTotalRetencoesFederais: true
        }
      }),
      this.prisma.nFSe.count({ where })
    ]);

    return {
      totalServicos: Number(result._sum?.valorTotalServicos) || 0,
      totalISS: Number(result._sum?.valorTotalISS) || 0,
      totalIBS: Number(result._sum?.valorTotalIBS) || 0,
      totalCBS: Number(result._sum?.valorCBS) || 0,
      totalRetencoesFederais: Number(result._sum?.valorTotalRetencoesFederais) || 0,
      quantidade: count
    };
  }

  async getEstatisticas(empresaId: string) {
    const statusCounts = await this.prisma.nFSe.groupBy({
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

    const where: Prisma.NFSeWhereInput = {
      empresaId,
      status: 'AUTORIZADA',
      dataHoraEmissao: {
        gte: inicio,
        lte: fim
      }
    };

    const [result, count] = await Promise.all([
      this.prisma.nFSe.aggregate({
        where,
        _sum: {
          valorTotalServicos: true,
          valorTotalISS: true,
          valorTotalIBS: true,
          valorCBS: true,
          valorTotalRetencoesFederais: true
        }
      }),
      this.prisma.nFSe.count({ where })
    ]);

    return {
      mes,
      ano,
      totalNotas: count,
      valorTotal: Number(result._sum?.valorTotalServicos) || 0,
      totalISS: Number(result._sum?.valorTotalISS) || 0,
      totalIBS: Number(result._sum?.valorTotalIBS) || 0,
      totalCBS: Number(result._sum?.valorCBS) || 0,
      totalRetencoes: Number(result._sum?.valorTotalRetencoesFederais) || 0
    };
  }

  async findByNumeroSerie(empresaId: string, numeroNfse: number, serieDPS: number) {
    return this.prisma.nFSe.findFirst({
      where: {
        empresaId,
        numeroNfse,
        serieDPS,
        NOT: {
          status: 'CANCELADA'
        }
      }
    });
  }

  async getUltimaNFSe(empresaId: string) {
    return this.prisma.nFSe.findFirst({
      where: { empresaId },
      orderBy: { numeroNfse: 'desc' },
      select: {
        numeroNfse: true,
        serieDPS: true,
        chaveAcesso: true,
        dataHoraEmissao: true,
        status: true
      }
    });
  }

  async getServicosMaisPrestados(empresaId: string, startDate?: Date, endDate?: Date, limit: number = 10) {
    const where: Prisma.NFSeWhereInput = {
      empresaId,
      status: 'AUTORIZADA'
    };

    if (startDate && endDate) {
      where.dataHoraEmissao = {
        gte: startDate,
        lte: endDate
      };
    }

    // Busca todas as NFS-e no período
    const nfses = await this.prisma.nFSe.findMany({
      where,
      include: {
        servico: true
      },
      take: 500
    });

    // Agrupa por serviço
    const servicoMap: Record<string, { descricao: string; codigo: string; quantidade: number; valor: number }> = {};

    for (const nfse of nfses) {
      if (!nfse.servico || !nfse.servicoId) continue;
      const key = nfse.servicoId;
      if (!servicoMap[key]) {
        servicoMap[key] = {
          descricao: nfse.servico.descricao,
          codigo: nfse.servico.codigoInterno,
          quantidade: 0,
          valor: 0
        };
      }
      servicoMap[key].quantidade += 1;
      servicoMap[key].valor += Number(nfse.valorTotalServicos);
    }

    // Converte para array e ordena
    const resultados = Object.values(servicoMap)
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, limit);

    return resultados;
  }

  async createHistoricoStatus(data: {
    nfseId: string;
    statusAnterior: StatusDocumento;
    statusNovo: StatusDocumento;
    usuario: string;
    motivo?: string;
  }) {
    return this.prisma.historicoStatusNFSe.create({
      data: {
        nfse: { connect: { id: data.nfseId } },
        statusAnterior: data.statusAnterior,
        statusNovo: data.statusNovo,
        usuario: data.usuario,
        motivo: data.motivo
      }
    });
  }

  async findByTomador(tomadorId: string, startDate?: Date, endDate?: Date) {
    const where: Prisma.NFSeWhereInput = {
      tomadorId,
      status: 'AUTORIZADA'
    };

    if (startDate && endDate) {
      where.dataHoraEmissao = {
        gte: startDate,
        lte: endDate
      };
    }

    return this.prisma.nFSe.findMany({
      where,
      include: {
        servico: true
      },
      take: 500,
      orderBy: { dataHoraEmissao: 'desc' }
    });
  }

  async findByServico(servicoId: string, startDate?: Date, endDate?: Date) {
    const where: Prisma.NFSeWhereInput = {
      servicoId,
      status: 'AUTORIZADA'
    };

    if (startDate && endDate) {
      where.dataHoraEmissao = {
        gte: startDate,
        lte: endDate
      };
    }

    return this.prisma.nFSe.findMany({
      where,
      include: {
        tomador: {
          include: { endereco: true }
        }
      },
      take: 500,
      orderBy: { dataHoraEmissao: 'desc' }
    });
  }
}