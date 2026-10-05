-- AlterTable
ALTER TABLE "mdfes" ADD COLUMN     "rntrc" VARCHAR(8),
ADD COLUMN     "veicTracaoPlaca" VARCHAR(8),
ADD COLUMN     "veicTracaoRenavam" VARCHAR(11),
ADD COLUMN     "veicTracaoTara" VARCHAR(6),
ADD COLUMN     "veicTracaoTpCar" CHAR(2),
ADD COLUMN     "veicTracaoTpRod" CHAR(2),
ADD COLUMN     "veicTracaoUF" CHAR(2);

-- CreateTable
CREATE TABLE "mdfe_condutores" (
    "id" TEXT NOT NULL,
    "mdfeId" TEXT NOT NULL,
    "xNome" VARCHAR(60) NOT NULL,
    "CPF" CHAR(11) NOT NULL,

    CONSTRAINT "mdfe_condutores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mdfe_condutores_mdfeId_idx" ON "mdfe_condutores"("mdfeId");

-- AddForeignKey
ALTER TABLE "mdfe_condutores" ADD CONSTRAINT "mdfe_condutores_mdfeId_fkey" FOREIGN KEY ("mdfeId") REFERENCES "mdfes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
