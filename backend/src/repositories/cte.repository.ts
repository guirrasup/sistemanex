// backend/src/repositories/cte.repository.ts
import { Prisma, PrismaClient, StatusDocumento } from '@prisma/client';

const prisma = new PrismaClient();

// 🔥 LIMITES DE PAGINAÇÃO (mitigação CWE-770 / CWE-400)
const MAX_PAGE_SIZE = 100;
const MAX_FIND_MANY_LIMIT = 500;

// 🔥 INCLUDES PADRONIZADOS
const CTE_INCLUDE_BASICO = {
  emitente: true,
  remetente: true,
  destinatario: true,
  transportadora: true,
  componentes: true,
  quantidades: true,
} as const;

const CTE_INCLUDE_COMPLETO = {
  ...CTE_INCLUDE_BASICO,
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
} as const;

// 🔥 Helper para mesclar filtro de data sem sobrescrever gte/lte
function buildDateFilter(dataInicio?: Date, dataFim?: Date) {
  if (!dataInicio && !dataFim) return undefined;
  return {
    ...(dataInicio && { gte: dataInicio }),
    ...(dataFim && { lte: dataFim })
  };
}

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
  async findAll(empresaId: string, page: number = 1, limit: number = 50, filtros?: FiltroCte) {
    const pageSegura = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
    const limitSeguro = Number.isFinite(limit) && limit > 0
      ? Math.min(Math.floor(limit), MAX_PAGE_SIZE)
      : 50;

    const skip = (pageSegura - 1) * limitSeguro;

    const where: Prisma.CTeWhereInput = {
      empresaId,
      ...(filtros?.status && {
        status: Array.isArray(filtros.status)
          ? { in: filtros.status }
          : filtros.status
      }),
      ...(buildDateFilter(filtros?.dataInicio, filtros?.dataFim) && {
        dataHoraEmissao: buildDateFilter(filtros?.dataInicio, filtros?.dataFim)
      }),
      ...(filtros?.remetenteId && { remetenteId: filtros.remetenteId }),
      ...(filtros?.destinatarioId && { destinatarioId: filtros.destinatarioId }),
      ...(filtros?.numero !== undefined && { numero: filtros.numero }),
      ...(filtros?.serie !== undefined && { serie: filtros.serie }),
      ...(filtros?.chave && { chaveAcesso: filtros.chave }),
      ...(filtros?.modal && { modal: filtros.modal }),
      ...(filtros?.tpCTe && { tpCTe: filtros.tpCTe }),
    };

    const [data, total] = await Promise.all([
      prisma.cTe.findMany({
        where,
        skip,
        take: limitSeguro,
        orderBy: { createdAt: 'desc' },
        include: CTE_INCLUDE_COMPLETO
      }),
      prisma.cTe.count({ where })
    ]);

    return {
      data,
      total,
      page: pageSegura,
      limit: limitSeguro,
      totalPages: Math.ceil(total / limitSeguro)
    };
  }

  async findById(id: string, empresaId: string) {
    return prisma.cTe.findFirst({
      where: { id, empresaId },
      include: CTE_INCLUDE_COMPLETO
    });
  }

  async findByChave(chave: string, empresaId: string) {
    return prisma.cTe.findFirst({
      where: { chaveAcesso: chave, empresaId },
      include: CTE_INCLUDE_COMPLETO
    });
  }

  async findByProtocolo(protocolo: string, empresaId: string) {
    return prisma.cTe.findFirst({
      where: { protocoloAutorizacao: protocolo, empresaId },
      include: CTE_INCLUDE_COMPLETO
    });
  }

  async create(data: any) {
    if (!data.empresaId) {
      throw new Error('empresaId é obrigatório');
    }

    const payload: Prisma.CTeCreateInput = {
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

      dhCont: data.dhCont,
      xJust: data.xJust,

      xCaracAd: data.xCaracAd,
      xCaracSer: data.xCaracSer,
      xEmi: data.xEmi,
      xOrig: data.xOrig,
      xDest: data.xDest,
      xRota: data.xRota,

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

      vTPrest: data.vTPrest,
      vRec: data.vRec,

      CST00: data.CST00,
      vBC00: data.vBC00,
      pICMS00: data.pICMS00,
      vICMS00: data.vICMS00,

      CST20: data.CST20,
      pRedBC20: data.pRedBC20,
      vBC20: data.vBC20,
      pICMS20: data.pICMS20,
      vICMS20: data.vICMS20,

      CST45: data.CST45,
      vICMSDeson45: data.vICMSDeson45,
      cBenef45: data.cBenef45,

      CST60: data.CST60,
      vBCSTRet: data.vBCSTRet,
      vICMSSTRet: data.vICMSSTRet,
      pICMSSTRet: data.pICMSSTRet,
      vCred: data.vCred,

      CST90: data.CST90,
      pRedBC90: data.pRedBC90,
      vBC90: data.vBC90,
      pICMS90: data.pICMS90,
      vICMS90: data.vICMS90,
      vCred90: data.vCred90,

      CSTOutraUF: data.CSTOutraUF,
      pRedBCOutraUF: data.pRedBCOutraUF,
      vBCOutraUF: data.vBCOutraUF,
      pICMSOutraUF: data.pICMSOutraUF,
      vICMSOutraUF: data.vICMSOutraUF,

      CSTSN: data.CSTSN,
      indSN: data.indSN,

      vBCUFFim: data.vBCUFFim,
      pFCPUFFim: data.pFCPUFFim,
      pICMSUFFim: data.pICMSUFFim,
      pICMSInter: data.pICMSInter,
      vFCPUFFim: data.vFCPUFFim,
      vICMSUFFim: data.vICMSUFFim,
      vICMSUFIni: data.vICMSUFIni,

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

      vTotDFe: data.vTotDFe,

      vCarga: data.vCarga,
      proPred: data.produtoPredominante,
      xOutCat: data.xOutCat,
      vCargaAverb: data.vCargaAverb,

      veicChassi: data.veicChassi,
      veicCor: data.veicCor,
      veicxCor: data.veicxCor,
      veiccMod: data.veiccMod,
      veicvUnit: data.veicvUnit,
      veicvFrete: data.veicvFrete,

      nFat: data.nFat,
      vOrig: data.vOrig,
      vDesc: data.vDesc,
      vLiq: data.vLiq,

      chCteSub: data.chCteSub,
      indAlteraToma: data.indAlteraToma,

      xObsGlobalizado: data.xObsGlobalizado,

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

      empresa: { connect: { id: data.empresaId } },
      emitente: data.emitenteId ? { connect: { id: data.emitenteId } } : undefined,
      remetente: data.remetenteId ? { connect: { id: data.remetenteId } } : undefined,
      destinatario: data.destinatarioId ? { connect: { id: data.destinatarioId } } : undefined,
      expedidor: data.expedidorId ? { connect: { id: data.expedidorId } } : undefined,
      recebedor: data.recebedorId ? { connect: { id: data.recebedorId } } : undefined,
      transportadora: data.transportadoraId ? { connect: { id: data.transportadoraId } } : undefined,

      componentes: data.componentes ? { create: data.componentes } : undefined,
      quantidades: data.quantidades ? { create: data.quantidades } : undefined,
      duplicatas: data.duplicatas ? { create: data.duplicatas } : undefined,
      observacoes: data.observacoes ? { create: data.observacoes } : undefined,
      observacoesFisco: data.observacoesFisco ? { create: data.observacoesFisco } : undefined,
      autorizadosDownload: data.autorizadosDownload ? { create: data.autorizadosDownload } : undefined,
      complementos: data.complementos ? { create: data.complementos } : undefined,
      substitutos: data.substitutos ? { create: data.substitutos } : undefined,
      globalizados: data.globalizados ? { create: data.globalizados } : undefined,
      servicosVinculados: data.servicosVinculados ? { create: data.servicosVinculados } : undefined,
      documentos: data.documentos ? { create: data.documentos } : undefined,
    };

    return prisma.cTe.create({
      data: payload,
      include: CTE_INCLUDE_COMPLETO
    });
  }

  async updateStatus(id: string, empresaId: string, status: StatusDocumento, motivo?: string) {
    const existente = await prisma.cTe.findFirst({
      where: { id, empresaId },
      select: { id: true }
    });

    if (!existente) {
      throw new Error('CT-e não encontrado');
    }

    const data: Prisma.CTeUpdateInput = { status };

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
      include: CTE_INCLUDE_COMPLETO
    });
  }

  async update(id: string, empresaId: string, data: Prisma.CTeUpdateInput) {
    const existente = await prisma.cTe.findFirst({
      where: { id, empresaId },
      select: { id: true }
    });

    if (!existente) {
      throw new Error('CT-e não encontrado');
    }

    return prisma.cTe.update({
      where: { id },
      data,
      include: CTE_INCLUDE_COMPLETO
    });
  }

  async delete(id: string, empresaId: string) {
    const cte = await prisma.cTe.findFirst({
      where: { id, empresaId }
    });

    if (!cte) {
      throw new Error('CT-e não encontrado');
    }

    if (cte.status !== 'RASCUNHO') {
      throw new Error('Apenas CT-e em RASCUNHO podem ser excluídos');
    }

    return prisma.cTe.delete({ where: { id } });
  }

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

  async getTotalFrete(empresaId: string, dataInicio?: Date, dataFim?: Date) {
    const dateFilter = buildDateFilter(dataInicio, dataFim);

    const where: Prisma.CTeWhereInput = {
      empresaId,
      status: 'AUTORIZADA',
      ...(dateFilter && { dataHoraEmissao: dateFilter })
    };

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

  async getResumoMensal(empresaId: string, ano: number, mes: number) {
    if (mes < 1 || mes > 12) {
      throw new Error('Mês inválido');
    }

    const dataInicio = new Date(ano, mes - 1, 1);
    const dataFim = new Date(ano, mes, 0, 23, 59, 59, 999);

    const where: Prisma.CTeWhereInput = {
      empresaId,
      status: 'AUTORIZADA',
      dataHoraEmissao: {
        gte: dataInicio,
        lte: dataFim
      }
    };

    const [agregado, quantidade] = await Promise.all([
      prisma.cTe.aggregate({
        where,
        _sum: { vTPrest: true, vCarga: true }
      }),
      prisma.cTe.count({ where })
    ]);

    const totalFrete = agregado._sum.vTPrest || 0;
    const totalCarga = agregado._sum.vCarga || 0;

    return {
      mes,
      ano,
      quantidade,
      totalFrete,
      totalCarga,
      mediaFrete: quantidade > 0 ? totalFrete / quantidade : 0
    };
  }

  async findByCliente(empresaId: string, clienteId: string, tipo: string, dataInicio?: Date, dataFim?: Date) {
    const dateFilter = buildDateFilter(dataInicio, dataFim);

    const where: Prisma.CTeWhereInput = {
      empresaId,
      status: 'AUTORIZADA',
      ...(dateFilter && { dataHoraEmissao: dateFilter })
    };

    if (tipo === 'AMBOS') {
      where.OR = [
        { remetenteId: clienteId },
        { destinatarioId: clienteId }
      ];
    } else if (tipo === 'REMETENTE') {
      where.remetenteId = clienteId;
    } else if (tipo === 'DESTINATARIO') {
      where.destinatarioId = clienteId;
    }

    return prisma.cTe.findMany({
      where,
      take: MAX_FIND_MANY_LIMIT,
      include: CTE_INCLUDE_BASICO,
      orderBy: { dataHoraEmissao: 'desc' }
    });
  }

  async findByTransportadora(empresaId: string, transportadoraId: string, dataInicio?: Date, dataFim?: Date) {
    const dateFilter = buildDateFilter(dataInicio, dataFim);

    const where: Prisma.CTeWhereInput = {
      empresaId,
      transportadoraId,
      status: 'AUTORIZADA',
      ...(dateFilter && { dataHoraEmissao: dateFilter })
    };

    return prisma.cTe.findMany({
      where,
      take: MAX_FIND_MANY_LIMIT,
      include: CTE_INCLUDE_BASICO,
      orderBy: { dataHoraEmissao: 'desc' }
    });
  }

  async findByModal(empresaId: string, modal: string, dataInicio?: Date, dataFim?: Date) {
    const dateFilter = buildDateFilter(dataInicio, dataFim);

    const where: Prisma.CTeWhereInput = {
      empresaId,
      modal,
      status: 'AUTORIZADA',
      ...(dateFilter && { dataHoraEmissao: dateFilter })
    };

    return prisma.cTe.findMany({
      where,
      take: MAX_FIND_MANY_LIMIT,
      include: CTE_INCLUDE_BASICO,
      orderBy: { dataHoraEmissao: 'desc' }
    });
  }

  async findByStatus(empresaId: string, status: StatusDocumento, dataInicio?: Date, dataFim?: Date) {
    const dateFilter = buildDateFilter(dataInicio, dataFim);

    const where: Prisma.CTeWhereInput = {
      empresaId,
      status,
      ...(dateFilter && { dataHoraEmissao: dateFilter })
    };

    return prisma.cTe.findMany({
      where,
      take: MAX_FIND_MANY_LIMIT,
      include: CTE_INCLUDE_BASICO,
      orderBy: { dataHoraEmissao: 'desc' }
    });
  }

  async buscarCteSubstituido(chave: string, empresaId: string) {
    return prisma.cTe.findFirst({
      where: { chCteSub: chave, empresaId },
      include: CTE_INCLUDE_COMPLETO
    });
  }

  async buscarCteComplementado(chave: string, empresaId: string) {
    return prisma.cTe.findFirst({
      where: {
        empresaId,
        complementos: {
          some: { chCTe: chave }
        }
      },
      include: CTE_INCLUDE_COMPLETO
    });
  }
}