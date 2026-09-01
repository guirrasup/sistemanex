// src/services/mdfe.service.ts

import { Prisma, StatusMDFe, ModalMDFe } from '@prisma/client';
import { MdfeRepository } from '../repositories/mdfe.repository';
import { MdfeComponentRepository } from '../repositories/mdfe.component.repository';
import { ClienteRepository } from '../repositories/cliente.repository';
import { EmpresaRepository } from '../repositories/empresa.repository';
import { gerarChaveAcessoMDFe } from '../utils/chaveAcessoMDFe';
import { gerarXmlMDFe } from '../utils/xmlMdfeGenerator';

export class MdfeService {
  private mdfeRepo: MdfeRepository;
  private componentRepo: MdfeComponentRepository;
  private clienteRepo: ClienteRepository;
  private empresaRepo: EmpresaRepository;

  constructor() {
    this.mdfeRepo = new MdfeRepository();
    this.componentRepo = new MdfeComponentRepository();
    this.clienteRepo = new ClienteRepository();
    this.empresaRepo = new EmpresaRepository();
  }

  /**
   * 📋 LISTAR MDF-e COM FILTROS
   */
  async listarMdfes(
    empresaId: string,
    page: number = 1,
    limit: number = 50,
    filtros?: {
      status?: StatusMDFe | StatusMDFe[];
      dataInicio?: Date;
      dataFim?: Date;
      modal?: string;
      numero?: number;
      serie?: number;
      chave?: string;
    }
  ) {
    return this.mdfeRepo.findAll({
      empresaId,
      status: filtros?.status,
      dataInicio: filtros?.dataInicio,
      dataFim: filtros?.dataFim,
      modal: filtros?.modal,
      numero: filtros?.numero,
      serie: filtros?.serie,
      chaveAcesso: filtros?.chave,
      page,
      limit
    });
  }

  /**
   * 🔍 BUSCAR MDF-e POR ID
   */
  async buscarPorId(id: string) {
    return this.mdfeRepo.findById(id);
  }

  /**
   * 🔍 BUSCAR MDF-e POR CHAVE
   */
  async buscarPorChave(chave: string) {
    return this.mdfeRepo.findByChave(chave);
  }

  /**
   * 📝 EMITIR MDF-e
   */
  async emitirMdfe(data: any) {
    const empresa = await this.empresaRepo.findById(data.empresaId);
    if (!empresa) throw new Error('Empresa não encontrada');

    // Valida certificado
    if (!empresa.certificado || empresa.certificado.status !== 'VALIDO') {
      throw new Error('Certificado digital inválido ou não configurado');
    }

    // Valida emitente
    const emitente = await this.clienteRepo.findById(data.emitenteId);
    if (!emitente) throw new Error('Emitente não encontrado');
    if (emitente.empresaId !== data.empresaId) {
      throw new Error('Emitente não pertence à empresa');
    }

    // Valida municípios de carregamento
    if (!data.municipiosCarrega || data.municipiosCarrega.length === 0) {
      throw new Error('Pelo menos um município de carregamento é obrigatório');
    }
    if (data.municipiosCarrega.length > 50) {
      throw new Error('Máximo de 50 municípios de carregamento');
    }

    // Valida municípios de descarga
    if (!data.municipiosDescarga || data.municipiosDescarga.length === 0) {
      throw new Error('Pelo menos um município de descarga é obrigatório');
    }
    if (data.municipiosDescarga.length > 1000) {
      throw new Error('Máximo de 1000 municípios de descarga');
    }

    // Valida documentos
    const totalCTe = data.municipiosDescarga.reduce(
      (acc: number, m: any) => acc + (m.ctes?.length || 0), 0
    );
    const totalNFe = data.municipiosDescarga.reduce(
      (acc: number, m: any) => acc + (m.nfes?.length || 0), 0
    );
    const totalMDFe = data.municipiosDescarga.reduce(
      (acc: number, m: any) => acc + (m.mdfesTransp?.length || 0), 0
    );

    if (totalCTe > 20000) throw new Error('Máximo de 20000 CT-e por MDF-e');
    if (totalNFe > 20000) throw new Error('Máximo de 20000 NF-e por MDF-e');
    if (totalMDFe > 20000) throw new Error('Máximo de 20000 MDF-e por MDF-e (Aquaviário)');

    // Gera número e série
    const numero = await this.getProximoNumero(data.empresaId);
    const serie = empresa.serieMdfe || 1;

    // Gera chave de acesso
    const aamm = new Date().toISOString().slice(2, 4) +
      (new Date().getMonth() + 1).toString().padStart(2, '0');

    const { chaveCompleta, cMDF, cDV } = gerarChaveAcessoMDFe({
      cUF: empresa.endereco?.codigoMunicipio?.slice(0, 2) || '35',
      aamm,
      cnpj: empresa.cnpj,
      modelo: '58',
      serie,
      numero,
      tpEmis: 1
    });

    // Prepara dados do MDF-e
    const mdfeData: Prisma.MDFeCreateInput = {
      chaveAcesso: chaveCompleta,
      modelo: '58',
      serie,
      numero,
      cUF: empresa.endereco?.codigoMunicipio?.slice(0, 2) || '35',
      cMDF,
      cDV,
      modal: data.modal,
      tpAmb: empresa.ambienteEmissao === 'PRODUCAO' ? '1' : '2',
      tpEmit: data.tpEmit,
      tpTransp: data.tpTransp,
      tpEmis: '1',
      procEmi: '0',
      verProc: data.verProc || 'SUP-TECNOLOGIA-3.00',
      dhEmi: new Date(),
      dhIniViagem: data.dhIniViagem ? new Date(data.dhIniViagem) : undefined,
      UFIni: data.UFIni,
      UFFim: data.UFFim,
      indCanalVerde: data.indCanalVerde || false,
      indCarregaPosterior: data.indCarregaPosterior || false,
      status: 'RASCUNHO',
      versaoMDFe: '3.00',

      // Totalizadores
      qCTe: totalCTe || undefined,
      qNFe: totalNFe || undefined,
      qMDFe: totalMDFe || undefined,
      vCarga: data.vCarga || 0,
      cUnid: data.cUnid || '01',
      qCarga: data.qCarga || 0,

      // Produto predominante
      tpCarga: data.tpCarga,
      xProd: data.xProd,
      cEAN: data.cEAN,
      NCM: data.NCM,

      // Informações adicionais
      infAdFisco: data.infAdFisco,
      infCpl: data.infCpl,

      // Relacionamentos
      empresa: { connect: { id: data.empresaId } },
      emitente: { connect: { id: data.emitenteId } },
    };

    // Cria MDF-e
    const mdfe = await this.mdfeRepo.create(mdfeData);

    // Cria componentes em transação
    await this.criarComponentesMDFe(mdfe.id, data);

    // Atualiza número
    await this.empresaRepo.update(data.empresaId, {
      proximoNumeroMdfe: numero + 1
    });

    // Gera XML
    const xml = gerarXmlMDFe({
      mdfe,
      emitente,
      municipiosCarrega: data.municipiosCarrega,
      percursos: data.percursos || [],
      municipiosDescarga: data.municipiosDescarga,
      seguros: data.seguros || [],
      lacres: data.lacres || [],
      autorizadosDownload: data.autorizadosDownload || [],
      produtoPredominante: {
        tpCarga: data.tpCarga,
        xProd: data.xProd,
        cEAN: data.cEAN,
        NCM: data.NCM
      },
      totalizadores: {
        qCTe: totalCTe,
        qNFe: totalNFe,
        qMDFe: totalMDFe,
        vCarga: data.vCarga || 0,
        cUnid: data.cUnid || '01',
        qCarga: data.qCarga || 0
      }
    });

    // Atualiza com XML
    const mdfeAtualizado = await this.mdfeRepo.updateStatus(mdfe.id, 'ASSINADA');
    await this.mdfeRepo.update(id, { xmlAssinado: xml });

    // Registra histórico
    await this.componentRepo.createHistoricoStatus({
      mdfeId: mdfe.id,
      statusAnterior: 'RASCUNHO',
      statusNovo: 'ASSINADA',
      usuario: data.usuario || 'SISTEMA',
      motivo: 'Emissão realizada'
    });

    return { ...mdfeAtualizado, xml };
  }

  /**
   * 🧩 CRIA COMPONENTES DO MDF-e
   */
  private async criarComponentesMDFe(mdfeId: string, data: any) {
    // 1. Municípios de Carregamento
    if (data.municipiosCarrega?.length > 0) {
      await this.componentRepo.createManyMunCarrega(
        data.municipiosCarrega.map((m: any) => ({
          mdfeId,
          cMunCarrega: m.codigo,
          xMunCarrega: m.nome
        }))
      );
    }

    // 2. Percursos
    if (data.percursos?.length > 0) {
      await this.componentRepo.createManyPercurso(
        data.percursos.map((p: any, index: number) => ({
          mdfeId,
          UFPer: p.uf,
          ordem: index + 1
        }))
      );
    }

    // 3. Municípios de Descarga e documentos
    for (const munDescarga of data.municipiosDescarga) {
      const munDescargaCriado = await this.componentRepo.createMunDescarga({
        mdfeId,
        cMunDescarga: munDescarga.codigo,
        xMunDescarga: munDescarga.nome
      });

      // 3.1 CT-e
      if (munDescarga.ctes?.length > 0) {
        for (const cte of munDescarga.ctes) {
          const cteCriado = await this.componentRepo.createCTe({
            munDescargaId: munDescargaCriado.id,
            chCTe: cte.chave,
            SegCodBarra: cte.segundoCodigoBarras,
            indReentrega: cte.indReentrega || false,
            qtdTotal: cte.entregaParcial?.quantidadeTotal,
            qtdParcial: cte.entregaParcial?.quantidadeParcial,
            indPrestacaoParcial: cte.prestacaoParcial?.indicador || false
          });

          // Unidades de Transporte do CT-e
          if (cte.unidadesTransporte?.length > 0) {
            await this.criarUnidadesTransporte(cteCriado.id, cte.unidadesTransporte, 'cte');
          }

          // Produtos Perigosos do CT-e
          if (cte.perigosos?.length > 0) {
            await this.componentRepo.createManyPerigoso(
              cte.perigosos.map((p: any) => ({
                cteId: cteCriado.id,
                nONU: p.numeroONU,
                xNomeAE: p.nomeApropriado,
                xClaRisco: p.classeRisco,
                grEmb: p.grupoEmbalagem,
                qTotProd: p.quantidadeTotal,
                qVolTipo: p.quantidadeVolumes
              }))
            );
          }

          // NF-e Prestação Parcial
          if (cte.prestacaoParcial?.nfes?.length > 0) {
            await this.componentRepo.createManyNFePrestParcial(
              cte.prestacaoParcial.nfes.map((chNFe: string) => ({
                cteId: cteCriado.id,
                chNFe
              }))
            );
          }
        }
      }

      // 3.2 NF-e
      if (munDescarga.nfes?.length > 0) {
        for (const nfe of munDescarga.nfes) {
          const nfeCriado = await this.componentRepo.createNFe({
            munDescargaId: munDescargaCriado.id,
            chNFe: nfe.chave,
            SegCodBarra: nfe.segundoCodigoBarras,
            indReentrega: nfe.indReentrega || false
          });

          // Unidades de Transporte da NF-e
          if (nfe.unidadesTransporte?.length > 0) {
            await this.criarUnidadesTransporte(nfeCriado.id, nfe.unidadesTransporte, 'nfe');
          }

          // Produtos Perigosos da NF-e
          if (nfe.perigosos?.length > 0) {
            await this.componentRepo.createManyPerigoso(
              nfe.perigosos.map((p: any) => ({
                nfeId: nfeCriado.id,
                nONU: p.numeroONU,
                xNomeAE: p.nomeApropriado,
                xClaRisco: p.classeRisco,
                grEmb: p.grupoEmbalagem,
                qTotProd: p.quantidadeTotal,
                qVolTipo: p.quantidadeVolumes
              }))
            );
          }
        }
      }

      // 3.3 MDF-e Transportado (Aquaviário)
      if (munDescarga.mdfesTransp?.length > 0) {
        for (const mdfeTransp of munDescarga.mdfesTransp) {
          const mdfeTranspCriado = await this.componentRepo.createMDFeTransp({
            munDescargaId: munDescargaCriado.id,
            chMDFe: mdfeTransp.chave,
            indReentrega: mdfeTransp.indReentrega || false
          });

          // Unidades de Transporte do MDF-e
          if (mdfeTransp.unidadesTransporte?.length > 0) {
            await this.criarUnidadesTransporte(mdfeTranspCriado.id, mdfeTransp.unidadesTransporte, 'mdfeTransp');
          }

          // Produtos Perigosos do MDF-e
          if (mdfeTransp.perigosos?.length > 0) {
            await this.componentRepo.createManyPerigoso(
              mdfeTransp.perigosos.map((p: any) => ({
                mdfeTranspId: mdfeTranspCriado.id,
                nONU: p.numeroONU,
                xNomeAE: p.nomeApropriado,
                xClaRisco: p.classeRisco,
                grEmb: p.grupoEmbalagem,
                qTotProd: p.quantidadeTotal,
                qVolTipo: p.quantidadeVolumes
              }))
            );
          }
        }
      }
    }

    // 4. Seguros
    if (data.seguros?.length > 0) {
      await this.componentRepo.createManySeguro(
        data.seguros.map((s: any) => ({
          mdfeId,
          respSeg: s.responsavel,
          respCNPJ: s.responsavelCNPJ,
          respCPF: s.responsavelCPF,
          xSeg: s.seguradoraNome,
          CNPJSeg: s.seguradoraCNPJ,
          nApol: s.apolice,
          nAver: s.averbacoes ? JSON.stringify(s.averbacoes) : null
        }))
      );
    }

    // 5. Lacres do MDF-e
    if (data.lacres?.length > 0) {
      await this.componentRepo.createManyLacre(
        data.lacres.map((l: string) => ({
          mdfeId,
          nLacre: l
        }))
      );
    }

    // 6. Autorizados para Download
    if (data.autorizadosDownload?.length > 0) {
      await this.componentRepo.createManyAutXML(
        data.autorizadosDownload.map((a: any) => ({
          mdfeId,
          CNPJ: a.cnpj,
          CPF: a.cpf
        }))
      );
    }
  }

  /**
   * 🧩 CRIA UNIDADES DE TRANSPORTE
   */
  private async criarUnidadesTransporte(
    parentId: string,
    unidades: any[],
    parentType: 'cte' | 'nfe' | 'mdfeTransp'
  ) {
    for (const unidade of unidades) {
      const unidadeCriada = await this.componentRepo.createUnidadeTransp({
        tpUnidTransp: unidade.tipo,
        idUnidTransp: unidade.identificacao,
        [`${parentType}Id`]: parentId,
        qtdRat: unidade.quantidadeRateada
      });

      // Lacres da unidade de transporte
      if (unidade.lacres?.length > 0) {
        await this.componentRepo.createManyLacreUnidade(
          unidade.lacres.map((l: string) => ({
            unidadeTranspId: unidadeCriada.id,
            nLacre: l
          }))
        );
      }

      // Unidades de carga
      if (unidade.unidadesCarga?.length > 0) {
        for (const uc of unidade.unidadesCarga) {
          const ucCriada = await this.componentRepo.createUnidadeCarga({
            unidadeTranspId: unidadeCriada.id,
            tpUnidCarga: uc.tipo,
            idUnidCarga: uc.identificacao,
            qtdRat: uc.quantidadeRateada
          });

          // Lacres da unidade de carga
          if (uc.lacres?.length > 0) {
            await this.componentRepo.createManyLacreUnidadeCarga(
              uc.lacres.map((l: string) => ({
                unidadeCargaId: ucCriada.id,
                nLacre: l
              }))
            );
          }
        }
      }
    }
  }

  /**
   * 🚩 ENCERRAR MDF-e
   */
  async encerrarMdfe(id: string, protocolo: string, municipioEncerramento: string, empresaId: string) {
    const mdfe = await this.mdfeRepo.findById(id);
    if (!mdfe) throw new Error('MDF-e não encontrado');
    if (mdfe.empresaId !== empresaId) throw new Error('Acesso negado');

    if (mdfe.status === 'ENCERRADA') {
      throw new Error('MDF-e já está encerrado');
    }

    if (mdfe.status !== 'AUTORIZADA') {
      throw new Error('MDF-e deve estar autorizado para ser encerrado');
    }

    const result = await this.mdfeRepo.encerrar(id, protocolo, municipioEncerramento);

    await this.componentRepo.createHistoricoStatus({
      mdfeId: id,
      statusAnterior: mdfe.status,
      statusNovo: 'ENCERRADA',
      usuario: 'SISTEMA',
      motivo: 'Encerramento da viagem'
    });

    return result;
  }

  /**
   * ❌ CANCELAR MDF-e
   */
  async cancelarMdfe(id: string, motivo: string, empresaId: string) {
    const mdfe = await this.mdfeRepo.findById(id);
    if (!mdfe) throw new Error('MDF-e não encontrado');
    if (mdfe.empresaId !== empresaId) throw new Error('Acesso negado');

    if (mdfe.status === 'CANCELADA') {
      throw new Error('MDF-e já está cancelado');
    }

    if (mdfe.status === 'ENCERRADA') {
      throw new Error('MDF-e encerrado não pode ser cancelado');
    }

    const result = await this.mdfeRepo.cancelar(id, motivo);

    await this.componentRepo.createHistoricoStatus({
      mdfeId: id,
      statusAnterior: mdfe.status,
      statusNovo: 'CANCELADA',
      usuario: 'SISTEMA',
      motivo
    });

    return result;
  }

  /**
   * 📊 ESTATÍSTICAS DE MDF-e
   */
  async getEstatisticas(empresaId: string) {
    return this.mdfeRepo.getEstatisticas(empresaId);
  }

  /**
   * 💰 TOTAL DE CARGA TRANSPORTADA
   */
  async getTotalCarga(empresaId: string, startDate?: Date, endDate?: Date) {
    return this.mdfeRepo.getTotalCarga(empresaId, startDate, endDate);
  }

  /**
   * 🔢 OBTÉM PRÓXIMO NÚMERO
   */
  private async getProximoNumero(empresaId: string): Promise<number> {
    const empresa = await this.empresaRepo.findById(empresaId);
    if (!empresa) throw new Error('Empresa não encontrada');
    return (empresa.proximoNumeroMdfe || 1);
  }
}