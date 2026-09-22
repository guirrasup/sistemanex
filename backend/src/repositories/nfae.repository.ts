// backend/src/repositories/nfae.repository.ts
import { Prisma, PrismaClient, StatusNFAe } from '@prisma/client';

const prisma = new PrismaClient();

// 🔥 LIMITES DE PAGINAÇÃO (mitigação CWE-770 / CWE-400)
const MAX_PAGE_SIZE = 100;
const MAX_ITENS_INCLUDE = 500;

// 🔥 INCLUDE PADRONIZADO
const NFAE_INCLUDE = {
  itens: true,
  destinatario: true,
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

export interface FiltroNFAe {
  status?: StatusNFAe | StatusNFAe[];
  dataInicio?: Date;
  dataFim?: Date;
  numero?: number;
  serie?: number;
  chave?: string;
  destinatarioId?: string;
}

export class NFAeRepository {

  async findAll(empresaId: string, page: number = 1, limit: number = 50, filtros?: FiltroNFAe) {
    // 🔥 Clamp de paginação (evita page=0/negativa e limit descontrolado)
    const pageSegura = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
    const limitSeguro = Number.isFinite(limit) && limit > 0
      ? Math.min(Math.floor(limit), MAX_PAGE_SIZE)
      : 50;

    const skip = (pageSegura - 1) * limitSeguro;

    const dateFilter = buildDateFilter(filtros?.dataInicio, filtros?.dataFim);

    const where: Prisma.NFAeWhereInput = {
      empresaId,
      ...(filtros?.status && {
        status: Array.isArray(filtros.status)
          ? { in: filtros.status }
          : filtros.status
      }),
      // 🔥 Corrige bug: dataInicio + dataFim no mesmo campo eram sobrescritos
      ...(dateFilter && { dataHoraEmissao: dateFilter }),
      ...(filtros?.numero !== undefined && { numero: filtros.numero }),
      ...(filtros?.serie !== undefined && { serie: filtros.serie }),
      ...(filtros?.chave && { chaveAcesso: filtros.chave }),
      ...(filtros?.destinatarioId && { destinatarioId: filtros.destinatarioId }),
    };

    const [data, total] = await Promise.all([
      prisma.nFAe.findMany({
        where,
        skip,
        take: limitSeguro,
        orderBy: { createdAt: 'desc' },
        include: NFAE_INCLUDE,
      }),
      prisma.nFAe.count({ where }),
    ]);

    return {
      data,
      total,
      page: pageSegura,
      limit: limitSeguro,
      totalPages: Math.ceil(total / limitSeguro),
    };
  }

  // 🔒 IDOR fix: exige empresaId e usa findFirst({ id, empresaId })
  async findById(id: string, empresaId: string) {
    return prisma.nFAe.findFirst({
      where: { id, empresaId },
      include: NFAE_INCLUDE,
    });
  }

  // 🔒 IDOR fix: exige empresaId
  async findByChave(chave: string, empresaId: string) {
    return prisma.nFAe.findFirst({
      where: { chaveAcesso: chave, empresaId },
      include: NFAE_INCLUDE,
    });
  }

  async create(data: Record<string, unknown>) {
    // 🔒 IDOR: garante que empresaId está sempre presente
    if (!data.empresaId) {
      throw new Error('empresaId é obrigatório');
    }

    // 🔥 Payload explícito com connect nas relações (Prisma exige connect em create)
    const payload = {
      modelo: data.modelo || '63',
      serie: data.serie || 900,
      numero: data.numero,
      chaveAcesso: data.chaveAcesso,
      dataHoraEmissao: data.dataHoraEmissao || new Date(),
      naturezaOperacao: data.naturezaOperacao,
      motivoEmissao: data.motivoEmissao,
      descricaoMotivo: data.descricaoMotivo,
      ambiente: data.ambiente || 1,
      tipoEmissao: data.tipoEmissao || '1',
      status: data.status || 'RASCUNHO',

      // Requerente
      requerenteTipoPessoa: data.requerenteTipoPessoa || 'PF',
      requerenteDocumento: data.requerenteDocumento,
      requerenteNome: data.requerenteNome,
      requerenteInscricaoProdutor: data.requerenteInscricaoProdutor,
      requerenteLogradouro: data.requerenteLogradouro,
      requerenteNumero: data.requerenteNumero || 'S/N',
      requerenteComplemento: data.requerenteComplemento,
      requerenteBairro: data.requerenteBairro,
      requerenteMunicipio: data.requerenteMunicipio,
      requerenteMunicipioIbge: data.requerenteMunicipioIbge,
      requerenteUf: data.requerenteUf || 'SP',
      requerenteCep: data.requerenteCep,
      requerenteTelefone: data.requerenteTelefone,
      requerenteEmail: data.requerenteEmail,

      // Destinatário
      destinatarioTipoPessoa: data.destinatarioTipoPessoa || 'PJ',
      destinatarioDocumento: data.destinatarioDocumento,
      destinatarioNome: data.destinatarioNome,
      destinatarioIE: data.destinatarioIE || 'ISENTO',
      destinatarioLogradouro: data.destinatarioLogradouro,
      destinatarioNumero: data.destinatarioNumero || 'S/N',
      destinatarioComplemento: data.destinatarioComplemento,
      destinatarioBairro: data.destinatarioBairro,
      destinatarioMunicipio: data.destinatarioMunicipio,
      destinatarioMunicipioIbge: data.destinatarioMunicipioIbge,
      destinatarioUf: data.destinatarioUf || 'SP',
      destinatarioCep: data.destinatarioCep,
      destinatarioTelefone: data.destinatarioTelefone,
      destinatarioEmail: data.destinatarioEmail,

      // Valores
      valorTotalProdutos: data.valorTotalProdutos || 0,
      baseCalculoICMS: data.baseCalculoICMS || 0,
      aliquotaICMSMediana: data.aliquotaICMSMediana || 0,
      valorTotalICMS: data.valorTotalICMS || 0,
      valorTotalNota: data.valorTotalNota || 0,

      // Guia DAE
      guiaDAENumero: data.guiaDAENumero,
      guiaDAECodigoBarras: data.guiaDAECodigoBarras,
      guiaDAEChavePix: data.guiaDAEChavePix,
      guiaDAEVencimento: data.guiaDAEVencimento,
      guiaDAEValor: data.guiaDAEValor,
      guiaDAEStatus: data.guiaDAEStatus || 'AGUARDANDO_PAGAMENTO',

      // Órgão emissor
      orgaoEmissorSefaz: data.orgaoEmissorSefaz || 'SEFAZ/SP',

      // Protocolo
      protocoloAutorizacao: data.protocoloAutorizacao,
      dataHoraAutorizacao: data.dataHoraAutorizacao,
      motivoCancelamento: data.motivoCancelamento,
      dataHoraCancelamento: data.dataHoraCancelamento,
      motivoRejeicao: data.motivoRejeicao,
      dataHoraRejeicao: data.dataHoraRejeicao,

      // XML
      xmlAssinado: data.xmlAssinado || '',
      xmlRetorno: data.xmlRetorno,

      // Controle
      enviadoEm: data.enviadoEm,
      enviadoPor: data.enviadoPor,
      ipEnvio: data.ipEnvio,

      // Informações adicionais
      informacoesComplementares: data.informacoesComplementares,

      // 🔥 Relações via connect (não empresaId/destinatarioId soltos)
      empresa: { connect: { id: data.empresaId } },
      destinatario: data.destinatarioId
        ? { connect: { id: data.destinatarioId } }
        : undefined,
    };

    return prisma.nFAe.create({
      data: payload as unknown as Prisma.NFAeCreateInput,
      include: NFAE_INCLUDE,
    });
  }

  // 🔒 IDOR fix: valida posse antes de mutar
  async updateStatus(id: string, empresaId: string, status: StatusNFAe, motivo?: string) {
    const existente = await prisma.nFAe.findFirst({
      where: { id, empresaId },
      select: { id: true },
    });

    if (!existente) {
      throw new Error('NFA-e não encontrada');
    }

    const data: Prisma.NFAeUpdateInput = { status };

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

    return prisma.nFAe.update({
      where: { id },
      data,
      include: NFAE_INCLUDE,
    });
  }

  // 🔒 IDOR fix: valida posse antes de mutar
  async update(id: string, empresaId: string, data: Prisma.NFAeUpdateInput) {
    const existente = await prisma.nFAe.findFirst({
      where: { id, empresaId },
      select: { id: true },
    });

    if (!existente) {
      throw new Error('NFA-e não encontrada');
    }

    return prisma.nFAe.update({
      where: { id },
      data,
      include: NFAE_INCLUDE,
    });
  }

  // 🔒 IDOR fix: findFirst({ id, empresaId }) em vez de findUnique({ id })
  async delete(id: string, empresaId: string) {
    const nfae = await prisma.nFAe.findFirst({
      where: { id, empresaId },
    });

    if (!nfae) {
      throw new Error('NFA-e não encontrada');
    }

    if (nfae.status !== 'RASCUNHO') {
      throw new Error('Apenas NFA-e em RASCUNHO podem ser excluídas');
    }

    return prisma.nFAe.delete({ where: { id } });
  }

  async getProximoNumero(empresaId: string, serie: number = 900): Promise<number> {
    const last = await prisma.nFAe.findFirst({
      where: { empresaId, serie },
      orderBy: { numero: 'desc' },
      select: { numero: true },
    });

    return (last?.numero || 0) + 1;
  }

  async getEstatisticas(empresaId: string) {
    const [total, autorizadas, canceladas, valores] = await Promise.all([
      prisma.nFAe.count({ where: { empresaId } }),
      prisma.nFAe.count({ where: { empresaId, status: 'AUTORIZADA' } }),
      prisma.nFAe.count({ where: { empresaId, status: 'CANCELADA' } }),
      prisma.nFAe.aggregate({
        where: { empresaId, status: 'AUTORIZADA' },
        _sum: {
          valorTotalNota: true,
          valorTotalICMS: true,
        },
      }),
    ]);

    return {
      total,
      autorizadas,
      canceladas,
      totalFaturamento: valores._sum.valorTotalNota || 0,
      totalICMS: valores._sum.valorTotalICMS || 0,
    };
  }

  async getTotalPeriodo(empresaId: string, dataInicio?: Date, dataFim?: Date) {
    const dateFilter = buildDateFilter(dataInicio, dataFim);

    const where: Prisma.NFAeWhereInput = {
      empresaId,
      status: 'AUTORIZADA',
      // 🔥 Corrige bug: dataInicio + dataFim no mesmo campo eram sobrescritos
      ...(dateFilter && { dataHoraEmissao: dateFilter })
    };

    const result = await prisma.nFAe.aggregate({
      where,
      _sum: { valorTotalNota: true, valorTotalICMS: true },
      _count: true,
    });

    return {
      totalFaturamento: result._sum.valorTotalNota || 0,
      totalICMS: result._sum.valorTotalICMS || 0,
      quantidade: result._count,
    };
  }

  async getResumoMensal(empresaId: string, ano: number, mes: number) {
    if (mes < 1 || mes > 12) {
      throw new Error('Mês inválido');
    }

    const dataInicio = new Date(ano, mes - 1, 1);
    const dataFim = new Date(ano, mes, 0, 23, 59, 59, 999);

    const where: Prisma.NFAeWhereInput = {
      empresaId,
      status: 'AUTORIZADA',
      dataHoraEmissao: {
        gte: dataInicio,
        lte: dataFim,
      },
    };

    // 🔥 Agregação no BD em vez de carregar todos os NFA-e em memória
    const [agregado, quantidade] = await Promise.all([
      prisma.nFAe.aggregate({
        where,
        _sum: { valorTotalNota: true, valorTotalICMS: true }
      }),
      prisma.nFAe.count({ where })
    ]);

    const totalFaturamento = Number(agregado._sum.valorTotalNota) || 0;
    const totalICMS = Number(agregado._sum.valorTotalICMS) || 0;

    return {
      mes,
      ano,
      quantidade,
      totalFaturamento,
      totalICMS,
      mediaFaturamento: quantidade > 0 ? totalFaturamento / quantidade : 0,
    };
  }
}