// C:\emissornfe\backend\scripts\seed.ts

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // 1. Criar endereço da empresa
  console.log('📦 Criando endereço...');
  const endereco = await prisma.endereco.create({
    data: {
      logradouro: 'Setor Comercial Sul - SCS',
      numero: 'Qd 02 - Bloco C - Sala 101',
      complemento: 'Edifício Capital',
      bairro: 'Asa Sul',
      codigoMunicipio: '5300108',
      nomeMunicipio: 'Brasília',
      uf: 'DF',
      cep: '70300-000',
      telefone: '(61) 4000-0000',
      email: 'contato@suptecnologia.com.br'
    }
  });
  console.log('✅ Endereço criado:', endereco.id);

  // 2. Criar empresa SUP BRASÍLIA
  let empresa = await prisma.empresa.findFirst({
    where: { cnpj: '29.535.022/0001-38' }
  });

  if (!empresa) {
    console.log('📦 Criando empresa SUP BRASÍLIA...');
    empresa = await prisma.empresa.create({
      data: {
        razaoSocial: 'SUP SOLUÇÕES TECNOLÓGICAS LTDA',
        nomeFantasia: 'SUP TECNOLOGIA BRASÍLIA',
        cnpj: '29.535.022/0001-38',
        inscricaoEstadual: '073.123.456.789',
        inscricaoMunicipal: '9876543',
        cnae: '6202-3/00 - Desenvolvimento de Software',
        regimeTributario: 'SIMPLES_NACIONAL',
        optanteSimples: true,
        optanteMEI: false,
        ambienteEmissao: 'PRODUCAO',
        serieNfe: 1,
        proximoNumeroNfe: 1,
        serieNfse: 1,
        proximoNumeroNfse: 1,
        serieNfce: 1,
        proximoNumeroNfce: 1,
        serieCte: 1,
        proximoNumeroCte: 1,
        serieNfae: 900,
        proximoNumeroNfae: 1,
        chavePixPadrao: '29.535.022/0001-38',
        enderecoId: endereco.id
      }
    });
    console.log('✅ Empresa SUP BRASÍLIA criada:', empresa.id);
    console.log('   CNPJ: 29.535.022/0001-38');
    console.log('   Cidade: Brasília - DF');
  } else {
    console.log('✅ Empresa SUP BRASÍLIA já existe:', empresa.id);
  }

  // 3. Criar usuário ADMIN
  const senhaHash = await bcrypt.hash('123456', 12);
  
  let admin = await prisma.usuario.findFirst({
    where: { email: 'admin@suptecnologia.com.br' }
  });

  if (!admin) {
    console.log('👤 Criando usuário ADMIN...');
    admin = await prisma.usuario.create({
      data: {
        nome: 'Administrador',
        email: 'admin@suptecnologia.com.br',
        senhaHash,
        cargo: 'Administrador Fiscal',
        perfil: 'ADMIN',
        ativo: true,
        empresaId: empresa.id
      }
    });
    console.log('✅ Usuário ADMIN criado:', admin.id);
    console.log('   Email: admin@suptecnologia.com.br');
    console.log('   Senha: 123456');
  } else {
    console.log('✅ Usuário ADMIN já existe');
  }

  // 4. Criar usuário FISCAL
  let fiscal = await prisma.usuario.findFirst({
    where: { email: 'fiscal@suptecnologia.com.br' }
  });

  if (!fiscal) {
    console.log('👤 Criando usuário FISCAL...');
    fiscal = await prisma.usuario.create({
      data: {
        nome: 'Operador Fiscal',
        email: 'fiscal@suptecnologia.com.br',
        senhaHash,
        cargo: 'Operador de Emissão',
        perfil: 'FISCAL',
        ativo: true,
        empresaId: empresa.id
      }
    });
    console.log('✅ Usuário FISCAL criado:', fiscal.id);
    console.log('   Email: fiscal@suptecnologia.com.br');
    console.log('   Senha: 123456');
  } else {
    console.log('✅ Usuário FISCAL já existe');
  }

  // 5. Criar cliente exemplo
  let cliente = await prisma.cliente.findFirst({
    where: { documento: '00.000.000/0001-91' }
  });

  if (!cliente) {
    console.log('👤 Criando cliente exemplo...');
    
    const enderecoCliente = await prisma.endereco.create({
      data: {
        logradouro: 'Av. das Nações Unidas',
        numero: '12901',
        complemento: 'Torre Norte',
        bairro: 'Brooklin',
        codigoMunicipio: '3550308',
        nomeMunicipio: 'São Paulo',
        uf: 'SP',
        cep: '04578-000',
        telefone: '(11) 4000-0000',
        email: 'cliente@empresa.com.br'
      }
    });

    cliente = await prisma.cliente.create({
      data: {
        tipo: 'CLIENTE',
        tipoPessoa: 'PJ',
        documento: '00.000.000/0001-91',
        razaoSocial: 'Empresa Cliente Exemplo LTDA',
        nomeFantasia: 'Cliente Exemplo',
        inscricaoEstadual: '123.456.789.000',
        email: 'cliente@empresa.com.br',
        telefone: '(11) 4000-0000',
        ativo: true,
        enderecoId: enderecoCliente.id,
        empresaId: empresa.id
      }
    });
    console.log('✅ Cliente exemplo criado:', cliente.id);
  } else {
    console.log('✅ Cliente exemplo já existe');
  }

  // 6. Criar alguns produtos de exemplo
  const produtosExemplo = [
    {
      codigo: 'SUP-001',
      descricao: 'Servidor Dell PowerEdge R740',
      categoria: 'Hardware & Equipamentos',
      unidade: 'UN',
      ncm: '84714100',
      cfopPadrao: '5102',
      origem: 0,
      precoCusto: 25000.00,
      margemLucro: 28,
      precoVenda: 32000.00,
      estoqueAtual: 5,
      estoqueMinimo: 2,
      aliquotaICMS: 18.0,
      aliquotaPIS: 1.65,
      aliquotaCOFINS: 7.60,
      aliquotaIBS: 0.10,
      aliquotaCBS: 0.90,
      ativo: true,
      empresaId: empresa.id
    },
    {
      codigo: 'SUP-002',
      descricao: 'Switch Cisco Catalyst 2960-X',
      categoria: 'Redes & Conectividade',
      unidade: 'UN',
      ncm: '85176262',
      cfopPadrao: '5102',
      origem: 0,
      precoCusto: 3500.00,
      margemLucro: 48,
      precoVenda: 5200.00,
      estoqueAtual: 12,
      estoqueMinimo: 3,
      aliquotaICMS: 18.0,
      aliquotaPIS: 1.65,
      aliquotaCOFINS: 7.60,
      aliquotaIBS: 0.10,
      aliquotaCBS: 0.90,
      ativo: true,
      empresaId: empresa.id
    },
    {
      codigo: 'SUP-003',
      descricao: 'Firewall Fortinet 60F',
      categoria: 'Segurança da Informação',
      unidade: 'UN',
      ncm: '85176292',
      cfopPadrao: '5102',
      origem: 0,
      precoCusto: 4200.00,
      margemLucro: 62,
      precoVenda: 6800.00,
      estoqueAtual: 8,
      estoqueMinimo: 2,
      aliquotaICMS: 18.0,
      aliquotaPIS: 1.65,
      aliquotaCOFINS: 7.60,
      aliquotaIBS: 0.10,
      aliquotaCBS: 0.90,
      ativo: true,
      empresaId: empresa.id
    }
  ];

  for (const produto of produtosExemplo) {
    const exists = await prisma.produto.findFirst({
      where: { 
        codigo: produto.codigo,
        empresaId: empresa.id 
      }
    });

    if (!exists) {
      console.log(`📦 Criando produto ${produto.codigo}...`);
      await prisma.produto.create({ data: produto });
      console.log(`✅ Produto ${produto.codigo} criado`);
    } else {
      console.log(`✅ Produto ${produto.codigo} já existe`);
    }
  }

  console.log('🎉 Seed concluído com sucesso!');
  console.log('');
  console.log('📋 Dados para login:');
  console.log('   Admin: admin@suptecnologia.com.br / 123456');
  console.log('   Fiscal: fiscal@suptecnologia.com.br / 123456');
  console.log('');
  console.log('📦 Produtos criados:');
  console.log('   SUP-001 - Servidor Dell PowerEdge R740');
  console.log('   SUP-002 - Switch Cisco Catalyst 2960-X');
  console.log('   SUP-003 - Firewall Fortinet 60F');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });