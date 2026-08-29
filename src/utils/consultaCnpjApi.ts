// C:\emissornfe\src\utils\consultaCnpjApi.ts

import { limparDocumento } from './cpfCnpjValidator';

export interface ConsultaCnpjResponse {
  sucesso: boolean;
  dados?: {
    cnpj: string;
    razaoSocial: string;
    nomeFantasia?: string;
    situacaoCadastral: string;
    situacaoCadastralDescricao?: string;
    dataSituacaoCadastral: string;
    naturezaJuridica: string;
    naturezaJuridicaCodigo?: string;
    dataAbertura: string;
    cnaePrincipal: string;
    cnaePrincipalDescricao?: string;
    cnaeSecundarios: Array<{
      codigo: string;
      descricao: string;
    }>;
    endereco: {
      tipoLogradouro: string;
      logradouro: string;
      numero: string;
      complemento?: string;
      bairro: string;
      cep: string;
      municipio: string;
      codigoMunicipio: string;
      uf: string;
      pais: string;
      codigoPais: string;
    };
    telefone: Array<{
      ddd: string;
      numero: string;
    }>;
    email: string;
    capitalSocial: number;
    porte: string;
    situacaoEspecial: string;
    dataSituacaoEspecial: string;
    optanteSimples: boolean;
    optanteMEI: boolean;
    socios: Array<{
      nome: string;
      cpf?: string;
      qualificacao: string;
      dataInclusao: string;
    }>;
    rntrc?: {
      numero: string;
      situacao: string;
      dataValidade: string;
      categoria?: string;
      dataPrimeiroCadastro?: string;
      dataSituacao?: string;
      equiparado?: boolean;
    };
    qualificacaoResponsavel?: {
      codigo: string;
      descricao: string;
    };
    motivoSituacaoCadastral?: {
      codigo: string;
      descricao: string;
    };
    matrizFilial?: string;
  };
  erro?: string;
}

/**
 * 🔥 CONSULTA CNPJ VIA OPENCNPJ (API PÚBLICA)
 */
export async function consultarCnpjConectaGov(cnpj: string): Promise<ConsultaCnpjResponse> {
  const cnpjLimpo = limparDocumento(cnpj);
  
  if (cnpjLimpo.length !== 14) {
    return {
      sucesso: false,
      erro: 'CNPJ inválido. Digite 14 dígitos.'
    };
  }

  try {
    const url = `https://api.opencnpj.org/${cnpjLimpo}?datasets=receita,rntrc`;
    
    console.log(`🔍 Consultando OpenCNPJ: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (response.status === 404) {
      return {
        sucesso: false,
        erro: 'CNPJ não encontrado'
      };
    }

    if (!response.ok) {
      return {
        sucesso: false,
        erro: `Erro ${response.status} na consulta`
      };
    }

    const data = await response.json();
    
    console.log('📊 Dados recebidos da OpenCNPJ:', data);
    console.log('📋 RNTRC recebido:', data.rntrc);

    // 🔥 MAPEIA OS SÓCIOS
    let sociosMapeados: Array<{ nome: string; cpf?: string; qualificacao: string; dataInclusao: string }> = [];

    if (data.QSA && Array.isArray(data.QSA)) {
      sociosMapeados = data.QSA.map((s: any) => ({
        nome: s.nome_socio || s.nome || '',
        cpf: s.cnpj_cpf_socio || s.cpf || '',
        qualificacao: s.qualificacao_socio || s.qualificacao || '',
        dataInclusao: s.data_entrada_sociedade || s.data_inclusao || '',
      }));
    }

    // 🔥 MAPEIA RNTRC APENAS COM CAMPOS ESPECÍFICOS (SEM REDUNDÂNCIA)
    let rntrcMapeado = undefined;
    if (data.rntrc) {
rntrcMapeado = {
  numero: data.rntrc.numero_rntrc || data.rntrc.numero || '',
  situacao: data.rntrc.situacao || '',
  dataSituacao: data.rntrc.data_situacao || '',
  categoria: data.rntrc.categoria || '',
  dataPrimeiroCadastro: data.rntrc.data_primeiro_cadastro || '',
  equiparado: data.rntrc.equiparado || false,
};
      console.log('✅ RNTRC mapeado:', rntrcMapeado);
    }

    // 🔥 MAPEIA O RESTANTE DOS DADOS
    const resultado = {
      cnpj: data.cnpj || '',
      razaoSocial: data.razao_social || '',
      nomeFantasia: data.nome_fantasia || '',
      situacaoCadastral: data.situacao_cadastral || '',
      situacaoCadastralDescricao: data.motivo_situacao_cadastral?.descricao || '',
      dataSituacaoCadastral: data.data_situacao_cadastral || '',
      naturezaJuridica: data.natureza_juridica || '',
      naturezaJuridicaCodigo: '',
      dataAbertura: data.data_inicio_atividade || '',
      cnaePrincipal: data.cnae_principal || '',
      cnaePrincipalDescricao: data.cnaes?.find((c: any) => c.is_principal)?.descricao || '',
      cnaeSecundarios: (data.cnaes || [])
        .filter((c: any) => !c.is_principal)
        .map((c: any) => ({
          codigo: c.codigo || '',
          descricao: c.descricao || ''
        })),
      endereco: {
        tipoLogradouro: data.tipo_logradouro || '',
        logradouro: data.logradouro || '',
        numero: data.numero || 'S/N',
        complemento: data.complemento || '',
        bairro: data.bairro || '',
        cep: data.cep || '',
        municipio: data.municipio || '',
        codigoMunicipio: data.codigo_municipio || '',
        uf: data.uf || '',
        pais: data.pais?.descricao || 'BRASIL',
        codigoPais: data.pais?.codigo || '1058',
      },
      telefone: (data.telefones || []).map((t: any) => ({
        ddd: t.ddd || '',
        numero: t.numero || ''
      })),
      email: data.email || '',
      capitalSocial: parseFloat((data.capital_social || '0').replace(',', '.')) || 0,
      porte: data.porte_empresa || '',
      situacaoEspecial: data.situacao_especial || '',
      dataSituacaoEspecial: data.data_situacao_especial || '',
      optanteSimples: data.opcao_simples === 'S',
      optanteMEI: data.opcao_mei === 'S',
      socios: sociosMapeados,
      rntrc: rntrcMapeado,
      qualificacaoResponsavel: data.qualificacao_responsavel ? {
        codigo: data.qualificacao_responsavel.codigo || '',
        descricao: data.qualificacao_responsavel.descricao || ''
      } : undefined,
      motivoSituacaoCadastral: data.motivo_situacao_cadastral ? {
        codigo: data.motivo_situacao_cadastral.codigo || '',
        descricao: data.motivo_situacao_cadastral.descricao || ''
      } : undefined,
      matrizFilial: data.matriz_filial || '',
    };

    console.log('✅ Resultado final:', resultado);

    return {
      sucesso: true,
      dados: resultado
    };

  } catch (error: any) {
    console.error('❌ Erro na consulta:', error);
    return {
      sucesso: false,
      erro: error.message || 'Erro ao consultar CNPJ'
    };
  }
}