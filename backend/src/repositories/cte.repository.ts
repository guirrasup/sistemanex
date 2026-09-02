// src/repositories/cte.repository.ts

import { prisma } from '../config/prisma';
import { StatusDocumento } from '@prisma/client';

export interface FiltroCte {
  status?: StatusDocumento | StatusDocumento[];
  dataInicio?: Date;
  dataFim?: Date;
  remetenteId?: string;
  destinatarioId?: string;
  numero?: number;
  serie?: number;
  chave?: string;
  modal?: string;
  tpCTe?: string;
}

export class CteRepository {
  /**
   * 🔍 LISTAR CT-e COM FILTROS
   */
  async findAll(empresaId: string, page: number = 1, limit: number = 50, filtros?: FiltroCte) {
    const skip = (page - 1) * limit;

    const where: any = {
      empresaId,
      ...(filtros?.status && {
        status: Array.isArray(filtros.status) 
          ? { in: filtros.status } 
          : filtros.status
      }),
      ...(filtros?.dataInicio && {
        dataHoraEmissao: {
          gte: filtros.dataInicio
        }
      }),
      ...(filtros?.dataFim && {
        dataHoraEmissao: {
          lte: filtros.dataFim
        }
      }),
      ...(filtros?.remetenteId && { remetenteId: filtros.remetenteId }),
      ...(filtros?.destinatarioId && { destinatarioId: filtros.destinatarioId }),
      ...(filtros?.numero && { numero: filtros.numero }),
      ...(filtros?.serie !== undefined && { serie: filtros.serie }),
      ...(filtros?.chave && { chaveAcesso: filtros.chave }),
      ...(filtros?.modal && { modal: filtros.modal }),
      ...(filtros?.tpCTe && { tpCTe: filtros.tpCTe }),
    };

    const [data, total] = await Promise.all([
      prisma.cTe.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          emitente: true,
          remetente: true,
          destinatario: true,
          transportadora: true,
          componentes: true,
          quantidades: true,
          documentos: {
            include: {
              unidadesCarga: {
                include: { lacres: true }
              },
              unidadesTransporte: {
                include: { lacres: true }
              }
            }
          },
          duplicatas: true,
          observacoes: true,
          observacoesFisco: true,
          autorizadosDownload: true,
          complementos: true,
          substitutos: true,
          globalizados: true,
          servicosVinculados: true,
          historicoStatus: true,
        }
      }),
      prisma.cTe.count({ where })
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
   * 🔍 BUSCAR CT-e POR ID
   */
  async findById(id: string) {
    return prisma.cTe.findUnique({
      where: { id },
      include: {
        emitente: true,
        remetente: true,
        destinatario: true,
        transportadora: true,
        componentes: true,
        quantidades: true,
        documentos: {
          include: {
            unidadesCarga: {
              include: { lacres: true }
            },
            unidadesTransporte: {
              include: { lacres: true }
            }
          }
        },
        duplicatas: true,
        observacoes: true,
        observacoesFisco: true,
        autorizadosDownload: true,
        complementos: true,
        substitutos: true,
        globalizados: true,
        servicosVinculados: true,
        historicoStatus: true,
      }
    });
  }

  /**
   * 🔍 BUSCAR CT-e POR CHAVE DE ACESSO
   */
  async findByChave(chave: string) {
    return prisma.cTe.findUnique({
      where: { chaveAcesso: chave },
      include: {
        emitente: true,
        remetente: true,
        destinatario: true,
        transportadora: true,
        componentes: true,
        quantidades: true,
        documentos: {
          include: {
            unidadesCarga: {
              include: { lacres: true }
            },
            unidadesTransporte: {
              include: { lacres: true }
            }
          }
        },
        duplicatas: true,
        observacoes: true,
        observacoesFisco: true,
        autorizadosDownload: true,
        complementos: true,
        substitutos: true,
        globalizados: true,
        servicosVinculados: true,
        historicoStatus: true,
      }
    });
  }

  /**
   * 🔍 BUSCAR CT-e POR PROTOCOLO
   */
  async findByProtocolo(protocolo: string) {
    return prisma.cTe.findFirst({
      where: { protocoloAutorizacao: protocolo },
      include: {
        emitente: true,
        remetente: true,
        destinatario: true,
        transportadora: true,
        componentes: true,
        quantidades: true,
        documentos: {
          include: {
            unidadesCarga: {
              include: { lacres: true }
            },
            unidadesTransporte: {
              include: { lacres: true }
            }
          }
        },
        duplicatas: true,
        observacoes: true,
        observacoesFisco: true,
        autorizadosDownload: true,
        complementos: true,
        substitutos: true,
        globalizados: true,
        servicosVinculados: true,
        historicoStatus: true,
      }
    });
  }

  /**
   * 📝 CRIAR CT-e
   */
  async create(data: any) {
    return prisma.cTe.create({
      data: {
        // IDENTIFICAÇÃO (ide)
        versao: data.versao || '4.00',
        cUF: data.cUF,
        cCT: data.cCT,
        CFOP: data.CFOP,
        natOp: data.natOp,
        mod: data.mod || '57',
        serie: data.serie,
        nCT: data.nCT,
        dhEmi: data.dhEmi || new Date(),
        tpImp: data.tpImp || '1',
        tpEmis: data.tpEmis || '1',
        cDV: data.cDV,
        tpAmb: data.tpAmb || 1,
        tpCTe: data.tpCTe || 'NORMAL',
        procEmi: data.procEmi || '0',
        verProc: data.verProc || 'SUP-TECNOLOGIA-1.0',
        indGlobalizado: data.indGlobalizado || false,
        cMunEnv: data.cMunEnv,
        xMunEnv: data.xMunEnv,
        UFEnv: data.UFEnv,
        modal: data.modal,
        tpServ: data.tpServ || 0,
        cMunIni: data.cMunIni,
        xMunIni: data.xMunIni,
        UFIni: data.UFIni,
        cMunFim: data.cMunFim,
        xMunFim: data.xMunFim,
        UFFim: data.UFFim,
        retira: data.retira || '1',
        xDetRetira: data.xDetRetira,
        indIEToma: data.indIEToma || '9',

        // TOMADOR
        toma: data.tomadorServico || 0,
        tomadorCNPJ: data.tomadorCNPJ,
        tomadorCPF: data.tomadorCPF,
        tomadorIE: data.tomadorIE,
        tomadorxNome: data.tomadorxNome,
        tomadorxFant: data.tomadorxFant,
        tomadorFone: data.tomadorFone,
        tomadorEmail: data.tomadorEmail,
        tomadorxLgr: data.tomadorxLgr,
        tomadorNro: data.tomadorNro,
        tomadorxCpl: data.tomadorxCpl,
        tomadorxBairro: data.tomadorxBairro,
        tomadorcMun: data.tomadorcMun,
        tomadorxMun: data.tomadorxMun,
        tomadorCEP: data.tomadorCEP,
        tomadorUF: data.tomadorUF,
        tomadorcPais: data.tomadorcPais,
        tomadorxPais: data.tomadorxPais,

        // CONTINGÊNCIA
        dhCont: data.dhCont,
        xJust: data.xJust,

        // DADOS COMPLEMENTARES
        xCaracAd: data.xCaracAd,
        xCaracSer: data.xCaracSer,
        xEmi: data.xEmi,
        xOrig: data.xOrig,
        xDest: data.xDest,
        xRota: data.xRota,

        // PREVISÃO DE ENTREGA
        tpPer: data.tpPer,
        dProg: data.dProg,
        dIni: data.dIni,
        dFim: data.dFim,
        tpHor: data.tpHor,
        hProg: data.hProg,
        hIni: data.hIni,
        hFim: data.hFim,

        origCalc: data.origCalc,
        destCalc: data.destCalc,
        xObs: data.xObs,

        // VALORES DA PRESTAÇÃO
        vTPrest: data.vTPrest,
        vRec: data.vRec,

        // IMPOSTOS - ICMS00
        CST00: data.CST00,
        vBC00: data.vBC00,
        pICMS00: data.pICMS00,
        vICMS00: data.vICMS00,

        // ICMS20
        CST20: data.CST20,
        pRedBC20: data.pRedBC20,
        vBC20: data.vBC20,
        pICMS20: data.pICMS20,
        vICMS20: data.vICMS20,

        // ICMS45
        CST45: data.CST45,
        vICMSDeson45: data.vICMSDeson45,
        cBenef45: data.cBenef45,

        // ICMS60
        CST60: data.CST60,
        vBCSTRet: data.vBCSTRet,
        vICMSSTRet: data.vICMSSTRet,
        pICMSSTRet: data.pICMSSTRet,
        vCred: data.vCred,

        // ICMS90
        CST90: data.CST90,
        pRedBC90: data.pRedBC90,
        vBC90: data.vBC90,
        pICMS90: data.pICMS90,
        vICMS90: data.vICMS90,
        vCred90: data.vCred90,

        // ICMSOutraUF
        CSTOutraUF: data.CSTOutraUF,
        pRedBCOutraUF: data.pRedBCOutraUF,
        vBCOutraUF: data.vBCOutraUF,
        pICMSOutraUF: data.pICMSOutraUF,
        vICMSOutraUF: data.vICMSOutraUF,

        // ICMSSN
        CSTSN: data.CSTSN,
        indSN: data.indSN,

        // ICMSUFFim
        vBCUFFim: data.vBCUFFim,
        pFCPUFFim: data.pFCPUFFim,
        pICMSUFFim: data.pICMSUFFim,
        pICMSInter: data.pICMSInter,
        vFCPUFFim: data.vFCPUFFim,
        vICMSUFFim: data.vICMSUFFim,
        vICMSUFIni: data.vICMSUFIni,

        // IBS/CBS
        CSTIBSCBS: data.CSTIBSCBS,
        cClassTrib: data.cClassTrib,
        indDoacao: data.indDoacao,
        vBCIBS: data.vBCIBS,
        pIBSUF: data.pIBSUF,
        pDifIBSUF: data.pDifIBSUF,
        vDifIBSUF: data.vDifIBSUF,
        vDevTribIBSUF: data.vDevTribIBSUF,
        pRedAliqIBSUF: data.pRedAliqIBSUF,
        pAliqEfetIBSUF: data.pAliqEfetIBSUF,
        vIBSUF: data.vIBSUF,
        pIBSMun: data.pIBSMun,
        pDifIBSMun: data.pDifIBSMun,
        vDifIBSMun: data.vDifIBSMun,
        vDevTribIBSMun: data.vDevTribIBSMun,
        pRedAliqIBSMun: data.pRedAliqIBSMun,
        pAliqEfetIBSMun: data.pAliqEfetIBSMun,
        vIBSMun: data.vIBSMun,
        vIBS: data.vIBS,
        pCBS: data.pCBS,
        pDifCBS: data.pDifCBS,
        vDifCBS: data.vDifCBS,
        vDevTribCBS: data.vDevTribCBS,
        pRedAliqCBS: data.pRedAliqCBS,
        pAliqEfetCBS: data.pAliqEfetCBS,
        vCBS: data.vCBS,
        CSTReg: data.CSTReg,
        cClassTribReg: data.cClassTribReg,
        pAliqEfetRegIBSUF: data.pAliqEfetRegIBSUF,
        vTribRegIBSUF: data.vTribRegIBSUF,
        pAliqEfetRegIBSMun: data.pAliqEfetRegIBSMun,
        vTribRegIBSMun: data.vTribRegIBSMun,
        pAliqEfetRegCBS: data.pAliqEfetRegCBS,
        vTribRegCBS: data.vTribRegCBS,
        vIBSEstCred: data.vIBSEstCred,
        vCBSEstCred: data.vCBSEstCred,

        // TOTAL DO DOCUMENTO
        vTotDFe: data.vTotDFe,

        // INFORMAÇÕES DA CARGA
        vCarga: data.vCarga,
        proPred: data.produtoPredominante,
        xOutCat: data.xOutCat,
        vCargaAverb: data.vCargaAverb,

        // VEÍCULOS NOVOS
        veicChassi: data.veicChassi,
        veicCor: data.veicCor,
        veicxCor: data.veicxCor,
        veiccMod: data.veiccMod,
        veicvUnit: data.veicvUnit,
        veicvFrete: data.veicvFrete,

        // COBRANÇA
        nFat: data.nFat,
        vOrig: data.vOrig,
        vDesc: data.vDesc,
        vLiq: data.vLiq,

        // CT-e DE SUBSTITUIÇÃO
        chCteSub: data.chCteSub,
        indAlteraToma: data.indAlteraToma,

        // CT-e GLOBALIZADO
        xObsGlobalizado: data.xObsGlobalizado,

        // STATUS
        status: data.status || 'RASCUNHO',
        chaveAcesso: data.chaveAcesso,
        protocoloAutorizacao: data.protocoloAutorizacao,
        dataHoraAutorizacao: data.dataHoraAutorizacao,
        motivoCancelamento: data.motivoCancelamento,
        dataHoraCancelamento: data.dataHoraCancelamento,
        motivoRejeicao: data.motivoRejeicao,
        dataHoraRejeicao: data.dataHoraRejeicao,
        xmlAssinado: data.xmlAssinado || '',
        xmlRetorno: data.xmlRetorno,
        xmlModal: data.xmlModal,

        // RELACIONAMENTOS
        empresaId: data.empresaId,
        emitenteId: data.emitenteId,
        remetenteId: data.remetenteId,
        destinatarioId: data.destinatarioId,
        expedidorId: data.expedidorId,
        recebedorId: data.recebedorId,
        transportadoraId: data.transportadoraId,

        // SUB-ESTRUTURAS
        componentes: data.componentes ? {
          create: data.componentes
        } : undefined,

        quantidades: data.quantidades ? {
          create: data.quantidades
        } : undefined,

        duplicatas: data.duplicatas ? {
          create: data.duplicatas
        } : undefined,

        observacoes: data.observacoes ? {
          create: data.observacoes
        } : undefined,

        observacoesFisco: data.observacoesFisco ? {
          create: data.observacoesFisco
        } : undefined,

        autorizadosDownload: data.autorizadosDownload ? {
          create: data.autorizadosDownload
        } : undefined,

        complementos: data.complementos ? {
          create: data.complementos
        } : undefined,

        substitutos: data.substitutos ? {
          create: data.substitutos
        } : undefined,

        globalizados: data.globalizados ? {
          create: data.globalizados
        } : undefined,

        servicosVinculados: data.servicosVinculados ? {
          create: data.servicosVinculados
        } : undefined,

        documentos: data.documentos ? {
          create: data.documentos
        } : undefined,
      },
      include: {
        emitente: true,
        remetente: true,
        destinatario: true,
        transportadora: true,
        componentes: true,
        quantidades: true,
        documentos: {
          include: {
            unidadesCarga: {
              include: { lacres: true }
            },
            unidadesTransporte: {
              include: { lacres: true }
            }
          }
        },
        duplicatas: true,
        observacoes: true,
        observacoesFisco: true,
        autorizadosDownload: true,
        complementos: true,
        substitutos: true,
        globalizados: true,
        servicosVinculados: true,
        historicoStatus: true,
      }
    });
  }

  /**
   * 📝 ATUALIZAR STATUS DO CT-e
   */
  async updateStatus(id: string, status: StatusDocumento, motivo?: string) {
    const data: any = { status };

    if (status === 'CANCELADA') {
      data.motivoCancelamento = motivo;
      data.dataHoraCancelamento = new Date();
    }

    if (status === 'AUTORIZADA') {
      data.dataHoraAutorizacao = new Date();
    }

    if (status === 'REJEITADA') {
      data.motivoRejeicao = motivo;
      data.dataHoraRejeicao = new Date();
    }

    return prisma.cTe.update({
      where: { id },
      data,
      include: {
        emitente: true,
        remetente: true,
        destinatario: true,
        transportadora: true,
        componentes: true,
        quantidades: true,
        documentos: {
          include: {
            unidadesCarga: {
              include: { lacres: true }
            },
            unidadesTransporte: {
              include: { lacres: true }
            }
          }
        },
        duplicatas: true,
        observacoes: true,
        observacoesFisco: true,
        autorizadosDownload: true,
        complementos: true,
        substitutos: true,
        globalizados: true,
        servicosVinculados: true,
        historicoStatus: true,
      }
    });
  }

  /**
   * 📝 ATUALIZAR CT-e (completo)
   */
  async update(id: string, data: any) {
    return prisma.cTe.update({
      where: { id },
      data,
      include: {
        emitente: true,
        remetente: true,
        destinatario: true,
        transportadora: true,
        componentes: true,
        quantidades: true,
        documentos: {
          include: {
            unidadesCarga: {
              include: { lacres: true }
            },
            unidadesTransporte: {
              include: { lacres: true }
            }
          }
        },
        duplicatas: true,
        observacoes: true,
        observacoesFisco: true,
        autorizadosDownload: true,
        complementos: true,
        substitutos: true,
        globalizados: true,
        servicosVinculados: true,
        historicoStatus: true,
      }
    });
  }

  /**
   * ❌ EXCLUIR CT-e (apenas se RASCUNHO)
   */
  async delete(id: string) {
    const cte = await prisma.cTe.findUnique({ where: { id } });

    if (!cte) {
      throw new Error('CT-e não encontrado');
    }

    if (cte.status !== 'RASCUNHO') {
      throw new Error('Apenas CT-e em RASCUNHO podem ser excluídos');
    }

    return prisma.cTe.delete({ where: { id } });
  }

  /**
   * 📊 ESTATÍSTICAS
   */
  async getEstatisticas(empresaId: string) {
    const [total, autorizadas, canceladas, processando, rejeitadas, totalFrete, totalCargas] = await Promise.all([
      prisma.cTe.count({ where: { empresaId } }),
      prisma.cTe.count({ where: { empresaId, status: 'AUTORIZADA' } }),
      prisma.cTe.count({ where: { empresaId, status: 'CANCELADA' } }),
      prisma.cTe.count({ where: { empresaId, status: 'PROCESSANDO' } }),
      prisma.cTe.count({ where: { empresaId, status: 'REJEITADA' } }),
      prisma.cTe.aggregate({
        where: { empresaId, status: 'AUTORIZADA' },
        _sum: { vTPrest: true }
      }),
      prisma.cTe.aggregate({
        where: { empresaId, status: 'AUTORIZADA' },
        _sum: { vCarga: true }
      })
    ]);

    return {
      total,
      autorizadas,
      canceladas,
      processando,
      rejeitadas,
      totalFrete: totalFrete._sum.vTPrest || 0,
      totalCarga: totalCargas._sum.vCarga || 0
    };
  }

  /**
   * 💰 TOTAL DE FRETE POR PERÍODO
   */
  async getTotalFrete(empresaId: string, dataInicio?: Date, dataFim?: Date) {
    const where: any = { 
      empresaId, 
      status: 'AUTORIZADA' 
    };

    if (dataInicio) {
      where.dataHoraEmissao = { ...where.dataHoraEmissao, gte: dataInicio };
    }
    if (dataFim) {
      where.dataHoraEmissao = { ...where.dataHoraEmissao, lte: dataFim };
    }

    const result = await prisma.cTe.aggregate({
      where,
      _sum: { vTPrest: true },
      _count: true
    });

    return {
      totalFrete: result._sum.vTPrest || 0,
      quantidade: result._count
    };
  }

  /**
   * 📊 RESUMO MENSAL
   */
  async getResumoMensal(empresaId: string, ano: number, mes: number) {
    const dataInicio = new Date(ano, mes - 1, 1);
    const dataFim = new Date(ano, mes, 0);

    const ctes = await prisma.cTe.findMany({
      where: {
        empresaId,
        status: 'AUTORIZADA',
        dataHoraEmissao: {
          gte: dataInicio,
          lte: dataFim
        }
      }
    });

    const totalFrete = ctes.reduce((acc, c) => acc + (c.vTPrest || 0), 0);
    const totalCarga = ctes.reduce((acc, c) => acc + (c.vCarga || 0), 0);

    return {
      mes,
      ano,
      quantidade: ctes.length,
      totalFrete,
      totalCarga,
      mediaFrete: ctes.length > 0 ? totalFrete / ctes.length : 0
    };
  }

  /**
   * 📊 CT-e POR CLIENTE
   */
  async findByCliente(clienteId: string, tipo: string, dataInicio?: Date, dataFim?: Date) {
    const where: any = {
      status: 'AUTORIZADA'
    };

    if (tipo === 'REMETENTE' || tipo === 'AMBOS') {
      where.remetenteId = clienteId;
    } else if (tipo === 'DESTINATARIO' || tipo === 'AMBOS') {
      where.destinatarioId = clienteId;
    }

    if (dataInicio) {
      where.dataHoraEmissao = { ...where.dataHoraEmissao, gte: dataInicio };
    }
    if (dataFim) {
      where.dataHoraEmissao = { ...where.dataHoraEmissao, lte: dataFim };
    }

    return prisma.cTe.findMany({
      where,
      include: {
        emitente: true,
        remetente: true,
        destinatario: true,
        transportadora: true,
        componentes: true,
        quantidades: true,
      },
      orderBy: { dataHoraEmissao: 'desc' }
    });
  }

  /**
   * 📊 CT-e POR TRANSPORTADORA
   */
  async findByTransportadora(transportadoraId: string, dataInicio?: Date, dataFim?: Date) {
    const where: any = {
      transportadoraId,
      status: 'AUTORIZADA'
    };

    if (dataInicio) {
      where.dataHoraEmissao = { ...where.dataHoraEmissao, gte: dataInicio };
    }
    if (dataFim) {
      where.dataHoraEmissao = { ...where.dataHoraEmissao, lte: dataFim };
    }

    return prisma.cTe.findMany({
      where,
      include: {
        emitente: true,
        remetente: true,
        destinatario: true,
        transportadora: true,
        componentes: true,
        quantidades: true,
      },
      orderBy: { dataHoraEmissao: 'desc' }
    });
  }

  /**
   * 📊 CT-e POR MODAL
   */
  async findByModal(modal: string, dataInicio?: Date, dataFim?: Date) {
    const where: any = {
      modal,
      status: 'AUTORIZADA'
    };

    if (dataInicio) {
      where.dataHoraEmissao = { ...where.dataHoraEmissao, gte: dataInicio };
    }
    if (dataFim) {
      where.dataHoraEmissao = { ...where.dataHoraEmissao, lte: dataFim };
    }

    return prisma.cTe.findMany({
      where,
      include: {
        emitente: true,
        remetente: true,
        destinatario: true,
        transportadora: true,
        componentes: true,
        quantidades: true,
      },
      orderBy: { dataHoraEmissao: 'desc' }
    });
  }

  /**
   * 📊 CT-e POR STATUS
   */
  async findByStatus(status: StatusDocumento, dataInicio?: Date, dataFim?: Date) {
    const where: any = { status };

    if (dataInicio) {
      where.dataHoraEmissao = { ...where.dataHoraEmissao, gte: dataInicio };
    }
    if (dataFim) {
      where.dataHoraEmissao = { ...where.dataHoraEmissao, lte: dataFim };
    }

    return prisma.cTe.findMany({
      where,
      include: {
        emitente: true,
        remetente: true,
        destinatario: true,
        transportadora: true,
        componentes: true,
        quantidades: true,
      },
      orderBy: { dataHoraEmissao: 'desc' }
    });
  }

  /**
   * 🔄 BUSCAR CT-e SUBSTITUÍDO
   */
  async buscarCteSubstituido(chave: string) {
    return prisma.cTe.findFirst({
      where: { chCteSub: chave },
      include: {
        emitente: true,
        remetente: true,
        destinatario: true,
        transportadora: true,
        componentes: true,
        quantidades: true,
        documentos: {
          include: {
            unidadesCarga: {
              include: { lacres: true }
            },
            unidadesTransporte: {
              include: { lacres: true }
            }
          }
        },
        duplicatas: true,
        observacoes: true,
        observacoesFisco: true,
        autorizadosDownload: true,
        complementos: true,
        substitutos: true,
        globalizados: true,
        servicosVinculados: true,
        historicoStatus: true,
      }
    });
  }

  /**
   * 🔄 BUSCAR CT-e COMPLEMENTADO
   */
  async buscarCteComplementado(chave: string) {
    return prisma.cTe.findFirst({
      where: { 
        complementos: {
          some: { chCTe: chave }
        }
      },
      include: {
        emitente: true,
        remetente: true,
        destinatario: true,
        transportadora: true,
        componentes: true,
        quantidades: true,
        documentos: {
          include: {
            unidadesCarga: {
              include: { lacres: true }
            },
            unidadesTransporte: {
              include: { lacres: true }
            }
          }
        },
        duplicatas: true,
        observacoes: true,
        observacoesFisco: true,
        autorizadosDownload: true,
        complementos: true,
        substitutos: true,
        globalizados: true,
        servicosVinculados: true,
        historicoStatus: true,
      }
    });
  }
}