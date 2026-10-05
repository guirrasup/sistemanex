-- Integridade fiscal e multi-tenant
-- Escrita à mão a partir do `prisma migrate diff`: colunas NOT NULL novas e
-- reduções de tamanho precisam tratar os dados existentes antes da constraint.
-- Em transação: se qualquer passo falhar, nada é aplicado pela metade.

BEGIN;

-- ============================================================
-- 1. Cliente.documento / Transportadora.cnpj únicos POR EMPRESA
-- ============================================================
DROP INDEX "clientes_documento_key";
CREATE UNIQUE INDEX "clientes_empresaId_documento_key" ON "clientes"("empresaId", "documento");

DROP INDEX "transportadoras_cnpj_key";
-- O índice composto (empresaId, cnpj) cobre as buscas só por empresaId.
DROP INDEX "transportadoras_empresaId_idx";
CREATE UNIQUE INDEX "transportadoras_empresaId_cnpj_key" ON "transportadoras"("empresaId", "cnpj");

-- ============================================================
-- 2. nItem sequencial por documento (ItemNFe, ItemNFCe, NFAeItem)
--    Itens existentes são numerados pela ordem de gravação.
-- ============================================================
ALTER TABLE "itens_nfe" ADD COLUMN "nItem" INTEGER;
UPDATE "itens_nfe" AS i SET "nItem" = n.seq
FROM (
  SELECT "id", ROW_NUMBER() OVER (PARTITION BY "nfeId" ORDER BY "createdAt", "id") AS seq
  FROM "itens_nfe"
) AS n
WHERE i."id" = n."id";
ALTER TABLE "itens_nfe" ALTER COLUMN "nItem" SET NOT NULL;
CREATE UNIQUE INDEX "itens_nfe_nfeId_nItem_key" ON "itens_nfe"("nfeId", "nItem");

ALTER TABLE "itens_nfce" ADD COLUMN "nItem" INTEGER;
UPDATE "itens_nfce" AS i SET "nItem" = n.seq
FROM (
  SELECT "id", ROW_NUMBER() OVER (PARTITION BY "nfceId" ORDER BY "createdAt", "id") AS seq
  FROM "itens_nfce"
) AS n
WHERE i."id" = n."id";
ALTER TABLE "itens_nfce" ALTER COLUMN "nItem" SET NOT NULL;
-- O índice único (nfceId, nItem) substitui o índice simples em nfceId.
DROP INDEX "itens_nfce_nfceId_idx";
CREATE UNIQUE INDEX "itens_nfce_nfceId_nItem_key" ON "itens_nfce"("nfceId", "nItem");

ALTER TABLE "nfaes_itens" ADD COLUMN "nItem" INTEGER;
UPDATE "nfaes_itens" AS i SET "nItem" = n.seq
FROM (
  SELECT "id", ROW_NUMBER() OVER (PARTITION BY "nfaeId" ORDER BY "createdAt", "id") AS seq
  FROM "nfaes_itens"
) AS n
WHERE i."id" = n."id";
ALTER TABLE "nfaes_itens" ALTER COLUMN "nItem" SET NOT NULL;
DROP INDEX "nfaes_itens_nfaeId_idx";
CREATE UNIQUE INDEX "nfaes_itens_nfaeId_nItem_key" ON "nfaes_itens"("nfaeId", "nItem");

-- ============================================================
-- 3. Índices de busca de NF-e
-- ============================================================
CREATE INDEX "nfes_empresaId_dhEmi_idx" ON "nfes"("empresaId", "dhEmi");
CREATE INDEX "nfes_destinatarioId_idx" ON "nfes"("destinatarioId");

-- ============================================================
-- 4. Limites de tamanho
-- ============================================================
ALTER TABLE "historico_status_nfe"
  ALTER COLUMN "motivo" SET DATA TYPE VARCHAR(500) USING LEFT("motivo", 500);

-- Placa: remove hífen/espaços e normaliza para maiúsculas antes de reduzir
-- para 7 caracteres (padrão antigo ABC1234 e Mercosul ABC1D23).
UPDATE "mdfes"
SET "veicTracaoPlaca" = UPPER(REGEXP_REPLACE("veicTracaoPlaca", '[^A-Za-z0-9]', '', 'g'))
WHERE "veicTracaoPlaca" IS NOT NULL;
ALTER TABLE "mdfes" ALTER COLUMN "veicTracaoPlaca" SET DATA TYPE VARCHAR(7);

-- ============================================================
-- 5. Referência duplicada no mesmo documento
-- ============================================================
CREATE UNIQUE INDEX "nfes_referencias_nfeId_tipoRef_chaveNFe_key" ON "nfes_referencias"("nfeId", "tipoRef", "chaveNFe");

COMMIT;
