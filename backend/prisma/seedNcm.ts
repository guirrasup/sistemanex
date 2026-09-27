// prisma/seedNcm.ts
// Popula a tabela `ncms` com a tabela oficial (TIPI/Receita Federal), obtida
// via BrasilAPI (https://brasilapi.com.br/api/ncm/v1, espelha o Portal Único
// Siscomex) e salva em prisma/data-ncm.json — 10.435 códigos de 8 dígitos
// atualmente vigentes (filtrados por data_fim = 9999-12-31 na coleta).
// Script isolado do seed.ts geral — só faz upsert nesta tabela.
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const prisma = new PrismaClient()
const __dirname = dirname(fileURLToPath(import.meta.url))

async function main() {
  const linhas: { codigo: string; descricao: string }[] = JSON.parse(
    readFileSync(join(__dirname, 'data-ncm.json'), 'utf-8')
  )

  // createMany é ordens de magnitude mais rápido que upsert em loop pra ~10 mil
  // linhas — como é uma tabela de referência estática (não recebe edição de
  // usuário), não precisamos do upsert por linha do seedCfop.ts aqui.
  const resultado = await prisma.ncm.createMany({
    data: linhas,
    skipDuplicates: true,
  })

  console.log(`NCM: ${resultado.count} inseridos de ${linhas.length} no arquivo (duplicados ignorados).`)
  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
