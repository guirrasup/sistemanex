// backend/src/services/nfae.service.ts
import { PrismaClient, StatusNFAe, Prisma, MotivoEmissaoNFAe, TipoPessoaNFAe } from '@prisma/client';
import { NFAeDocumento, NFAeItem } from '../types/nfae.types.js';
import { gerarChaveAcessoNFe } from '../utils/chaveAcesso.js';
import { gerarXmlNfae, type NfaeParaXml } from '../utils/xmlNfaeGenerator.js';
import { CertificadoService } from './certificado.service.js';
import { extrairChaveECertificadoDoPfx, assinarXmlEnvelopado } from '../utils/xmlSigner.js';
import { EmpresaRepository } from '../repositories/empresa.repository.js';
import { formatarDataHoraSefaz } from '../utils/dataHoraSefaz.js';

const prisma = new PrismaClient();

// 🔥 LIMITES DE RECURSOS (mitigação CWE-770 / CWE-400)
const MAX_PAGE_SIZE = 100;
const MAX_FIND_MANY = 500;
const MAX_ITENS_POR_NOTA = 500;
const MAX_STRING_FILTRO = 200;

// 🔥 INCLUDE PADRONIZADO
const NFAE_INCLUDE = {
  itens: true,
  destinatario: true,
  historicoStatus: true,
} as const;

interface FiltrosNFAe {
  dataInicio?: Date;
  dataFim?: Date;
  status?: StatusNFAe;
  numero?: number;
  serie?: number;
  chave?: string;
  destinatarioId?: string;
}

interface RequerenteNFAe {
  tipoPessoa?: TipoPessoaNFAe;
  documento?: string;
  nome?: string;
  inscricaoProdutor?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  municipio?: string;
  municipioIbge?: string;
  uf?: string;
  cep?: string;
  telefone?: string;
  email?: string;
}

interface DestinatarioNFAe {
  tipoPessoa?: TipoPessoaNFAe;
  documento?: string;
  nome?: string;
  ie?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  municipio?: string;
  municipioIbge?: string;
  uf?: string;
  cep?: string;
  telefone?: string;
  email?: string;
}

interface GuiaDaeInput {
  numero?: string;
  codigoBarras?: string;
  chavePix?: string;
  vencimento?: string | number | Date;
  valor?: number;
  status?: string;
}

interface ItemNFAeInput {
  codigo: string;
  descricao: string;
  ncm: string;
  unidade?: string;
  quantidade?: number;
  valorUnitario?: number;
  valorTotal?: number;
  aliquotaICMS?: number;
  valorICMS?: number;
  codigoBarrasEAN?: string;
}

interface EmitirNFAeInput {
  empresaId: string;
  itens?: ItemNFAeInput[];
  numero?: number;
  serie?: number;
  requerente?: RequerenteNFAe;
  destinatario?: DestinatarioNFAe;
  destinatarioId?: string;
  naturezaOperacao?: string;
  motivoEmissao?: MotivoEmissaoNFAe;
  descricaoMotivo?: string;
  ambiente?: number;
  tipoEmissao?: string;
  guiaDAE?: GuiaDaeInput;
  orgaoEmissorSefaz?: string;
  xmlAssinado?: string;
  informacoesComplementares?: string;
  [key: string]: unknown;
}

const PROTOCOLO_MOCK_SUFIXO_BASE = 1000000;
const PROTOCOLO_MOCK_SUFIXO_RANGE = 9000000;

// 🔥 Helper para mesclar filtro de data sem sobrescrever gte/lte
function buildDateFilter(dataInicio?: Date, dataFim?: Date) {
  if (!dataInicio && !dataFim) return undefined;
  return {
    ...(dataInicio && { gte: dataInicio }),
    ...(dataFim && { lte: dataFim })
  };
}

export class NFAeService {
  private certificadoService: CertificadoService;
  private empresaRepo: EmpresaRepository;

  constructor() {
    this.certificadoService = new CertificadoService();
    this.empresaRepo = new EmpresaRepository();
  }

  async listar(empresaId: string, page: number = 1, limit: number = 50, filtros?: FiltrosNFAe) {
    // 🔥 Clamp de paginação (CWE-770)
    const pageSegura = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
    const limitSeguro = Number.isFinite(limit) && limit > 0
      ? Math.min(Math.floor(limit), MAX_PAGE_SIZE)
      : 50;

    const skip = (pageSegura - 1) * limitSeguro;

    const dateFilter = buildDateFilter(filtros?.dataInicio, filtros?.dataFim);

    const where: Prisma.NFAeWhereInput = {
      empresaId,
      ...(filtros?.status && { status: filtros.status }),
      // 🔥 Corrige bug: dataInicio + dataFim no mesmo campo eram sobrescritos
      ...(dateFilter && { dataHoraEmissao: dateFilter }),
      ...(filtros?.numero !== undefined && { numero: filtros.numero }),
      ...(filtros?.serie !== undefined && { serie: filtros.serie }),
      ...(filtros?.chave && { chaveAcesso: String(filtros.chave).slice(0, MAX_STRING_FILTRO) }),
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

  // 🔒 IDOR: empresaId agora é OBRIGATÓRIO
  async buscarPorId(id: string, empresaId: string) {
    return prisma.nFAe.findFirst({
      where: { id, empresaId },
      include: NFAE_INCLUDE,
    });
  }

  // 🔒 IDOR: empresaId agora é OBRIGATÓRIO
  async buscarPorChave(chave: string, empresaId: string) {
    return prisma.nFAe.findFirst({
      where: { chaveAcesso: chave, empresaId },
      include: NFAE_INCLUDE,
    });
  }

  async findByDestinatario(destinatarioId: string, empresaId: string) {
    return prisma.nFAe.findMany({
      where: { destinatarioId, empresaId },
      include: NFAE_INCLUDE,
      orderBy: { createdAt: 'desc' },
      take: MAX_FIND_MANY,
    });
  }

  async excluir(id: string, empresaId: string) {
    const nfae = await this.buscarPorId(id, empresaId);

    if (!nfae) {
      throw new Error('NFA-e não encontrada');
    }

    if (nfae.status !== 'RASCUNHO') {
      throw new Error('Apenas NFA-e em RASCUNHO podem ser excluídas');
    }

    return prisma.nFAe.delete({ where: { id } });
  }

  async emitir(data: EmitirNFAeInput) {
    // 🔒 Validação de entrada
    if (!data.empresaId) {
      throw new Error('empresaId é obrigatório');
    }

    const empresa = await this.empresaRepo.findById(data.empresaId);
    if (!empresa) throw new Error('Empresa não encontrada');

    if (!empresa.certificado || empresa.certificado.status !== 'VALIDO') {
      throw new Error('Certificado digital inválido ou não configurado');
    }

    const itens = Array.isArray(data.itens) ? data.itens : [];

    // 🔥 Limite de itens por nota (CWE-770)
    if (itens.length > MAX_ITENS_POR_NOTA) {
      throw new Error(`Limite de ${MAX_ITENS_POR_NOTA} itens por NFA-e excedido`);
    }

    // 1. Gerar chave de acesso
    const aamm = new Date().toISOString().slice(2, 4) + new Date().toISOString().slice(5, 7);
    const numero = data.numero || await this.getProximoNumero(data.empresaId, data.serie || 900);

    const { chaveCompleta, codigoNumerico, dv } = gerarChaveAcessoNFe({
      codigoUf: data.requerente?.municipioIbge?.slice(0, 2) || '35',
      anoMes: aamm,
      cnpjEmitente: data.requerente?.documento?.replace(/\D/g, '') || '00000000000000',
      modelo: '63',
      serie: data.serie || 900,
      numero,
      tipoEmissao: 1,
    });

    // 2. Calcular totais
    const valorTotalProdutos = itens.reduce((acc, item) => acc + (item.valorTotal || 0), 0);
    const valorTotalICMS = itens.reduce((acc, item) => acc + (item.valorICMS || 0), 0);
    const baseCalculoICMS = valorTotalProdutos;
    const aliquotaICMSMediana = itens.length > 0
      ? itens.reduce((acc, item) => acc + (item.aliquotaICMS || 0), 0) / itens.length
      : 0;

    // 2.1 Monta o DTO fiscal, gera e assina o XML (antes da transação, pois o
    // arquivo assinado precisa estar pronto para ser gravado junto com a NFA-e)
    const nfaeParaXml: NfaeParaXml = {
      chaveAcesso: chaveCompleta,
      numero,
      serie: data.serie || 900,
      dataHoraEmissao: formatarDataHoraSefaz(),
      naturezaOperacao: data.naturezaOperacao || 'Fornecimento de Energia Elétrica',
      motivoEmissao: data.motivoEmissao || 'PRODUTOR_RURAL',
      descricaoMotivo: data.descricaoMotivo || data.motivoEmissao || 'Produtor Rural',
      ambiente: data.ambiente || 1,
      orgaoEmissorSefaz: data.orgaoEmissorSefaz || 'SEFAZ/SP',
      requerente: {
        tipoPessoa: data.requerente?.tipoPessoa || 'PF',
        documento: data.requerente?.documento || '',
        nome: data.requerente?.nome || '',
        endereco: {
          logradouro: data.requerente?.logradouro || '',
          numero: data.requerente?.numero || 'S/N',
          complemento: data.requerente?.complemento,
          bairro: data.requerente?.bairro || '',
          municipio: data.requerente?.municipio || '',
          municipioIbge: data.requerente?.municipioIbge,
          uf: data.requerente?.uf || 'SP',
          cep: data.requerente?.cep || '',
          telefone: data.requerente?.telefone,
        },
      },
      destinatario: {
        tipoPessoa: data.destinatario?.tipoPessoa || 'PJ',
        documento: data.destinatario?.documento || '',
        nome: data.destinatario?.nome || '',
        inscricaoEstadual: data.destinatario?.ie || 'ISENTO',
        endereco: {
          logradouro: data.destinatario?.logradouro || '',
          numero: data.destinatario?.numero || 'S/N',
          complemento: data.destinatario?.complemento,
          bairro: data.destinatario?.bairro || '',
          municipio: data.destinatario?.municipio || '',
          municipioIbge: data.destinatario?.municipioIbge,
          uf: data.destinatario?.uf || 'SP',
          cep: data.destinatario?.cep || '',
          telefone: data.destinatario?.telefone,
        },
      },
      itens: itens.map((item) => ({
        codigo: item.codigo,
        descricao: item.descricao,
        ncm: item.ncm,
        unidade: item.unidade || 'UN',
        quantidade: item.quantidade || 1,
        valorUnitario: item.valorUnitario || 0,
        valorTotal: item.valorTotal || ((item.quantidade || 0) * (item.valorUnitario || 0)) || 0,
        aliquotaICMS: item.aliquotaICMS || 0,
        valorICMS: item.valorICMS || 0,
        codigoBarrasEAN: item.codigoBarrasEAN,
      })),
      valorTotalProdutos,
      baseCalculoICMS,
      aliquotaICMSMediana,
      valorTotalICMS,
      valorTotalNota: valorTotalProdutos,
      guiaDAE: {
        numero: data.guiaDAE?.numero || `DAE-${Date.now()}`,
        codigoBarras: data.guiaDAE?.codigoBarras,
        vencimento: (data.guiaDAE?.vencimento ? new Date(data.guiaDAE.vencimento) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).toISOString(),
        valor: data.guiaDAE?.valor || valorTotalProdutos,
      },
      informacoesComplementares: data.informacoesComplementares,
    };

    const xmlSemAssinatura = gerarXmlNfae(nfaeParaXml);
    const certificado = await this.certificadoService.obterCertificadoDecriptado(data.empresaId);
    if (!certificado) {
      throw new Error('Certificado digital não configurado para esta empresa');
    }
    const chaveECertPem = extrairChaveECertificadoDoPfx(certificado.pfxBuffer, certificado.senha);
    const xmlAssinadoFinal = assinarXmlEnvelopado(xmlSemAssinatura, 'infNFAe', chaveECertPem);

    // 3. Criar NFA-e + itens em transação única
    const nfae = await prisma.$transaction(async (tx) => {
      const novaNfae = await tx.nFAe.create({
        data: {
          modelo: '63',
          serie: data.serie || 900,
          numero,
          chaveAcesso: chaveCompleta,
          dataHoraEmissao: new Date(),
          naturezaOperacao: data.naturezaOperacao || 'Fornecimento de Energia Elétrica',
          motivoEmissao: data.motivoEmissao || 'PRODUTOR_RURAL',
          descricaoMotivo: data.descricaoMotivo || data.motivoEmissao || 'Produtor Rural',
          ambiente: data.ambiente || 1,
          tipoEmissao: data.tipoEmissao || '1',
          status: 'AUTORIZADA',

          requerenteTipoPessoa: data.requerente?.tipoPessoa || 'PF',
          requerenteDocumento: data.requerente?.documento || '',
          requerenteNome: data.requerente?.nome || '',
          requerenteInscricaoProdutor: data.requerente?.inscricaoProdutor,
          requerenteLogradouro: data.requerente?.logradouro || '',
          requerenteNumero: data.requerente?.numero || 'S/N',
          requerenteComplemento: data.requerente?.complemento,
          requerenteBairro: data.requerente?.bairro || '',
          requerenteMunicipio: data.requerente?.municipio || '',
          requerenteMunicipioIbge: data.requerente?.municipioIbge || '',
          requerenteUf: data.requerente?.uf || 'SP',
          requerenteCep: data.requerente?.cep || '',
          requerenteTelefone: data.requerente?.telefone,
          requerenteEmail: data.requerente?.email,

          destinatarioTipoPessoa: data.destinatario?.tipoPessoa || 'PJ',
          destinatarioDocumento: data.destinatario?.documento || '',
          destinatarioNome: data.destinatario?.nome || '',
          destinatarioIE: data.destinatario?.ie || 'ISENTO',
          destinatarioLogradouro: data.destinatario?.logradouro || '',
          destinatarioNumero: data.destinatario?.numero || 'S/N',
          destinatarioComplemento: data.destinatario?.complemento,
          destinatarioBairro: data.destinatario?.bairro || '',
          destinatarioMunicipio: data.destinatario?.municipio || '',
          destinatarioMunicipioIbge: data.destinatario?.municipioIbge || '',
          destinatarioUf: data.destinatario?.uf || 'SP',
          destinatarioCep: data.destinatario?.cep || '',
          destinatarioTelefone: data.destinatario?.telefone,
          destinatarioEmail: data.destinatario?.email,

          valorTotalProdutos,
          baseCalculoICMS,
          aliquotaICMSMediana,
          valorTotalICMS,
          valorTotalNota: valorTotalProdutos,

          guiaDAENumero: data.guiaDAE?.numero || `DAE-${Date.now()}`,
          guiaDAECodigoBarras: data.guiaDAE?.codigoBarras || '00000000000000000000000000000000000',
          guiaDAEChavePix: data.guiaDAE?.chavePix || '00000000000000000000000000000000000',
          guiaDAEVencimento: data.guiaDAE?.vencimento ? new Date(data.guiaDAE.vencimento) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          guiaDAEValor: data.guiaDAE?.valor || valorTotalProdutos,
          guiaDAEStatus: data.guiaDAE?.status || 'AGUARDANDO_PAGAMENTO',

          orgaoEmissorSefaz: data.orgaoEmissorSefaz || 'SEFAZ/SP',

          protocoloAutorizacao: `1352600${Math.floor(PROTOCOLO_MOCK_SUFIXO_BASE + Math.random() * PROTOCOLO_MOCK_SUFIXO_RANGE)}`,
          dataHoraAutorizacao: new Date(),

          xmlAssinado: xmlAssinadoFinal,

          informacoesComplementares: data.informacoesComplementares || '',

          // 🔥 Relações via connect
          empresa: { connect: { id: data.empresaId } },
          destinatario: data.destinatarioId
            ? { connect: { id: data.destinatarioId } }
            : undefined,
        },
        include: NFAE_INCLUDE,
      });

      // 4. Criar itens em lote (createMany)
      if (itens.length > 0) {
        await tx.nFAeItem.createMany({
          data: itens.map((item) => ({
            nfaeId: novaNfae.id,
            codigo: item.codigo,
            descricao: item.descricao,
            ncm: item.ncm,
            unidade: item.unidade || 'UN',
            quantidade: item.quantidade || 1,
            valorUnitario: item.valorUnitario || 0,
            valorTotal: item.valorTotal || ((item.quantidade || 0) * (item.valorUnitario || 0)) || 0,
            aliquotaICMS: item.aliquotaICMS || 0,
            valorICMS: item.valorICMS || 0,
            codigoBarrasEAN: item.codigoBarrasEAN,
          })),
        });
      }

      return novaNfae;
    });

    // 5. Retorna NFA-e com itens já carregados
    return this.buscarPorId(nfae.id, data.empresaId);
  }

  async cancelar(id: string, motivo: string, empresaId: string) {
    const nfae = await this.buscarPorId(id, empresaId);

    if (!nfae) {
      throw new Error('NFA-e não encontrada');
    }

    if (nfae.status === 'CANCELADA') {
      throw new Error('NFA-e já está cancelada');
    }

    if (nfae.status !== 'AUTORIZADA') {
      throw new Error('Apenas NFA-e autorizadas podem ser canceladas');
    }

    return prisma.nFAe.update({
      where: { id },
      data: {
        status: 'CANCELADA',
        motivoCancelamento: motivo,
        dataHoraCancelamento: new Date(),
      },
      include: NFAE_INCLUDE,
    });
  }

  async baixarXml(id: string, empresaId: string) {
    const nfae = await this.buscarPorId(id, empresaId);

    if (!nfae) {
      throw new Error('NFA-e não encontrada');
    }

    return nfae.xmlAssinado;
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
    const where: Prisma.NFAeWhereInput = {
      empresaId,
      status: 'AUTORIZADA',
      ...((dataInicio || dataFim) && {
        dataHoraEmissao: {
          ...(dataInicio && { gte: dataInicio }),
          ...(dataFim && { lte: dataFim }),
        },
      }),
    };

    const result = await prisma.nFAe.aggregate({
      where,
      _sum: { valorTotalNota: true, valorTotalICMS: true },
      _count: true,
    });

    return {
      totalFaturamento: Number(result._sum.valorTotalNota) || 0,
      totalICMS: Number(result._sum.valorTotalICMS) || 0,
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
      dataHoraEmissao: { gte: dataInicio, lte: dataFim },
    };

    const [agregado, quantidade] = await Promise.all([
      prisma.nFAe.aggregate({
        where,
        _sum: { valorTotalNota: true, valorTotalICMS: true }
      }),
      prisma.nFAe.count({ where })
    ]);

    return {
      mes,
      ano,
      quantidade,
      totalFaturamento: Number(agregado._sum.valorTotalNota) || 0,
      totalICMS: Number(agregado._sum.valorTotalICMS) || 0,
    };
  }

  async getProximoNumero(empresaId: string, serie: number = 900): Promise<number> {
    const last = await prisma.nFAe.findFirst({
      where: { empresaId, serie },
      orderBy: { numero: 'desc' },
      select: { numero: true },
    });

    return (last?.numero || 0) + 1;
  }

}