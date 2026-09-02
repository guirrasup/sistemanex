// backend/src/repositories/nfae.repository.ts

import { prisma } from '../config/prisma';
import { StatusNFAe } from '@prisma/client';

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
  
  /**
   * 🔍 LISTAR NFA-e COM FILTROS
   */
  async findAll(empresaId: string, page: number = 1, limit: number = 50, filtros?: FiltroNFAe) {
    const skip = (page - 1) * limit;

    const where: any = { empresaId };

    if (filtros?.status) {
      where.status = Array.isArray(filtros.status) 
        ? { in: filtros.status } 
        : filtros.status;
    }
    if (filtros?.dataInicio) {
      where.dataHoraEmissao = { gte: filtros.dataInicio };
    }
    if (filtros?.dataFim) {
      where.dataHoraEmissao = { lte: filtros.dataFim };
    }
    if (filtros?.numero) {
      where.numero = filtros.numero;
    }
    if (filtros?.serie) {
      where.serie = filtros.serie;
    }
    if (filtros?.chave) {
      where.chaveAcesso = filtros.chave;
    }
    if (filtros?.destinatarioId) {
      where.destinatarioId = filtros.destinatarioId;
    }

    const [data, total] = await Promise.all([
      prisma.nFAe.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          itens: true,
          destinatario: true,
          historicoStatus: true,
        },
      }),
      prisma.nFAe.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 🔍 BUSCAR NFA-e POR ID
   */
  async findById(id: string) {
    return prisma.nFAe.findUnique({
      where: { id },
      include: {
        itens: true,
        destinatario: true,
        historicoStatus: true,
      },
    });
  }

  /**
   * 🔍 BUSCAR NFA-e POR CHAVE DE ACESSO
   */
  async findByChave(chave: string) {
    return prisma.nFAe.findUnique({
      where: { chaveAcesso: chave },
      include: {
        itens: true,
        destinatario: true,
        historicoStatus: true,
      },
    });
  }

  /**
   * 📝 CRIAR NFA-e
   */
  async create(data: any) {
    return prisma.nFAe.create({
      data: {
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
        
        // Relacionamentos
        empresaId: data.empresaId,
        destinatarioId: data.destinatarioId,
      },
      include: {
        itens: true,
        destinatario: true,
        historicoStatus: true,
      },
    });
  }

  /**
   * 📝 ATUALIZAR STATUS DA NFA-e
   */
  async updateStatus(id: string, status: StatusNFAe, motivo?: string) {
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

    return prisma.nFAe.update({
      where: { id },
      data,
      include: {
        itens: true,
        destinatario: true,
        historicoStatus: true,
      },
    });
  }

  /**
   * 📝 ATUALIZAR NFA-e
   */
  async update(id: string, data: any) {
    return prisma.nFAe.update({
      where: { id },
      data,
      include: {
        itens: true,
        destinatario: true,
        historicoStatus: true,
      },
    });
  }

  /**
   * ❌ EXCLUIR NFA-e (apenas RASCUNHO)
   */
  async delete(id: string) {
    const nfae = await prisma.nFAe.findUnique({ where: { id } });

    if (!nfae) {
      throw new Error('NFA-e não encontrada');
    }

    if (nfae.status !== 'RASCUNHO') {
      throw new Error('Apenas NFA-e em RASCUNHO podem ser excluídas');
    }

    return prisma.nFAe.delete({ where: { id } });
  }

  /**
   * 🔢 PRÓXIMO NÚMERO
   */
  async getProximoNumero(empresaId: string, serie: number = 900): Promise<number> {
    const last = await prisma.nFAe.findFirst({
      where: { empresaId, serie },
      orderBy: { numero: 'desc' },
      select: { numero: true },
    });

    return (last?.numero || 0) + 1;
  }

  /**
   * 📊 ESTATÍSTICAS
   */
  async getEstatisticas(empresaId: string) {
    const [total, autorizadas, canceladas] = await Promise.all([
      prisma.nFAe.count({ where: { empresaId } }),
      prisma.nFAe.count({ where: { empresaId, status: 'AUTORIZADA' } }),
      prisma.nFAe.count({ where: { empresaId, status: 'CANCELADA' } }),
    ]);

    const valores = await prisma.nFAe.aggregate({
      where: { empresaId, status: 'AUTORIZADA' },
      _sum: {
        valorTotalNota: true,
        valorTotalICMS: true,
      },
    });

    return {
      total,
      autorizadas,
      canceladas,
      totalFaturamento: valores._sum.valorTotalNota || 0,
      totalICMS: valores._sum.valorTotalICMS || 0,
    };
  }

  /**
   * 💰 TOTAL POR PERÍODO
   */
  async getTotalPeriodo(empresaId: string, dataInicio?: Date, dataFim?: Date) {
    const where: any = { empresaId, status: 'AUTORIZADA' };

    if (dataInicio) {
      where.dataHoraEmissao = { gte: dataInicio };
    }
    if (dataFim) {
      where.dataHoraEmissao = { lte: dataFim };
    }

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

  /**
   * 📊 RESUMO MENSAL
   */
  async getResumoMensal(empresaId: string, ano: number, mes: number) {
    const dataInicio = new Date(ano, mes - 1, 1);
    const dataFim = new Date(ano, mes, 0);

    const nfaes = await prisma.nFAe.findMany({
      where: {
        empresaId,
        status: 'AUTORIZADA',
        dataHoraEmissao: {
          gte: dataInicio,
          lte: dataFim,
        },
      },
      include: {
        itens: true,
      },
    });

    const totalFaturamento = nfaes.reduce((acc, n) => acc + n.valorTotalNota, 0);
    const totalICMS = nfaes.reduce((acc, n) => acc + n.valorTotalICMS, 0);

    return {
      mes,
      ano,
      quantidade: nfaes.length,
      totalFaturamento,
      totalICMS,
      mediaFaturamento: nfaes.length > 0 ? totalFaturamento / nfaes.length : 0,
    };
  }
}