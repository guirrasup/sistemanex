// backend/src/services/transportadora.service.ts

import { TransportadoraRepository } from '../repositories/transportadora.repository';
import { EmpresaRepository } from '../repositories/empresa.repository';

export class TransportadoraService {
  private transportadoraRepo: TransportadoraRepository;
  private empresaRepo: EmpresaRepository;

  constructor() {
    this.transportadoraRepo = new TransportadoraRepository();
    this.empresaRepo = new EmpresaRepository();
  }

  async listar(
    empresaId: string,
    page: number,
    limit: number,
    busca: string = ''
  ) {
    return this.transportadoraRepo.findAll(empresaId, page, limit, busca);
  }

  async buscarPorId(id: string) {
    return this.transportadoraRepo.findById(id);
  }

  async buscarPorCnpj(cnpj: string, empresaId: string) {
    return this.transportadoraRepo.findByCnpj(cnpj, empresaId);
  }

  async buscarAtivos(empresaId: string) {
    return this.transportadoraRepo.findAtivos(empresaId);
  }

  async buscarPorTipo(empresaId: string, tipo: string) {
    return this.transportadoraRepo.findByTipoTransportador(empresaId, tipo);
  }

  async criar(data: any) {
    // Validações
    if (!data.cnpj || data.cnpj.replace(/\D/g, '').length !== 14) {
      throw new Error('CNPJ inválido (deve ter 14 dígitos)');
    }

    if (!data.razaoSocial || data.razaoSocial.trim().length < 3) {
      throw new Error('Razão Social é obrigatória (mínimo 3 caracteres)');
    }

    if (!data.endereco) {
      throw new Error('Endereço é obrigatório');
    }

    // Verifica se já existe
    const existente = await this.transportadoraRepo.findByCnpj(
      data.cnpj,
      data.empresaId
    );

    if (existente) {
      throw new Error('Já existe uma transportadora com este CNPJ');
    }

    // Cria transportadora com endereço
    return this.transportadoraRepo.create({
      tipoPessoa: data.tipoPessoa || 'PJ',
      cnpj: data.cnpj,
      razaoSocial: data.razaoSocial,
      nomeFantasia: data.nomeFantasia || null,
      inscricaoEstadual: data.inscricaoEstadual || null,
      inscricaoMunicipal: data.inscricaoMunicipal || null,
      cnae: data.cnae || null,
      email: data.email || null,
      telefone: data.telefone || null,
      celularWhatsApp: data.celularWhatsApp || null,
      contato: data.contato || null,
      site: data.site || null,
      rntrc: data.rntrc || null,
      antt: data.antt || null,
      inscricaoSuframa: data.inscricaoSuframa || null,
      regimeTributario: data.regimeTributario || 'SIMPLES_NACIONAL',
      tipoTransportador: data.tipoTransportador || null,
      banco: data.banco || null,
      agencia: data.agencia || null,
      conta: data.conta || null,
      operacao: data.operacao || null,
      chavePix: data.chavePix || null,
      ativo: data.ativo !== undefined ? data.ativo : true,
      observacoes: data.observacoes || null,
      empresa: {
        connect: { id: data.empresaId }
      },
      endereco: {
        create: {
          logradouro: data.endereco.logradouro || '',
          numero: data.endereco.numero || '',
          complemento: data.endereco.complemento || null,
          bairro: data.endereco.bairro || '',
          codigoMunicipio: data.endereco.codigoMunicipio || '',
          nomeMunicipio: data.endereco.nomeMunicipio || '',
          uf: data.endereco.uf || '',
          cep: data.endereco.cep || '',
          telefone: data.endereco.telefone || data.telefone || '',
          email: data.endereco.email || data.email || ''
        }
      }
    });
  }

  async atualizar(id: string, data: any, empresaId: string) {
    const transportadora = await this.transportadoraRepo.findById(id);

    if (!transportadora) {
      throw new Error('Transportadora não encontrada');
    }

    if (transportadora.empresaId !== empresaId) {
      throw new Error('Acesso negado');
    }

    // Prepara dados para atualização
    const updateData: any = {
      tipoPessoa: data.tipoPessoa,
      cnpj: data.cnpj,
      razaoSocial: data.razaoSocial,
      nomeFantasia: data.nomeFantasia || null,
      inscricaoEstadual: data.inscricaoEstadual || null,
      inscricaoMunicipal: data.inscricaoMunicipal || null,
      cnae: data.cnae || null,
      email: data.email || null,
      telefone: data.telefone || null,
      celularWhatsApp: data.celularWhatsApp || null,
      contato: data.contato || null,
      site: data.site || null,
      rntrc: data.rntrc || null,
      antt: data.antt || null,
      inscricaoSuframa: data.inscricaoSuframa || null,
      regimeTributario: data.regimeTributario,
      tipoTransportador: data.tipoTransportador || null,
      banco: data.banco || null,
      agencia: data.agencia || null,
      conta: data.conta || null,
      operacao: data.operacao || null,
      chavePix: data.chavePix || null,
      ativo: data.ativo !== undefined ? data.ativo : true,
      observacoes: data.observacoes || null
    };

    // Atualiza endereço se fornecido
    if (data.endereco) {
      updateData.endereco = {
        update: {
          logradouro: data.endereco.logradouro,
          numero: data.endereco.numero,
          complemento: data.endereco.complemento || null,
          bairro: data.endereco.bairro,
          codigoMunicipio: data.endereco.codigoMunicipio,
          nomeMunicipio: data.endereco.nomeMunicipio,
          uf: data.endereco.uf,
          cep: data.endereco.cep,
          telefone: data.endereco.telefone || data.telefone || '',
          email: data.endereco.email || data.email || ''
        }
      };
    }

    return this.transportadoraRepo.update(id, updateData);
  }

  async excluir(id: string, empresaId: string) {
    const transportadora = await this.transportadoraRepo.findById(id);

    if (!transportadora) {
      throw new Error('Transportadora não encontrada');
    }

    if (transportadora.empresaId !== empresaId) {
      throw new Error('Acesso negado');
    }

    return this.transportadoraRepo.delete(id);
  }
}