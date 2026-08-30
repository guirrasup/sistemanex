// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed completo...')

  // ============================================
  // 1. Verificar/Criar empresa padrão
  // ============================================
<<<<<<< HEAD
  const CNPJ_EMPRESA = '18236447000190'

=======
  // O campo "cnpj" da Empresa é @db.Char(14) — só dígitos, sem máscara.
  const CNPJ_EMPRESA = '18236447000190'
  
>>>>>>> 45de1e20cc1feadd2ba63ddd53c3cf08c6821ee7
  let empresa = await prisma.empresa.findUnique({
    where: { cnpj: CNPJ_EMPRESA }
  })

  if (!empresa) {
    empresa = await prisma.empresa.create({
      data: {
        razaoSocial: 'SUP TECNOLOGIA EM SISTEMAS LTDA',
        nomeFantasia: 'SUP TECNOLOGIA',
        cnpj: CNPJ_EMPRESA,
        codigoUF: '35',
        inscricaoEstadual: '114882901110',
        inscricaoMunicipal: '48829012',
        cnae: '6201501',
        regimeTributario: 'SIMPLES_NACIONAL',
        aliquotaSimples: 6.0,
        ambienteEmissao: 'PRODUCAO',
        chavePixPadrao: '18236447000190',
        optanteSimples: true,
        endereco: {
          create: {
            logradouro: 'Avenida Paulista',
            numero: '1374',
            complemento: 'Andar 14 - Sala 142',
            bairro: 'Bela Vista',
            codigoMunicipio: '3550308',
            nomeMunicipio: 'Sao Paulo',
            uf: 'SP',
            codigoUF: '35',
            cep: '01310100',
            telefone: '1132809900',
            email: 'fiscal@suptecnologia.com.br'
          }
        },
        certificado: {
          create: {
            tipo: 'A1',
            nomeTitular: 'SUP TECNOLOGIA EM SISTEMAS LTDA:18236447000190',
            cnpjCpf: '18236447000190',
            emissora: 'AC SERPRO RFB v5 (ICP-Brasil)',
            dataValidadeInicio: new Date('2026-01-10'),
            dataValidadeFim: new Date('2027-01-10'),
            diasRestantes: 138,
            status: 'VALIDO'
          }
        }
      }
    })

    console.log('Empresa criada:', empresa.id)
  } else {
    console.log('Empresa ja existe:', empresa.id)
  }

  // ============================================
  // 2. Verificar/Criar usuário admin
  // ============================================
  let admin = await prisma.usuario.findUnique({
    where: { email: 'admin@suptecnologia.com.br' }
  })

  if (!admin) {
    const senhaHash = await bcrypt.hash('admin123', 12)

    admin = await prisma.usuario.create({
      data: {
        nome: 'Carlos Eduardo Nogueira',
        email: 'admin@suptecnologia.com.br',
        senhaHash,
        cargo: 'Administrador Fiscal',
        perfil: 'ADMIN',
        empresa: { connect: { id: empresa.id } }
      }
    })

    console.log('Usuario admin criado:', admin.email)
  } else {
    console.log('Usuario admin ja existe:', admin.email)
  }

  // ============================================
  // 3. Criar clientes
  // ============================================
  const clientesData = [
    {
      tipo: 'CLIENTE',
      tipoPessoa: 'PJ',
      documento: '33000167000101',
      razaoSocial: 'PETROLEO BRASILEIRO S A PETROBRAS',
      nomeFantasia: 'PETROBRAS',
      inscricaoEstadual: '80002321',
      inscricaoMunicipal: '012994001',
      indicadorIE: 'CONTRIBUINTE',
      email: 'faturamento@petrobras.com.br',
      telefone: '2132244477',
      endereco: {
        logradouro: 'Avenida Republica do Chile',
        numero: '65',
        bairro: 'Centro',
        codigoMunicipio: '3304557',
        nomeMunicipio: 'Rio de Janeiro',
        uf: 'RJ',
        codigoUF: '33',
        cep: '20031912'
      }
    },
    {
      tipo: 'CLIENTE',
      tipoPessoa: 'PJ',
      documento: '00360305000104',
      razaoSocial: 'CAIXA ECONOMICA FEDERAL',
      nomeFantasia: 'CAIXA',
      indicadorIE: 'NAO_CONTRIBUINTE',
      email: 'suprimentos@caixa.gov.br',
      telefone: '6132069900',
      endereco: {
        logradouro: 'SBS Quadra 4 Bloco A',
        numero: 'SN',
        bairro: 'Asa Sul',
        codigoMunicipio: '5300108',
        nomeMunicipio: 'Brasilia',
        uf: 'DF',
        codigoUF: '53',
        cep: '70092900'
      }
    },
    {
      tipo: 'CLIENTE',
      tipoPessoa: 'PJ',
      documento: '02558157000162',
      razaoSocial: 'MAGAZINE LUIZA S/A',
      nomeFantasia: 'MAGAZINE LUIZA',
      inscricaoEstadual: '110042490110',
      indicadorIE: 'CONTRIBUINTE',
      email: 'faturamento@magazineluiza.com.br',
      telefone: '1140044004',
      endereco: {
        logradouro: 'Avenida Brigadeiro Faria Lima',
        numero: '4100',
        bairro: 'Vila Olimpia',
        codigoMunicipio: '3550308',
        nomeMunicipio: 'Sao Paulo',
        uf: 'SP',
        codigoUF: '35',
        cep: '04538132'
      }
    },
    {
      tipo: 'AMBOS',
      tipoPessoa: 'PJ',
      documento: '34274633000102',
      razaoSocial: 'AMBEV S/A',
      nomeFantasia: 'AMBEV',
      inscricaoEstadual: '110123456110',
      inscricaoMunicipal: '21234560',
      indicadorIE: 'CONTRIBUINTE',
      email: 'faturamento@ambev.com.br',
      telefone: '1121221234',
      endereco: {
        logradouro: 'Rua Dr. Renato Paes de Barros',
        numero: '1017',
        bairro: 'Itaim Bibi',
        codigoMunicipio: '3550308',
        nomeMunicipio: 'Sao Paulo',
        uf: 'SP',
        codigoUF: '35',
        cep: '04530001'
      }
    },
    {
      tipo: 'AMBOS',
      tipoPessoa: 'PJ',
      documento: '62494258000193',
      razaoSocial: 'NESTLE BRASIL LTDA',
      nomeFantasia: 'NESTLE',
      inscricaoEstadual: '110789456110',
      indicadorIE: 'CONTRIBUINTE',
      email: 'faturamento@nestle.com.br',
      telefone: '1130492000',
      endereco: {
        logradouro: 'Avenida das Nacoes Unidas',
        numero: '18001',
        bairro: 'Vila Gertrudes',
        codigoMunicipio: '3550308',
        nomeMunicipio: 'Sao Paulo',
        uf: 'SP',
        codigoUF: '35',
        cep: '04795900'
      }
    }
  ]

  for (const data of clientesData) {
    let cliente = await prisma.cliente.findUnique({
      where: { documento: data.documento }
    })

    if (!cliente) {
      await prisma.cliente.create({
        data: {
          tipo: data.tipo,
          tipoPessoa: data.tipoPessoa,
          documento: data.documento,
          razaoSocial: data.razaoSocial,
          nomeFantasia: data.nomeFantasia,
          inscricaoEstadual: data.inscricaoEstadual,
          inscricaoMunicipal: data.inscricaoMunicipal,
          indicadorIE: data.indicadorIE,
          email: data.email,
          telefone: data.telefone,
          empresa: { connect: { id: empresa.id } },
          endereco: { create: data.endereco }
        }
      })
    }
  }

  console.log('Clientes processados')

  // ============================================
  // 4. Criar fornecedores
  // ============================================
  const fornecedoresData = [
    {
      tipo: 'FORNECEDOR',
      tipoPessoa: 'PJ',
      documento: '49067965000120',
      razaoSocial: 'MICROSOFT BRASIL LTDA',
      nomeFantasia: 'MICROSOFT',
      inscricaoEstadual: '110345678110',
      indicadorIE: 'CONTRIBUINTE',
      email: 'fornecedor@microsoft.com.br',
      telefone: '1147027000',
      endereco: {
        logradouro: 'Avenida Nacoes Unidas',
        numero: '12901',
        bairro: 'Vila Gertrudes',
        codigoMunicipio: '3550308',
        nomeMunicipio: 'Sao Paulo',
        uf: 'SP',
        codigoUF: '35',
        cep: '04794000'
      }
    },
    {
      tipo: 'FORNECEDOR',
      tipoPessoa: 'PJ',
      documento: '04263233000169',
      razaoSocial: 'DELL COMPUTADORES DO BRASIL LTDA',
      nomeFantasia: 'DELL',
      inscricaoEstadual: '114882901110',
      indicadorIE: 'CONTRIBUINTE',
      email: 'fornecedor@dell.com.br',
      telefone: '1139983200',
      endereco: {
        logradouro: 'Avenida das Nacoes Unidas',
        numero: '14401',
        bairro: 'Vila Gertrudes',
        codigoMunicipio: '3550308',
        nomeMunicipio: 'Sao Paulo',
        uf: 'SP',
        codigoUF: '35',
        cep: '04794000'
      }
    },
    {
      tipo: 'FORNECEDOR',
      tipoPessoa: 'PJ',
      documento: '02214286000100',
      razaoSocial: 'HP BRASIL INDUSTRIA E COMERCIO LTDA',
      nomeFantasia: 'HP',
      inscricaoEstadual: '110456789110',
      indicadorIE: 'CONTRIBUINTE',
      email: 'fornecedor@hp.com.br',
      telefone: '1140044004',
      endereco: {
        logradouro: 'Avenida das Nacoes Unidas',
        numero: '8501',
        bairro: 'Vila Gertrudes',
        codigoMunicipio: '3550308',
        nomeMunicipio: 'Sao Paulo',
        uf: 'SP',
        codigoUF: '35',
        cep: '05425070'
      }
    },
    {
      tipo: 'FORNECEDOR',
      tipoPessoa: 'PJ',
      documento: '03570683000140',
      razaoSocial: 'CISCO SYSTEMS DO BRASIL LTDA',
      nomeFantasia: 'CISCO',
      inscricaoEstadual: '110567890110',
      indicadorIE: 'CONTRIBUINTE',
      email: 'fornecedor@cisco.com.br',
      telefone: '1135097000',
      endereco: {
        logradouro: 'Avenida das Nacoes Unidas',
        numero: '12901',
        bairro: 'Vila Gertrudes',
        codigoMunicipio: '3550308',
        nomeMunicipio: 'Sao Paulo',
        uf: 'SP',
        codigoUF: '35',
        cep: '04794000'
      }
    },
    {
      tipo: 'FORNECEDOR',
      tipoPessoa: 'PJ',
      documento: '04150884000110',
      razaoSocial: 'IBM BRASIL INDUSTRIA MAQUINAS E SERVICOS LTDA',
      nomeFantasia: 'IBM',
      inscricaoEstadual: '110678901110',
      indicadorIE: 'CONTRIBUINTE',
      email: 'fornecedor@ibm.com.br',
      telefone: '1121321000',
      endereco: {
        logradouro: 'Avenida das Nacoes Unidas',
        numero: '12901',
        bairro: 'Vila Gertrudes',
        codigoMunicipio: '3550308',
        nomeMunicipio: 'Sao Paulo',
        uf: 'SP',
        codigoUF: '35',
        cep: '04794000'
      }
    }
  ]

  for (const data of fornecedoresData) {
    let fornecedor = await prisma.cliente.findUnique({
      where: { documento: data.documento }
    })

    if (!fornecedor) {
      await prisma.cliente.create({
        data: {
          tipo: data.tipo,
          tipoPessoa: data.tipoPessoa,
          documento: data.documento,
          razaoSocial: data.razaoSocial,
          nomeFantasia: data.nomeFantasia,
          inscricaoEstadual: data.inscricaoEstadual,
          indicadorIE: data.indicadorIE,
          email: data.email,
          telefone: data.telefone,
          empresa: { connect: { id: empresa.id } },
          endereco: { create: data.endereco }
        }
      })
    }
  }

  console.log('Fornecedores processados')

  // ============================================
  // 5. Criar produtos
  // ============================================
  const produtosData = [
    {
      codigo: 'SUP-SRV-RACK',
      descricao: 'Servidor Dell PowerEdge R650xs Xeon Silver 32GB RAM 2x960GB SSD Enterprise',
      categoria: 'Hardware & Servidores',
      unidade: 'UN',
      ncm: '84714100',
      cest: '2105300',
      cfopPadrao: '5102',
      precoCusto: 14500.00,
      precoVenda: 21000.00,
      estoqueAtual: 12,
      estoqueMinimo: 3,
      aliquotaICMS: 18.0,
      aliquotaPIS: 1.65,
      aliquotaCOFINS: 7.6,
      aliquotaIPI: 5.0
    },
    {
      codigo: 'SUP-NOBRK-3KVA',
      descricao: 'Nobreak Senoidal Online Rack/Torre 3000VA / 2700W Bivolt',
      categoria: 'Energia & Protecao',
      unidade: 'UN',
      ncm: '85044040',
      cest: '2106100',
      cfopPadrao: '5102',
      precoCusto: 3200.00,
      precoVenda: 4900.00,
      estoqueAtual: 28,
      estoqueMinimo: 5,
      aliquotaICMS: 18.0,
      aliquotaPIS: 1.65,
      aliquotaCOFINS: 7.6,
      aliquotaIPI: 10.0
    },
    {
      codigo: 'SUP-NOTE-DELL',
      descricao: 'Notebook Dell Latitude 5430 Intel Core i7 16GB RAM 512GB SSD 14"',
      categoria: 'Informatica',
      unidade: 'UN',
      ncm: '84713012',
      cest: '2105300',
      cfopPadrao: '5102',
      precoCusto: 5800.00,
      precoVenda: 8500.00,
      estoqueAtual: 45,
      estoqueMinimo: 10,
      aliquotaICMS: 18.0,
      aliquotaPIS: 1.65,
      aliquotaCOFINS: 7.6,
      aliquotaIPI: 5.0
    },
    {
      codigo: 'SUP-MONITOR-24',
      descricao: 'Monitor Dell 24" P2422H Full HD LED IPS',
      categoria: 'Perifericos',
      unidade: 'UN',
      ncm: '85285210',
      cest: '2105900',
      cfopPadrao: '5102',
      precoCusto: 850.00,
      precoVenda: 1450.00,
      estoqueAtual: 60,
      estoqueMinimo: 15,
      aliquotaICMS: 18.0,
      aliquotaPIS: 1.65,
      aliquotaCOFINS: 7.6,
      aliquotaIPI: 5.0
    },
    {
      codigo: 'SUP-SWITCH-48P',
      descricao: 'Switch Gigabit 48 Portas Gerenciavel Cisco SG350-48',
      categoria: 'Redes',
      unidade: 'UN',
      ncm: '85176262',
      cest: '2106100',
      cfopPadrao: '5102',
      precoCusto: 4200.00,
      precoVenda: 6800.00,
      estoqueAtual: 8,
      estoqueMinimo: 2,
      aliquotaICMS: 18.0,
      aliquotaPIS: 1.65,
      aliquotaCOFINS: 7.6,
      aliquotaIPI: 10.0
    }
  ]

  for (const data of produtosData) {
    let produto = await prisma.produto.findUnique({
      where: { codigo: data.codigo }
    })

    if (!produto) {
      await prisma.produto.create({
        data: {
          ...data,
          empresa: { connect: { id: empresa.id } }
        }
      })
    }
  }

  console.log('Produtos processados')

  // ============================================
  // 6. Criar serviços
  // ============================================
  const servicosData = [
    {
      codigoInterno: 'SRV-DEV-01',
      descricao: 'Desenvolvimento e customizacao de sistemas sob medida e integracoes de APIs fiscais',
      codigoTributacaoNacional: '010701',
      codigoTributacaoMunicipal: '0107',
      codigoNBS: '1.1403.21.10',
      cListServ: '01.01',
      valorUnitario: 3500.00,
      aliquotaISS: 5.0,
      retencaoISSPadrao: false,
      aliquotaPIS: 0.65,
      aliquotaCOFINS: 3.0,
      aliquotaIRRF: 1.5,
      aliquotaCSLL: 1.0,
      aliquotaINSS: 0
    },
    {
      codigoInterno: 'SRV-CONS-03',
      descricao: 'Consultoria tecnica em conformidade fiscal SPED, NFS-e Padrao Nacional e Reforma Tributaria 2026',
      codigoTributacaoNacional: '170101',
      codigoTributacaoMunicipal: '1701',
      codigoNBS: '1.1404.10.00',
      cListServ: '17.01',
      valorUnitario: 4800.00,
      aliquotaISS: 5.0,
      retencaoISSPadrao: true,
      aliquotaPIS: 0.65,
      aliquotaCOFINS: 3.0,
      aliquotaIRRF: 1.5,
      aliquotaCSLL: 1.0,
      aliquotaINSS: 0
    },
    {
      codigoInterno: 'SRV-SUPT-02',
      descricao: 'Suporte tecnico especializado em ambientes Windows Server, Linux e redes corporativas',
      codigoTributacaoNacional: '010701',
      codigoTributacaoMunicipal: '0107',
      codigoNBS: '1.1403.22.00',
      cListServ: '01.01',
      valorUnitario: 2500.00,
      aliquotaISS: 5.0,
      retencaoISSPadrao: false,
      aliquotaPIS: 0.65,
      aliquotaCOFINS: 3.0,
      aliquotaIRRF: 1.5,
      aliquotaCSLL: 1.0,
      aliquotaINSS: 0
    },
    {
      codigoInterno: 'SRV-CLOUD-04',
      descricao: 'Migracao e gerenciamento de infraestrutura para nuvem AWS e Azure com DevOps',
      codigoTributacaoNacional: '010701',
      codigoTributacaoMunicipal: '0107',
      codigoNBS: '1.1403.21.50',
      cListServ: '01.01',
      valorUnitario: 6000.00,
      aliquotaISS: 5.0,
      retencaoISSPadrao: false,
      aliquotaPIS: 0.65,
      aliquotaCOFINS: 3.0,
      aliquotaIRRF: 1.5,
      aliquotaCSLL: 1.0,
      aliquotaINSS: 0
    },
    {
      codigoInterno: 'SRV-TREIN-05',
      descricao: 'Treinamento corporativo para equipes fiscais e contabeis sobre SPED e obrigacoes acessorias',
      codigoTributacaoNacional: '180101',
      codigoTributacaoMunicipal: '1801',
      codigoNBS: '1.1404.30.00',
      cListServ: '18.01',
      valorUnitario: 3200.00,
      aliquotaISS: 5.0,
      retencaoISSPadrao: true,
      aliquotaPIS: 0.65,
      aliquotaCOFINS: 3.0,
      aliquotaIRRF: 1.5,
      aliquotaCSLL: 1.0,
      aliquotaINSS: 0
    }
  ]

  for (const data of servicosData) {
    let servico = await prisma.servico.findUnique({
      where: { codigoInterno: data.codigoInterno }
    })

    if (!servico) {
      await prisma.servico.create({
        data: {
          ...data,
          empresa: { connect: { id: empresa.id } }
        }
      })
    }
  }

  console.log('Servicos processados')

  // ============================================
  // 7. Criar transportadoras
  // ============================================
  const transportadorasData = [
    {
      tipoPessoa: 'PJ',
      cnpj: '12345678000190',
      razaoSocial: 'TRANSPORTADORA RAPIDA LTDA',
      nomeFantasia: 'RAPIDA CARGAS',
      inscricaoEstadual: '123456789',
      rntrc: '1234567',
      tipoTransportador: 'RODOVIARIO',
      email: 'contato@rapidacargas.com.br',
      telefone: '1134567890',
      celularWhatsApp: '11987654321',
      contato: 'Joao Silva',
      ativo: true,
      endereco: {
        logradouro: 'Avenida das Transportadoras',
        numero: '500',
        bairro: 'Distrito Industrial',
        codigoMunicipio: '3550308',
        nomeMunicipio: 'Sao Paulo',
        uf: 'SP',
        codigoUF: '35',
        cep: '02000000',
        telefone: '1134567890',
        email: 'contato@rapidacargas.com.br'
      }
    },
    {
      tipoPessoa: 'PJ',
      cnpj: '98765432000110',
      razaoSocial: 'TRANSPORTADORA EXPRESSA LTDA',
      nomeFantasia: 'EXPRESSA CARGAS',
      inscricaoEstadual: '987654321',
      rntrc: '7654321',
      tipoTransportador: 'RODOVIARIO',
      email: 'contato@expressacargas.com.br',
      telefone: '1145678901',
      celularWhatsApp: '11876543210',
      contato: 'Maria Santos',
      ativo: true,
      endereco: {
        logradouro: 'Rua dos Transportes',
        numero: '1000',
        bairro: 'Vila Industrial',
        codigoMunicipio: '3550308',
        nomeMunicipio: 'Sao Paulo',
        uf: 'SP',
        codigoUF: '35',
        cep: '03000000',
        telefone: '1145678901',
        email: 'contato@expressacargas.com.br'
      }
    },
    {
      tipoPessoa: 'PJ',
      cnpj: '45678901000123',
      razaoSocial: 'TRANSPORTADORA FELIX LTDA',
      nomeFantasia: 'FELIX LOGISTICA',
      inscricaoEstadual: '456789123',
      rntrc: '4567890',
      tipoTransportador: 'RODOVIARIO',
      email: 'contato@felixlogistica.com.br',
      telefone: '1156789012',
      celularWhatsApp: '11765432109',
      contato: 'Pedro Felix',
      ativo: true,
      endereco: {
        logradouro: 'Avenida dos Estados',
        numero: '2000',
        bairro: 'Parque Industrial',
        codigoMunicipio: '3550308',
        nomeMunicipio: 'Sao Paulo',
        uf: 'SP',
        codigoUF: '35',
        cep: '04000000',
        telefone: '1156789012',
        email: 'contato@felixlogistica.com.br'
      }
    },
    {
      tipoPessoa: 'PJ',
      cnpj: '67890123000145',
      razaoSocial: 'TRANSPORTADORA UNIAO LTDA',
      nomeFantasia: 'UNIAO FRETES',
      inscricaoEstadual: '678901234',
      rntrc: '6789012',
      tipoTransportador: 'RODOVIARIO',
      email: 'contato@uniaofretes.com.br',
      telefone: '1167890123',
      celularWhatsApp: '11654321098',
      contato: 'Ana Oliveira',
      ativo: true,
      endereco: {
        logradouro: 'Rua das Industrias',
        numero: '300',
        bairro: 'Distrito Logistico',
        codigoMunicipio: '3550308',
        nomeMunicipio: 'Sao Paulo',
        uf: 'SP',
        codigoUF: '35',
        cep: '05000000',
        telefone: '1167890123',
        email: 'contato@uniaofretes.com.br'
      }
    },
    {
      tipoPessoa: 'PJ',
      cnpj: '89012345000167',
      razaoSocial: 'TRANSPORTADORA GLOBAL LTDA',
      nomeFantasia: 'GLOBAL LOG',
      inscricaoEstadual: '890123456',
      rntrc: '8901234',
      tipoTransportador: 'MULTIMODAL',
      email: 'contato@globallog.com.br',
      telefone: '1178901234',
      celularWhatsApp: '11543210987',
      contato: 'Roberto Costa',
      ativo: true,
      endereco: {
        logradouro: 'Avenida Intermodal',
        numero: '1500',
        bairro: 'Logistica',
        codigoMunicipio: '3550308',
        nomeMunicipio: 'Sao Paulo',
        uf: 'SP',
        codigoUF: '35',
        cep: '06000000',
        telefone: '1178901234',
        email: 'contato@globallog.com.br'
      }
    }
  ]

  for (const data of transportadorasData) {
    let transportadora = await prisma.transportadora.findFirst({
      where: {
<<<<<<< HEAD
        cnpj: data.cnpj,
=======
        cnpj: data.cnpj.replace(/\D/g, ''),
>>>>>>> 45de1e20cc1feadd2ba63ddd53c3cf08c6821ee7
        empresaId: empresa.id
      }
    })

    if (!transportadora) {
      await prisma.transportadora.create({
        data: {
          ...data,
          // Campo é @db.Char(14) — só dígitos, sem máscara.
          cnpj: data.cnpj.replace(/\D/g, ''),
          empresa: { connect: { id: empresa.id } },
          endereco: { create: data.endereco }
        }
      })
    }
  }

  console.log('Transportadoras processadas')

  console.log('\n========================================')
  console.log('RESUMO DO SEED')
  console.log('========================================')
  console.log('Empresa: SUP TECNOLOGIA EM SISTEMAS LTDA')
  console.log('Usuario Admin: admin@suptecnologia.com.br (senha: admin123)')
  console.log('Seed concluido com sucesso!')
  console.log('========================================')
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })