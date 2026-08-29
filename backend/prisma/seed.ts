// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed completo...')

  // ============================================
  // 1. Verificar/Criar empresa padrão
  // ============================================
  // O campo "cnpj" da Empresa é @db.Char(14) — só dígitos, sem máscara.
  const CNPJ_EMPRESA = '18236447000190'
  
  let empresa = await prisma.empresa.findUnique({
    where: { cnpj: CNPJ_EMPRESA }
  })

  if (!empresa) {
    empresa = await prisma.empresa.create({
      data: {
        razaoSocial: 'SUP TECNOLOGIA EM SISTEMAS LTDA',
        nomeFantasia: 'SUP TECNOLOGIA',
        cnpj: CNPJ_EMPRESA,
        inscricaoEstadual: '114.882.901.110',
        inscricaoMunicipal: '4.882.901-2',
        cnae: '6201-5/01',
        regimeTributario: 'SIMPLES_NACIONAL',
        aliquotaSimples: 6.0,
        ambienteEmissao: 'PRODUCAO',
        chavePixPadrao: '18.236.447/0001-90',
        optanteSimples: true,
        endereco: {
          create: {
            logradouro: 'Avenida Paulista',
            numero: '1374',
            complemento: 'Andar 14 - Sala 142',
            bairro: 'Bela Vista',
            codigoMunicipio: '3550308',
            nomeMunicipio: 'São Paulo',
            uf: 'SP',
            cep: '01310-100',
            telefone: '(11) 3280-9900',
            email: 'fiscal@suptecnologia.com.br'
          }
        },
        certificado: {
          create: {
            tipo: 'A1',
            nomeTitular: 'SUP TECNOLOGIA EM SISTEMAS LTDA:18236447000190',
            cnpjCpf: '18.236.447/0001-90',
            emissora: 'AC SERPRO RFB v5 (ICP-Brasil)',
            dataValidadeInicio: new Date('2026-01-10'),
            dataValidadeFim: new Date('2027-01-10'),
            diasRestantes: 138,
            status: 'VALIDO'
          }
        }
      }
    })
    console.log('✅ Empresa criada:', empresa.id)
  } else {
    console.log('✅ Empresa já existe:', empresa.id)
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
    console.log('✅ Usuário admin criado:', admin.email)
  } else {
    console.log('✅ Usuário admin já existe:', admin.email)
  }

  // ============================================
  // 3. Criar clientes (5) - verificando duplicatas
  // ============================================
  const clientesData = [
    {
      tipo: 'CLIENTE',
      tipoPessoa: 'PJ',
      documento: '33.000.167/0001-01',
      razaoSocial: 'PETROLEO BRASILEIRO S A PETROBRAS',
      nomeFantasia: 'PETROBRAS',
      inscricaoEstadual: '80.002.321',
      inscricaoMunicipal: '01.299.400-1',
      indicadorIE: '1',
      email: 'faturamento@petrobras.com.br',
      telefone: '(21) 3224-4477',
      endereco: {
        logradouro: 'Avenida República do Chile',
        numero: '65',
        bairro: 'Centro',
        codigoMunicipio: '3304557',
        nomeMunicipio: 'Rio de Janeiro',
        uf: 'RJ',
        cep: '20031-912'
      }
    },
    {
      tipo: 'CLIENTE',
      tipoPessoa: 'PJ',
      documento: '00.360.305/0001-04',
      razaoSocial: 'CAIXA ECONOMICA FEDERAL',
      nomeFantasia: 'CAIXA',
      indicadorIE: '9',
      email: 'suprimentos@caixa.gov.br',
      telefone: '(61) 3206-9900',
      endereco: {
        logradouro: 'SBS Quadra 4 Bloco A',
        numero: 'SN',
        bairro: 'Asa Sul',
        codigoMunicipio: '5300108',
        nomeMunicipio: 'Brasília',
        uf: 'DF',
        cep: '70092-900'
      }
    },
    {
      tipo: 'CLIENTE',
      tipoPessoa: 'PJ',
      documento: '02.558.157/0001-62',
      razaoSocial: 'MAGAZINE LUIZA S/A',
      nomeFantasia: 'MAGAZINE LUIZA',
      inscricaoEstadual: '110.042.490.110',
      indicadorIE: '1',
      email: 'faturamento@magazineluiza.com.br',
      telefone: '(11) 4004-4004',
      endereco: {
        logradouro: 'Avenida Brigadeiro Faria Lima',
        numero: '4100',
        bairro: 'Vila Olímpia',
        codigoMunicipio: '3550308',
        nomeMunicipio: 'São Paulo',
        uf: 'SP',
        cep: '04538-132'
      }
    },
    {
      tipo: 'AMBOS',
      tipoPessoa: 'PJ',
      documento: '34.274.633/0001-02',
      razaoSocial: 'AMBEV S/A',
      nomeFantasia: 'AMBEV',
      inscricaoEstadual: '110.123.456.110',
      inscricaoMunicipal: '2.123.456-0',
      indicadorIE: '1',
      email: 'faturamento@ambev.com.br',
      telefone: '(11) 2122-1234',
      endereco: {
        logradouro: 'Rua Dr. Renato Paes de Barros',
        numero: '1017',
        bairro: 'Itaim Bibi',
        codigoMunicipio: '3550308',
        nomeMunicipio: 'São Paulo',
        uf: 'SP',
        cep: '04530-001'
      }
    },
    {
      tipo: 'AMBOS',
      tipoPessoa: 'PJ',
      documento: '62.494.258/0001-93',
      razaoSocial: 'NESTLÉ BRASIL LTDA',
      nomeFantasia: 'NESTLÉ',
      inscricaoEstadual: '110.789.456.110',
      indicadorIE: '1',
      email: 'faturamento@nestle.com.br',
      telefone: '(11) 3049-2000',
      endereco: {
        logradouro: 'Avenida das Nações Unidas',
        numero: '18001',
        bairro: 'Vila Gertrudes',
        codigoMunicipio: '3550308',
        nomeMunicipio: 'São Paulo',
        uf: 'SP',
        cep: '04795-900'
      }
    }
  ]

  const clientes = []
  for (const data of clientesData) {
    let cliente = await prisma.cliente.findUnique({
      where: { documento: data.documento }
    })
    
    if (!cliente) {
      cliente = await prisma.cliente.create({
        data: {
          ...data,
          empresa: { connect: { id: empresa.id } },
          endereco: { create: data.endereco }
        }
      })
      clientes.push(cliente)
    } else {
      clientes.push(cliente)
    }
  }

  console.log(`✅ ${clientes.length} clientes processados (${clientes.filter(c => c.tipo === 'AMBOS').length} AMBOS)`)

  // ============================================
  // 4. Criar fornecedores (5) - verificando duplicatas
  // ============================================
  const fornecedoresData = [
    {
      tipo: 'FORNECEDOR',
      tipoPessoa: 'PJ',
      documento: '49.067.965/0001-20',
      razaoSocial: 'MICROSOFT BRASIL LTDA',
      nomeFantasia: 'MICROSOFT',
      inscricaoEstadual: '110.345.678.110',
      indicadorIE: '1',
      email: 'fornecedor@microsoft.com.br',
      telefone: '(11) 4702-7000',
      endereco: {
        logradouro: 'Avenida Nações Unidas',
        numero: '12901',
        bairro: 'Vila Gertrudes',
        codigoMunicipio: '3550308',
        nomeMunicipio: 'São Paulo',
        uf: 'SP',
        cep: '04794-000'
      }
    },
    {
      tipo: 'FORNECEDOR',
      tipoPessoa: 'PJ',
      documento: '04.263.233/0001-69',
      razaoSocial: 'DELL COMPUTADORES DO BRASIL LTDA',
      nomeFantasia: 'DELL',
      inscricaoEstadual: '114.882.901.110',
      indicadorIE: '1',
      email: 'fornecedor@dell.com.br',
      telefone: '(11) 3998-3200',
      endereco: {
        logradouro: 'Avenida das Nações Unidas',
        numero: '14401',
        bairro: 'Vila Gertrudes',
        codigoMunicipio: '3550308',
        nomeMunicipio: 'São Paulo',
        uf: 'SP',
        cep: '04794-000'
      }
    },
    {
      tipo: 'FORNECEDOR',
      tipoPessoa: 'PJ',
      documento: '02.214.286/0001-00',
      razaoSocial: 'HP BRASIL INDÚSTRIA E COMÉRCIO LTDA',
      nomeFantasia: 'HP',
      inscricaoEstadual: '110.456.789.110',
      indicadorIE: '1',
      email: 'fornecedor@hp.com.br',
      telefone: '(11) 4004-4004',
      endereco: {
        logradouro: 'Avenida das Nações Unidas',
        numero: '8501',
        bairro: 'Vila Gertrudes',
        codigoMunicipio: '3550308',
        nomeMunicipio: 'São Paulo',
        uf: 'SP',
        cep: '05425-070'
      }
    },
    {
      tipo: 'FORNECEDOR',
      tipoPessoa: 'PJ',
      documento: '03.570.683/0001-40',
      razaoSocial: 'CISCO SYSTEMS DO BRASIL LTDA',
      nomeFantasia: 'CISCO',
      inscricaoEstadual: '110.567.890.110',
      indicadorIE: '1',
      email: 'fornecedor@cisco.com.br',
      telefone: '(11) 3509-7000',
      endereco: {
        logradouro: 'Avenida das Nações Unidas',
        numero: '12901',
        bairro: 'Vila Gertrudes',
        codigoMunicipio: '3550308',
        nomeMunicipio: 'São Paulo',
        uf: 'SP',
        cep: '04794-000'
      }
    },
    {
      tipo: 'FORNECEDOR',
      tipoPessoa: 'PJ',
      documento: '04.150.884/0001-10',
      razaoSocial: 'IBM BRASIL INDÚSTRIA MÁQUINAS E SERVIÇOS LTDA',
      nomeFantasia: 'IBM',
      inscricaoEstadual: '110.678.901.110',
      indicadorIE: '1',
      email: 'fornecedor@ibm.com.br',
      telefone: '(11) 2132-1000',
      endereco: {
        logradouro: 'Avenida das Nações Unidas',
        numero: '12901',
        bairro: 'Vila Gertrudes',
        codigoMunicipio: '3550308',
        nomeMunicipio: 'São Paulo',
        uf: 'SP',
        cep: '04794-000'
      }
    }
  ]

  const fornecedores = []
  for (const data of fornecedoresData) {
    let fornecedor = await prisma.cliente.findUnique({
      where: { documento: data.documento }
    })
    
    if (!fornecedor) {
      fornecedor = await prisma.cliente.create({
        data: {
          ...data,
          empresa: { connect: { id: empresa.id } },
          endereco: { create: data.endereco }
        }
      })
      fornecedores.push(fornecedor)
    } else {
      fornecedores.push(fornecedor)
    }
  }

  console.log(`✅ ${fornecedores.length} fornecedores processados (exclusivos)`)

  // ============================================
  // 5. Criar produtos (5) - verificando duplicatas
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
      categoria: 'Energia & Proteção',
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
      categoria: 'Informática',
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
      categoria: 'Periféricos',
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
      descricao: 'Switch Gigabit 48 Portas Gerenciável Cisco SG350-48',
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

  const produtos = []
  for (const data of produtosData) {
    let produto = await prisma.produto.findUnique({
      where: { codigo: data.codigo }
    })
    
    if (!produto) {
      produto = await prisma.produto.create({
        data: {
          ...data,
          empresa: { connect: { id: empresa.id } }
        }
      })
      produtos.push(produto)
    } else {
      produtos.push(produto)
    }
  }

  console.log(`✅ ${produtos.length} produtos processados`)

  // ============================================
  // 6. Criar serviços (5) - verificando duplicatas
  // ============================================
  const servicosData = [
    {
      codigoInterno: 'SRV-DEV-01',
      descricao: 'Desenvolvimento e customização de sistemas sob medida e integrações de APIs fiscais',
      codigoTributacaoNacional: '010701',
      codigoTributacaoMunicipal: '0107',
      codigoNBS: '1.1403.21.10',
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
      descricao: 'Consultoria técnica em conformidade fiscal SPED, NFS-e Padrão Nacional e Reforma Tributária 2026',
      codigoTributacaoNacional: '170101',
      codigoTributacaoMunicipal: '1701',
      codigoNBS: '1.1404.10.00',
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
      descricao: 'Suporte técnico especializado em ambientes Windows Server, Linux e redes corporativas',
      codigoTributacaoNacional: '010701',
      codigoTributacaoMunicipal: '0107',
      codigoNBS: '1.1403.22.00',
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
      descricao: 'Migração e gerenciamento de infraestrutura para nuvem AWS e Azure com DevOps',
      codigoTributacaoNacional: '010701',
      codigoTributacaoMunicipal: '0107',
      codigoNBS: '1.1403.21.50',
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
      descricao: 'Treinamento corporativo para equipes fiscais e contábeis sobre SPED e obrigações acessórias',
      codigoTributacaoNacional: '180101',
      codigoTributacaoMunicipal: '1801',
      codigoNBS: '1.1404.30.00',
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

  const servicos = []
  for (const data of servicosData) {
    let servico = await prisma.servico.findUnique({
      where: { codigoInterno: data.codigoInterno }
    })
    
    if (!servico) {
      servico = await prisma.servico.create({
        data: {
          ...data,
          empresa: { connect: { id: empresa.id } }
        }
      })
      servicos.push(servico)
    } else {
      servicos.push(servico)
    }
  }

  console.log(`✅ ${servicos.length} serviços processados`)

  // ============================================
  // 7. Criar transportadoras (5) - verificando duplicatas
  // ============================================
  const transportadorasData = [
    {
      tipoPessoa: 'PJ',
      cnpj: '12.345.678/0001-90',
      razaoSocial: 'TRANSPORTADORA RÁPIDA LTDA',
      nomeFantasia: 'RÁPIDA CARGAS',
      inscricaoEstadual: '123.456.789',
      rntrc: '1234567',
      tipoTransportador: 'RODOVIARIO',
      email: 'contato@rapidacargas.com.br',
      telefone: '(11) 3456-7890',
      celularWhatsApp: '(11) 98765-4321',
      contato: 'João Silva',
      ativo: true,
      endereco: {
        logradouro: 'Avenida das Transportadoras',
        numero: '500',
        bairro: 'Distrito Industrial',
        codigoMunicipio: '3550308',
        nomeMunicipio: 'São Paulo',
        uf: 'SP',
        cep: '02000-000',
        telefone: '(11) 3456-7890',
        email: 'contato@rapidacargas.com.br'
      }
    },
    {
      tipoPessoa: 'PJ',
      cnpj: '98.765.432/0001-10',
      razaoSocial: 'TRANSPORTADORA EXPRESSA LTDA',
      nomeFantasia: 'EXPRESSA CARGAS',
      inscricaoEstadual: '987.654.321',
      rntrc: '7654321',
      tipoTransportador: 'RODOVIARIO',
      email: 'contato@expressacargas.com.br',
      telefone: '(11) 4567-8901',
      celularWhatsApp: '(11) 87654-3210',
      contato: 'Maria Santos',
      ativo: true,
      endereco: {
        logradouro: 'Rua dos Transportes',
        numero: '1000',
        bairro: 'Vila Industrial',
        codigoMunicipio: '3550308',
        nomeMunicipio: 'São Paulo',
        uf: 'SP',
        cep: '03000-000',
        telefone: '(11) 4567-8901',
        email: 'contato@expressacargas.com.br'
      }
    },
    {
      tipoPessoa: 'PJ',
      cnpj: '45.678.901/0001-23',
      razaoSocial: 'TRANSPORTADORA FÉLIX LTDA',
      nomeFantasia: 'FÉLIX LOGÍSTICA',
      inscricaoEstadual: '456.789.123',
      rntrc: '4567890',
      tipoTransportador: 'RODOVIARIO',
      email: 'contato@felixlogistica.com.br',
      telefone: '(11) 5678-9012',
      celularWhatsApp: '(11) 76543-2109',
      contato: 'Pedro Félix',
      ativo: true,
      endereco: {
        logradouro: 'Avenida dos Estados',
        numero: '2000',
        bairro: 'Parque Industrial',
        codigoMunicipio: '3550308',
        nomeMunicipio: 'São Paulo',
        uf: 'SP',
        cep: '04000-000',
        telefone: '(11) 5678-9012',
        email: 'contato@felixlogistica.com.br'
      }
    },
    {
      tipoPessoa: 'PJ',
      cnpj: '67.890.123/0001-45',
      razaoSocial: 'TRANSPORTADORA UNIÃO LTDA',
      nomeFantasia: 'UNIÃO FRETES',
      inscricaoEstadual: '678.901.234',
      rntrc: '6789012',
      tipoTransportador: 'RODOVIARIO',
      email: 'contato@uniaofretes.com.br',
      telefone: '(11) 6789-0123',
      celularWhatsApp: '(11) 65432-1098',
      contato: 'Ana Oliveira',
      ativo: true,
      endereco: {
        logradouro: 'Rua das Indústrias',
        numero: '300',
        bairro: 'Distrito Logístico',
        codigoMunicipio: '3550308',
        nomeMunicipio: 'São Paulo',
        uf: 'SP',
        cep: '05000-000',
        telefone: '(11) 6789-0123',
        email: 'contato@uniaofretes.com.br'
      }
    },
    {
      tipoPessoa: 'PJ',
      cnpj: '89.012.345/0001-67',
      razaoSocial: 'TRANSPORTADORA GLOBAL LTDA',
      nomeFantasia: 'GLOBAL LOG',
      inscricaoEstadual: '890.123.456',
      rntrc: '8901234',
      tipoTransportador: 'MULTIMODAL',
      email: 'contato@globallog.com.br',
      telefone: '(11) 7890-1234',
      celularWhatsApp: '(11) 54321-0987',
      contato: 'Roberto Costa',
      ativo: true,
      endereco: {
        logradouro: 'Avenida Intermodal',
        numero: '1500',
        bairro: 'Logística',
        codigoMunicipio: '3550308',
        nomeMunicipio: 'São Paulo',
        uf: 'SP',
        cep: '06000-000',
        telefone: '(11) 7890-1234',
        email: 'contato@globallog.com.br'
      }
    }
  ]

  const transportadoras = []
  for (const data of transportadorasData) {
    let transportadora = await prisma.transportadora.findFirst({
      where: {
        cnpj: data.cnpj.replace(/\D/g, ''),
        empresaId: empresa.id
      }
    })
    
    if (!transportadora) {
      transportadora = await prisma.transportadora.create({
        data: {
          ...data,
          // Campo é @db.Char(14) — só dígitos, sem máscara.
          cnpj: data.cnpj.replace(/\D/g, ''),
          empresa: { connect: { id: empresa.id } },
          endereco: { create: data.endereco }
        }
      })
      transportadoras.push(transportadora)
    } else {
      transportadoras.push(transportadora)
    }
  }

  console.log(`✅ ${transportadoras.length} transportadoras processadas`)

  // ============================================
  // 8. Estatísticas finais
  // ============================================
  console.log('\n📊 ===== RESUMO DO SEED =====')
  console.log(`🏢 Empresa: SUP TECNOLOGIA EM SISTEMAS LTDA`)
  console.log(`👤 Usuário Admin: admin@suptecnologia.com.br (senha: admin123)`)
  console.log(`👥 Clientes: ${clientes.length} (sendo ${clientes.filter(c => c.tipo === 'AMBOS').length} AMBOS)`)
  console.log(`🏭 Fornecedores exclusivos: ${fornecedores.length}`)
  console.log(`📦 Produtos: ${produtos.length}`)
  console.log(`🛠️ Serviços: ${servicos.length}`)
  console.log(`🚚 Transportadoras: ${transportadoras.length}`)
  console.log('🎉 Seed concluído com sucesso!\n')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })