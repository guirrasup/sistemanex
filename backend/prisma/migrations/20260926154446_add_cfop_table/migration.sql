-- CreateTable
CREATE TABLE "cfops" (
    "id" TEXT NOT NULL,
    "codigo" CHAR(4) NOT NULL,
    "descricao" VARCHAR(255) NOT NULL,
    "tipo" CHAR(1) NOT NULL,
    "ambito" VARCHAR(20) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cfops_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cfops_codigo_key" ON "cfops"("codigo");
