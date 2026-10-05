// prisma/seedCfop.ts
// Popula a tabela `cfops` com o catálogo nacional (Ajuste SINIEF 07/2001).
// Script isolado do seed.ts geral — só faz upsert nesta tabela, não mexe em
// nenhum outro dado (clientes, produtos, empresas de teste, etc.).
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Cada código foi pesquisado e validado contra pelo menos 2 fontes
// independentes (ver relatório da pesquisa); ambito/tipo derivados do
// primeiro dígito do código (1/5=interna, 2/6=interestadual, 3/7=exterior;
// 1/2/3=entrada, 5/6/7=saída), não do texto da descrição.
const CFOPS: [string, string][] = [
  // 1xxx — Entrada, operação interna
  ['1101', 'Compra para industrialização ou produção rural'],
  ['1102', 'Compra para comercialização'],
  ['1151', 'Transferência para industrialização ou produção rural'],
  ['1152', 'Transferência para comercialização'],
  ['1201', 'Devolução de venda de produção do estabelecimento'],
  ['1202', 'Devolução de venda de mercadoria adquirida ou recebida de terceiros'],
  ['1401', 'Compra para industrialização ou produção rural em operação com mercadoria sujeita ao regime de substituição tributária'],
  ['1403', 'Compra para comercialização em operação com mercadoria sujeita ao regime de substituição tributária'],
  ['1551', 'Compra de bem para o ativo imobilizado'],
  ['1556', 'Compra de material para uso ou consumo'],
  ['1910', 'Entrada de bonificação, doação ou brinde'],
  ['1917', 'Entrada de mercadoria recebida em consignação mercantil ou industrial'],
  ['1918', 'Devolução de mercadoria remetida em consignação mercantil ou industrial'],
  ['1949', 'Outra entrada de mercadoria ou prestação de serviço não especificado'],
  // 2xxx — Entrada, operação interestadual
  ['2101', 'Compra para industrialização ou produção rural'],
  ['2102', 'Compra para comercialização'],
  ['2201', 'Devolução de venda de produção do estabelecimento'],
  ['2202', 'Devolução de venda de mercadoria adquirida ou recebida de terceiros'],
  ['2401', 'Compra para industrialização ou produção rural em operação com mercadoria sujeita ao regime de substituição tributária'],
  ['2403', 'Compra para comercialização em operação com mercadoria sujeita ao regime de substituição tributária'],
  ['2551', 'Compra de bem para o ativo imobilizado'],
  ['2556', 'Compra de material para uso ou consumo'],
  // 3xxx — Entrada do exterior
  ['3101', 'Compra para industrialização ou produção rural'],
  ['3102', 'Compra para comercialização'],
  ['3127', 'Compra para industrialização sob o regime de drawback'],
  // 5xxx — Saída, operação interna
  ['5101', 'Venda de produção do estabelecimento'],
  ['5102', 'Venda de mercadoria adquirida ou recebida de terceiros'],
  ['5111', 'Venda de produção do estabelecimento remetida anteriormente em consignação industrial'],
  ['5116', 'Venda de produção do estabelecimento originada de encomenda para entrega futura'],
  ['5117', 'Venda de mercadoria adquirida ou recebida de terceiros, originada de encomenda para entrega futura'],
  ['5151', 'Transferência de produção do estabelecimento'],
  ['5152', 'Transferência de mercadoria adquirida ou recebida de terceiros'],
  ['5201', 'Devolução de compra para industrialização ou produção rural'],
  ['5202', 'Devolução de compra para comercialização'],
  ['5401', 'Venda de produção do estabelecimento em operação com produto sujeito ao regime de substituição tributária, na condição de contribuinte substituto'],
  ['5403', 'Venda de mercadoria adquirida ou recebida de terceiros em operação com mercadoria sujeita ao regime de substituição tributária, na condição de contribuinte substituto'],
  ['5551', 'Venda de bem do ativo imobilizado'],
  ['5552', 'Transferência de bem do ativo imobilizado'],
  ['5556', 'Devolução de compra de material de uso ou consumo'],
  ['5910', 'Remessa em bonificação, doação ou brinde'],
  ['5911', 'Remessa de amostra grátis'],
  ['5912', 'Remessa de mercadoria ou bem para demonstração, mostruário ou treinamento'],
  ['5917', 'Remessa de mercadoria em consignação mercantil ou industrial'],
  ['5918', 'Devolução de mercadoria recebida em consignação mercantil ou industrial'],
  ['5922', 'Lançamento efetuado a título de simples faturamento decorrente de venda para entrega futura'],
  ['5949', 'Outra saída de mercadoria ou prestação de serviço não especificado'],
  // 6xxx — Saída, operação interestadual
  ['6101', 'Venda de produção do estabelecimento'],
  ['6102', 'Venda de mercadoria adquirida ou recebida de terceiros'],
  ['6108', 'Venda de produção do estabelecimento, destinada a não contribuinte'],
  ['6109', 'Venda de mercadoria adquirida ou recebida de terceiros, destinada a não contribuinte'],
  ['6151', 'Transferência de produção do estabelecimento'],
  ['6152', 'Transferência de mercadoria adquirida ou recebida de terceiros'],
  ['6201', 'Devolução de compra para industrialização ou produção rural'],
  ['6202', 'Devolução de compra para comercialização'],
  ['6401', 'Venda de produção do estabelecimento em operação com produto sujeito ao regime de substituição tributária, na condição de contribuinte substituto'],
  ['6403', 'Venda de mercadoria adquirida ou recebida de terceiros em operação com mercadoria sujeita ao regime de substituição tributária, na condição de contribuinte substituto'],
  ['6551', 'Venda de bem do ativo imobilizado'],
  ['6552', 'Transferência de bem do ativo imobilizado'],
  ['6910', 'Remessa em bonificação, doação ou brinde'],
  ['6949', 'Outra saída de mercadoria ou prestação de serviço não especificado'],
  // 7xxx — Saída para o exterior
  ['7101', 'Venda de produção do estabelecimento'],
  ['7102', 'Venda de mercadoria adquirida ou recebida de terceiros'],
  ['7127', 'Venda de produção do estabelecimento sob o regime de drawback'],
]

function classificar(codigo: string): { tipo: string; ambito: string } {
  const primeiro = codigo[0]
  const tipo = ['1', '2', '3'].includes(primeiro) ? '0' : '1' // 0=entrada, 1=saída
  const ambito =
    ['1', '5'].includes(primeiro) ? 'INTERNA' :
    ['2', '6'].includes(primeiro) ? 'INTERESTADUAL' :
    'EXTERIOR'
  return { tipo, ambito }
}

async function main() {
  let criados = 0
  let atualizados = 0

  for (const [codigo, descricao] of CFOPS) {
    const { tipo, ambito } = classificar(codigo)
    const existia = await prisma.cfop.findUnique({ where: { codigo } })

    await prisma.cfop.upsert({
      where: { codigo },
      create: { codigo, descricao, tipo, ambito },
      update: { descricao, tipo, ambito },
    })

    if (existia) atualizados++; else criados++
  }

  console.log(`CFOP: ${criados} criados, ${atualizados} atualizados, ${CFOPS.length} total.`)
  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
