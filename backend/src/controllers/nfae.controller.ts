// backend/src/services/nfae.service.ts

import { prisma } from '../config/prisma';
import { gerarChaveAcessoNFe } from '../utils/chaveAcesso';
import { StatusNFAe } from '@prisma/client';

export class NFAeService {
  
  async listar(empresaId: string, page: number = 1, limit: number = 50, filtros?: any) {
    const skip = (page - 1) * limit;

    const where: any = { empresaId };

    if (filtros?.status) {
      where.status = filtros.status;
    }
    if (filtros?.dataInicio) {
      where.dataHoraEmissao = { gte: new Date(filtros.dataInicio) };
    }
    if (filtros?.dataFim) {
      where.dataHoraEmissao = { lte: new Date(filtros.dataFim) };
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

  async buscarPorId(id: string) {
    return prisma.nFAe.findUnique({
      where: { id },
      include: {
        itens: true,
        destinatario: true,
        historicoStatus: true,
      },
    });
  }

  async buscarPorChave(chave: string) {
    return prisma.nFAe.findUnique({
      where: { chaveAcesso: chave },
      include: {
        itens: true,
        destinatario: true,
        historicoStatus: true,
      },
    });
  }

  async emitir(data: any) {
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

    const itens = data.itens || [];
    const valorTotalProdutos = itens.reduce((acc: number, item: any) => acc + item.valorTotal, 0);
    const valorTotalICMS = itens.reduce((acc: number, item: any) => acc + item.valorICMS, 0);
    const aliquotaICMSMediana = itens.length > 0 
      ? itens.reduce((acc: number, item: any) => acc + item.aliquotaICMS, 0) / itens.length 
      : 0;

    const nfae = await prisma.nFAe.create({
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
        baseCalculoICMS: valorTotalProdutos,
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
        
        protocoloAutorizacao: `1352600${Math.floor(1000000 + Math.random() * 9000000)}`,
        dataHoraAutorizacao: new Date(),
        
        xmlAssinado: this.gerarXmlMock(chaveCompleta, numero, data),
        
        informacoesComplementares: data.informacoesComplementares || '',
        
        empresaId: data.empresaId,
        destinatarioId: data.destinatarioId,
      },
      include: {
        itens: true,
        destinatario: true,
        historicoStatus: true,
      },
    });

    if (itens.length > 0) {
      await Promise.all(
        itens.map((item: any) =>
          prisma.nFAeItem.create({
            data: {
              nfaeId: nfae.id,
              codigo: item.codigo,
              descricao: item.descricao,
              ncm: item.ncm,
              unidade: item.unidade || 'UN',
              quantidade: item.quantidade || 1,
              valorUnitario: item.valorUnitario || 0,
              valorTotal: item.valorTotal || item.quantidade * item.valorUnitario,
              aliquotaICMS: item.aliquotaICMS || 0,
              valorICMS: item.valorICMS || 0,
              codigoBarrasEAN: item.codigoBarrasEAN,
            },
          })
        )
      );
    }

    return this.buscarPorId(nfae.id);
  }

  async cancelar(id: string, motivo: string, empresaId: string) {
    const nfae = await this.buscarPorId(id);

    if (!nfae) {
      throw new Error('NFA-e não encontrada');
    }

    if (nfae.empresaId !== empresaId) {
      throw new Error('Acesso negado');
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
      include: {
        itens: true,
        destinatario: true,
        historicoStatus: true,
      },
    });
  }

  async baixarXml(id: string, empresaId: string) {
    const nfae = await this.buscarPorId(id);

    if (!nfae) {
      throw new Error('NFA-e não encontrada');
    }

    if (nfae.empresaId !== empresaId) {
      throw new Error('Acesso negado');
    }

    return nfae.xmlAssinado;
  }

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

  async getProximoNumero(empresaId: string, serie: number = 900): Promise<number> {
    const last = await prisma.nFAe.findFirst({
      where: { empresaId, serie },
      orderBy: { numero: 'desc' },
      select: { numero: true },
    });

    return (last?.numero || 0) + 1;
  }

  private gerarXmlMock(chave: string, numero: number, data: any): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">
  <NFe>
    <infNFe Id="NFe${chave}" versao="4.00">
      <ide>
        <cUF>${data.requerente?.municipioIbge?.slice(0, 2) || '35'}</cUF>
        <mod>63</mod>
        <nNF>${numero}</nNF>
        <natOp>${data.naturezaOperacao || 'Fornecimento de Energia Elétrica'}</natOp>
      </ide>
    </infNFe>
  </NFe>
</nfeProc>`;
  }
}