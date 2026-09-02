// src/services/cte.service.ts

import { CteRepository, FiltroCte } from '../repositories/cte.repository';
import { StatusDocumento } from '@prisma/client';
import { gerarChaveAcessoNFe, calcularDVMod11NFe } from '../utils/chaveAcesso';

export class CteService {
  private cteRepo: CteRepository;

  constructor() {
    this.cteRepo = new CteRepository();
  }

  /**
   * 📋 LISTAR CT-e COM FILTROS
   */
  async listarCtes(
    empresaId: string,
    page: number = 1,
    limit: number = 50,
    filtros?: FiltroCte
  ) {
    return this.cteRepo.findAll(empresaId, page, limit, filtros);
  }

  /**
   * 🔍 BUSCAR CT-e POR ID
   */
  async buscarPorId(id: string) {
    return this.cteRepo.findById(id);
  }

  /**
   * 🔍 BUSCAR CT-e POR CHAVE DE ACESSO
   */
  async buscarPorChave(chave: string) {
    return this.cteRepo.findByChave(chave);
  }

  /**
   * 🔍 BUSCAR CT-e POR PROTOCOLO
   */
  async buscarPorProtocolo(protocolo: string) {
    return this.cteRepo.findByProtocolo(protocolo);
  }

  /**
   * 📝 EMITIR CT-e
   */
  async emitirCte(data: any) {
    // 1. Gerar chave de acesso
    const cUF = data.cUF || data.cMunIni?.slice(0, 2) || '35';
    const aamm = new Date().toISOString().slice(2, 4) + new Date().toISOString().slice(5, 7);
    const cnpjEmitente = data.emitenteCNPJ || '00000000000000';
    const serie = data.serie || 1;
    const numero = data.nCT || (await this.cteRepo.getProximoNumero(data.empresaId, serie));
    const tipoEmissao = data.tpEmis || 1;

    const { chaveCompleta, codigoNumerico, dv } = gerarChaveAcessoNFe({
      codigoUf: cUF,
      anoMes: aamm,
      cnpjEmitente,
      modelo: '57',
      serie,
      numero,
      tipoEmissao,
    });

    // 2. Calcular valores
    const vTPrest = data.vTPrest || this.calcularTotalFrete(data);
    const vRec = data.vRec || vTPrest;

    // 3. Calcular ICMS
    const aliquotaICMS = data.aliquotaICMS || 12;
    const vBC = vTPrest;
    const vICMS = (vBC * aliquotaICMS) / 100;
    const vPIS = (vTPrest * 0.65) / 100;
    const vCOFINS = (vTPrest * 3.0) / 100;

    // 4. Criar CT-e
    const cte = await this.cteRepo.create({
      // IDENTIFICAÇÃO
      versao: '4.00',
      cUF,
      cCT: codigoNumerico,
      CFOP: data.CFOP || '6353',
      natOp: data.natOp || 'Prestação de Serviço de Transporte de Cargas',
      mod: '57',
      serie,
      nCT: numero,
      dhEmi: new Date(),
      tpImp: data.tpImp || '1',
      tpEmis: tipoEmissao,
      cDV: dv,
      tpAmb: data.tpAmb || 1,
      tpCTe: data.tpCTe || 'NORMAL',
      procEmi: data.procEmi || '0',
      verProc: data.verProc || 'SUP-TECNOLOGIA-1.0',
      indGlobalizado: data.indGlobalizado || false,
      cMunEnv: data.cMunEnv || data.cMunIni,
      xMunEnv: data.xMunEnv || data.xMunIni,
      UFEnv: data.UFEnv || data.UFIni,
      modal: data.modal || 'RODOVIARIO',
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

      // VALORES DA PRESTAÇÃO
      vTPrest,
      vRec,

      // IMPOSTOS - ICMS00
      CST00: '00',
      vBC00: vBC,
      pICMS00: aliquotaICMS,
      vICMS00: vICMS,

      // INFORMAÇÕES DA CARGA
      vCarga: data.valorCargaAverbada,
      proPred: data.produtoPredominante,
      xOutCat: data.xOutCat,
      vCargaAverb: data.valorCargaAverbada,

      // COBRANÇA
      nFat: data.nFat || String(numero),
      vOrig: vTPrest,
      vLiq: vTPrest,

      // CT-e DE SUBSTITUIÇÃO
      chCteSub: data.chCteSub,
      indAlteraToma: data.indAlteraToma,

      // CT-e GLOBALIZADO
      xObsGlobalizado: data.xObsGlobalizado,

      // STATUS
      status: 'AUTORIZADA',
      chaveAcesso: chaveCompleta,
      protocoloAutorizacao: `1352600${Math.floor(1000000 + Math.random() * 9000000)}`,
      dataHoraAutorizacao: new Date(),
      xmlAssinado: data.xmlAssinado || this.gerarXmlMock(chaveCompleta, numero, data),

      // RELACIONAMENTOS
      empresaId: data.empresaId,
      emitenteId: data.emitenteId,
      remetenteId: data.remetenteId,
      destinatarioId: data.destinatarioId,
      expedidorId: data.expedidorId,
      recebedorId: data.recebedorId,
      transportadoraId: data.transportadoraId,

      // SUB-ESTRUTURAS
      componentes: data.componentes,
      quantidades: data.quantidades,
      duplicatas: data.duplicatas,
      observacoes: data.observacoes,
      observacoesFisco: data.observacoesFisco,
      autorizadosDownload: data.autorizadosDownload,
      complementos: data.complementos,
      substitutos: data.substitutos,
      globalizados: data.globalizados,
      servicosVinculados: data.servicosVinculados,
      documentos: data.documentos,
    });

    return cte;
  }

  /**
   * ❌ CANCELAR CT-e
   */
  async cancelarCte(id: string, motivo: string, empresaId: string) {
    const cte = await this.cteRepo.findById(id);

    if (!cte) {
      throw new Error('CT-e não encontrado');
    }

    if (cte.empresaId !== empresaId) {
      throw new Error('Acesso negado');
    }

    if (cte.status === 'CANCELADA') {
      throw new Error('CT-e já está cancelado');
    }

    if (cte.status !== 'AUTORIZADA') {
      throw new Error('Apenas CT-e autorizados podem ser cancelados');
    }

    return this.cteRepo.updateStatus(id, 'CANCELADA', motivo);
  }

  /**
   * 📄 BAIXAR XML DO CT-e
   */
  async baixarXml(id: string, empresaId: string) {
    const cte = await this.cteRepo.findById(id);

    if (!cte) {
      throw new Error('CT-e não encontrado');
    }

    if (cte.empresaId !== empresaId) {
      throw new Error('Acesso negado');
    }

    return cte.xmlAssinado;
  }

  /**
   * 📄 GERAR DACTE
   */
  async gerarDacte(id: string, empresaId: string) {
    const cte = await this.cteRepo.findById(id);

    if (!cte) {
      throw new Error('CT-e não encontrado');
    }

    if (cte.empresaId !== empresaId) {
      throw new Error('Acesso negado');
    }

    // Retorna os dados para o frontend renderizar o DACTE
    return {
      id: cte.id,
      numero: cte.nCT,
      serie: cte.serie,
      chaveAcesso: cte.chaveAcesso,
      dataHoraEmissao: cte.dhEmi,
      naturezaOperacao: cte.natOp,
      cfop: cte.CFOP,
      modal: cte.modal,
      emitente: {
        razaoSocial: cte.emitente?.razaoSocial || 'Emitente não encontrado',
        cnpj: cte.emitente?.cnpj || '',
        inscricaoEstadual: cte.emitente?.inscricaoEstadual || '',
        endereco: cte.emitente?.endereco || {},
      },
      remetente: {
        nomeRazaoSocial: cte.remetente?.razaoSocial || '',
        documento: cte.remetente?.documento || '',
        inscricaoEstadual: cte.remetente?.inscricaoEstadual || '',
        endereco: cte.remetente?.endereco || {},
      },
      destinatario: {
        nomeRazaoSocial: cte.destinatario?.razaoSocial || '',
        documento: cte.destinatario?.documento || '',
        inscricaoEstadual: cte.destinatario?.inscricaoEstadual || '',
        endereco: cte.destinatario?.endereco || {},
      },
      municipioInicio: { nome: cte.xMunIni, uf: cte.UFIni },
      municipioFim: { nome: cte.xMunFim, uf: cte.UFFim },
      produtoPredominante: cte.proPred,
      valorCargaAverbada: cte.vCargaAverb,
      pesoBrutoKg: 0,
      pesoLiquidoKg: 0,
      quantidadeVolumes: 0,
      especieVolumes: '',
      rntrc: '',
      veiculo: { placa: '', uf: '' },
      motorista: { nome: '', cpf: '' },
      valorTotalFrete: cte.vTPrest,
      componentesValor: {
        fretePeso: 0,
        freteValor: 0,
        pedagio: 0,
        taxaGris: 0,
        outrasTaxas: 0,
      },
      valorReceber: cte.vRec,
      cstICMS: cte.CST00 || '00',
      baseCalculoICMS: cte.vBC00 || 0,
      aliquotaICMS: cte.pICMS00 || 0,
      valorICMS: cte.vICMS00 || 0,
      protocoloAutorizacao: cte.protocoloAutorizacao,
      dataHoraAutorizacao: cte.dataHoraAutorizacao,
    };
  }

  /**
   * 📊 ESTATÍSTICAS
   */
  async getEstatisticas(empresaId: string) {
    return this.cteRepo.getEstatisticas(empresaId);
  }

  /**
   * 💰 TOTAL DE FRETE POR PERÍODO
   */
  async getTotalFrete(empresaId: string, dataInicio?: Date, dataFim?: Date) {
    return this.cteRepo.getTotalFrete(empresaId, dataInicio, dataFim);
  }

  /**
   * 📊 RESUMO MENSAL
   */
  async getResumoMensal(empresaId: string, ano: number, mes: number) {
    return this.cteRepo.getResumoMensal(empresaId, ano, mes);
  }

  /**
   * 📊 CT-e POR CLIENTE
   */
  async findByCliente(clienteId: string, tipo: string, dataInicio?: Date, dataFim?: Date) {
    return this.cteRepo.findByCliente(clienteId, tipo, dataInicio, dataFim);
  }

  /**
   * 📊 CT-e POR TRANSPORTADORA
   */
  async findByTransportadora(transportadoraId: string, dataInicio?: Date, dataFim?: Date) {
    return this.cteRepo.findByTransportadora(transportadoraId, dataInicio, dataFim);
  }

  /**
   * 📊 CT-e POR MODAL
   */
  async findByModal(modal: string, dataInicio?: Date, dataFim?: Date) {
    return this.cteRepo.findByModal(modal, dataInicio, dataFim);
  }

  /**
   * 📊 CT-e POR STATUS
   */
  async findByStatus(status: StatusDocumento, dataInicio?: Date, dataFim?: Date) {
    return this.cteRepo.findByStatus(status, dataInicio, dataFim);
  }

  /**
   * 🔄 BUSCAR CT-e SUBSTITUÍDO
   */
  async buscarCteSubstituido(chave: string) {
    return this.cteRepo.buscarCteSubstituido(chave);
  }

  /**
   * 🔄 BUSCAR CT-e COMPLEMENTADO
   */
  async buscarCteComplementado(chave: string) {
    return this.cteRepo.buscarCteComplementado(chave);
  }

  /**
   * 🔢 CALCULAR TOTAL DO FRETE
   */
  private calcularTotalFrete(data: any): number {
    let total = 0;

    if (data.componentesValor) {
      total += data.componentesValor.fretePeso || 0;
      total += data.componentesValor.freteValor || 0;
      total += data.componentesValor.pedagio || 0;
      total += data.componentesValor.taxaGris || 0;
      total += data.componentesValor.outrasTaxas || 0;
    }

    return total || 0;
  }

  /**
   * 🔧 GERAR XML MOCK (para desenvolvimento)
   */
  private gerarXmlMock(chave: string, numero: number, data: any): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<cteProc versao="4.00" xmlns="http://www.portalfiscal.inf.br/cte">
  <CTe>
    <infCte Id="CTe${chave}" versao="4.00">
      <ide>
        <cUF>${data.cUF || '35'}</cUF>
        <mod>57</mod>
        <nCT>${numero}</nCT>
      </ide>
    </infCte>
  </CTe>
</cteProc>`;
  }
}