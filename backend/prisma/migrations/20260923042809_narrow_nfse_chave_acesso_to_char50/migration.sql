/*
  Warnings:

  - You are about to alter the column `chaveAcesso` on the `nfses` table. The data in that column could be lost. The data in that column will be cast from `Char(53)` to `Char(50)`.

*/
-- AlterTable
ALTER TABLE "nfses" ALTER COLUMN "chaveAcesso" SET DATA TYPE CHAR(50);
