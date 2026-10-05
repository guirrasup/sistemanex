-- CreateTable
CREATE TABLE "ncms" (
    "id" TEXT NOT NULL,
    "codigo" CHAR(8) NOT NULL,
    "descricao" VARCHAR(500) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ncms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cests" (
    "id" TEXT NOT NULL,
    "codigo" CHAR(7) NOT NULL,
    "descricao" VARCHAR(500) NOT NULL,
    "segmento" VARCHAR(255) NOT NULL,
    "ncmId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ncms_codigo_key" ON "ncms"("codigo");

-- CreateIndex
CREATE INDEX "cests_ncmId_idx" ON "cests"("ncmId");

-- CreateIndex
CREATE UNIQUE INDEX "cests_codigo_ncmId_key" ON "cests"("codigo", "ncmId");

-- AddForeignKey
ALTER TABLE "cests" ADD CONSTRAINT "cests_ncmId_fkey" FOREIGN KEY ("ncmId") REFERENCES "ncms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
