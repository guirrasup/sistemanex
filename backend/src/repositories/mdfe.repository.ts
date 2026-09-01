// src/repositories/mdfe.repository.ts

import { Prisma, StatusMDFe } from '@prisma/client';
import { BaseRepository } from './base.repository';

// ============================================================
// INTERFACES
// ============================================================

export interface FiltroMDFe {
  empresaId: string;
  status?: StatusMDFe | StatusMDFe[];
  dataInicio?: Date;
  dataFim?: Date;
  modal?: string;
  numero?: number;
  serie?: number;
  chaveAcesso?: string;
  page?: number;
  limit?: number;
}

export interface TotalCargaMDFeResult {
  valorTotal: number;
  pesoTotal: number;
  quantidade: number;
  qCTe: number;
  qNFe: number;
  qMDFe: number;
}

// ============================================================
// REPOSITÓRIO
// ============================================================

export class MdfeRepository extends BaseRepository {

  /**
   * 🔍 Busca MDF-e por ID com todos os relacionamentos
   */
  async findById(id: string) {
    if (!id) {
      throw new Error('ID do MDF-e é obrigatório');
    }

    return this.prisma.mDFe.findUnique({
      where: { id },
      include: {
        empresa: {
          include: { endereco: true }
        },
        emitente: {
          include: { endereco: true }
        },
        municipiosCarrega: true,
        percursos: true,
        municipiosDescarga: {
          include: {
            ctes: {
              include: {
                unidadesTransporte: {
                  include: {
                    unidadesCarga: true,
                    lacres: true
                  }
                },
                perigosos: true,
                nfesParciais: true
              }
            },
            nfes: {
              include: {
                unidadesTransporte: {
                  include: {
                    unidadesCarga: true,
                    lacres: true
                  }
                },
                perigosos: true
              }
            },
            mdfesTransp: {
              include: {
                unidadesTransporte: {
                  include: {
                    unidadesCarga: true,
                    lacres: true
                  }
                },
                perigosos: true
              }
            }
          }
        },
        seguros: true,
        lacres: true,
        autorizadosDownload: true,
        historicoStatus: true,
        encerramento: true
      }
    });
  }

  /**
   * 🔍 Busca MDF-e por Chave de Acesso (44 dígitos)
   */
  async findByChave(chaveAcesso: string) {
    if (!/^[0-9]{44}$/.test(chaveAcesso)) {
      throw new Error('Chave de acesso inválida: deve ter 44 dígitos');
    }

    return this.prisma.mDFe.findUnique({
      where: { chaveAcesso },
      include: {
        empresa: {
          include: { endereco: true }
        },
        emitente: {
          include: { endereco: true }
        },
        municipiosCarrega: true,
        percursos: true,
        municipiosDescarga: {
          include: {
            ctes: {
              include: {
                unidadesTransporte: {
                  include: {
                    unidadesCarga: true,
                    lacres: true
                  }
                },
                perigosos: true,
                nfesParciais: true
              }
            },
            nfes: {
              include: {
                unidadesTransporte: {
                  include: {
                    unidadesCarga: true,
                    lacres: true
                  }
                },
                perigosos: true
              }
            },
            mdfesTransp: {
              include: {
                unidadesTransporte: {
                  include: {
                    unidadesCarga: true,
                    lacres: true
                  }
                },
                perigosos: true
              }
            }
          }
        },
        seguros: true,
        lacres: true,
        autorizadosDownload: true,
        historicoStatus: true,
        encerramento: true
      }
    });
  }

  /**
   * 📋 Lista MDF-e com filtros avançados
   */
  async findAll(filtros: FiltroMDFe) {
    const {
      empresaId,
      status,
      dataInicio,
      dataFim,
      modal,
      numero,
      serie,
      chaveAcesso,
      page = 1,
      limit = 50
    } = filtros;

    const skip = (page - 1) * limit;

    // 🔥 CONSTRÓI WHERE DINÂMICO
    const where: Prisma.MDFeWhereInput = { empresaId };

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

    // ✅ Filtro por modal
    if (modal) {
      where.modal = modal as any;
    }

    // ✅ Filtro por número
    if (numero !== undefined) {
      where.numero = numero;
    }

    // ✅ Filtro por série
    if (serie !== undefined) {
      where.serie = serie;
    }

    // ✅ Filtro por chave de acesso
    if (chaveAcesso) {
      if (!/^[0-9]{44}$/.test(chaveAcesso)) {
        throw new Error('Chave de acesso inválida: deve ter 44 dígitos');
      }
      where.chaveAcesso = chaveAcesso;
    }

    // 🔥 EXECUTA CONSULTA
    const [data, total] = await Promise.all([
      this.prisma.mDFe.findMany({
        where,
        include: {
          empresa: {
            include: { endereco: true }
          },
          emitente: {
            include: { endereco: true }
          },
          municipiosCarrega: true,
          municipiosDescarga: {
            include: {
              ctes: true,
              nfes: true,
              mdfesTransp: true
            }
          },
          seguros: true,
          lacres: true,
          encerramento: true
        },
        skip,
        take: limit,
        orderBy: { dhEmi: 'desc' }
      }),
      this.prisma.mDFe.count({ where })
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
   * 📝 Cria um novo MDF-e
   */
  async create(data: Prisma.MDFeCreateInput) {
    if (!data.chaveAcesso) {
      throw new Error('Chave de acesso é obrigatória');
    }
    if (!/^[0-9]{44}$/.test(data.chaveAcesso)) {
      throw new Error('Chave de acesso inválida: deve ter 44 dígitos');
      }
      if (!data.empresaId) {
        throw new Error('Empresa é obrigatória');
      }

      return this.prisma.mDFe.create({
        data,
        include: {
          empresa: {
            include: { endereco: true }
          },
          emitente: {
            include: { endereco: true }
          },
          municipiosCarrega: true,
          municipiosDescarga: {
            include: {
              ctes: {
                include: {
                  unidadesTransporte: {
                    include: {
                      unidadesCarga: true,
                      lacres: true
                    }
                  },
                  perigosos: true,
                  nfesParciais: true
                }
              },
              nfes: {
                include: {
                  unidadesTransporte: {
                    include: {
                      unidadesCarga: true,
                      lacres: true
                    }
                  },
                  perigosos: true
                }
              },
              mdfesTransp: {
                include: {
                  unidadesTransporte: {
                    include: {
                      unidadesCarga: true,
                      lacres: true
                    }
                  },
                  perigosos: true
                }
              }
            }
          },
          seguros: true,
          lacres: true,
          autorizadosDownload: true
        }
      });
    }

    /**
     * 📝 Atualiza o status do MDF-e
     */
    async updateStatus(id: string, status: StatusMDFe, protocolo?: string) {
      if (!id) {
        throw new Error('ID do MDF-e é obrigatório');
      }

      const data: Prisma.MDFeUpdateInput = { status };

      if (protocolo) {
        data.protocoloAutorizacao = protocolo;
        data.dataHoraAutorizacao = new Date();
      }

      return this.prisma.mDFe.update({
        where: { id },
        data,
        include: {
          empresa: {
            include: { endereco: true }
          },
          emitente: {
            include: { endereco: true }
          },
          municipiosCarrega: true,
          municipiosDescarga: {
            include: {
              ctes: true,
              nfes: true,
              mdfesTransp: true
            }
          },
          seguros: true,
          lacres: true,
          encerramento: true
        }
      });
    }

    /**
     * ❌ Cancela um MDF-e
     */
    async cancelar(id: string, motivo: string) {
      if (!id) {
        throw new Error('ID do MDF-e é obrigatório');
      }

      if (motivo.length < 15) {
        throw new Error('Motivo deve ter no mínimo 15 caracteres');
      }
      if (motivo.length > 255) {
        throw new Error('Motivo deve ter no máximo 255 caracteres');
      }

      const mdfeExistente = await this.prisma.mDFe.findUnique({
        where: { id },
        select: { status: true }
      });

      if (!mdfeExistente) {
        throw new Error('MDF-e não encontrado');
      }

      if (mdfeExistente.status === 'CANCELADA') {
        throw new Error('MDF-e já está cancelado');
      }

      return this.prisma.mDFe.update({
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
          emitente: {
            include: { endereco: true }
          },
          municipiosCarrega: true,
          municipiosDescarga: {
            include: {
              ctes: true,
              nfes: true,
              mdfesTransp: true
            }
          },
          seguros: true,
          lacres: true,
          encerramento: true
        }
      });
    }

    /**
     * 🚩 Encerra um MDF-e
     */
    async encerrar(id: string, protocolo: string, municipioEncerramento: string) {
      if (!id) {
        throw new Error('ID do MDF-e é obrigatório');
      }

      const mdfeExistente = await this.prisma.mDFe.findUnique({
        where: { id },
        select: { status: true }
      });

      if (!mdfeExistente) {
        throw new Error('MDF-e não encontrado');
      }

      if (mdfeExistente.status === 'ENCERRADA') {
        throw new Error('MDF-e já está encerrado');
      }

      return this.prisma.$transaction([
        this.prisma.mDFe.update({
          where: { id },
          data: {
            status: 'ENCERRADA',
            dataHoraEncerramento: new Date()
          }
        }),
        this.prisma.encerramentoMDFe.create({
          data: {
            mdfe: { connect: { id } },
            nProt: protocolo,
            dhEnc: new Date(),
            xMunEnc: municipioEncerramento
          }
        })
      ]);
    }

    /**
     * 💰 Obtém total de carga transportada por período
     */
    async getTotalCarga(empresaId: string, startDate?: Date, endDate?: Date): Promise<TotalCargaMDFeResult> {
      const where: Prisma.MDFeWhereInput = {
        empresaId,
        status: 'AUTORIZADA'
      };

      if (startDate && endDate) {
        where.dhEmi = {
          gte: startDate,
          lte: endDate
        };
      }

      const [result, count, qCTe, qNFe, qMDFe] = await Promise.all([
        this.prisma.mDFe.aggregate({
          where,
          _sum: {
            vCarga: true,
            qCarga: true
          }
        }),
        this.prisma.mDFe.count({ where }),
        this.prisma.mDFe.aggregate({
          where,
          _sum: {
            qCTe: true
          }
        }),
        this.prisma.mDFe.aggregate({
          where,
          _sum: {
            qNFe: true
          }
        }),
        this.prisma.mDFe.aggregate({
          where,
          _sum: {
            qMDFe: true
          }
        })
      ]);

      return {
        valorTotal: Number(result._sum.vCarga) || 0,
        pesoTotal: Number(result._sum.qCarga) || 0,
        quantidade: count,
        qCTe: Number(qCTe._sum.qCTe) || 0,
        qNFe: Number(qNFe._sum.qNFe) || 0,
        qMDFe: Number(qMDFe._sum.qMDFe) || 0
      };
    }

    /**
     * 📊 Obtém estatísticas de MDF-e por status
     */
    async getEstatisticas(empresaId: string) {
      const statusCounts = await this.prisma.mDFe.groupBy({
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
     * 🔍 Busca MDF-e por número e série
     */
    async findByNumeroSerie(empresaId: string, numero: number, serie: number) {
      return this.prisma.mDFe.findFirst({
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

    /**
     * 📊 Obtém o último MDF-e emitido
     */
    async getUltimoMDFe(empresaId: string) {
      return this.prisma.mDFe.findFirst({
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
  }