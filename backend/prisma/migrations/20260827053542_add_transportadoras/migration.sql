/*
  Warnings:

  - The `ambiente` column on the `nfaes` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `nfaes` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropIndex
DROP INDEX "transportadoras_ativo_idx";

-- AlterTable
ALTER TABLE "nfaes" ALTER COLUMN "chaveAcesso" SET DATA TYPE TEXT,
DROP COLUMN "ambiente",
ADD COLUMN     "ambiente" INTEGER NOT NULL DEFAULT 1,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PROCESSANDO',
ALTER COLUMN "requerenteUf" SET DATA TYPE TEXT,
ALTER COLUMN "requerenteCep" SET DATA TYPE TEXT;

-- CreateIndex
CREATE INDEX "transportadoras_cnpj_idx" ON "transportadoras"("cnpj");
