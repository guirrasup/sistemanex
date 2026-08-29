// C:\emissornfe\backend\src\repositories\nfe.repository.ts

import { Prisma, StatusDocumento } from '@prisma/client';
import { BaseRepository } from './base.repository';
import { TChNFe, TProt, TJust } from '../../src/types/fiscal';

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
  
  /**
   * 🔍 Busca NF-e por ID com todos os relacionamentos
   */
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

  /**
   * 🔍 Busca NF-e por Chave de Acesso (TChNFe - 44 dígitos)
   * ✅ Valida TChNFe (PL_006h)
   */
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

  /**
   * 🔍 Lista NF-e com filtros avançados
   * ✅ Suporte a múltiplos status
   * ✅ Filtro por período, destinatário, número, série
   */
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
      where.dataHoraEmissao = {};
      if (dataInicio) {
        where.dataHoraEmissao.gte = dataInicio;
      }
      if (dataFim) {
        where.dataHoraEmissao.lte = dataFim;
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
        orderBy: { dataHoraEmissao: 'desc' }
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

  /**
   * 📝 Cria uma nova NF-e
   * ✅ Usa StatusDocumento enum do Prisma
   * ✅ Valida dados obrigatórios
   */
  async create(data: Prisma.NFeCreateInput) {
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

  /**
   * 📝 Atualiza o status da NF-e
   * ✅ Usa StatusDocumento enum do Prisma
   * ✅ Valida TProt (15 ou 17 dígitos)
   */
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

  /**
   * ❌ Cancela uma NF-e
   * ✅ Usa StatusDocumento enum do Prisma
   * ✅ Valida TJust (15-255 caracteres)
   * ✅ Verifica se a NF-e já está cancelada
   */
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

  /**
   * 💰 Obtém total de vendas por período
   * ✅ Inclui IBS e CBS (Reforma Tributária 2026)
   * ✅ Retorna quantidade de notas
   */
  async getTotalVendas(empresaId: string, startDate?: Date, endDate?: Date): Promise<TotalVendasResult> {
    const where: Prisma.NFeWhereInput = {
      empresaId,
      status: StatusDocumento.AUTORIZADA // ✅ Usando enum
    };

    if (startDate && endDate) {
      where.dataHoraEmissao = {
        gte: startDate,
        lte: endDate
      };
    }

    const [result, count] = await Promise.all([
      this.prisma.nFe.aggregate({
        where,
        _sum: {
          valorTotalProdutos: true,
          valorTotalNota: true,
          valorTotalICMS: true,
          valorTotalPIS: true,
          valorTotalCOFINS: true,
          valorTotalIBS: true,
          valorTotalCBS: true
        }
      }),
      this.prisma.nFe.count({ where })
    ]);

    return {
      totalProdutos: Number(result._sum.valorTotalProdutos) || 0,
      totalNota: Number(result._sum.valorTotalNota) || 0,
      totalICMS: Number(result._sum.valorTotalICMS) || 0,
      totalPIS: Number(result._sum.valorTotalPIS) || 0,
      totalCOFINS: Number(result._sum.valorTotalCOFINS) || 0,
      totalIBS: Number(result._sum.valorTotalIBS) || 0,
      totalCBS: Number(result._sum.valorTotalCBS) || 0,
      quantidade: count
    };
  }

  /**
   * 📊 Obtém estatísticas de NF-e por status
   */
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

  /**
   * 📊 Obtém resumo mensal de NF-e (para dashboard)
   */
  async getResumoMensal(empresaId: string, ano: number, mes: number) {
    const inicio = new Date(ano, mes - 1, 1);
    const fim = new Date(ano, mes, 0);

    const where: Prisma.NFeWhereInput = {
      empresaId,
      status: StatusDocumento.AUTORIZADA,
      dataHoraEmissao: {
        gte: inicio,
        lte: fim
      }
    };

    const [result, count] = await Promise.all([
      this.prisma.nFe.aggregate({
        where,
        _sum: {
          valorTotalNota: true,
          valorTotalICMS: true,
          valorTotalPIS: true,
          valorTotalCOFINS: true,
          valorTotalIBS: true,
          valorTotalCBS: true
        }
      }),
      this.prisma.nFe.count({ where })
    ]);

    return {
      mes,
      ano,
      totalNotas: count,
      valorTotal: Number(result._sum.valorTotalNota) || 0,
      totalICMS: Number(result._sum.valorTotalICMS) || 0,
      totalPIS: Number(result._sum.valorTotalPIS) || 0,
      totalCOFINS: Number(result._sum.valorTotalCOFINS) || 0,
      totalIBS: Number(result._sum.valorTotalIBS) || 0,
      totalCBS: Number(result._sum.valorTotalCBS) || 0
    };
  }

  /**
   * 🔍 Busca NF-e por número e série (para validação de duplicidade)
   */
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

  /**
   * 📊 Obtém a última NF-e emitida
   */
  async getUltimaNFe(empresaId: string) {
    return this.prisma.nFe.findFirst({
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

  /**
   * 🔍 Busca NF-e por protocolo de autorização (TProt)
   */
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