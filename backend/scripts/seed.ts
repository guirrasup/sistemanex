// C:\emissornfe\backend\scripts\seed-clientes-servicos.ts

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de Clientes, Fornecedores e Serviços...');
  console.log('');

  // ============================================
  // 1. BUSCAR EMPRESA EXISTENTE
  // ============================================
  let empresa = await prisma.empresa.findFirst({
    where: { cnpj: '29.535.022/0001-38' }
  });

  if (!empresa) {
    console.log('❌ Empresa não encontrada. Execute o seed base primeiro.');
    console.log('   npx tsx scripts/seed.ts');
    process.exit(1);
  }

  console.log(`✅ Empresa encontrada: ${empresa.razaoSocial}`);
  console.log('');

  // ============================================
  // 2. CLIENTES E FORNECEDORES
  // ============================================
  console.log('📦 Criando Clientes e Fornecedores...');
  console.log('');

  const clientesData = [
    // CLIENTES PESSOA JURÍDICA
    {
      tipo: 'CLIENTE',
      tipoPessoa: 'PJ',
      documento: '12.345.678/0001-90',
      razaoSocial: 'TECHNOLOGY SOLUTIONS LTDA',
      nomeFantasia: 'Tech Solutions',
      inscricaoEstadual: '123.456.789.001',
      email: 'contato@techsolutions.com.br',
      telefone: '(11) 4000-1001',
      celularWhatsApp: '(11) 99999-1001',
      contato: 'João Silva',
      observacoes: 'Cliente VIP - Contrato anual de suporte',
      endereco: {
        logradouro: 'Av. Engenheiro Luís Carlos Berrini',
        numero: '1500',
        complemento: 'Torre 1 - 10º Andar',
        bairro: 'Brooklin',
        codigoMunicipio: '3550308',
        nomeMunicipio: 'São Paulo',
        uf: 'SP',
        cep: '04571-000',
        telefone: '(11) 4000-1001',
        email: 'contato@techsolutions.com.br'
      }
    },
    {
      tipo: 'CLIENTE',
      tipoPessoa: 'PJ',
      documento: '98.765.432/0001-10',
      razaoSocial: 'CONSULTORIA INTELIGENTE LTDA',
      nomeFantasia: 'Inteligente Consultoria',
      inscricaoEstadual: '123.456.789.002',
      email: 'financeiro@inteligente.com.br',
      telefone: '(31) 4000-2002',
      celularWhatsApp: '(31) 99999-2002',
      contato: 'Maria Oliveira',
      observacoes: 'Consultoria em TI - Contrato mensal',
      endereco: {
        logradouro: 'Av. do Contorno',
        numero: '8000',
        complemento: 'Sala 501',
        bairro: 'Savassi',
        codigoMunicipio: '3106200',
        nomeMunicipio: 'Belo Horizonte',
        uf: 'MG',
        cep: '30110-000',
        telefone: '(31) 4000-2002',
        email: 'financeiro@inteligente.com.br'
      }
    },
    {
      tipo: 'CLIENTE',
      tipoPessoa: 'PJ',
      documento: '45.678.912/0001-34',
      razaoSocial: 'HOSPITAL SANTA CASA DE SAÚDE',
      nomeFantasia: 'Santa Casa Saúde',
      inscricaoEstadual: '123.456.789.003',
      email: 'compras@santacasa.com.br',
      telefone: '(62) 4000-3003',
      celularWhatsApp: '(62) 99999-3003',
      contato: 'Dr. Roberto Santos',
      observacoes: 'Hospital - Fornecimento de equipamentos médicos',
      endereco: {
        logradouro: 'Rua da Saúde',
        numero: '100',
        complemento: 'Bloco A',
        bairro: 'Centro',
        codigoMunicipio: '5200050',
        nomeMunicipio: 'Goiânia',
        uf: 'GO',
        cep: '74000-000',
        telefone: '(62) 4000-3003',
        email: 'compras@santacasa.com.br'
      }
    },
    {
      tipo: 'CLIENTE',
      tipoPessoa: 'PJ',
      documento: '78.901.234/0001-56',
      razaoSocial: 'AGROINDUSTRIAL BRASIL S/A',
      nomeFantasia: 'Agro Brasil',
      inscricaoEstadual: '123.456.789.004',
      email: 'logistica@agrobrasil.com.br',
      telefone: '(63) 4000-4004',
      celularWhatsApp: '(63) 99999-4004',
      contato: 'Carlos Mendes',
      observacoes: 'Agronegócio - Transporte de cargas e insumos',
      endereco: {
        logradouro: 'BR-153',
        numero: 'S/N',
        complemento: 'Km 45',
        bairro: 'Zona Rural',
        codigoMunicipio: '5100250',
        nomeMunicipio: 'Palmas',
        uf: 'TO',
        cep: '77000-000',
        telefone: '(63) 4000-4004',
        email: 'logistica@agrobrasil.com.br'
      }
    },
    {
      tipo: 'CLIENTE',
      tipoPessoa: 'PF',
      documento: '123.456.789-01',
      razaoSocial: 'Paulo Roberto Almeida',
      nomeFantasia: null,
      inscricaoEstadual: null,
      email: 'paulo.almeida@gmail.com',
      telefone: '(61) 4000-5005',
      celularWhatsApp: '(61) 99999-5005',
      contato: 'Paulo Almeida',
      observacoes: 'Pessoa Física - Consultoria em TI',
      endereco: {
        logradouro: 'SHIS QI 05',
        numero: '500',
        complemento: 'Bloco C',
        bairro: 'Lago Sul',
        codigoMunicipio: '5300108',
        nomeMunicipio: 'Brasília',
        uf: 'DF',
        cep: '71615-000',
        telefone: '(61) 4000-5005',
        email: 'paulo.almeida@gmail.com'
      }
    },
    {
      tipo: 'CLIENTE',
      tipoPessoa: 'PF',
      documento: '987.654.321-00',
      razaoSocial: 'Ana Cristina Ferreira',
      nomeFantasia: null,
      inscricaoEstadual: null,
      email: 'ana.ferreira@outlook.com',
      telefone: '(85) 4000-6006',
      celularWhatsApp: '(85) 99999-6006',
      contato: 'Ana Ferreira',
      observacoes: 'Pessoa Física - Desenvolvimento de software',
      endereco: {
        logradouro: 'Rua dos Tabajaras',
        numero: '200',
        complemento: 'Apto 301',
        bairro: 'Aldeota',
        codigoMunicipio: '2304400',
        nomeMunicipio: 'Fortaleza',
        uf: 'CE',
        cep: '60115-000',
        telefone: '(85) 4000-6006',
        email: 'ana.ferreira@outlook.com'
      }
    },

    // FORNECEDORES
    {
      tipo: 'FORNECEDOR',
      tipoPessoa: 'PJ',
      documento: '11.222.333/0001-44',
      razaoSocial: 'DISTRIBUIDORA DE TECNOLOGIA S/A',
      nomeFantasia: 'DistriTech',
      inscricaoEstadual: '123.456.789.005',
      email: 'vendas@distritech.com.br',
      telefone: '(11) 4000-7007',
      celularWhatsApp: '(11) 99999-7007',
      contato: 'José Carlos',
      observacoes: 'Fornecedor de hardware e equipamentos',
      endereco: {
        logradouro: 'Rua dos Trabalhadores',
        numero: '5000',
        complemento: 'Galpão 3',
        bairro: 'Industrial',
        codigoMunicipio: '3550308',
        nomeMunicipio: 'São Paulo',
        uf: 'SP',
        cep: '04678-000',
        telefone: '(11) 4000-7007',
        email: 'vendas@distritech.com.br'
      }
    },
    {
      tipo: 'FORNECEDOR',
      tipoPessoa: 'PJ',
      documento: '99.888.777/0001-22',
      razaoSocial: 'CLOUD SOLUTIONS HOSTING LTDA',
      nomeFantasia: 'Cloud Hosting',
      inscricaoEstadual: '123.456.789.006',
      email: 'suporte@cloudhosting.com.br',
      telefone: '(21) 4000-8008',
      celularWhatsApp: '(21) 99999-8008',
      contato: 'Fernanda Lima',
      observacoes: 'Fornecedor de serviços em cloud e hospedagem',
      endereco: {
        logradouro: 'Av. das Américas',
        numero: '1000',
        complemento: 'Sala 2001',
        bairro: 'Barra da Tijuca',
        codigoMunicipio: '3304557',
        nomeMunicipio: 'Rio de Janeiro',
        uf: 'RJ',
        cep: '22640-000',
        telefone: '(21) 4000-8008',
        email: 'suporte@cloudhosting.com.br'
      }
    },
    {
      tipo: 'FORNECEDOR',
      tipoPessoa: 'PJ',
      documento: '44.555.666/0001-78',
      razaoSocial: 'MATERIAIS DE CONSTRUÇÃO LTDA',
      nomeFantasia: 'Construmax',
      inscricaoEstadual: '123.456.789.007',
      email: 'comercial@construmax.com.br',
      telefone: '(41) 4000-9009',
      celularWhatsApp: '(41) 99999-9009',
      contato: 'Ricardo Souza',
      observacoes: 'Fornecedor de materiais de construção',
      endereco: {
        logradouro: 'Av. das Torres',
        numero: '2500',
        complemento: 'Lote 12',
        bairro: 'Campina do Siqueira',
        codigoMunicipio: '4106902',
        nomeMunicipio: 'Curitiba',
        uf: 'PR',
        cep: '80740-000',
        telefone: '(41) 4000-9009',
        email: 'comercial@construmax.com.br'
      }
    },
    {
      tipo: 'AMBOS',
      tipoPessoa: 'PJ',
      documento: '55.666.777/0001-89',
      razaoSocial: 'LOGÍSTICA RÁPIDA TRANSPORTES LTDA',
      nomeFantasia: 'LogRápida',
      inscricaoEstadual: '123.456.789.008',
      email: 'faturamento@lograpida.com.br',
      telefone: '(61) 4000-1010',
      celularWhatsApp: '(61) 99999-1010',
      contato: 'Marcos Pereira',
      observacoes: 'Cliente e Fornecedor - Transporte e logística',
      endereco: {
        logradouro: 'Setor de Armazenagem Sul',
        numero: '1000',
        complemento: 'Quadra 2',
        bairro: 'SAS',
        codigoMunicipio: '5300108',
        nomeMunicipio: 'Brasília',
        uf: 'DF',
        cep: '70610-000',
        telefone: '(61) 4000-1010',
        email: 'faturamento@lograpida.com.br'
      }
    }
  ];

  let clientesCriados = 0;
  let fornecedoresCriados = 0;

  for (const data of clientesData) {
    // Verifica se já existe
    const exists = await prisma.cliente.findFirst({
      where: { documento: data.documento }
    });

    if (exists) {
      console.log(`⏭️  Cliente já existe: ${data.razaoSocial}`);
      continue;
    }

    // Cria endereço
    const endereco = await prisma.endereco.create({
      data: data.endereco
    });

    // Cria cliente
    await prisma.cliente.create({
      data: {
        tipo: data.tipo as any,
        tipoPessoa: data.tipoPessoa as any,
        documento: data.documento,
        razaoSocial: data.razaoSocial,
        nomeFantasia: data.nomeFantasia,
        inscricaoEstadual: data.inscricaoEstadual,
        email: data.email,
        telefone: data.telefone,
        celularWhatsApp: data.celularWhatsApp,
        contato: data.contato,
        observacoes: data.observacoes,
        ativo: true,
        enderecoId: endereco.id,
        empresaId: empresa.id
      }
    });

    if (data.tipo === 'FORNECEDOR') {
      fornecedoresCriados++;
    } else if (data.tipo === 'CLIENTE') {
      clientesCriados++;
    } else {
      clientesCriados++;
      fornecedoresCriados++;
    }

    console.log(`✅ ${data.tipo} criado: ${data.razaoSocial}`);
  }

  console.log('');
  console.log(`📊 Resumo: ${clientesCriados} clientes e ${fornecedoresCriados} fornecedores criados`);
  console.log('');

  // ============================================
  // 3. SERVIÇOS
  // ============================================
  console.log('📦 Criando Catálogo de Serviços...');
  console.log('');

  const servicosData = [
    {
      codigoInterno: 'SRV-001',
      descricao: 'Consultoria em TI - Análise de Sistemas e Arquitetura',
      codigoTributacaoNacional: '010701',
      codigoTributacaoMunicipal: '0107',
      codigoNBS: '1.1403.21.10',
      valorUnitario: 8500.00,
      aliquotaISS: 5.0,
      retencaoISSPadrao: false,
      aliquotaPIS: 0.65,
      aliquotaCOFINS: 3.0,
      aliquotaIRRF: 1.5,
      aliquotaCSLL: 1.0,
      aliquotaINSS: 0,
      aliquotaIBS: 0.10,
      aliquotaCBS: 0.90,
      ativo: true,
      empresaId: empresa.id
    },
    {
      codigoInterno: 'SRV-002',
      descricao: 'Desenvolvimento de Software - Aplicações Web e Mobile',
      codigoTributacaoNacional: '010701',
      codigoTributacaoMunicipal: '0107',
      codigoNBS: '1.1403.21.10',
      valorUnitario: 12000.00,
      aliquotaISS: 5.0,
      retencaoISSPadrao: false,
      aliquotaPIS: 0.65,
      aliquotaCOFINS: 3.0,
      aliquotaIRRF: 1.5,
      aliquotaCSLL: 1.0,
      aliquotaINSS: 0,
      aliquotaIBS: 0.10,
      aliquotaCBS: 0.90,
      ativo: true,
      empresaId: empresa.id
    },
    {
      codigoInterno: 'SRV-003',
      descricao: 'Suporte Técnico e Manutenção de Infraestrutura de TI',
      codigoTributacaoNacional: '010701',
      codigoTributacaoMunicipal: '0107',
      codigoNBS: '1.1403.21.10',
      valorUnitario: 3500.00,
      aliquotaISS: 5.0,
      retencaoISSPadrao: true,
      aliquotaPIS: 0.65,
      aliquotaCOFINS: 3.0,
      aliquotaIRRF: 1.5,
      aliquotaCSLL: 1.0,
      aliquotaINSS: 0,
      aliquotaIBS: 0.10,
      aliquotaCBS: 0.90,
      ativo: true,
      empresaId: empresa.id
    },
    {
      codigoInterno: 'SRV-004',
      descricao: 'Segurança da Informação - Auditoria e Pentest',
      codigoTributacaoNacional: '010701',
      codigoTributacaoMunicipal: '0107',
      codigoNBS: '1.1403.21.10',
      valorUnitario: 9500.00,
      aliquotaISS: 5.0,
      retencaoISSPadrao: false,
      aliquotaPIS: 0.65,
      aliquotaCOFINS: 3.0,
      aliquotaIRRF: 1.5,
      aliquotaCSLL: 1.0,
      aliquotaINSS: 0,
      aliquotaIBS: 0.10,
      aliquotaCBS: 0.90,
      ativo: true,
      empresaId: empresa.id
    },
    {
      codigoInterno: 'SRV-005',
      descricao: 'Hospedagem e Infraestrutura em Cloud - Serviços Gerenciados',
      codigoTributacaoNacional: '010701',
      codigoTributacaoMunicipal: '0107',
      codigoNBS: '1.1403.21.10',
      valorUnitario: 4500.00,
      aliquotaISS: 5.0,
      retencaoISSPadrao: false,
      aliquotaPIS: 0.65,
      aliquotaCOFINS: 3.0,
      aliquotaIRRF: 1.5,
      aliquotaCSLL: 1.0,
      aliquotaINSS: 0,
      aliquotaIBS: 0.10,
      aliquotaCBS: 0.90,
      ativo: true,
      empresaId: empresa.id
    },
    {
      codigoInterno: 'SRV-006',
      descricao: 'Treinamento e Capacitação em Tecnologia da Informação',
      codigoTributacaoNacional: '010701',
      codigoTributacaoMunicipal: '0107',
      codigoNBS: '1.1403.21.10',
      valorUnitario: 2800.00,
      aliquotaISS: 5.0,
      retencaoISSPadrao: false,
      aliquotaPIS: 0.65,
      aliquotaCOFINS: 3.0,
      aliquotaIRRF: 1.5,
      aliquotaCSLL: 1.0,
      aliquotaINSS: 0,
      aliquotaIBS: 0.10,
      aliquotaCBS: 0.90,
      ativo: true,
      empresaId: empresa.id
    },
    {
      codigoInterno: 'SRV-007',
      descricao: 'Consultoria em Processos e Governança de TI (COBIT, ITIL)',
      codigoTributacaoNacional: '010701',
      codigoTributacaoMunicipal: '0107',
      codigoNBS: '1.1403.21.10',
      valorUnitario: 15000.00,
      aliquotaISS: 5.0,
      retencaoISSPadrao: false,
      aliquotaPIS: 0.65,
      aliquotaCOFINS: 3.0,
      aliquotaIRRF: 1.5,
      aliquotaCSLL: 1.0,
      aliquotaINSS: 0,
      aliquotaIBS: 0.10,
      aliquotaCBS: 0.90,
      ativo: true,
      empresaId: empresa.id
    },
    {
      codigoInterno: 'SRV-008',
      descricao: 'Desenvolvimento de E-commerce e Lojas Virtuais',
      codigoTributacaoNacional: '010701',
      codigoTributacaoMunicipal: '0107',
      codigoNBS: '1.1403.21.10',
      valorUnitario: 8000.00,
      aliquotaISS: 5.0,
      retencaoISSPadrao: false,
      aliquotaPIS: 0.65,
      aliquotaCOFINS: 3.0,
      aliquotaIRRF: 1.5,
      aliquotaCSLL: 1.0,
      aliquotaINSS: 0,
      aliquotaIBS: 0.10,
      aliquotaCBS: 0.90,
      ativo: true,
      empresaId: empresa.id
    }
  ];

  let servicosCriados = 0;

  for (const data of servicosData) {
    const exists = await prisma.servico.findFirst({
      where: { 
        codigoInterno: data.codigoInterno,
        empresaId: empresa.id 
      }
    });

    if (exists) {
      console.log(`⏭️  Serviço já existe: ${data.codigoInterno} - ${data.descricao}`);
      continue;
    }

    await prisma.servico.create({ data });
    servicosCriados++;
    console.log(`✅ Serviço criado: ${data.codigoInterno} - ${data.descricao}`);
  }

  console.log('');
  console.log(`📊 Resumo: ${servicosCriados} serviços criados`);
  console.log('');

  // ============================================
  // 4. RESUMO FINAL
  // ============================================
  console.log('🎉 Seed adicional concluído com sucesso!');
  console.log('');
  console.log('📋 Resumo Final:');
  console.log(`   👤 Clientes: ${clientesCriados}`);
  console.log(`   🏢 Fornecedores: ${fornecedoresCriados}`);
  console.log(`   🔧 Serviços: ${servicosCriados}`);
  console.log('');
  console.log('📌 Próximos passos:');
  console.log('   1. Reinicie o backend: npm run dev');
  console.log('   2. Faça login com admin@suptecnologia.com.br / 123456');
  console.log('   3. Teste a emissão de NFS-e com os serviços criados');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });