// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // 1. Criar empresa padrão
  const empresa = await prisma.empresa.create({
    data: {
      razaoSocial: 'SUP TECNOLOGIA EM SISTEMAS LTDA',
      nomeFantasia: 'SUP TECNOLOGIA',
      cnpj: '18.236.447/0001-90',
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

  // 2. Criar usuário admin
  const senhaHash = await bcrypt.hash('admin123', 12)
  
  const admin = await prisma.usuario.create({
    data: {
      nome: 'Carlos Eduardo Nogueira',
      email: 'admin@suptecnologia.com.br',
      senhaHash,
      cargo: 'Administrador Fiscal',
      perfil: 'ADMIN',
      empresaId: empresa.id
    }
  })

  console.log('✅ Usuário admin criado:', admin.email)

  // 3. Criar clientes
  const clientes = await Promise.all([
    prisma.cliente.create({
      data: {
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
        empresaId: empresa.id,
        endereco: {
          create: {
            logradouro: 'Avenida República do Chile',
            numero: '65',
            bairro: 'Centro',
            codigoMunicipio: '3304557',
            nomeMunicipio: 'Rio de Janeiro',
            uf: 'RJ',
            cep: '20031-912'
          }
        }
      }
    }),
    prisma.cliente.create({
      data: {
        tipo: 'CLIENTE',
        tipoPessoa: 'PJ',
        documento: '00.360.305/0001-04',
        razaoSocial: 'CAIXA ECONOMICA FEDERAL',
        nomeFantasia: 'CAIXA',
        indicadorIE: '9',
        email: 'suprimentos@caixa.gov.br',
        telefone: '(61) 3206-9900',
        empresaId: empresa.id,
        endereco: {
          create: {
            logradouro: 'SBS Quadra 4 Bloco A',
            numero: 'SN',
            bairro: 'Asa Sul',
            codigoMunicipio: '5300108',
            nomeMunicipio: 'Brasília',
            uf: 'DF',
            cep: '70092-900'
          }
        }
      }
    })
  ])

  console.log(`✅ ${clientes.length} clientes criados`)

  // 4. Criar produtos
  const produtos = await Promise.all([
    prisma.produto.create({
      data: {
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
        aliquotaIPI: 5.0,
        empresaId: empresa.id
      }
    }),
    prisma.produto.create({
      data: {
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
        aliquotaIPI: 10.0,
        empresaId: empresa.id
      }
    })
  ])

  console.log(`✅ ${produtos.length} produtos criados`)

  // 5. Criar serviços
  const servicos = await Promise.all([
    prisma.servico.create({
      data: {
        codigoInterno: 'SRV-DEV-01',
        descricao: 'Desenvolvimento e customização de sistemas sob medida e integrações de APIs fiscais',
        codigoTributacaoNacional: '010701',
        codigoTributacaoMunicipal: '0107',
        codigoNBS: '1.1403.21.10',
        valorUnitario: 3500.00,
        aliquotaISS: 5.0,
        aliquotaPIS: 0.65,
        aliquotaCOFINS: 3.0,
        aliquotaIRRF: 1.5,
        aliquotaCSLL: 1.0,
        empresaId: empresa.id
      }
    }),
    prisma.servico.create({
      data: {
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
        empresaId: empresa.id
      }
    })
  ])

  console.log(`✅ ${servicos.length} serviços criados`)

  console.log('🎉 Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })