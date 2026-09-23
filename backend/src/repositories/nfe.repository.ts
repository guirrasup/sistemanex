// backend/src/repositories/nfe.repository.ts
import { Prisma, StatusDocumento } from '@prisma/client';
import { BaseRepository } from './base.repository.js';
import { TChNFe, TProt, TJust } from '../../src/types/fiscal.js';

// ============================================================
// INTERFACES
// ============================================================

export interface FiltroNFe {
  empresaId: string;
  status?: StatusDocumento | StatusDocumento[];
  dataInicio?: Date;
  dataFim?: Date;
  destinatarioId?: string;
  numero?: number;
  serie?: number;
  chaveAcesso?: TChNFe;
  page?: number;
  limit?: number;
}

export interface TotalVendasResult {
  totalProdutos: number;
  totalNota: number;
  totalICMS: number;
  totalPIS: number;
  totalCOFINS: number;
  totalIBS: number;
  totalCBS: number;
  quantidade: number;
}

// ============================================================
// REPOSITÓRIO
// ============================================================

export class NfeRepository extends BaseRepository {
  
  async findById(id: string) {
    if (!id) {
      throw new Error('ID da NF-e é obrigatório');
    }

    return this.prisma.nFe.findUnique({
      where: { id },
      include: {
        empresa: {
          include: { endereco: true }
        },
        destinatario: {
          include: { endereco: true }
        },
        itens: true,
        duplicatas: true,
        transporte: {
          include: {
            transportadora: {
              include: { endereco: true }
            }
          }
        }
      }
    });
  }

  async findByChave(chaveAcesso: string) {
    // ✅ VALIDA TChNFe (44 dígitos)
    if (!/^[0-9]{44}$/.test(chaveAcesso)) {
      throw new Error('Chave de acesso inválida: deve ter 44 dígitos (TChNFe)');
    }

    return this.prisma.nFe.findUnique({
      where: { chaveAcesso },
      include: {
        empresa: {
          include: { endereco: true }
        },
        destinatario: {
          include: { endereco: true }
        },
        itens: true,
        duplicatas: true,
        transporte: {
          include: {
            transportadora: {
              include: { endereco: true }
            }
          }
        }
      }
    });
  }

  async findAll(filtros: FiltroNFe) {
    const {
      empresaId,
      status,
      dataInicio,
      dataFim,
      destinatarioId,
      numero,
      serie,
      chaveAcesso,
      page = 1,
      limit = 50
    } = filtros;

    const skip = (page - 1) * limit;

    // 🔥 CONSTRÓI WHERE DINÂMICO
    const where: Prisma.NFeWhereInput = { empresaId };

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
      where.dhEmi = {};
      if (dataInicio) {
        where.dhEmi.gte = dataInicio;
      }
      if (dataFim) {
        where.dhEmi.lte = dataFim;
      }
    }

    // ✅ Filtro por destinatário
    if (destinatarioId) {
      where.destinatarioId = destinatarioId;
    }

    // ✅ Filtro por número (TNF - PL_006h)
    if (numero !== undefined) {
      where.numero = numero;
    }

    // ✅ Filtro por série (TSerie - PL_006h)
    if (serie !== undefined) {
      where.serie = serie;
    }

    // ✅ Filtro por chave de acesso (TChNFe - PL_006h)
    if (chaveAcesso) {
      if (!/^[0-9]{44}$/.test(chaveAcesso)) {
        throw new Error('Chave de acesso inválida: deve ter 44 dígitos (TChNFe)');
      }
      where.chaveAcesso = chaveAcesso;
    }

    // 🔥 EXECUTA CONSULTA
    const [data, total] = await Promise.all([
      this.prisma.nFe.findMany({
        where,
        include: {
          destinatario: {
            include: { endereco: true }
          },
          itens: true,
          duplicatas: true,
          transporte: {
            include: {
              transportadora: {
                include: { endereco: true }
              }
            }
          }
        },
        skip,
        take: limit,
        orderBy: { dhEmi: 'desc' }
      }),
      this.prisma.nFe.count({ where })
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async create(data: Prisma.NFeUncheckedCreateInput) {
    // ✅ VALIDA DADOS OBRIGATÓRIOS
    if (!data.chaveAcesso) {
      throw new Error('Chave de acesso é obrigatória (TChNFe)');
    }
    if (!/^[0-9]{44}$/.test(data.chaveAcesso)) {
      throw new Error('Chave de acesso inválida: deve ter 44 dígitos (TChNFe)');
    }
    if (!data.empresaId) {
      throw new Error('Empresa é obrigatória');
    }
    if (!data.destinatarioId) {
      throw new Error('Destinatário é obrigatório');
    }

    return this.prisma.nFe.create({
      data,
      include: {
        empresa: {
          include: { endereco: true }
        },
        destinatario: {
          include: { endereco: true }
        },
        itens: true,
        duplicatas: true,
        transporte: {
          include: {
            transportadora: {
              include: { endereco: true }
            }
          }
        }
      }
    });
  }

  async updateStatus(id: string, status: StatusDocumento, protocolo?: string) {
    if (!id) {
      throw new Error('ID da NF-e é obrigatório');
    }

    // ✅ VALIDA TProt (15 ou 17 dígitos) - se fornecido
    if (protocolo && !/^[0-9]{15}$/.test(protocolo) && !/^[0-9]{17}$/.test(protocolo)) {
      throw new Error('Protocolo inválido: deve ter 15 ou 17 dígitos (TProt)');
    }

    const data: Prisma.NFeUpdateInput = {
      status: status
    };

    if (protocolo) {
      data.protocoloAutorizacao = protocolo;
      data.dataHoraAutorizacao = new Date();
    }

    return this.prisma.nFe.update({
      where: { id },
      data,
      include: {
        empresa: {
          include: { endereco: true }
        },
        destinatario: {
          include: { endereco: true }
        },
        itens: true,
        duplicatas: true,
        transporte: {
          include: {
            transportadora: {
              include: { endereco: true }
            }
          }
        }
      }
    });
  }

  async cancelar(id: string, motivo: string) {
    if (!id) {
      throw new Error('ID da NF-e é obrigatório');
    }

    // ✅ VALIDA TJust (15-255 caracteres)
    if (motivo.length < 15) {
      throw new Error('Motivo deve ter no mínimo 15 caracteres (TJust)');
    }
    if (motivo.length > 255) {
      throw new Error('Motivo deve ter no máximo 255 caracteres (TJust)');
    }

    // 🔥 VERIFICA SE A NF-e EXISTE E NÃO ESTÁ CANCELADA
    const nfeExistente = await this.prisma.nFe.findUnique({
      where: { id },
      select: { status: true }
    });

    if (!nfeExistente) {
      throw new Error('NF-e não encontrada');
    }

    if (nfeExistente.status === StatusDocumento.CANCELADA) {
      throw new Error('NF-e já está cancelada');
    }

    return this.prisma.nFe.update({
      where: { id },
      data: {
        status: StatusDocumento.CANCELADA, // ✅ Usando enum
        motivoCancelamento: motivo,
        dataHoraCancelamento: new Date()
      },
      include: {
        empresa: {
          include: { endereco: true }
        },
        destinatario: {
          include: { endereco: true }
        },
        itens: true,
        duplicatas: true,
        transporte: {
          include: {
            transportadora: {
              include: { endereco: true }
            }
          }
        }
      }
    });
  }

  async getTotalVendas(empresaId: string, startDate?: Date, endDate?: Date): Promise<TotalVendasResult> {
    const where: Prisma.NFeWhereInput = {
      empresaId,
      status: StatusDocumento.AUTORIZADA // ✅ Usando enum
    };

    if (startDate && endDate) {
      where.dhEmi = {
        gte: startDate,
        lte: endDate
      };
    }

    const [result, count] = await Promise.all([
      this.prisma.nFe.aggregate({
        where,
        _sum: {
          vProd: true,
          vNF: true,
          vICMS: true,
          vPIS: true,
          vCOFINS: true,
          vIBS: true,
          vCBS: true
        }
      }),
      this.prisma.nFe.count({ where })
    ]);

    return {
      totalProdutos: Number(result._sum.vProd) || 0,
      totalNota: Number(result._sum.vNF) || 0,
      totalICMS: Number(result._sum.vICMS) || 0,
      totalPIS: Number(result._sum.vPIS) || 0,
      totalCOFINS: Number(result._sum.vCOFINS) || 0,
      totalIBS: Number(result._sum.vIBS) || 0,
      totalCBS: Number(result._sum.vCBS) || 0,
      quantidade: count
    };
  }

  async getEstatisticas(empresaId: string) {
    const statusCounts = await this.prisma.nFe.groupBy({
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

    const where: Prisma.NFeWhereInput = {
      empresaId,
      status: StatusDocumento.AUTORIZADA,
      dhEmi: {
        gte: inicio,
        lte: fim
      }
    };

    const [result, count] = await Promise.all([
      this.prisma.nFe.aggregate({
        where,
        _sum: {
          vNF: true,
          vICMS: true,
          vPIS: true,
          vCOFINS: true,
          vIBS: true,
          vCBS: true
        }
      }),
      this.prisma.nFe.count({ where })
    ]);

    return {
      mes,
      ano,
      totalNotas: count,
      valorTotal: Number(result._sum.vNF) || 0,
      totalICMS: Number(result._sum.vICMS) || 0,
      totalPIS: Number(result._sum.vPIS) || 0,
      totalCOFINS: Number(result._sum.vCOFINS) || 0,
      totalIBS: Number(result._sum.vIBS) || 0,
      totalCBS: Number(result._sum.vCBS) || 0
    };
  }

  async findByNumeroSerie(empresaId: string, numero: number, serie: number) {
    return this.prisma.nFe.findFirst({
      where: {
        empresaId,
        numero,
        serie,
        NOT: {
          status: StatusDocumento.CANCELADA
        }
      }
    });
  }

  async getUltimaNFe(empresaId: string) {
    return this.prisma.nFe.findFirst({
      where: { empresaId },
      orderBy: { numero: 'desc' },
      select: {
        numero: true,
        serie: true,
        chaveAcesso: true,
        dhEmi: true,
        status: true
      }
    });
  }

  async criarEvento(data: Prisma.EventoNFeUncheckedCreateInput) {
    return this.prisma.eventoNFe.create({ data });
  }

  async criarInutilizacao(data: Prisma.InutilizacaoNFeUncheckedCreateInput) {
    return this.prisma.inutilizacaoNFe.create({ data });
  }

  async contarEventosPorTipo(nfeId: string, tpEvento: string) {
    return this.prisma.eventoNFe.count({ where: { nfeId, tpEvento } });
  }

  async findByProtocolo(protocolo: string) {
    // ✅ VALIDA TProt (15 ou 17 dígitos)
    if (!/^[0-9]{15}$/.test(protocolo) && !/^[0-9]{17}$/.test(protocolo)) {
      throw new Error('Protocolo inválido: deve ter 15 ou 17 dígitos (TProt)');
    }

    return this.prisma.nFe.findFirst({
      where: { protocoloAutorizacao: protocolo },
      include: {
        empresa: {
          include: { endereco: true }
        },
        destinatario: {
          include: { endereco: true }
        },
        itens: true,
        duplicatas: true,
        transporte: {
          include: {
            transportadora: {
              include: { endereco: true }
            }
          }
        }
      }
    });
  }
}