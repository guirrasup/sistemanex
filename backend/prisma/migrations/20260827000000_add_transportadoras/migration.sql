-- ============================================
-- MIGRATION: Adicionar Transportadoras
-- ============================================

-- 1. CRIAR TABELA TRANSPORTADORAS
CREATE TABLE "transportadoras" (
    "id" TEXT NOT NULL,
    "tipoPessoa" "TipoPessoa" NOT NULL DEFAULT 'PJ',
    "cnpj" TEXT NOT NULL,
    "razaoSocial" TEXT NOT NULL,
    "nomeFantasia" TEXT,
    "inscricaoEstadual" TEXT,
    "inscricaoMunicipal" TEXT,
    "cnae" TEXT,
    "email" TEXT,
    "telefone" TEXT,
    "celularWhatsApp" TEXT,
    "contato" TEXT,
    "site" TEXT,
    "rntrc" TEXT,
    "antt" TEXT,
    "inscricaoSuframa" TEXT,
    "regimeTributario" "RegimeTributario" DEFAULT 'SIMPLES_NACIONAL',
    "tipoTransportador" TEXT,
    "banco" TEXT,
    "agencia" TEXT,
    "conta" TEXT,
    "operacao" TEXT,
    "chavePix" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "observacoes" TEXT,
    "enderecoId" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transportadoras_pkey" PRIMARY KEY ("id")
);

-- 2. CRIAR ÍNDICES DA TRANSPORTADORA
CREATE UNIQUE INDEX "transportadoras_cnpj_key" ON "transportadoras"("cnpj");
CREATE UNIQUE INDEX "transportadoras_enderecoId_key" ON "transportadoras"("enderecoId");
CREATE INDEX "transportadoras_empresaId_idx" ON "transportadoras"("empresaId");
CREATE INDEX "transportadoras_rntrc_idx" ON "transportadoras"("rntrc");
CREATE INDEX "transportadoras_razaoSocial_idx" ON "transportadoras"("razaoSocial");
CREATE INDEX "transportadoras_ativo_idx" ON "transportadoras"("ativo");

-- 3. ADICIONAR FOREIGN KEYS DA TRANSPORTADORA
ALTER TABLE "transportadoras" ADD CONSTRAINT "transportadoras_enderecoId_fkey" 
    FOREIGN KEY ("enderecoId") REFERENCES "enderecos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "transportadoras" ADD CONSTRAINT "transportadoras_empresaId_fkey" 
    FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 4. ADICIONAR COLUNA transportadoraId NA TABELA transportes_nfe
ALTER TABLE "transportes_nfe" ADD COLUMN "transportadoraId" TEXT;

-- 5. CRIAR ÍNDICE PARA transportadoraId EM transportes_nfe
CREATE INDEX "transportes_nfe_transportadoraId_idx" ON "transportes_nfe"("transportadoraId");

-- 6. ADICIONAR FOREIGN KEY transportadoraId EM transportes_nfe
ALTER TABLE "transportes_nfe" ADD CONSTRAINT "transportes_nfe_transportadoraId_fkey" 
    FOREIGN KEY ("transportadoraId") REFERENCES "transportadoras"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 7. ADICIONAR COLUNA transportadoraId NA TABELA ctes
ALTER TABLE "ctes" ADD COLUMN "transportadoraId" TEXT;

-- 8. CRIAR ÍNDICE PARA transportadoraId EM ctes
CREATE INDEX "ctes_transportadoraId_idx" ON "ctes"("transportadoraId");

-- 9. ADICIONAR FOREIGN KEY transportadoraId EM ctes
ALTER TABLE "ctes" ADD CONSTRAINT "ctes_transportadoraId_fkey" 
    FOREIGN KEY ("transportadoraId") REFERENCES "transportadoras"("id") ON DELETE SET NULL ON UPDATE CASCADE;