import { Prisma } from '@prisma/client';
import { NfseRepository } from '../repositories/nfse.repository.js';
import { ClienteRepository } from '../repositories/cliente.repository.js';
import { EmpresaRepository } from '../repositories/empresa.repository.js';
import { FinanceiroRepository } from '../repositories/financeiro.repository.js';
import { gerarChaveAcessoNFSe } from '../utils/chaveAcesso.js';
import { calcularTributosNfse } from '../utils/tributosEngine.js';
import { gerarXmlNfseNacional } from '../utils/xmlNfseGenerator.js';

export class NfseService {
  private nfseRepo: NfseRepository;
  private clienteRepo: ClienteRepository;
  private empresaRepo: EmpresaRepository;
  private financeiroRepo: FinanceiroRepository;

  constructor() {
    this.nfseRepo = new NfseRepository();
    this.clienteRepo = new ClienteRepository();
    this.empresaRepo = new EmpresaRepository();
    this.financeiroRepo = new FinanceiroRepository();
  }

  async emitirNfse(data: any) {
    const empresa = await this.empresaRepo.findById(data.empresaId);
    if (!empresa) throw new Error('Empresa não encontrada');

    const tomador = await this.clienteRepo.findById(data.tomadorId);
    if (!tomador) throw new Error('Tomador não encontrado');

    if (!empresa.certificado || empresa.certificado.status !== 'VALIDO') {
      throw new Error('Certificado digital inválido ou não configurado');
    }

    const calc = calcularTributosNfse({
      valorServico: data.servico?.valorServico || 0,
      descontoIncondicionado: data.servico?.descontoIncondicionado || 0,
      deducoesMateriais: data.servico?.deducoesMateriais || 0,
      aliquotaISS: data.servico?.aliquotaISS || 5,
      tipoRetencaoISS: data.servico?.tipoRetencaoISS || 1,
      tributacaoISSQN: data.servico?.tributacaoISSQN || 1,
      optanteSimplesNacional: empresa.optanteSimplesNacional || false,
      formaPagamento: data.formaPagamento || '17',
      cnpjTomador: tomador.documento,
    });

    const numeroNfse = await this.getProximoNumero(data.empresaId);
    const aamm = new Date().toISOString().slice(2, 4) +
                 (new Date().getMonth() + 1).toString().padStart(2, '0');

    const { chaveCompleta, codigoVerificacao } = gerarChaveAcessoNFSe({
      codigoMunicipioIBGE: empresa.endereco?.codigoMunicipio || '3550308',
      ambienteGerador: empresa.ambienteEmissao || 1,
      tipoInscricao: 1,
      documentoEmitente: empresa.cnpj,
      numeroNfse,
      anoMesDPS: aamm,
    });

    const nfseData = {
      chaveAcesso: chaveCompleta,
      numeroNfse,
      serieDPS: empresa.serieNfse || 1,
      numeroDPS: numeroNfse,
      dataCompetencia: new Date().toISOString().split('T')[0],
      dataHoraEmissao: new Date(),
      dataHoraProcessamento: new Date(),
      codigoVerificacao,
      ambiente: empresa.ambienteEmissao || 1,
      tipoEmissao: 1,
      status: 'AUTORIZADA',

      codigoTributacaoNacional: data.servico?.codigoTributacaoNacional || '010701',
      codigoTributacaoMunicipal: data.servico?.codigoTributacaoMunicipal || '0107',
      descricaoServico: data.servico?.descricao || 'Serviços prestados',
      codigoNBS: data.servico?.codigoNBS || '1.1403.21.10',
      localPrestacaoCodigo: empresa.endereco?.codigoMunicipio || '3550308',
      localPrestacaoNome: empresa.endereco?.nomeMunicipio || 'São Paulo',
      localPrestacaoUf: empresa.endereco?.uf || 'SP',

      valorServico: calc.valorServico,
      descontoIncondicionado: calc.descontoIncondicionado,
      descontoCondicionado: calc.descontoCondicionado,
      deducoesMateriais: calc.deducoesMateriais,

      tributacaoISSQN: data.servico?.tributacaoISSQN || 1,
      aliquotaISS: calc.aliquotaISS,
      valorISS: calc.valorISS,
      tipoRetencaoISS: data.servico?.tipoRetencaoISS || 1,
      valorISSRetido: calc.valorISSRetido,
      baseCalculoISS: calc.baseCalculoISS,

      aliquotaPIS: calc.aliquotaPIS,
      valorPIS: calc.valorPIS,
      retidoPIS: false,
      aliquotaCOFINS: calc.aliquotaCOFINS,
      valorCOFINS: calc.valorCOFINS,
      retidoCOFINS: false,
      aliquotaIRRF: calc.aliquotaIRRF,
      valorIRRF: calc.valorIRRF,
      aliquotaCSLL: calc.aliquotaCSLL,
      valorCSLL: calc.valorCSLL,
      aliquotaINSS: calc.aliquotaINSS,
      valorINSS: calc.valorINSS,

      valorTotalServicos: calc.valorServico,
      valorTotalDescontos: calc.descontoIncondicionado,
      valorTotalDeducoes: calc.deducoesMateriais,
      valorTotalISS: calc.valorISS,
      valorTotalISSRetido: calc.valorISSRetido,
      valorTotalRetencoesFederais: calc.totalRetencoes - calc.valorISSRetido,
      valorTotalIBS: calc.valorTotalIBS,
      valorTotalCBS: calc.valorCBS,
      valorLiquidoNfse: calc.valorLiquido,
      valorTotalNotaFinal: calc.valorTotalNotaFinal,

      informacoesComplementares: data.informacoesComplementares || '',
      urlVisualizacaoNacional: 'https://www.nfse.gov.br/consultapublica',

      empresaId: data.empresaId,
      tomadorId: data.tomadorId,
    };

    const nfseCriada = await this.nfseRepo.create(nfseData);
    const xml = gerarXmlNfseNacional(nfseCriada);

    await this.empresaRepo.update(data.empresaId, {
      proximoNumeroNfse: numeroNfse + 1
    });

    await this.financeiroRepo.create({
      tipo: 'RECEBER',
      numeroDocumento: `NFSE-${numeroNfse}/01`,
      descricao: `NFS-e ${numeroNfse}`,
      categoria: 'PRESTACAO_SERVICOS',
      pessoaNome: tomador.razaoSocial,
      pessoaDocumento: tomador.documento,
      dataEmissao: new Date(),
      dataVencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      valorOriginal: calc.valorLiquido,
      status: 'PENDENTE',
      formaPagamento: 'PIX / Boleto',
      documentoOrigemTipo: 'NFSE',
      documentoOrigemChave: chaveCompleta,
      empresaId: data.empresaId,
      clienteId: data.tomadorId
    });

    return { ...nfseCriada, xml };
  }

  async getProximoNumero(empresaId: string): Promise<number> {
    const empresa = await this.empresaRepo.findById(empresaId);
    if (!empresa) throw new Error('Empresa não encontrada');
    return (empresa.proximoNumeroNfse || 1);
  }

  async cancelarNfse(id: string, motivo: string, empresaId: string) {
    const nfse = await this.nfseRepo.findById(id);
    if (!nfse) throw new Error('NFS-e não encontrada');
    if (nfse.empresaId !== empresaId) throw new Error('Acesso negado');
    if (nfse.status === 'CANCELADA') throw new Error('NFS-e já está cancelada');
    return this.nfseRepo.cancelar(id, motivo);
  }

  async listarNfses(empresaId: string, page: number, limit: number) {
    return this.nfseRepo.findAll(empresaId, page, limit);
  }

  async buscarPorId(id: string) {
    return this.nfseRepo.findById(id);
  }

  async buscarPorChave(chave: string) {
    return this.nfseRepo.findByChave(chave);
  }

  async getTotalFaturado(empresaId: string, startDate?: Date, endDate?: Date) {
    return this.nfseRepo.getTotalFaturado(empresaId, startDate, endDate);
  }
}
