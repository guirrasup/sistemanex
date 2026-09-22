// prisma/seed.ts
import { PrismaClient, Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// 🔥 LIMITES DE RECURSOS (mitigação CWE-770 / CWE-400)
const MAX_TRANSACTION_BATCH = 500

// 🔥 CONFIGURAÇÃO VIA ENV (evita credenciais/ambiente hardcoded — CWE-798 / CWE-1188)
const SEED_ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@suptecnologia.com.br'
const SEED_ADMIN_SENHA = process.env.SEED_ADMIN_SENHA
const SEED_AMBIENTE = process.env.SEED_AMBIENTE === 'PRODUCAO' ? 'PRODUCAO' : 'HOMOLOGACAO'

if (!SEED_ADMIN_SENHA) {
  console.error('❌ Defina SEED_ADMIN_SENHA no ambiente antes de rodar o seed.')
  process.exit(1)
}

// 🔥 HELPER DE TRANSAÇÃO EM LOTES (fatia em vez de abortar — CWE-770)
async function criarEmLotes<T>(
  registros: T[],
  criar: (data: T) => Prisma.PrismaPromise<unknown>,
  tamanhoLote: number = MAX_TRANSACTION_BATCH
): Promise<void> {
  for (let i = 0; i < registros.length; i += tamanhoLote) {
    const lote = registros.slice(i, i + tamanhoLote)
    await prisma.$transaction(lote.map(criar))
  }
}

async function main() {
  const CNPJ_EMPRESA = '18236447000190'

  let empresa = await prisma.empresa.findUnique({
    where: { cnpj: CNPJ_EMPRESA }
  })

  if (!empresa) {
    empresa = await prisma.empresa.create({
      data: {
        razaoSocial: 'SUP TECNOLOGIA EM SISTEMAS LTDA - DEV',
        nomeFantasia: 'SUP TECNOLOGIA DEV',
        cnpj: CNPJ_EMPRESA,
        uf: 'SP',
        codigoUF: '35',
        codigoMunicipio: '3550308',
        nomeMunicipio: 'Sao Paulo',
        inscricaoEstadual: '114882901110',
        inscricaoMunicipal: '48829012',
        cnae: '6201501',
        regimeTributario: 'SIMPLES_NACIONAL',
        aliquotaSimples: 6.0,
        ambienteEmissao: SEED_AMBIENTE, // ✅ env-driven (default HOMOLOGACAO)
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

  let admin = await prisma.usuario.findUnique({
    where: { email: SEED_ADMIN_EMAIL }
  })

  if (!admin) {
    const senhaHash = await bcrypt.hash(SEED_ADMIN_SENHA, 12)

    admin = await prisma.usuario.create({
      data: {
        nome: 'Carlos Eduardo Nogueira',
        email: SEED_ADMIN_EMAIL,
        senhaHash,
        cargo: 'Administrador Fiscal',
        perfil: 'ADMIN',
        empresa: { connect: { id: empresa.id } }
      }
    })

    /* [AutoPatch] Remova o dado sensível do log ou mascare antes:
   console.log('Usuario admin criado:', admin.email)
*/
  } else {
    /* [AutoPatch] Remova o dado sensível do log ou mascare antes:
   console.log('Usuario admin ja existe:', admin.email)
*/
  }

  // ============================================
  // CLIENTES (CNPJs fictícios válidos — sem empresas reais)
  // ============================================
  const clientesData = [
    {
      tipo: 'CLIENTE',
      tipoPessoa: 'PJ',
      documento: '11222333000181',
      razaoSocial: 'CLIENTE EXEMPLO ALFA LTDA - DEV',
      nomeFantasia: 'ALFA DEV',
      inscricaoEstadual: '80002321',
      inscricaoMunicipal: '012994001',
      indIEDest: '1',
      email: 'faturamento@alfa-dev.local',
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
      documento: '22333444000162',
      razaoSocial: 'CLIENTE EXEMPLO BETA S/A - DEV',
      nomeFantasia: 'BETA DEV',
      indIEDest: '9',
      email: 'suprimentos@beta-dev.local',
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
      documento: '33444555000143',
      razaoSocial: 'CLIENTE EXEMPLO GAMA LTDA - DEV',
      nomeFantasia: 'GAMA DEV',
      inscricaoEstadual: '110042490110',
      indIEDest: '1',
      email: 'faturamento@gama-dev.local',
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
      documento: '44555666000124',
      razaoSocial: 'CLIENTE EXEMPLO DELTA S/A - DEV',
      nomeFantasia: 'DELTA DEV',
      inscricaoEstadual: '110123456110',
      inscricaoMunicipal: '21234560',
      indIEDest: '1',
      email: 'faturamento@delta-dev.local',
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
      documento: '55666777000105',
      razaoSocial: 'CLIENTE EXEMPLO EPSILON LTDA - DEV',
      nomeFantasia: 'EPSILON DEV',
      inscricaoEstadual: '110789456110',
      indIEDest: '1',
      email: 'faturamento@epsilon-dev.local',
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

  const documentosClientes = clientesData.map(c => c.documento)
  const clientesExistentes = await prisma.cliente.findMany({
    where: { documento: { in: documentosClientes } },
    select: { documento: true }
  })
  const documentosClientesExistentes = new Set(clientesExistentes.map(c => c.documento))

  const clientesParaCriar = clientesData.filter(c => !documentosClientesExistentes.has(c.documento))

  if (clientesParaCriar.length > 0) {
    // ✅ chunking em vez de abort
    await criarEmLotes(
      clientesParaCriar,
      (data) =>
        prisma.cliente.create({
          data: {
            tipo: data.tipo,
            tipoPessoa: data.tipoPessoa,
            documento: data.documento,
            razaoSocial: data.razaoSocial,
            nomeFantasia: data.nomeFantasia,
            inscricaoEstadual: data.inscricaoEstadual,
            inscricaoMunicipal: data.inscricaoMunicipal,
            indIEDest: data.indIEDest,
            email: data.email,
            telefone: data.telefone,
            empresa: { connect: { id: empresa.id } },
            endereco: { create: data.endereco }
          }
        })
    )
  }

  console.log('Clientes processados')

  // ============================================
  // FORNECEDORES (CNPJs fictícios válidos)
  // ============================================
  const fornecedoresData = [
    {
      tipo: 'FORNECEDOR',
      tipoPessoa: 'PJ',
      documento: '66777888000196',
      razaoSocial: 'FORNECEDOR EXEMPLO ZETA LTDA - DEV',
      nomeFantasia: 'ZETA DEV',
      inscricaoEstadual: '110345678110',
      indIEDest: '1',
      email: 'fornecedor@zeta-dev.local',
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
      documento: '77888999000177',
      razaoSocial: 'FORNECEDOR EXEMPLO ETA LTDA - DEV',
      nomeFantasia: 'ETA DEV',
      inscricaoEstadual: '114882901110',
      indIEDest: '1',
      email: 'fornecedor@eta-dev.local',
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
      documento: '88999000000158',
      razaoSocial: 'FORNECEDOR EXEMPLO THETA LTDA - DEV',
      nomeFantasia: 'THETA DEV',
      inscricaoEstadual: '110456789110',
      indIEDest: '1',
      email: 'fornecedor@theta-dev.local',
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
      documento: '99000111000139',
      razaoSocial: 'FORNECEDOR EXEMPLO IOTA LTDA - DEV',
      nomeFantasia: 'IOTA DEV',
      inscricaoEstadual: '110567890110',
      indIEDest: '1',
      email: 'fornecedor@iota-dev.local',
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
      documento: '10111213000110',
      razaoSocial: 'FORNECEDOR EXEMPLO KAPPA LTDA - DEV',
      nomeFantasia: 'KAPPA DEV',
      inscricaoEstadual: '110678901110',
      indIEDest: '1',
      email: 'fornecedor@kappa-dev.local',
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

  const documentosFornecedores = fornecedoresData.map(f => f.documento)
  const fornecedoresExistentes = await prisma.cliente.findMany({
    where: { documento: { in: documentosFornecedores } },
    select: { documento: true }
  })
  const documentosFornecedoresExistentes = new Set(fornecedoresExistentes.map(f => f.documento))

  const fornecedoresParaCriar = fornecedoresData.filter(f => !documentosFornecedoresExistentes.has(f.documento))

  if (fornecedoresParaCriar.length > 0) {
    await criarEmLotes(
      fornecedoresParaCriar,
      (data) =>
        prisma.cliente.create({
          data: {
            tipo: data.tipo,
            tipoPessoa: data.tipoPessoa,
            documento: data.documento,
            razaoSocial: data.razaoSocial,
            nomeFantasia: data.nomeFantasia,
            inscricaoEstadual: data.inscricaoEstadual,
            indIEDest: data.indIEDest,
            email: data.email,
            telefone: data.telefone,
            empresa: { connect: { id: empresa.id } },
            endereco: { create: data.endereco }
          }
        })
    )
  }

  console.log('Fornecedores processados')

  // ============================================
  // PRODUTOS (mantidos — são genéricos, sem marca real)
  // ============================================
  const produtosData = [
    {
      codigo: 'SUP-SRV-RACK',
      descricao: 'Servidor Rack 1U Xeon Silver 32GB RAM 2x960GB SSD Enterprise',
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
      codigo: 'SUP-NOTE-PRO',
      descricao: 'Notebook Corporativo Intel Core i7 16GB RAM 512GB SSD 14"',
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
      descricao: 'Monitor 24" Full HD LED IPS',
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
      descricao: 'Switch Gigabit 48 Portas Gerenciavel',
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

  const codigosProdutos = produtosData.map(p => p.codigo)
  const produtosExistentes = await prisma.produto.findMany({
    where: { codigo: { in: codigosProdutos } },
    select: { codigo: true }
  })
  const codigosProdutosExistentes = new Set(produtosExistentes.map(p => p.codigo))

  const produtosParaCriar = produtosData.filter(p => !codigosProdutosExistentes.has(p.codigo))

  if (produtosParaCriar.length > 0) {
    await criarEmLotes(
      produtosParaCriar,
      (data) =>
        prisma.produto.create({
          data: {
            ...data,
            empresa: { connect: { id: empresa.id } }
          }
        })
    )
  }

  console.log('Produtos processados')

  // ============================================
  // SERVIÇOS
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

  const codigosServicos = servicosData.map(s => s.codigoInterno)
  const servicosExistentes = await prisma.servico.findMany({
    where: { codigoInterno: { in: codigosServicos } },
    select: { codigoInterno: true }
  })
  const codigosServicosExistentes = new Set(servicosExistentes.map(s => s.codigoInterno))

  const servicosParaCriar = servicosData.filter(s => !codigosServicosExistentes.has(s.codigoInterno))

  if (servicosParaCriar.length > 0) {
    await criarEmLotes(
      servicosParaCriar,
      (data) =>
        prisma.servico.create({
          data: {
            ...data,
            empresa: { connect: { id: empresa.id } }
          }
        })
    )
  }

  console.log('Servicos processados')

  // ============================================
  // TRANSPORTADORAS (CNPJs fictícios)
  // ============================================
  const transportadorasData = [
    {
      tipoPessoa: 'PJ',
      cnpj: '11222333000181',
      razaoSocial: 'TRANSPORTADORA EXEMPLO UM LTDA - DEV',
      nomeFantasia: 'TRANSP UM DEV',
      inscricaoEstadual: '123456789',
      rntrc: '1234567',
      tipoTransportador: 'RODOVIARIO',
      email: 'contato@transp-um-dev.local',
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
        email: 'contato@transp-um-dev.local'
      }
    },
    {
      tipoPessoa: 'PJ',
      cnpj: '22333444000162',
      razaoSocial: 'TRANSPORTADORA EXEMPLO DOIS LTDA - DEV',
      nomeFantasia: 'TRANSP DOIS DEV',
      inscricaoEstadual: '987654321',
      rntrc: '7654321',
      tipoTransportador: 'RODOVIARIO',
      email: 'contato@transp-dois-dev.local',
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
        email: 'contato@transp-dois-dev.local'
      }
    },
    {
      tipoPessoa: 'PJ',
      cnpj: '33444555000143',
      razaoSocial: 'TRANSPORTADORA EXEMPLO TRES LTDA - DEV',
      nomeFantasia: 'TRANSP TRES DEV',
      inscricaoEstadual: '456789123',
      rntrc: '4567890',
      tipoTransportador: 'RODOVIARIO',
      email: 'contato@transp-tres-dev.local',
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
        email: 'contato@transp-tres-dev.local'
      }
    },
    {
      tipoPessoa: 'PJ',
      cnpj: '44555666000124',
      razaoSocial: 'TRANSPORTADORA EXEMPLO QUATRO LTDA - DEV',
      nomeFantasia: 'TRANSP QUATRO DEV',
      inscricaoEstadual: '678901234',
      rntrc: '6789012',
      tipoTransportador: 'RODOVIARIO',
      email: 'contato@transp-quatro-dev.local',
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
        email: 'contato@transp-quatro-dev.local'
      }
    },
    {
      tipoPessoa: 'PJ',
      cnpj: '55666777000105',
      razaoSocial: 'TRANSPORTADORA EXEMPLO CINCO LTDA - DEV',
      nomeFantasia: 'TRANSP CINCO DEV',
      inscricaoEstadual: '890123456',
      rntrc: '8901234',
      tipoTransportador: 'MULTIMODAL',
      email: 'contato@transp-cinco-dev.local',
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
        email: 'contato@transp-cinco-dev.local'
      }
    }
  ]

  const cnpjsTransportadoras = transportadorasData.map(t => t.cnpj.replace(/\D/g, ''))
  const transportadorasExistentes = await prisma.transportadora.findMany({
    where: {
      cnpj: { in: cnpjsTransportadoras },
      empresaId: empresa.id
    },
    select: { cnpj: true }
  })
  const cnpjsTransportadorasExistentes = new Set(transportadorasExistentes.map(t => t.cnpj))

  const transportadorasParaCriar = transportadorasData.filter(
    t => !cnpjsTransportadorasExistentes.has(t.cnpj.replace(/\D/g, ''))
  )

  if (transportadorasParaCriar.length > 0) {
    await criarEmLotes(
      transportadorasParaCriar,
      (data) =>
        prisma.transportadora.create({
          data: {
            ...data,
            cnpj: data.cnpj.replace(/\D/g, ''),
            empresa: { connect: { id: empresa.id } },
            endereco: { create: data.endereco }
          }
        })
    )
  }

  console.log('Transportadoras processadas')

  console.log('\n========================================')
  console.log('RESUMO DO SEED')
  console.log('========================================')
  console.log(`Empresa: SUP TECNOLOGIA EM SISTEMAS LTDA - DEV`)
  console.log(`Ambiente de emissao: ${SEED_AMBIENTE}`)
  console.log(`Usuario Admin: ${SEED_ADMIN_EMAIL} (senha definida via SEED_ADMIN_SENHA)`)
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