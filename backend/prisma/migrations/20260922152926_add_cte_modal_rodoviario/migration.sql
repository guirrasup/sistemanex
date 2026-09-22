-- CreateTable: ordens de coleta do modal rodoviário do CT-e (infModal > rodo > occ)
CREATE TABLE "cte_ordens_coleta" (
    "id" TEXT NOT NULL,
    "cteId" TEXT NOT NULL,
    "serie" VARCHAR(3),
    "nOcc" VARCHAR(20) NOT NULL,
    "dEmi" TIMESTAMP(3) NOT NULL,
    "emiCNPJ" CHAR(14) NOT NULL,
    "emiCInt" VARCHAR(20),
    "emiIE" VARCHAR(14),
    "emiUF" CHAR(2) NOT NULL,
    "emiFone" VARCHAR(14),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cte_ordens_coleta_pkey" PRIMARY KEY ("id")
);

-- CreateTable: lacres do modal rodoviário do CT-e (infModal > rodo > lacRodo)
CREATE TABLE "cte_lacres_rodo" (
    "id" TEXT NOT NULL,
    "cteId" TEXT NOT NULL,
    "nLacre" VARCHAR(20) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cte_lacres_rodo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cte_ordens_coleta_cteId_idx" ON "cte_ordens_coleta"("cteId");

-- CreateIndex
CREATE INDEX "cte_lacres_rodo_cteId_idx" ON "cte_lacres_rodo"("cteId");

-- AddForeignKey
ALTER TABLE "cte_ordens_coleta" ADD CONSTRAINT "cte_ordens_coleta_cteId_fkey" FOREIGN KEY ("cteId") REFERENCES "ctes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cte_lacres_rodo" ADD CONSTRAINT "cte_lacres_rodo_cteId_fkey" FOREIGN KEY ("cteId") REFERENCES "ctes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
