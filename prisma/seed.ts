// Seed inicial do NEX Enterprise ERP
//
// Cria (se ainda não existirem):
//   - uma Company padrão
//   - um usuário admin, com senha já com hash (bcrypt) salva no banco
//
// Configuração via variáveis de ambiente (defina no .env antes de rodar):
//   SEED_COMPANY_NAME     - Razão social da empresa (default: "Minha Empresa")
//   SEED_COMPANY_TAX_ID   - CNPJ da empresa (default: "00000000000000" — TROQUE isso)
//   SEED_ADMIN_NAME       - Nome do usuário admin (default: "Administrador")
//   SEED_ADMIN_EMAIL      - E-mail de login do admin (default: "admin@nex.com.br")
//   SEED_ADMIN_PASSWORD   - Senha do admin. Se não definida, uma senha aleatória
//                           é gerada e impressa UMA VEZ no log — anote na hora.
//
// Uso (dentro do container, depois do "prisma migrate deploy"):
//   docker compose exec app npm run db:seed

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

async function main() {
  const companyName = process.env.SEED_COMPANY_NAME || "Minha Empresa";
  const companyTaxId = process.env.SEED_COMPANY_TAX_ID || "00000000000000";

  const adminName = process.env.SEED_ADMIN_NAME || "Administrador";
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@nex.com.br";

  let adminPassword = process.env.SEED_ADMIN_PASSWORD;
  let generatedPassword = false;
  if (!adminPassword) {
    adminPassword = crypto.randomBytes(9).toString("base64url");
    generatedPassword = true;
  }

  let company = await prisma.company.findUnique({ where: { taxId: companyTaxId } });
  if (!company) {
    company = await prisma.company.create({
      data: { legalName: companyName, taxId: companyTaxId }
    });
    console.log(`[seed] Empresa criada: ${company.legalName} (id: ${company.id})`);
  } else {
    console.log(`[seed] Empresa já existia: ${company.legalName} (id: ${company.id})`);
  }

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existingAdmin) {
    console.log(`[seed] Usuário admin "${adminEmail}" já existe. Nada foi alterado.`);
    console.log(`[seed] Esqueceu a senha? Apague esse usuário no banco e rode o seed de novo.`);
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.create({
    data: {
      companyId: company.id,
      name: adminName,
      email: adminEmail,
      passwordHash,
      role: "admin",
      isActive: true
    }
  });

  console.log("============================================================");
  console.log("[seed] Usuário admin criado com sucesso!");
  console.log(`  E-mail: ${admin.email}`);
  if (generatedPassword) {
    console.log(`  Senha (gerada agora, só aparece esta vez): ${adminPassword}`);
    console.log("  Anote em um lugar seguro e troque após o primeiro login.");
  } else {
    console.log("  Senha: a definida em SEED_ADMIN_PASSWORD no seu .env");
  }
  console.log("============================================================");
}

main()
  .catch((err) => {
    console.error("[seed] Erro ao rodar o seed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
