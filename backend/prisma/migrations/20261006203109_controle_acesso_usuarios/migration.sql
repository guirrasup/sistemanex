-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "perfilAcessoId" TEXT,
ADD COLUMN     "permissoesConcedidas" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "permissoesNegadas" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "sessaoVersao" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "perfis_acesso" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "nome" VARCHAR(60) NOT NULL,
    "descricao" VARCHAR(255),
    "cor" VARCHAR(20) NOT NULL DEFAULT 'slate',
    "permissoes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "perfis_acesso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "perfis_acesso_empresaId_nome_key" ON "perfis_acesso"("empresaId", "nome");

-- CreateIndex
CREATE INDEX "usuarios_perfilAcessoId_idx" ON "usuarios"("perfilAcessoId");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_perfilAcessoId_fkey" FOREIGN KEY ("perfilAcessoId") REFERENCES "perfis_acesso"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfis_acesso" ADD CONSTRAINT "perfis_acesso_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
