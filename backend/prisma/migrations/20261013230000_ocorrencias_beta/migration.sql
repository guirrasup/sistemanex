-- CreateTable
CREATE TABLE "ocorrencias_beta" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "usuarioNome" TEXT NOT NULL,
    "usuarioEmail" TEXT NOT NULL,
    "tipo" VARCHAR(20) NOT NULL DEFAULT 'ERRO',
    "gravidade" VARCHAR(20) NOT NULL DEFAULT 'MEDIA',
    "titulo" VARCHAR(140) NOT NULL,
    "descricao" TEXT NOT NULL,
    "tela" VARCHAR(80),
    "url" VARCHAR(500),
    "navegador" VARCHAR(400),
    "resolucao" VARCHAR(40),
    "versaoApp" VARCHAR(40),
    "screenshot" TEXT,
    "consoleLog" JSONB,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ABERTA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ocorrencias_beta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ocorrencias_beta_empresaId_createdAt_idx" ON "ocorrencias_beta"("empresaId", "createdAt");

-- CreateIndex
CREATE INDEX "ocorrencias_beta_status_idx" ON "ocorrencias_beta"("status");

