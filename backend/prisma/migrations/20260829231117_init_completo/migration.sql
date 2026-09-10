-- CreateEnum
CREATE TYPE "StatusCTe" AS ENUM ('RASCUNHO', 'VALIDADA', 'ASSINADA', 'PROCESSANDO', 'AUTORIZADA', 'REJEITADA', 'CANCELADA', 'DENEGADA');

-- CreateEnum
CREATE TYPE "ModalCTe" AS ENUM ('RODOVIARIO', 'AEREO', 'AQUAVIARIO', 'FERROVIARIO', 'DUTOVIARIO', 'MULTIMODAL');

-- CreateEnum
CREATE TYPE "TipoServicoCTe" AS ENUM ('NORMAL', 'SUBCONTRATACAO', 'REDESPACHO', 'REDESPACHO_INTERMEDIARIO', 'VINCULADO_MULTIMODAL');

-- CreateEnum
CREATE TYPE "TipoCTe" AS ENUM ('NORMAL', 'COMPLEMENTO_VALORES', 'SUBSTITUICAO');

-- CreateEnum
CREATE TYPE "TomadorServicoCTe" AS ENUM ('REMETENTE', 'EXPEDIDOR', 'RECEBEDOR', 'DESTINATARIO', 'OUTROS');

-- CreateEnum
CREATE TYPE "IndicadorIECTe" AS ENUM ('CONTRIBUINTE', 'ISENTO', 'NAO_CONTRIBUINTE');

-- CreateEnum
CREATE TYPE "CSTICMSCTe" AS ENUM ('TRIBUTACAO_NORMAL', 'REDUCAO_BC', 'ISENTA', 'NAO_TRIBUTADA', 'DIFERIDA', 'ST', 'OUTROS');

-- CreateEnum
CREATE TYPE "StatusNFAe" AS ENUM ('RASCUNHO', 'VALIDADA', 'ASSINADA', 'PROCESSANDO', 'AUTORIZADA', 'REJEITADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "MotivoEmissaoNFAe" AS ENUM ('PRODUTOR_RURAL', 'MEI_SEM_IE', 'PF_ATIVO_PESSOAL', 'FEIRAS_EVENTOS', 'DEVOLUCAO_AVULSA', 'OUTROS');

-- CreateEnum
CREATE TYPE "TipoPessoaNFAe" AS ENUM ('PF', 'PJ');

-- CreateEnum
CREATE TYPE "StatusMDFe" AS ENUM ('RASCUNHO', 'VALIDADA', 'ASSINADA', 'PROCESSANDO', 'AUTORIZADA', 'REJEITADA', 'CANCELADA', 'DENEGADA', 'ENCERRADA');

-- CreateEnum
CREATE TYPE "ModalMDFe" AS ENUM ('RODOVIARIO', 'AEREO', 'AQUAVIARIO', 'FERROVIARIO');

-- CreateEnum
CREATE TYPE "TipoEmitenteMDFe" AS ENUM ('PRESTADOR_SERVICO', 'TRANSPORTADOR_CARGA_PROPRIA', 'CTE_GLOBALIZADO');

-- CreateEnum
CREATE TYPE "TipoTransportadorMDFe" AS ENUM ('ETC', 'TAC', 'CTC');

-- CreateEnum
CREATE TYPE "TipoCargaMDFe" AS ENUM ('GRANEL_SOLIDO', 'GRANEL_LIQUIDO', 'FRIGORIFICADA', 'CONTEINERIZADA', 'CARGA_GERAL', 'NEOGRANEL', 'PERIGOSA_GRANEL_SOLIDO', 'PERIGOSA_GRANEL_LIQUIDO', 'PERIGOSA_FRIGORIFICADA', 'PERIGOSA_CONTEINERIZADA', 'PERIGOSA_CARGA_GERAL', 'GRANEL_PRESSURIZADA');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "StatusDocumento" ADD VALUE 'VALIDADA';
ALTER TYPE "StatusDocumento" ADD VALUE 'ASSINADA';
ALTER TYPE "StatusDocumento" ADD VALUE 'DENEGADA';

-- DropForeignKey
ALTER TABLE "ctes" DROP CONSTRAINT "ctes_destinatarioId_fkey";

-- DropForeignKey
ALTER TABLE "ctes" DROP CONSTRAINT "ctes_remetenteId_fkey";

-- DropForeignKey
ALTER TABLE "itens_nfae" DROP CONSTRAINT "itens_nfae_nfaeId_fkey";

-- DropForeignKey
ALTER TABLE "nfaes" DROP CONSTRAINT "nfaes_destinatarioId_fkey";

-- DropForeignKey
ALTER TABLE "nfses" DROP CONSTRAINT "nfses_servicoId_fkey";

-- DropForeignKey
ALTER TABLE "nfses" DROP CONSTRAINT "nfses_tomadorId_fkey";

-- DropIndex
DROP INDEX "ctes_transportadoraId_idx";

-- AlterTable
ALTER TABLE "certificados_digitais" ADD COLUMN     "senha" TEXT;

-- AlterTable
ALTER TABLE "clientes" DROP COLUMN "indicadorIE",
ADD COLUMN     "indIEDest" CHAR(1) NOT NULL DEFAULT '9',
ADD COLUMN     "inscricaoSuframa" CHAR(9);

-- AlterTable
ALTER TABLE "ctes" DROP COLUMN "aliquotaICMS",
DROP COLUMN "ambiente",
DROP COLUMN "baseCalculoICMS",
DROP COLUMN "cfop",
DROP COLUMN "chavesNFeTransportadas",
DROP COLUMN "cstICMS",
DROP COLUMN "cubagemM3",
DROP COLUMN "dataHoraEmissao",
DROP COLUMN "especieVolumes",
DROP COLUMN "fretePeso",
DROP COLUMN "freteValor",
DROP COLUMN "modelo",
DROP COLUMN "motoristaCpf",
DROP COLUMN "motoristaNome",
DROP COLUMN "municipioFimCod",
DROP COLUMN "municipioFimNome",
DROP COLUMN "municipioFimUf",
DROP COLUMN "municipioInicioCod",
DROP COLUMN "municipioInicioNome",
DROP COLUMN "municipioInicioUf",
DROP COLUMN "naturezaOperacao",
DROP COLUMN "numero",
DROP COLUMN "outrasTaxas",
DROP COLUMN "pedagio",
DROP COLUMN "pesoBrutoKg",
DROP COLUMN "pesoLiquidoKg",
DROP COLUMN "produtoPredominante",
DROP COLUMN "quantidadeVolumes",
DROP COLUMN "rntrc",
DROP COLUMN "taxaGris",
DROP COLUMN "tipoEmissao",
DROP COLUMN "tomadorServico",
DROP COLUMN "valorCOFINS",
DROP COLUMN "valorCargaAverbada",
DROP COLUMN "valorICMS",
DROP COLUMN "valorPIS",
DROP COLUMN "valorReceber",
DROP COLUMN "valorTotalFrete",
DROP COLUMN "valorTributosAprox",
DROP COLUMN "veiculoPlaca",
DROP COLUMN "veiculoUf",
ADD COLUMN     "CFOP" CHAR(3) NOT NULL,
ADD COLUMN     "CST00" CHAR(2),
ADD COLUMN     "CST20" CHAR(2),
ADD COLUMN     "CST45" CHAR(2),
ADD COLUMN     "CST60" CHAR(2),
ADD COLUMN     "CST90" CHAR(2),
ADD COLUMN     "CSTIBSCBS" CHAR(3),
ADD COLUMN     "CSTOutraUF" CHAR(2),
ADD COLUMN     "CSTReg" CHAR(3),
ADD COLUMN     "CSTSN" CHAR(2),
ADD COLUMN     "Id" VARCHAR(47),
ADD COLUMN     "UFEnv" CHAR(2) NOT NULL,
ADD COLUMN     "UFFim" CHAR(2) NOT NULL,
ADD COLUMN     "UFIni" CHAR(2) NOT NULL,
ADD COLUMN     "cBenef45" VARCHAR(10),
ADD COLUMN     "cCT" CHAR(8) NOT NULL,
ADD COLUMN     "cClassTrib" CHAR(6),
ADD COLUMN     "cClassTribReg" CHAR(6),
ADD COLUMN     "cDV" CHAR(1) NOT NULL,
ADD COLUMN     "cMunEnv" CHAR(7) NOT NULL,
ADD COLUMN     "cMunFim" CHAR(7) NOT NULL,
ADD COLUMN     "cMunIni" CHAR(7) NOT NULL,
ADD COLUMN     "cUF" CHAR(2) NOT NULL,
ADD COLUMN     "chCteSub" CHAR(44),
ADD COLUMN     "dFim" TIMESTAMP(3),
ADD COLUMN     "dIni" TIMESTAMP(3),
ADD COLUMN     "dProg" TIMESTAMP(3),
ADD COLUMN     "dataHoraEncerramento" TIMESTAMP(3),
ADD COLUMN     "dataHoraRejeicao" TIMESTAMP(3),
ADD COLUMN     "destCalc" VARCHAR(40),
ADD COLUMN     "dhCont" TIMESTAMP(3),
ADD COLUMN     "dhEmi" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "emitenteId" TEXT NOT NULL,
ADD COLUMN     "enviadoEm" TIMESTAMP(3),
ADD COLUMN     "enviadoPor" TEXT,
ADD COLUMN     "expedidorId" TEXT,
ADD COLUMN     "hFim" CHAR(8),
ADD COLUMN     "hIni" CHAR(8),
ADD COLUMN     "hProg" CHAR(8),
ADD COLUMN     "indAlteraToma" CHAR(1),
ADD COLUMN     "indDoacao" CHAR(1),
ADD COLUMN     "indGlobalizado" BOOLEAN DEFAULT false,
ADD COLUMN     "indIEToma" "IndicadorIECTe" NOT NULL DEFAULT 'NAO_CONTRIBUINTE',
ADD COLUMN     "indSN" CHAR(1),
ADD COLUMN     "infAdFisco" VARCHAR(2000),
ADD COLUMN     "ipEnvio" VARCHAR(45),
ADD COLUMN     "mod" CHAR(2) NOT NULL DEFAULT '57',
ADD COLUMN     "modal" "ModalCTe" NOT NULL,
ADD COLUMN     "motivoEncerramento" VARCHAR(255),
ADD COLUMN     "motivoRejeicao" VARCHAR(500),
ADD COLUMN     "nCT" INTEGER NOT NULL,
ADD COLUMN     "nFat" VARCHAR(60),
ADD COLUMN     "natOp" VARCHAR(60) NOT NULL,
ADD COLUMN     "origCalc" VARCHAR(40),
ADD COLUMN     "pAliqEfetCBS" DECIMAL(5,4),
ADD COLUMN     "pAliqEfetIBSMun" DECIMAL(5,4),
ADD COLUMN     "pAliqEfetIBSUF" DECIMAL(5,4),
ADD COLUMN     "pAliqEfetRegCBS" DECIMAL(5,4),
ADD COLUMN     "pAliqEfetRegIBSMun" DECIMAL(5,4),
ADD COLUMN     "pAliqEfetRegIBSUF" DECIMAL(5,4),
ADD COLUMN     "pCBS" DECIMAL(5,4),
ADD COLUMN     "pDifCBS" DECIMAL(5,4),
ADD COLUMN     "pDifIBSMun" DECIMAL(5,4),
ADD COLUMN     "pDifIBSUF" DECIMAL(5,4),
ADD COLUMN     "pFCPUFFim" DECIMAL(5,2),
ADD COLUMN     "pIBSMun" DECIMAL(5,4),
ADD COLUMN     "pIBSUF" DECIMAL(5,4),
ADD COLUMN     "pICMS00" DECIMAL(5,2),
ADD COLUMN     "pICMS20" DECIMAL(5,2),
ADD COLUMN     "pICMS90" DECIMAL(5,2),
ADD COLUMN     "pICMSInter" DECIMAL(5,2),
ADD COLUMN     "pICMSOutraUF" DECIMAL(5,2),
ADD COLUMN     "pICMSSTRet" DECIMAL(5,2),
ADD COLUMN     "pICMSUFFim" DECIMAL(5,2),
ADD COLUMN     "pRedAliqCBS" DECIMAL(5,4),
ADD COLUMN     "pRedAliqIBSMun" DECIMAL(5,4),
ADD COLUMN     "pRedAliqIBSUF" DECIMAL(5,4),
ADD COLUMN     "pRedBC20" DECIMAL(5,2),
ADD COLUMN     "pRedBC90" DECIMAL(5,2),
ADD COLUMN     "pRedBCOutraUF" DECIMAL(5,2),
ADD COLUMN     "pRedutor" VARCHAR(5),
ADD COLUMN     "proPred" VARCHAR(60) NOT NULL,
ADD COLUMN     "procEmi" CHAR(1) NOT NULL DEFAULT '0',
ADD COLUMN     "recebedorId" TEXT,
ADD COLUMN     "reciboLote" VARCHAR(15),
ADD COLUMN     "refDFeAnt" VARCHAR(44),
ADD COLUMN     "retira" CHAR(1) NOT NULL,
ADD COLUMN     "toma" "TomadorServicoCTe" NOT NULL,
ADD COLUMN     "tomadorCEP" CHAR(8),
ADD COLUMN     "tomadorCNPJ" CHAR(14),
ADD COLUMN     "tomadorCPF" CHAR(11),
ADD COLUMN     "tomadorEmail" VARCHAR(60),
ADD COLUMN     "tomadorFone" VARCHAR(14),
ADD COLUMN     "tomadorIE" VARCHAR(14),
ADD COLUMN     "tomadorNro" VARCHAR(60),
ADD COLUMN     "tomadorUF" CHAR(2),
ADD COLUMN     "tomadorcMun" CHAR(7),
ADD COLUMN     "tomadorcPais" CHAR(4),
ADD COLUMN     "tomadorxBairro" VARCHAR(60),
ADD COLUMN     "tomadorxCpl" VARCHAR(60),
ADD COLUMN     "tomadorxFant" VARCHAR(60),
ADD COLUMN     "tomadorxLgr" VARCHAR(255),
ADD COLUMN     "tomadorxMun" VARCHAR(60),
ADD COLUMN     "tomadorxNome" VARCHAR(60),
ADD COLUMN     "tomadorxPais" VARCHAR(60),
ADD COLUMN     "tpAmb" CHAR(1) NOT NULL DEFAULT '1',
ADD COLUMN     "tpCTe" "TipoCTe" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "tpEmis" CHAR(1) NOT NULL DEFAULT '1',
ADD COLUMN     "tpEnteGov" CHAR(1),
ADD COLUMN     "tpHor" CHAR(1),
ADD COLUMN     "tpImp" CHAR(1) NOT NULL,
ADD COLUMN     "tpOperGov" CHAR(1),
ADD COLUMN     "tpPer" CHAR(1),
ADD COLUMN     "tpServ" "TipoServicoCTe" NOT NULL,
ADD COLUMN     "vBC00" DECIMAL(15,2),
ADD COLUMN     "vBC20" DECIMAL(15,2),
ADD COLUMN     "vBC90" DECIMAL(15,2),
ADD COLUMN     "vBCIBS" DECIMAL(15,2),
ADD COLUMN     "vBCOutraUF" DECIMAL(15,2),
ADD COLUMN     "vBCSTRet" DECIMAL(15,2),
ADD COLUMN     "vBCUFFim" DECIMAL(15,2),
ADD COLUMN     "vCBS" DECIMAL(15,2),
ADD COLUMN     "vCBSEstCred" DECIMAL(15,2),
ADD COLUMN     "vCarga" DECIMAL(15,2),
ADD COLUMN     "vCargaAverb" DECIMAL(15,2),
ADD COLUMN     "vCred" DECIMAL(15,2),
ADD COLUMN     "vCred90" DECIMAL(15,2),
ADD COLUMN     "vDesc" DECIMAL(15,2),
ADD COLUMN     "vDevTribCBS" DECIMAL(15,2),
ADD COLUMN     "vDevTribIBSMun" DECIMAL(15,2),
ADD COLUMN     "vDevTribIBSUF" DECIMAL(15,2),
ADD COLUMN     "vDifCBS" DECIMAL(15,2),
ADD COLUMN     "vDifIBSMun" DECIMAL(15,2),
ADD COLUMN     "vDifIBSUF" DECIMAL(15,2),
ADD COLUMN     "vFCPUFFim" DECIMAL(15,2),
ADD COLUMN     "vIBS" DECIMAL(15,2),
ADD COLUMN     "vIBSEstCred" DECIMAL(15,2),
ADD COLUMN     "vIBSMun" DECIMAL(15,2),
ADD COLUMN     "vIBSUF" DECIMAL(15,2),
ADD COLUMN     "vICMS00" DECIMAL(15,2),
ADD COLUMN     "vICMS20" DECIMAL(15,2),
ADD COLUMN     "vICMS90" DECIMAL(15,2),
ADD COLUMN     "vICMSDeson45" DECIMAL(15,2),
ADD COLUMN     "vICMSOutraUF" DECIMAL(15,2),
ADD COLUMN     "vICMSSTRet" DECIMAL(15,2),
ADD COLUMN     "vICMSUFFim" DECIMAL(15,2),
ADD COLUMN     "vICMSUFIni" DECIMAL(15,2),
ADD COLUMN     "vLiq" DECIMAL(15,2),
ADD COLUMN     "vOrig" DECIMAL(15,2),
ADD COLUMN     "vRec" DECIMAL(15,2) NOT NULL,
ADD COLUMN     "vTPrest" DECIMAL(15,2) NOT NULL,
ADD COLUMN     "vTotDFe" DECIMAL(15,2),
ADD COLUMN     "vTribRegCBS" DECIMAL(15,2),
ADD COLUMN     "vTribRegIBSMun" DECIMAL(15,2),
ADD COLUMN     "vTribRegIBSUF" DECIMAL(15,2),
ADD COLUMN     "veicChassi" VARCHAR(17),
ADD COLUMN     "veicCor" VARCHAR(4),
ADD COLUMN     "veiccMod" VARCHAR(6),
ADD COLUMN     "veicvFrete" DECIMAL(15,2),
ADD COLUMN     "veicvUnit" DECIMAL(15,2),
ADD COLUMN     "veicxCor" VARCHAR(40),
ADD COLUMN     "verProc" VARCHAR(20) NOT NULL,
ADD COLUMN     "versao" VARCHAR(4) NOT NULL DEFAULT '4.00',
ADD COLUMN     "xCaracAd" VARCHAR(15),
ADD COLUMN     "xCaracSer" VARCHAR(30),
ADD COLUMN     "xDest" VARCHAR(60),
ADD COLUMN     "xDetRetira" VARCHAR(160),
ADD COLUMN     "xEmi" VARCHAR(20),
ADD COLUMN     "xJust" VARCHAR(256),
ADD COLUMN     "xMunEnv" VARCHAR(60) NOT NULL,
ADD COLUMN     "xMunFim" VARCHAR(60) NOT NULL,
ADD COLUMN     "xMunIni" VARCHAR(60) NOT NULL,
ADD COLUMN     "xObs" VARCHAR(2000),
ADD COLUMN     "xObsGlobalizado" VARCHAR(256),
ADD COLUMN     "xOrig" VARCHAR(60),
ADD COLUMN     "xOutCat" VARCHAR(30),
ADD COLUMN     "xRota" VARCHAR(10),
ADD COLUMN     "xmlModal" TEXT,
ADD COLUMN     "xmlRetorno" TEXT,
ALTER COLUMN "chaveAcesso" DROP NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "StatusCTe" NOT NULL DEFAULT 'RASCUNHO',
ALTER COLUMN "remetenteId" DROP NOT NULL,
ALTER COLUMN "destinatarioId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "empresas" ADD COLUMN     "codigoMunicipio" CHAR(7),
ADD COLUMN     "codigoUF" CHAR(2),
ADD COLUMN     "homologacaoQrCode" TEXT,
ADD COLUMN     "homologacaoWebService" TEXT,
ADD COLUMN     "inscricaoEstadualST" TEXT,
ADD COLUMN     "justificativaContingencia" VARCHAR(256),
ADD COLUMN     "nomeMunicipio" TEXT,
ADD COLUMN     "producaoQrCode" TEXT,
ADD COLUMN     "producaoWebService" TEXT,
ADD COLUMN     "proximoNumeroMdfe" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "proximoNumeroMdfeAno" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "proximoNumeroNfeAno" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "serieMdfe" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "serieMdfeAno" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "serieNfeAno" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tipoEmissao" CHAR(1) NOT NULL DEFAULT '1',
ADD COLUMN     "tokenCSC" VARCHAR(36),
ADD COLUMN     "tokenCSCId" VARCHAR(2),
ADD COLUMN     "uf" CHAR(2);

-- AlterTable
ALTER TABLE "enderecos" ADD COLUMN     "codigoUF" CHAR(2);

-- Backfill: as colunas denormalizadas de UF/município de "empresas" e o
-- "codigoUF" de "enderecos" são novas e não têm valor pra linhas existentes.
-- Preenche a partir do endereço já vinculado (codigoUF = 2 primeiros dígitos
-- do código IBGE do município, convenção padrão) antes de travar como NOT NULL.
UPDATE "enderecos" SET "codigoUF" = LEFT("codigoMunicipio", 2) WHERE "codigoUF" IS NULL;

UPDATE "empresas" e SET
  "uf" = en."uf",
  "codigoUF" = en."codigoUF",
  "codigoMunicipio" = en."codigoMunicipio",
  "nomeMunicipio" = en."nomeMunicipio"
FROM "enderecos" en
WHERE en.id = e."enderecoId" AND e."uf" IS NULL;

ALTER TABLE "enderecos" ALTER COLUMN "codigoUF" SET NOT NULL;

ALTER TABLE "empresas"
ALTER COLUMN "uf" SET NOT NULL,
ALTER COLUMN "codigoUF" SET NOT NULL,
ALTER COLUMN "codigoMunicipio" SET NOT NULL,
ALTER COLUMN "nomeMunicipio" SET NOT NULL;

-- AlterTable
ALTER TABLE "eventos_credito_presumido" ALTER COLUMN "tpAutor" SET DEFAULT '1',
ALTER COLUMN "tpAutor" SET DATA TYPE CHAR(1);

-- AlterTable
ALTER TABLE "eventos_credito_presumido_itens" ALTER COLUMN "vBCCredPres" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "vCredPresIBS" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "vCredPresCBS" SET DATA TYPE DECIMAL(15,4);

-- AlterTable
ALTER TABLE "eventos_nfe" ADD COLUMN     "inutilizacaoId" TEXT,
ADD COLUMN     "nfeId" TEXT,
ALTER COLUMN "tpAutor" SET DEFAULT '1',
ALTER COLUMN "tpAutor" SET DATA TYPE CHAR(1);

-- AlterTable
ALTER TABLE "itens_nfce" ADD COLUMN     "aliquotaCBS" DECIMAL(7,4),
ADD COLUMN     "aliquotaIBSMun" DECIMAL(7,4),
ADD COLUMN     "aliquotaIBSUF" DECIMAL(7,4),
ADD COLUMN     "aliquotaIPI" DECIMAL(5,2),
ADD COLUMN     "cBarra" VARCHAR(30),
ADD COLUMN     "cBarraTrib" VARCHAR(30),
ADD COLUMN     "cEnqIPI" VARCHAR(3),
ADD COLUMN     "codigoEAN" VARCHAR(14),
ADD COLUMN     "codigoEANTrib" VARCHAR(14),
ADD COLUMN     "csosnICMS" CHAR(3),
ADD COLUMN     "cstIBSCBS" CHAR(2),
ADD COLUMN     "cstIPI" CHAR(2),
ADD COLUMN     "indTot" CHAR(1) NOT NULL DEFAULT '1',
ADD COLUMN     "infAdProd" VARCHAR(500),
ADD COLUMN     "modBC" CHAR(1) DEFAULT '3',
ADD COLUMN     "origemMercadoria" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pCOFINSST" DECIMAL(7,4),
ADD COLUMN     "pFCP" DECIMAL(5,2),
ADD COLUMN     "pFCPST" DECIMAL(5,2),
ADD COLUMN     "pICMSST" DECIMAL(5,2),
ADD COLUMN     "pMVAST" DECIMAL(5,2),
ADD COLUMN     "pPISST" DECIMAL(7,4),
ADD COLUMN     "pRedBC" DECIMAL(5,2),
ADD COLUMN     "pRedBCST" DECIMAL(5,2),
ADD COLUMN     "qBCProdCOFINS" DECIMAL(15,4),
ADD COLUMN     "qBCProdPIS" DECIMAL(15,4),
ADD COLUMN     "vAliqProdCOFINS" DECIMAL(15,4),
ADD COLUMN     "vAliqProdPIS" DECIMAL(15,4),
ADD COLUMN     "vBCFCP" DECIMAL(15,4),
ADD COLUMN     "vBCFCPST" DECIMAL(15,4),
ADD COLUMN     "vBCST" DECIMAL(15,4),
ADD COLUMN     "vBCSTCOFINS" DECIMAL(15,4),
ADD COLUMN     "vBCSTPIS" DECIMAL(15,4),
ADD COLUMN     "vCOFINSST" DECIMAL(15,4),
ADD COLUMN     "vFCP" DECIMAL(15,4),
ADD COLUMN     "vFCPST" DECIMAL(15,4),
ADD COLUMN     "vICMSST" DECIMAL(15,4),
ADD COLUMN     "vPISST" DECIMAL(15,4),
ADD COLUMN     "valorCBS" DECIMAL(15,4),
ADD COLUMN     "valorIBSMun" DECIMAL(15,4),
ADD COLUMN     "valorIBSUF" DECIMAL(15,4),
ADD COLUMN     "valorIPI" DECIMAL(15,4),
ALTER COLUMN "descricao" SET DATA TYPE VARCHAR(120),
ALTER COLUMN "unidadeMedida" SET DATA TYPE VARCHAR(6);

-- AlterTable
ALTER TABLE "itens_nfe" DROP COLUMN "aliquotaCBS",
DROP COLUMN "aliquotaCOFINS",
DROP COLUMN "aliquotaIBSMun",
DROP COLUMN "aliquotaIBSUF",
DROP COLUMN "aliquotaICMS",
DROP COLUMN "aliquotaIPI",
DROP COLUMN "aliquotaPIS",
DROP COLUMN "baseCalculoICMS",
DROP COLUMN "descontoItem",
DROP COLUMN "valorCBS",
DROP COLUMN "valorCOFINS",
DROP COLUMN "valorIBSMun",
DROP COLUMN "valorIBSUF",
DROP COLUMN "valorICMS",
DROP COLUMN "valorIPI",
DROP COLUMN "valorPIS",
DROP COLUMN "valorTotalBruto",
DROP COLUMN "valorTributosAprox",
ADD COLUMN     "cBarra" VARCHAR(30),
ADD COLUMN     "cBarraTrib" VARCHAR(30),
ADD COLUMN     "cEnqIPI" VARCHAR(3),
ADD COLUMN     "csosnICMS" CHAR(3),
ADD COLUMN     "indTot" CHAR(1) NOT NULL DEFAULT '1',
ADD COLUMN     "infAdProd" VARCHAR(500),
ADD COLUMN     "modBC" CHAR(1) NOT NULL DEFAULT '3',
ADD COLUMN     "nFCI" VARCHAR(36),
ADD COLUMN     "nItemPed" INTEGER,
ADD COLUMN     "pCBS" DECIMAL(7,4),
ADD COLUMN     "pCOFINS" DECIMAL(7,4),
ADD COLUMN     "pCOFINSST" DECIMAL(7,4),
ADD COLUMN     "pFCP" DECIMAL(5,2),
ADD COLUMN     "pFCPST" DECIMAL(5,2),
ADD COLUMN     "pIBS" DECIMAL(7,4),
ADD COLUMN     "pICMS" DECIMAL(5,2),
ADD COLUMN     "pICMSST" DECIMAL(5,2),
ADD COLUMN     "pIPI" DECIMAL(5,2),
ADD COLUMN     "pMVAST" DECIMAL(5,2),
ADD COLUMN     "pPIS" DECIMAL(7,4),
ADD COLUMN     "pPISST" DECIMAL(7,4),
ADD COLUMN     "pRedBC" DECIMAL(5,2),
ADD COLUMN     "pRedBCST" DECIMAL(5,2),
ADD COLUMN     "qBCProdCOFINS" DECIMAL(15,4),
ADD COLUMN     "qBCProdPIS" DECIMAL(15,4),
ADD COLUMN     "qTrib" DECIMAL(15,4),
ADD COLUMN     "uTrib" VARCHAR(6),
ADD COLUMN     "vAliqProdCOFINS" DECIMAL(15,4),
ADD COLUMN     "vAliqProdPIS" DECIMAL(15,4),
ADD COLUMN     "vBC" DECIMAL(15,4),
ADD COLUMN     "vBCFCP" DECIMAL(15,4),
ADD COLUMN     "vBCFCPST" DECIMAL(15,4),
ADD COLUMN     "vBCST" DECIMAL(15,4),
ADD COLUMN     "vBCSTCOFINS" DECIMAL(15,4),
ADD COLUMN     "vBCSTPIS" DECIMAL(15,4),
ADD COLUMN     "vCBS" DECIMAL(15,4),
ADD COLUMN     "vCOFINS" DECIMAL(15,4),
ADD COLUMN     "vCOFINSST" DECIMAL(15,4),
ADD COLUMN     "vDesc" DECIMAL(15,4) NOT NULL DEFAULT 0,
ADD COLUMN     "vFCP" DECIMAL(15,4),
ADD COLUMN     "vFCPST" DECIMAL(15,4),
ADD COLUMN     "vIBS" DECIMAL(15,4),
ADD COLUMN     "vICMS" DECIMAL(15,4),
ADD COLUMN     "vICMSST" DECIMAL(15,4),
ADD COLUMN     "vIPI" DECIMAL(15,4),
ADD COLUMN     "vOutro" DECIMAL(15,4),
ADD COLUMN     "vPIS" DECIMAL(15,4),
ADD COLUMN     "vPISST" DECIMAL(15,4),
ADD COLUMN     "vProd" DECIMAL(15,4) NOT NULL,
ADD COLUMN     "vTotTrib" DECIMAL(15,4),
ADD COLUMN     "vUnTrib" DECIMAL(15,4),
ADD COLUMN     "xPed" VARCHAR(15),
ALTER COLUMN "descricao" SET DATA TYPE VARCHAR(120),
ALTER COLUMN "origemMercadoria" SET DEFAULT '0',
ALTER COLUMN "origemMercadoria" SET DATA TYPE CHAR(1);

-- AlterTable
ALTER TABLE "nfaes" DROP COLUMN "requerenteCpfCnpj",
DROP COLUMN "requerenteInscricao",
DROP COLUMN "requerenteTipo",
ADD COLUMN     "dataHoraRejeicao" TIMESTAMP(3),
ADD COLUMN     "destinatarioBairro" VARCHAR(60) NOT NULL,
ADD COLUMN     "destinatarioCep" CHAR(9) NOT NULL,
ADD COLUMN     "destinatarioComplemento" VARCHAR(60),
ADD COLUMN     "destinatarioDocumento" VARCHAR(14) NOT NULL,
ADD COLUMN     "destinatarioEmail" VARCHAR(60),
ADD COLUMN     "destinatarioIE" VARCHAR(14),
ADD COLUMN     "destinatarioLogradouro" VARCHAR(60) NOT NULL,
ADD COLUMN     "destinatarioMunicipio" VARCHAR(60) NOT NULL,
ADD COLUMN     "destinatarioMunicipioIbge" CHAR(7),
ADD COLUMN     "destinatarioNome" VARCHAR(60) NOT NULL,
ADD COLUMN     "destinatarioNumero" VARCHAR(10) NOT NULL,
ADD COLUMN     "destinatarioTelefone" VARCHAR(14),
ADD COLUMN     "destinatarioTipoPessoa" "TipoPessoaNFAe" NOT NULL DEFAULT 'PJ',
ADD COLUMN     "destinatarioUf" CHAR(2) NOT NULL,
ADD COLUMN     "enviadoEm" TIMESTAMP(3),
ADD COLUMN     "enviadoPor" TEXT,
ADD COLUMN     "informacoesComplementares" VARCHAR(2000),
ADD COLUMN     "ipEnvio" VARCHAR(45),
ADD COLUMN     "motivoRejeicao" VARCHAR(500),
ADD COLUMN     "requerenteComplemento" VARCHAR(60),
ADD COLUMN     "requerenteDocumento" VARCHAR(14) NOT NULL,
ADD COLUMN     "requerenteInscricaoProdutor" VARCHAR(20),
ADD COLUMN     "requerenteMunicipioIbge" CHAR(7),
ADD COLUMN     "requerenteTipoPessoa" "TipoPessoaNFAe" NOT NULL DEFAULT 'PF',
ADD COLUMN     "tipoEmissao" CHAR(1) NOT NULL DEFAULT '1',
ADD COLUMN     "xmlRetorno" TEXT,
ALTER COLUMN "modelo" SET DEFAULT '63',
ALTER COLUMN "modelo" SET DATA TYPE CHAR(2),
ALTER COLUMN "chaveAcesso" SET DATA TYPE CHAR(44),
ALTER COLUMN "naturezaOperacao" SET DATA TYPE VARCHAR(60),
DROP COLUMN "motivoEmissao",
ADD COLUMN     "motivoEmissao" "MotivoEmissaoNFAe" NOT NULL,
ALTER COLUMN "descricaoMotivo" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "requerenteNome" SET DATA TYPE VARCHAR(60),
ALTER COLUMN "requerenteLogradouro" SET DATA TYPE VARCHAR(60),
ALTER COLUMN "requerenteNumero" SET DATA TYPE VARCHAR(10),
ALTER COLUMN "requerenteBairro" SET DATA TYPE VARCHAR(60),
ALTER COLUMN "requerenteMunicipio" SET DATA TYPE VARCHAR(60),
ALTER COLUMN "requerenteTelefone" SET DATA TYPE VARCHAR(14),
ALTER COLUMN "requerenteEmail" SET DATA TYPE VARCHAR(60),
ALTER COLUMN "destinatarioId" DROP NOT NULL,
ALTER COLUMN "valorTotalProdutos" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "baseCalculoICMS" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "valorTotalICMS" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "valorTotalNota" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "guiaDAENumero" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "guiaDAECodigoBarras" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "guiaDAEChavePix" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "guiaDAEValor" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "guiaDAEStatus" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "orgaoEmissorSefaz" SET DATA TYPE VARCHAR(60),
ALTER COLUMN "motivoCancelamento" SET DATA TYPE VARCHAR(255),
DROP COLUMN "status",
ADD COLUMN     "status" "StatusNFAe" NOT NULL DEFAULT 'RASCUNHO';

-- AlterTable
ALTER TABLE "nfces" ADD COLUMN     "consumidorBairro" VARCHAR(60),
ADD COLUMN     "consumidorCep" CHAR(9),
ADD COLUMN     "consumidorCodigoMunicipio" CHAR(7),
ADD COLUMN     "consumidorCodigoPais" CHAR(4),
ADD COLUMN     "consumidorComplemento" VARCHAR(60),
ADD COLUMN     "consumidorLogradouro" VARCHAR(60),
ADD COLUMN     "consumidorNomeMunicipio" VARCHAR(60),
ADD COLUMN     "consumidorNomePais" VARCHAR(60),
ADD COLUMN     "consumidorNumero" VARCHAR(60),
ADD COLUMN     "consumidorTelefone" VARCHAR(14),
ADD COLUMN     "consumidorUf" CHAR(2),
ADD COLUMN     "dataHoraRejeicao" TIMESTAMP(3),
ADD COLUMN     "enviadoEm" TIMESTAMP(3),
ADD COLUMN     "enviadoPor" TEXT,
ADD COLUMN     "finNFe" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "idDest" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "indFinal" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "indPres" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "infAdFisco" VARCHAR(2000),
ADD COLUMN     "infCpl" VARCHAR(5000),
ADD COLUMN     "ipEnvio" VARCHAR(45),
ADD COLUMN     "motivoRejeicao" VARCHAR(500),
ADD COLUMN     "procEmi" CHAR(1) NOT NULL DEFAULT '0',
ADD COLUMN     "tpNF" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "verProc" VARCHAR(20) NOT NULL DEFAULT 'SUP-TECNOLOGIA-4.00',
ADD COLUMN     "xmlRetorno" TEXT,
ALTER COLUMN "naturezaOperacao" SET DATA TYPE VARCHAR(60),
ALTER COLUMN "tipoEmissao" SET DEFAULT '1',
ALTER COLUMN "tipoEmissao" SET DATA TYPE CHAR(1),
ALTER COLUMN "consumidorCpfCnpj" SET DATA TYPE VARCHAR(14),
ALTER COLUMN "consumidorNome" SET DATA TYPE VARCHAR(60),
ALTER COLUMN "consumidorEmail" SET DATA TYPE VARCHAR(60),
ALTER COLUMN "tokenCscId" SET DATA TYPE VARCHAR(6),
ALTER COLUMN "motivoCancelamento" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "nfes" DROP COLUMN "ambiente",
DROP COLUMN "baseCalculoICMS",
DROP COLUMN "baseCalculoICMSST",
DROP COLUMN "consumidorFinal",
DROP COLUMN "dataHoraEmissao",
DROP COLUMN "dataHoraSaida",
DROP COLUMN "finalidade",
DROP COLUMN "formaPagamento",
DROP COLUMN "informacoesAdicionais",
DROP COLUMN "naturezaOperacao",
DROP COLUMN "presencaComprador",
DROP COLUMN "tipoDocumento",
DROP COLUMN "tipoEmissao",
DROP COLUMN "valorTotalCBS",
DROP COLUMN "valorTotalCOFINS",
DROP COLUMN "valorTotalDesconto",
DROP COLUMN "valorTotalFrete",
DROP COLUMN "valorTotalIBS",
DROP COLUMN "valorTotalICMS",
DROP COLUMN "valorTotalICMSST",
DROP COLUMN "valorTotalIPI",
DROP COLUMN "valorTotalNota",
DROP COLUMN "valorTotalOutrasDesp",
DROP COLUMN "valorTotalPIS",
DROP COLUMN "valorTotalProdutos",
DROP COLUMN "valorTotalSeguro",
DROP COLUMN "valorTotalTributosAprox",
ADD COLUMN     "cDV" CHAR(1) NOT NULL,
ADD COLUMN     "cMunFG" CHAR(7) NOT NULL,
ADD COLUMN     "cNF" CHAR(8) NOT NULL,
ADD COLUMN     "cUF" CHAR(2) NOT NULL,
ADD COLUMN     "danfeImpresso" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dataHoraImpressao" TIMESTAMP(3),
ADD COLUMN     "dataHoraRejeicao" TIMESTAMP(3),
ADD COLUMN     "dhCont" TIMESTAMP(3),
ADD COLUMN     "dhEmi" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "dhSaiEnt" TIMESTAMP(3),
ADD COLUMN     "enviadoEm" TIMESTAMP(3),
ADD COLUMN     "enviadoPor" TEXT,
ADD COLUMN     "finNFe" CHAR(1) NOT NULL,
ADD COLUMN     "indFinal" CHAR(1) NOT NULL,
ADD COLUMN     "indPag" CHAR(1) NOT NULL,
ADD COLUMN     "indPres" CHAR(1) NOT NULL,
ADD COLUMN     "infAdFisco" VARCHAR(2000),
ADD COLUMN     "infCpl" VARCHAR(5000),
ADD COLUMN     "ipEnvio" VARCHAR(45),
ADD COLUMN     "loteId" TEXT,
ADD COLUMN     "mod" CHAR(2) NOT NULL DEFAULT '55',
ADD COLUMN     "motivoRejeicao" VARCHAR(500),
ADD COLUMN     "natOp" VARCHAR(60) NOT NULL,
ADD COLUMN     "procEmi" CHAR(1) NOT NULL,
ADD COLUMN     "qBCMono" DECIMAL(15,4),
ADD COLUMN     "qBCMonoRet" DECIMAL(15,4),
ADD COLUMN     "qBCMonoReten" DECIMAL(15,4),
ADD COLUMN     "reciboLote" VARCHAR(15),
ADD COLUMN     "tpAmb" CHAR(1) NOT NULL,
ADD COLUMN     "tpEmis" CHAR(1) NOT NULL,
ADD COLUMN     "tpNF" CHAR(1) NOT NULL,
ADD COLUMN     "usuarioImpressao" TEXT,
ADD COLUMN     "vBC" DECIMAL(15,4) NOT NULL,
ADD COLUMN     "vBCST" DECIMAL(15,4) NOT NULL DEFAULT 0,
ADD COLUMN     "vCBS" DECIMAL(15,4) NOT NULL DEFAULT 0,
ADD COLUMN     "vCOFINS" DECIMAL(15,4) NOT NULL DEFAULT 0,
ADD COLUMN     "vDesc" DECIMAL(15,4) NOT NULL DEFAULT 0,
ADD COLUMN     "vFCP" DECIMAL(15,4) NOT NULL DEFAULT 0,
ADD COLUMN     "vFCPST" DECIMAL(15,4) NOT NULL DEFAULT 0,
ADD COLUMN     "vFCPSTRet" DECIMAL(15,4) NOT NULL DEFAULT 0,
ADD COLUMN     "vFCPUFDest" DECIMAL(15,4) NOT NULL DEFAULT 0,
ADD COLUMN     "vFrete" DECIMAL(15,4) NOT NULL DEFAULT 0,
ADD COLUMN     "vIBS" DECIMAL(15,4) NOT NULL DEFAULT 0,
ADD COLUMN     "vICMS" DECIMAL(15,4) NOT NULL,
ADD COLUMN     "vICMSDeson" DECIMAL(15,4) NOT NULL DEFAULT 0,
ADD COLUMN     "vICMSMono" DECIMAL(15,4),
ADD COLUMN     "vICMSMonoRet" DECIMAL(15,4),
ADD COLUMN     "vICMSMonoReten" DECIMAL(15,4),
ADD COLUMN     "vICMSUFDest" DECIMAL(15,4) NOT NULL DEFAULT 0,
ADD COLUMN     "vICMSUFRemet" DECIMAL(15,4) NOT NULL DEFAULT 0,
ADD COLUMN     "vII" DECIMAL(15,4) NOT NULL DEFAULT 0,
ADD COLUMN     "vIPI" DECIMAL(15,4) NOT NULL DEFAULT 0,
ADD COLUMN     "vIPIDevol" DECIMAL(15,4) NOT NULL DEFAULT 0,
ADD COLUMN     "vNF" DECIMAL(15,4) NOT NULL,
ADD COLUMN     "vOutro" DECIMAL(15,4) NOT NULL DEFAULT 0,
ADD COLUMN     "vPIS" DECIMAL(15,4) NOT NULL DEFAULT 0,
ADD COLUMN     "vProd" DECIMAL(15,4) NOT NULL,
ADD COLUMN     "vST" DECIMAL(15,4) NOT NULL DEFAULT 0,
ADD COLUMN     "vSeg" DECIMAL(15,4) NOT NULL DEFAULT 0,
ADD COLUMN     "vTotTrib" DECIMAL(15,4) NOT NULL DEFAULT 0,
ADD COLUMN     "verProc" VARCHAR(20) NOT NULL,
ADD COLUMN     "versaoNFe" VARCHAR(5) NOT NULL DEFAULT '4.00',
ADD COLUMN     "xJust" VARCHAR(256),
ADD COLUMN     "xmlRetorno" TEXT,
ALTER COLUMN "idDest" DROP DEFAULT,
ALTER COLUMN "idDest" SET DATA TYPE CHAR(1),
ALTER COLUMN "tpImp" DROP DEFAULT,
ALTER COLUMN "tpImp" SET DATA TYPE CHAR(1);

-- AlterTable
ALTER TABLE "nfses" DROP COLUMN "urlVisualizacao",
DROP COLUMN "valorTotalCBS",
DROP COLUMN "valorTotalRetencoesFed",
ADD COLUMN     "codigoInterno" TEXT,
ADD COLUMN     "codigoNBS" VARCHAR(15) NOT NULL,
ADD COLUMN     "codigoTributacaoMunicipal" CHAR(4) NOT NULL,
ADD COLUMN     "codigoTributacaoNacional" CHAR(6) NOT NULL,
ADD COLUMN     "dataHoraAutorizacao" TIMESTAMP(3),
ADD COLUMN     "dataHoraRejeicao" TIMESTAMP(3),
ADD COLUMN     "deducoesMateriais" DECIMAL(15,4) NOT NULL DEFAULT 0,
ADD COLUMN     "descontoCondicionado" DECIMAL(15,4) NOT NULL DEFAULT 0,
ADD COLUMN     "descontoIncondicionado" DECIMAL(15,4) NOT NULL DEFAULT 0,
ADD COLUMN     "descricaoServico" VARCHAR(2000) NOT NULL,
ADD COLUMN     "enviadoEm" TIMESTAMP(3),
ADD COLUMN     "enviadoPor" TEXT,
ADD COLUMN     "indISS" CHAR(1) NOT NULL DEFAULT '1',
ADD COLUMN     "indIncentivo" CHAR(1) NOT NULL DEFAULT '2',
ADD COLUMN     "ipEnvio" VARCHAR(45),
ADD COLUMN     "localPrestacaoCodigoMunicipio" CHAR(7) NOT NULL,
ADD COLUMN     "localPrestacaoNomeMunicipio" TEXT NOT NULL,
ADD COLUMN     "localPrestacaoUf" CHAR(2) NOT NULL,
ADD COLUMN     "motivoRejeicao" VARCHAR(500),
ADD COLUMN     "pagamentoCnpjBasePSP" VARCHAR(8),
ADD COLUMN     "pagamentoCnpjRecebedor" CHAR(14),
ADD COLUMN     "pagamentoIdTransacao" VARCHAR(50),
ADD COLUMN     "pagamentoNumero" INTEGER,
ADD COLUMN     "pagamentoTipoMeio" VARCHAR(10),
ADD COLUMN     "prestadorBairro" TEXT NOT NULL,
ADD COLUMN     "prestadorCep" CHAR(9) NOT NULL,
ADD COLUMN     "prestadorCnpj" CHAR(14) NOT NULL,
ADD COLUMN     "prestadorCodigoMunicipio" CHAR(7) NOT NULL,
ADD COLUMN     "prestadorComplemento" TEXT,
ADD COLUMN     "prestadorEmail" TEXT,
ADD COLUMN     "prestadorInscricaoMunicipal" TEXT NOT NULL,
ADD COLUMN     "prestadorLogradouro" TEXT NOT NULL,
ADD COLUMN     "prestadorNomeFantasia" TEXT,
ADD COLUMN     "prestadorNomeMunicipio" TEXT NOT NULL,
ADD COLUMN     "prestadorNumero" TEXT NOT NULL,
ADD COLUMN     "prestadorOptanteSimples" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "prestadorRazaoSocial" TEXT NOT NULL,
ADD COLUMN     "prestadorRegimeEspecial" CHAR(1),
ADD COLUMN     "prestadorRegimeTributario" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "prestadorTelefone" TEXT,
ADD COLUMN     "prestadorUf" CHAR(2) NOT NULL,
ADD COLUMN     "protocoloAutorizacao" VARCHAR(15),
ADD COLUMN     "tomadorBairro" TEXT NOT NULL,
ADD COLUMN     "tomadorCep" CHAR(9) NOT NULL,
ADD COLUMN     "tomadorCodigoMunicipio" CHAR(7) NOT NULL,
ADD COLUMN     "tomadorCodigoPais" CHAR(4),
ADD COLUMN     "tomadorComplemento" TEXT,
ADD COLUMN     "tomadorDocumento" VARCHAR(14) NOT NULL,
ADD COLUMN     "tomadorEmail" TEXT,
ADD COLUMN     "tomadorIndicadorIE" CHAR(1) NOT NULL DEFAULT '9',
ADD COLUMN     "tomadorInscricaoEstadual" TEXT,
ADD COLUMN     "tomadorInscricaoMunicipal" TEXT,
ADD COLUMN     "tomadorLogradouro" TEXT NOT NULL,
ADD COLUMN     "tomadorNomeFantasia" TEXT,
ADD COLUMN     "tomadorNomeMunicipio" TEXT NOT NULL,
ADD COLUMN     "tomadorNomePais" TEXT,
ADD COLUMN     "tomadorNumero" TEXT NOT NULL,
ADD COLUMN     "tomadorRazaoSocial" TEXT NOT NULL,
ADD COLUMN     "tomadorTelefone" TEXT,
ADD COLUMN     "tomadorTipoPessoa" CHAR(2) NOT NULL,
ADD COLUMN     "tomadorUf" CHAR(2) NOT NULL,
ADD COLUMN     "urlVisualizacaoNacional" TEXT,
ADD COLUMN     "valorISSRetido" DECIMAL(15,4) NOT NULL DEFAULT 0,
ADD COLUMN     "valorServico" DECIMAL(15,4) NOT NULL,
ADD COLUMN     "valorTotalRetencoesFederais" DECIMAL(15,4) NOT NULL DEFAULT 0,
ADD COLUMN     "xmlCNC" TEXT,
ADD COLUMN     "xmlDPS" TEXT,
ADD COLUMN     "xmlRetorno" TEXT,
ALTER COLUMN "tipoEmissao" SET DEFAULT '1',
ALTER COLUMN "tipoEmissao" SET DATA TYPE CHAR(1),
ALTER COLUMN "informacoesComplementares" SET DATA TYPE VARCHAR(2000),
ALTER COLUMN "numeroPedido" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "motivoCancelamento" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "chaveNfseSubstituta" SET DATA TYPE CHAR(53),
ALTER COLUMN "tomadorId" DROP NOT NULL,
ALTER COLUMN "servicoId" DROP NOT NULL,
ALTER COLUMN "aliquotaPIS" SET NOT NULL,
ALTER COLUMN "aliquotaPIS" SET DEFAULT 0,
ALTER COLUMN "valorPIS" SET NOT NULL,
ALTER COLUMN "valorPIS" SET DEFAULT 0,
ALTER COLUMN "aliquotaCOFINS" SET NOT NULL,
ALTER COLUMN "aliquotaCOFINS" SET DEFAULT 0,
ALTER COLUMN "valorCOFINS" SET NOT NULL,
ALTER COLUMN "valorCOFINS" SET DEFAULT 0,
ALTER COLUMN "aliquotaIRRF" SET NOT NULL,
ALTER COLUMN "aliquotaIRRF" SET DEFAULT 0,
ALTER COLUMN "valorIRRF" SET NOT NULL,
ALTER COLUMN "valorIRRF" SET DEFAULT 0,
ALTER COLUMN "aliquotaCSLL" SET NOT NULL,
ALTER COLUMN "aliquotaCSLL" SET DEFAULT 0,
ALTER COLUMN "valorCSLL" SET NOT NULL,
ALTER COLUMN "valorCSLL" SET DEFAULT 0,
ALTER COLUMN "aliquotaINSS" SET NOT NULL,
ALTER COLUMN "aliquotaINSS" SET DEFAULT 0,
ALTER COLUMN "valorINSS" SET NOT NULL,
ALTER COLUMN "valorINSS" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "produtos" ADD COLUMN     "aliquotaICMSST" DECIMAL(5,2),
ADD COLUMN     "csosnICMS" CHAR(3),
ADD COLUMN     "cstCOFINS" CHAR(2) NOT NULL DEFAULT '01',
ADD COLUMN     "cstICMS" CHAR(2) NOT NULL DEFAULT '00',
ADD COLUMN     "cstIPI" CHAR(2),
ADD COLUMN     "cstPIS" CHAR(2) NOT NULL DEFAULT '01',
ADD COLUMN     "estoqueMaximo" DECIMAL(11,3),
ADD COLUMN     "modBC" CHAR(1) NOT NULL DEFAULT '3',
ADD COLUMN     "modBCST" CHAR(1) NOT NULL DEFAULT '4',
ADD COLUMN     "pMVAST" DECIMAL(5,2),
ADD COLUMN     "pRedBC" DECIMAL(5,2),
ADD COLUMN     "pRedBCST" DECIMAL(5,2),
ADD COLUMN     "uTrib" VARCHAR(6),
ALTER COLUMN "origem" SET DEFAULT '0',
ALTER COLUMN "origem" SET DATA TYPE CHAR(1);

-- AlterTable
ALTER TABLE "servicos" ADD COLUMN     "cListServ" CHAR(5);

-- Backfill: "cListServ" é o código do item da lista de serviços (LC 116),
-- formato "NN.NN". Deriva do "codigoTributacaoMunicipal" já existente
-- (mesmo código, sem o ponto) antes de travar como NOT NULL.
UPDATE "servicos" SET "cListServ" = LEFT("codigoTributacaoMunicipal", 2) || '.' || RIGHT("codigoTributacaoMunicipal", 2)
WHERE "cListServ" IS NULL AND "codigoTributacaoMunicipal" IS NOT NULL;

ALTER TABLE "servicos" ALTER COLUMN "cListServ" SET NOT NULL;

-- AlterTable
ALTER TABLE "transportadoras" DROP COLUMN "regimeTributario",
ADD COLUMN     "regimeTributario" CHAR(1) DEFAULT '1';

-- AlterTable
ALTER TABLE "transportes_nfe" ADD COLUMN     "balsa" VARCHAR(20),
ADD COLUMN     "cMunFGRet" CHAR(7),
ADD COLUMN     "cfopRet" CHAR(4),
ADD COLUMN     "pICMSRet" DECIMAL(5,2),
ADD COLUMN     "reboquePlaca" CHAR(7),
ADD COLUMN     "reboqueRNTC" TEXT,
ADD COLUMN     "reboqueUf" CHAR(2),
ADD COLUMN     "vBCRet" DECIMAL(15,4),
ADD COLUMN     "vICMSRet" DECIMAL(15,4),
ADD COLUMN     "vServ" DECIMAL(15,4),
ADD COLUMN     "vagao" VARCHAR(20),
ADD COLUMN     "volumesNumeracao" TEXT,
ALTER COLUMN "modalidadeFrete" SET DEFAULT '0',
ALTER COLUMN "modalidadeFrete" SET DATA TYPE CHAR(1),
ALTER COLUMN "volumesQuantidade" SET DATA TYPE INTEGER,
ALTER COLUMN "volumesPesoLiquido" SET DATA TYPE DECIMAL(12,3),
ALTER COLUMN "volumesPesoBruto" SET DATA TYPE DECIMAL(12,3);

-- DropTable
DROP TABLE "itens_nfae";

-- CreateTable
CREATE TABLE "logs_acao" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidadeId" TEXT NOT NULL,
    "dadosAntigos" TEXT,
    "dadosNovos" TEXT,
    "ipOrigem" VARCHAR(45),
    "dataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_acao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schema_version" (
    "id" TEXT NOT NULL,
    "versao" TEXT NOT NULL,
    "dataAtualizacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "descricao" TEXT NOT NULL,

    CONSTRAINT "schema_version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historico_status_nfse" (
    "id" TEXT NOT NULL,
    "nfseId" TEXT NOT NULL,
    "statusAnterior" "StatusDocumento" NOT NULL,
    "statusNovo" "StatusDocumento" NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario" TEXT NOT NULL,
    "motivo" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historico_status_nfse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historico_status_nfe" (
    "id" TEXT NOT NULL,
    "nfeId" TEXT NOT NULL,
    "statusAnterior" "StatusDocumento" NOT NULL,
    "statusNovo" "StatusDocumento" NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario" TEXT NOT NULL,
    "motivo" TEXT,

    CONSTRAINT "historico_status_nfe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nfes_referencias" (
    "id" TEXT NOT NULL,
    "nfeId" TEXT NOT NULL,
    "tipoRef" TEXT NOT NULL,
    "chaveNFe" CHAR(44),
    "cUF" CHAR(2),
    "AAMM" CHAR(4),
    "CNPJ" CHAR(14),
    "CPF" CHAR(11),
    "IE" TEXT,
    "mod" CHAR(2),
    "serie" INTEGER,
    "nNF" INTEGER,
    "nECF" VARCHAR(3),
    "nCOO" VARCHAR(6),
    "chaveNFF" CHAR(44),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nfes_referencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parametros_sistema" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT,
    "intervaloTransmissao" INTEGER NOT NULL DEFAULT 30,
    "intervaloConsulta" INTEGER NOT NULL DEFAULT 10,
    "registrosPorPagina" INTEGER NOT NULL DEFAULT 50,
    "avisoInutilizacaoMensal" BOOLEAN NOT NULL DEFAULT false,
    "proxyServidor" TEXT,
    "proxyPorta" INTEGER,
    "proxyUsuario" TEXT,
    "proxySenha" TEXT,
    "pastaBackup" TEXT,
    "maxBackups" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parametros_sistema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historico_backup" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario" TEXT NOT NULL,
    "arquivo" TEXT NOT NULL,
    "tamanho" INTEGER,
    "status" TEXT NOT NULL,
    "observacao" TEXT,
    "empresaId" TEXT,

    CONSTRAINT "historico_backup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_rastreabilidade" (
    "id" TEXT NOT NULL,
    "itemNFeId" TEXT NOT NULL,
    "nLote" VARCHAR(20) NOT NULL,
    "qLote" DECIMAL(11,3) NOT NULL,
    "dFab" TIMESTAMP(3) NOT NULL,
    "dVal" TIMESTAMP(3) NOT NULL,
    "cAgreg" VARCHAR(20),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "itens_rastreabilidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "declaracoes_importacao" (
    "id" TEXT NOT NULL,
    "itemNFeId" TEXT NOT NULL,
    "nDI" VARCHAR(15) NOT NULL,
    "dDI" TIMESTAMP(3) NOT NULL,
    "xLocDesemb" VARCHAR(60) NOT NULL,
    "UFDesemb" CHAR(2) NOT NULL,
    "dDesemb" TIMESTAMP(3) NOT NULL,
    "tpViaTransp" CHAR(1) NOT NULL DEFAULT '1',
    "vAFRMM" DECIMAL(15,4),
    "tpIntermedio" CHAR(1) NOT NULL DEFAULT '1',
    "CNPJ" CHAR(14),
    "CPF" CHAR(11),
    "UFTerceiro" CHAR(2),
    "cExportador" VARCHAR(60) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "declaracoes_importacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adicoes_importacao" (
    "id" TEXT NOT NULL,
    "diId" TEXT NOT NULL,
    "nAdicao" TEXT NOT NULL,
    "nSeqAdic" TEXT NOT NULL,
    "cFabricante" VARCHAR(60) NOT NULL,
    "vDescDI" DECIMAL(15,4),
    "nDraw" VARCHAR(20),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "adicoes_importacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detalhes_exportacao" (
    "id" TEXT NOT NULL,
    "itemNFeId" TEXT NOT NULL,
    "nDraw" VARCHAR(20),
    "nRE" VARCHAR(12),
    "chNFe" CHAR(44),
    "qExport" DECIMAL(15,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "detalhes_exportacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "veiculos_produto" (
    "id" TEXT NOT NULL,
    "itemNFeId" TEXT NOT NULL,
    "tpOp" TEXT NOT NULL,
    "chassi" VARCHAR(17) NOT NULL,
    "cCor" VARCHAR(4) NOT NULL,
    "xCor" VARCHAR(40) NOT NULL,
    "pot" VARCHAR(4) NOT NULL,
    "cilin" VARCHAR(4) NOT NULL,
    "pesoL" VARCHAR(9) NOT NULL,
    "pesoB" VARCHAR(9) NOT NULL,
    "nSerie" VARCHAR(9) NOT NULL,
    "tpComb" VARCHAR(2) NOT NULL,
    "nMotor" VARCHAR(21) NOT NULL,
    "CMT" VARCHAR(9) NOT NULL,
    "dist" VARCHAR(4) NOT NULL,
    "anoMod" CHAR(4) NOT NULL,
    "anoFab" CHAR(4) NOT NULL,
    "tpPint" CHAR(1) NOT NULL,
    "tpVeic" VARCHAR(2) NOT NULL,
    "espVeic" CHAR(1) NOT NULL,
    "VIN" CHAR(1) NOT NULL,
    "condVeic" CHAR(1) NOT NULL,
    "cMod" VARCHAR(6) NOT NULL,
    "cCorDENATRAN" VARCHAR(2) NOT NULL,
    "lota" VARCHAR(3) NOT NULL,
    "tpRest" CHAR(1) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "veiculos_produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medicamentos" (
    "id" TEXT NOT NULL,
    "itemNFeId" TEXT NOT NULL,
    "cProdANVISA" TEXT NOT NULL,
    "xMotivoIsencao" VARCHAR(255),
    "vPMC" DECIMAL(15,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medicamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "armas" (
    "id" TEXT NOT NULL,
    "itemNFeId" TEXT NOT NULL,
    "tpArma" CHAR(1) NOT NULL DEFAULT '0',
    "nSerie" VARCHAR(15) NOT NULL,
    "nCano" VARCHAR(15) NOT NULL,
    "descr" VARCHAR(256) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "armas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "combustiveis" (
    "id" TEXT NOT NULL,
    "itemNFeId" TEXT NOT NULL,
    "cProdANP" CHAR(9) NOT NULL,
    "descANP" VARCHAR(95) NOT NULL,
    "pGLP" DECIMAL(5,2),
    "pGNn" DECIMAL(5,2),
    "pGNi" DECIMAL(5,2),
    "vPart" DECIMAL(15,4),
    "CODIF" VARCHAR(21),
    "qTemp" DECIMAL(12,4),
    "UFCons" CHAR(2) NOT NULL,
    "pBio" DECIMAL(5,2),
    "qBCProdCIDE" DECIMAL(15,4) NOT NULL,
    "vAliqProdCIDE" DECIMAL(15,4) NOT NULL,
    "vCIDE" DECIMAL(15,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "combustiveis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "encerrantes" (
    "id" TEXT NOT NULL,
    "combustivelId" TEXT NOT NULL,
    "nBico" VARCHAR(3) NOT NULL,
    "nBomba" VARCHAR(3),
    "nTanque" VARCHAR(3) NOT NULL,
    "vEncIni" DECIMAL(12,3) NOT NULL,
    "vEncFin" DECIMAL(12,3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "encerrantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "origens_combustivel" (
    "id" TEXT NOT NULL,
    "combustivelId" TEXT NOT NULL,
    "indImport" CHAR(1) NOT NULL DEFAULT '0',
    "cUFOrig" CHAR(2) NOT NULL,
    "pOrig" DECIMAL(5,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "origens_combustivel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lacres" (
    "id" TEXT NOT NULL,
    "transporteNFeId" TEXT NOT NULL,
    "nLacre" VARCHAR(60) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lacres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagamentos_nfe" (
    "id" TEXT NOT NULL,
    "nfeId" TEXT NOT NULL,
    "indPag" CHAR(1) NOT NULL DEFAULT '0',
    "tPag" CHAR(2) NOT NULL,
    "xPag" VARCHAR(60),
    "vPag" DECIMAL(15,4) NOT NULL,
    "dPag" TIMESTAMP(3),
    "CNPJPag" CHAR(14),
    "UFPag" CHAR(2),
    "tpIntegra" CHAR(1) DEFAULT '1',
    "CNPJInstPag" CHAR(14),
    "tBand" CHAR(2),
    "cAut" VARCHAR(128),
    "CNPJReceb" CHAR(14),
    "idTermPag" VARCHAR(40),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pagamentos_nfe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "intermediadores" (
    "id" TEXT NOT NULL,
    "nfeId" TEXT NOT NULL,
    "CNPJ" CHAR(14) NOT NULL,
    "idCadIntTran" VARCHAR(60) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "intermediadores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inutilizacoes_nfe" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "serie" INTEGER NOT NULL,
    "numeroInicial" INTEGER NOT NULL,
    "numeroFinal" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "cUF" CHAR(2) NOT NULL,
    "cnpj" CHAR(14) NOT NULL,
    "justificativa" VARCHAR(255) NOT NULL,
    "protocolo" VARCHAR(15),
    "status" TEXT NOT NULL DEFAULT 'PROCESSANDO',
    "xmlEnvio" TEXT NOT NULL,
    "xmlRetorno" TEXT,
    "dataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataHoraAutorizacao" TIMESTAMP(3),
    "motivoRejeicao" VARCHAR(500),
    "eventoId" TEXT,
    "nfeId" TEXT,
    "nfesExcluidas" INTEGER,
    "nfesExcluidasIds" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inutilizacoes_nfe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lotes_nfe" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "numeroLote" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "ambiente" "TipoAmbiente" NOT NULL DEFAULT 'PRODUCAO',
    "versao" VARCHAR(5) NOT NULL DEFAULT '4.00',
    "situacao" TEXT NOT NULL DEFAULT 'PROCESSANDO',
    "protocolo" VARCHAR(15),
    "xmlEnvio" TEXT NOT NULL,
    "xmlRetorno" TEXT,
    "dataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataHoraAutorizacao" TIMESTAMP(3),
    "reciboLote" VARCHAR(15),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lotes_nfe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "envios_nfe" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "nfeId" TEXT NOT NULL,
    "loteId" TEXT,
    "tipo" TEXT NOT NULL DEFAULT 'NORMAL',
    "dataHoraEnvio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "situacao" TEXT NOT NULL,
    "xmlEnvio" TEXT NOT NULL,
    "xmlRetorno" TEXT,
    "protocolo" VARCHAR(15),
    "motivo" VARCHAR(500),
    "usuario" TEXT,
    "ipOrigem" VARCHAR(45),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "envios_nfe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "danfes" (
    "id" TEXT NOT NULL,
    "nfeId" TEXT NOT NULL,
    "formato" TEXT NOT NULL DEFAULT 'RETRATO',
    "tipo" TEXT NOT NULL DEFAULT 'NORMAL',
    "impressoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario" TEXT,
    "quantidadeCopias" INTEGER NOT NULL DEFAULT 1,
    "comFormularioPreImpresso" BOOLEAN NOT NULL DEFAULT false,
    "pdfGerado" BOOLEAN NOT NULL DEFAULT true,
    "caminhoPdf" TEXT,
    "hash" TEXT,
    "motivoReimpressao" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "danfes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agendamentos_busca" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "tipoBusca" TEXT NOT NULL DEFAULT 'AUTOMATICA',
    "usuarioSolicitante" TEXT,
    "dataHoraAgendada" TIMESTAMP(3) NOT NULL,
    "dataHoraExecucao" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "nfesProcessando" INTEGER NOT NULL DEFAULT 0,
    "tentativas" INTEGER NOT NULL DEFAULT 0,
    "maxTentativas" INTEGER NOT NULL DEFAULT 10,
    "resultado" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agendamentos_busca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracoes_ambiente" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "ambiente" "TipoAmbiente" NOT NULL DEFAULT 'PRODUCAO',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "urlNFeEnvio" TEXT NOT NULL,
    "urlNFeConsulta" TEXT NOT NULL,
    "urlNFeCancelamento" TEXT NOT NULL,
    "urlNFeInutilizacao" TEXT NOT NULL,
    "urlNFeEvento" TEXT NOT NULL,
    "urlNFCeEnvio" TEXT NOT NULL,
    "urlNFCeQrCode" TEXT NOT NULL,
    "urlCTeEnvio" TEXT NOT NULL,
    "timeoutConexao" INTEGER NOT NULL DEFAULT 30,
    "tempoEntreTentativas" INTEGER NOT NULL DEFAULT 10,
    "maxTentativas" INTEGER NOT NULL DEFAULT 3,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracoes_ambiente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exportacoes" (
    "id" TEXT NOT NULL,
    "nfeId" TEXT NOT NULL,
    "UFSaidaPais" CHAR(2) NOT NULL,
    "xLocExporta" VARCHAR(60) NOT NULL,
    "xLocDespacho" VARCHAR(60),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exportacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compras" (
    "id" TEXT NOT NULL,
    "nfeId" TEXT NOT NULL,
    "xNEmp" VARCHAR(22),
    "xPed" VARCHAR(60),
    "xCont" VARCHAR(60),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cana" (
    "id" TEXT NOT NULL,
    "nfeId" TEXT NOT NULL,
    "safra" VARCHAR(9) NOT NULL,
    "ref" CHAR(7) NOT NULL,
    "qTotMes" DECIMAL(15,4) NOT NULL,
    "qTotAnt" DECIMAL(15,4) NOT NULL,
    "qTotGer" DECIMAL(15,4) NOT NULL,
    "vFor" DECIMAL(15,4) NOT NULL,
    "vTotDed" DECIMAL(15,4) NOT NULL,
    "vLiqFor" DECIMAL(15,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cana_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fornecimentos_dia" (
    "id" TEXT NOT NULL,
    "canaId" TEXT NOT NULL,
    "dia" CHAR(2) NOT NULL,
    "qtde" DECIMAL(15,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fornecimentos_dia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deducoes_cana" (
    "id" TEXT NOT NULL,
    "canaId" TEXT NOT NULL,
    "xDed" VARCHAR(60) NOT NULL,
    "vDed" DECIMAL(15,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deducoes_cana_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "responsaveis_tecnicos" (
    "id" TEXT NOT NULL,
    "nfeId" TEXT NOT NULL,
    "CNPJ" CHAR(14) NOT NULL,
    "xContato" VARCHAR(60) NOT NULL,
    "email" VARCHAR(60) NOT NULL,
    "fone" VARCHAR(14) NOT NULL,
    "idCSRT" CHAR(2),
    "hashCSRT" VARCHAR(28),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "responsaveis_tecnicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "processos_referenciados" (
    "id" TEXT NOT NULL,
    "nfeId" TEXT NOT NULL,
    "nProc" VARCHAR(60) NOT NULL,
    "indProc" CHAR(1) NOT NULL DEFAULT '0',
    "tpAto" CHAR(1),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "processos_referenciados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagamentos_nfce" (
    "id" TEXT NOT NULL,
    "nfceId" TEXT NOT NULL,
    "indPag" CHAR(1) NOT NULL DEFAULT '0',
    "tPag" CHAR(2) NOT NULL,
    "xPag" VARCHAR(60),
    "vPag" DECIMAL(15,4) NOT NULL,
    "dPag" TIMESTAMP(3),
    "tpIntegra" CHAR(1) DEFAULT '1',
    "CNPJPag" CHAR(14),
    "UFPag" CHAR(2),
    "CNPJInstPag" CHAR(14),
    "tBand" CHAR(2),
    "cAut" VARCHAR(128),
    "CNPJReceb" CHAR(14),
    "idTermPag" VARCHAR(40),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pagamentos_nfce_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historico_status_nfce" (
    "id" TEXT NOT NULL,
    "nfceId" TEXT NOT NULL,
    "statusAnterior" "StatusDocumento" NOT NULL,
    "statusNovo" "StatusDocumento" NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario" TEXT NOT NULL,
    "motivo" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historico_status_nfce_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cte_componentes" (
    "id" TEXT NOT NULL,
    "cteId" TEXT NOT NULL,
    "xNome" VARCHAR(15) NOT NULL,
    "vComp" DECIMAL(15,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cte_componentes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cte_quantidades" (
    "id" TEXT NOT NULL,
    "cteId" TEXT NOT NULL,
    "cUnid" CHAR(2) NOT NULL,
    "tpMed" VARCHAR(20) NOT NULL,
    "qCarga" DECIMAL(11,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cte_quantidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cte_documentos" (
    "id" TEXT NOT NULL,
    "cteId" TEXT NOT NULL,
    "tipo" VARCHAR(10) NOT NULL,
    "chave" CHAR(44),
    "serie" VARCHAR(3),
    "nDoc" VARCHAR(20),
    "dEmi" TIMESTAMP(3),
    "dPrev" TIMESTAMP(3),
    "nRoma" VARCHAR(20),
    "nPed" VARCHAR(20),
    "mod" CHAR(2),
    "vBC" DECIMAL(15,2),
    "vICMS" DECIMAL(15,2),
    "vBCST" DECIMAL(15,2),
    "vST" DECIMAL(15,2),
    "vProd" DECIMAL(15,2),
    "vNF" DECIMAL(15,2),
    "nCFOP" CHAR(3),
    "nPeso" DECIMAL(12,3),
    "PIN" VARCHAR(9),
    "tpDoc" CHAR(2),
    "descOutros" VARCHAR(100),
    "vDocFisc" DECIMAL(15,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cte_documentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cte_unidades_carga" (
    "id" TEXT NOT NULL,
    "documentoId" TEXT NOT NULL,
    "tpUnidCarga" CHAR(1) NOT NULL,
    "idUnidCarga" VARCHAR(20) NOT NULL,
    "qtdRat" DECIMAL(3,3),
    "unidadeTransporteId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cte_unidades_carga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cte_unidade_carga_lacres" (
    "id" TEXT NOT NULL,
    "unidadeCargaId" TEXT NOT NULL,
    "nLacre" VARCHAR(20) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cte_unidade_carga_lacres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cte_unidades_transporte" (
    "id" TEXT NOT NULL,
    "documentoId" TEXT NOT NULL,
    "tpUnidTransp" CHAR(1) NOT NULL,
    "idUnidTransp" VARCHAR(20) NOT NULL,
    "qtdRat" DECIMAL(3,3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cte_unidades_transporte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cte_unidade_transporte_lacres" (
    "id" TEXT NOT NULL,
    "unidadeTransporteId" TEXT NOT NULL,
    "nLacre" VARCHAR(20) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cte_unidade_transporte_lacres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cte_duplicatas" (
    "id" TEXT NOT NULL,
    "cteId" TEXT NOT NULL,
    "nDup" VARCHAR(60) NOT NULL,
    "dVenc" TIMESTAMP(3) NOT NULL,
    "vDup" DECIMAL(15,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cte_duplicatas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cte_obs_cont" (
    "id" TEXT NOT NULL,
    "cteId" TEXT NOT NULL,
    "xCampo" VARCHAR(20) NOT NULL,
    "xTexto" VARCHAR(160) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cte_obs_cont_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cte_obs_fisco" (
    "id" TEXT NOT NULL,
    "cteId" TEXT NOT NULL,
    "xCampo" VARCHAR(20) NOT NULL,
    "xTexto" VARCHAR(60) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cte_obs_fisco_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cte_aut_xml" (
    "id" TEXT NOT NULL,
    "cteId" TEXT NOT NULL,
    "CNPJ" CHAR(14),
    "CPF" CHAR(11),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cte_aut_xml_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cte_historico_status" (
    "id" TEXT NOT NULL,
    "cteId" TEXT NOT NULL,
    "statusAnterior" "StatusCTe" NOT NULL,
    "statusNovo" "StatusCTe" NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario" TEXT NOT NULL,
    "motivo" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cte_historico_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cte_complementos" (
    "id" TEXT NOT NULL,
    "cteId" TEXT NOT NULL,
    "chCTe" CHAR(44) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cte_complementos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cte_substitutos" (
    "id" TEXT NOT NULL,
    "cteId" TEXT NOT NULL,
    "chCTe" CHAR(44) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cte_substitutos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cte_globalizados" (
    "id" TEXT NOT NULL,
    "cteId" TEXT NOT NULL,
    "chCTe" CHAR(44) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cte_globalizados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cte_servicos_vinculados" (
    "id" TEXT NOT NULL,
    "cteId" TEXT NOT NULL,
    "chCTeMultimodal" CHAR(44) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cte_servicos_vinculados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cte_responsaveis_tecnicos" (
    "id" TEXT NOT NULL,
    "cteId" TEXT NOT NULL,
    "CNPJ" CHAR(14) NOT NULL,
    "xContato" VARCHAR(60) NOT NULL,
    "email" VARCHAR(60) NOT NULL,
    "fone" VARCHAR(14) NOT NULL,
    "idCSRT" CHAR(3),
    "hashCSRT" VARCHAR(28),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cte_responsaveis_tecnicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cte_pagamentos_vinculados" (
    "id" TEXT NOT NULL,
    "cteId" TEXT NOT NULL,
    "nPag" VARCHAR(3) NOT NULL,
    "idTransacao" VARCHAR(35) NOT NULL,
    "tpMeioPgto" CHAR(2) NOT NULL,
    "CNPJReceb" CHAR(14) NOT NULL,
    "CNPJBasePSP" CHAR(8) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cte_pagamentos_vinculados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nfaes_itens" (
    "id" TEXT NOT NULL,
    "nfaeId" TEXT NOT NULL,
    "codigo" VARCHAR(20) NOT NULL,
    "descricao" VARCHAR(120) NOT NULL,
    "ncm" CHAR(8) NOT NULL,
    "unidade" VARCHAR(6) NOT NULL,
    "quantidade" DECIMAL(15,4) NOT NULL,
    "valorUnitario" DECIMAL(15,4) NOT NULL,
    "valorTotal" DECIMAL(15,2) NOT NULL,
    "aliquotaICMS" DECIMAL(5,2) NOT NULL,
    "valorICMS" DECIMAL(15,2) NOT NULL,
    "codigoBarrasEAN" VARCHAR(14),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nfaes_itens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nfaes_historico_status" (
    "id" TEXT NOT NULL,
    "nfaeId" TEXT NOT NULL,
    "statusAnterior" "StatusNFAe" NOT NULL,
    "statusNovo" "StatusNFAe" NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario" TEXT NOT NULL,
    "motivo" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nfaes_historico_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mdfes" (
    "id" TEXT NOT NULL,
    "chaveAcesso" CHAR(44) NOT NULL,
    "modelo" CHAR(2) NOT NULL DEFAULT '58',
    "serie" INTEGER NOT NULL,
    "numero" INTEGER NOT NULL,
    "cUF" CHAR(2) NOT NULL,
    "cMDF" CHAR(8) NOT NULL,
    "cDV" CHAR(1) NOT NULL,
    "modal" "ModalMDFe" NOT NULL,
    "tpAmb" CHAR(1) NOT NULL DEFAULT '1',
    "tpEmit" "TipoEmitenteMDFe" NOT NULL,
    "tpTransp" "TipoTransportadorMDFe",
    "tpEmis" CHAR(1) NOT NULL DEFAULT '1',
    "procEmi" CHAR(1) NOT NULL DEFAULT '0',
    "verProc" VARCHAR(20) NOT NULL,
    "dhEmi" TIMESTAMP(3) NOT NULL,
    "dhIniViagem" TIMESTAMP(3),
    "UFIni" CHAR(2) NOT NULL,
    "UFFim" CHAR(2) NOT NULL,
    "indCanalVerde" BOOLEAN DEFAULT false,
    "indCarregaPosterior" BOOLEAN DEFAULT false,
    "status" "StatusMDFe" NOT NULL DEFAULT 'RASCUNHO',
    "versaoMDFe" VARCHAR(5) NOT NULL DEFAULT '3.00',
    "qCTe" INTEGER DEFAULT 0,
    "qNFe" INTEGER DEFAULT 0,
    "qMDFe" INTEGER DEFAULT 0,
    "vCarga" DECIMAL(15,4) NOT NULL,
    "cUnid" CHAR(2) NOT NULL,
    "qCarga" DECIMAL(15,4) NOT NULL,
    "tpCarga" "TipoCargaMDFe" NOT NULL,
    "xProd" VARCHAR(120) NOT NULL,
    "cEAN" VARCHAR(14),
    "NCM" CHAR(8),
    "infAdFisco" VARCHAR(2000),
    "infCpl" VARCHAR(5000),
    "protocoloAutorizacao" CHAR(17),
    "dataHoraAutorizacao" TIMESTAMP(3),
    "motivoCancelamento" TEXT,
    "dataHoraCancelamento" TIMESTAMP(3),
    "motivoRejeicao" VARCHAR(500),
    "dataHoraRejeicao" TIMESTAMP(3),
    "motivoEncerramento" VARCHAR(255),
    "dataHoraEncerramento" TIMESTAMP(3),
    "xmlAssinado" TEXT NOT NULL,
    "xmlRetorno" TEXT,
    "xmlModal" TEXT,
    "enviadoEm" TIMESTAMP(3),
    "enviadoPor" TEXT,
    "ipEnvio" VARCHAR(45),
    "empresaId" TEXT NOT NULL,
    "emitenteId" TEXT,
    "loteId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mdfes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mdfe_municipios_carrega" (
    "id" TEXT NOT NULL,
    "mdfeId" TEXT NOT NULL,
    "cMunCarrega" CHAR(7) NOT NULL,
    "xMunCarrega" VARCHAR(60) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mdfe_municipios_carrega_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mdfe_percursos" (
    "id" TEXT NOT NULL,
    "mdfeId" TEXT NOT NULL,
    "UFPer" CHAR(2) NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mdfe_percursos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mdfe_municipios_descarga" (
    "id" TEXT NOT NULL,
    "mdfeId" TEXT NOT NULL,
    "cMunDescarga" CHAR(7) NOT NULL,
    "xMunDescarga" VARCHAR(60) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mdfe_municipios_descarga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mdfe_ctes" (
    "id" TEXT NOT NULL,
    "munDescargaId" TEXT NOT NULL,
    "chCTe" CHAR(44) NOT NULL,
    "SegCodBarra" VARCHAR(60),
    "indReentrega" BOOLEAN DEFAULT false,
    "qtdTotal" DECIMAL(15,4),
    "qtdParcial" DECIMAL(15,4),
    "indPrestacaoParcial" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mdfe_ctes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mdfe_nfes" (
    "id" TEXT NOT NULL,
    "munDescargaId" TEXT NOT NULL,
    "chNFe" CHAR(44) NOT NULL,
    "SegCodBarra" VARCHAR(60),
    "indReentrega" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mdfe_nfes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mdfe_mdfes_transp" (
    "id" TEXT NOT NULL,
    "munDescargaId" TEXT NOT NULL,
    "chMDFe" CHAR(44) NOT NULL,
    "indReentrega" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mdfe_mdfes_transp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mdfe_unidades_transporte" (
    "id" TEXT NOT NULL,
    "tpUnidTransp" CHAR(1) NOT NULL,
    "idUnidTransp" VARCHAR(20) NOT NULL,
    "cteId" TEXT,
    "nfeId" TEXT,
    "mdfeTranspId" TEXT,
    "qtdRat" DECIMAL(15,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mdfe_unidades_transporte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mdfe_lacres_unidade" (
    "id" TEXT NOT NULL,
    "unidadeTranspId" TEXT NOT NULL,
    "nLacre" VARCHAR(20) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mdfe_lacres_unidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mdfe_unidades_carga" (
    "id" TEXT NOT NULL,
    "unidadeTranspId" TEXT NOT NULL,
    "tpUnidCarga" CHAR(1) NOT NULL,
    "idUnidCarga" VARCHAR(20) NOT NULL,
    "qtdRat" DECIMAL(15,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mdfe_unidades_carga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mdfe_lacres_unidade_carga" (
    "id" TEXT NOT NULL,
    "unidadeCargaId" TEXT NOT NULL,
    "nLacre" VARCHAR(20) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mdfe_lacres_unidade_carga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mdfe_perigosos" (
    "id" TEXT NOT NULL,
    "nONU" VARCHAR(4) NOT NULL,
    "xNomeAE" VARCHAR(150),
    "xClaRisco" VARCHAR(40),
    "grEmb" VARCHAR(6),
    "qTotProd" VARCHAR(20) NOT NULL,
    "qVolTipo" VARCHAR(60),
    "cteId" TEXT,
    "nfeId" TEXT,
    "mdfeTranspId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mdfe_perigosos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mdfe_nfes_prest_parcial" (
    "id" TEXT NOT NULL,
    "cteId" TEXT NOT NULL,
    "chNFe" CHAR(44) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mdfe_nfes_prest_parcial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mdfe_seguros" (
    "id" TEXT NOT NULL,
    "mdfeId" TEXT NOT NULL,
    "respSeg" CHAR(1) NOT NULL,
    "respCNPJ" CHAR(14),
    "respCPF" CHAR(11),
    "xSeg" VARCHAR(30),
    "CNPJSeg" CHAR(14),
    "nApol" VARCHAR(20),
    "nAver" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mdfe_seguros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mdfe_lacres" (
    "id" TEXT NOT NULL,
    "mdfeId" TEXT NOT NULL,
    "nLacre" VARCHAR(60) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mdfe_lacres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mdfe_aut_xml" (
    "id" TEXT NOT NULL,
    "mdfeId" TEXT NOT NULL,
    "CNPJ" CHAR(14),
    "CPF" CHAR(11),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mdfe_aut_xml_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mdfe_encerramentos" (
    "id" TEXT NOT NULL,
    "mdfeId" TEXT NOT NULL,
    "nProt" CHAR(17) NOT NULL,
    "dhEnc" TIMESTAMP(3) NOT NULL,
    "xMunEnc" VARCHAR(60) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mdfe_encerramentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mdfe_historico_status" (
    "id" TEXT NOT NULL,
    "mdfeId" TEXT NOT NULL,
    "statusAnterior" "StatusMDFe" NOT NULL,
    "statusNovo" "StatusMDFe" NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario" TEXT NOT NULL,
    "motivo" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mdfe_historico_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lotes_mdfe" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "numeroLote" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "ambiente" CHAR(1) NOT NULL DEFAULT '1',
    "versao" VARCHAR(5) NOT NULL DEFAULT '3.00',
    "situacao" TEXT NOT NULL DEFAULT 'PROCESSANDO',
    "protocolo" VARCHAR(15),
    "xmlEnvio" TEXT NOT NULL,
    "xmlRetorno" TEXT,
    "dataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataHoraAutorizacao" TIMESTAMP(3),
    "reciboLote" VARCHAR(15),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lotes_mdfe_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "logs_acao_empresaId_idx" ON "logs_acao"("empresaId");

-- CreateIndex
CREATE INDEX "logs_acao_entidade_entidadeId_idx" ON "logs_acao"("entidade", "entidadeId");

-- CreateIndex
CREATE INDEX "historico_status_nfse_nfseId_idx" ON "historico_status_nfse"("nfseId");

-- CreateIndex
CREATE INDEX "historico_status_nfe_nfeId_idx" ON "historico_status_nfe"("nfeId");

-- CreateIndex
CREATE UNIQUE INDEX "parametros_sistema_empresaId_key" ON "parametros_sistema"("empresaId");

-- CreateIndex
CREATE INDEX "historico_backup_empresaId_idx" ON "historico_backup"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "declaracoes_importacao_itemNFeId_key" ON "declaracoes_importacao"("itemNFeId");

-- CreateIndex
CREATE UNIQUE INDEX "detalhes_exportacao_itemNFeId_key" ON "detalhes_exportacao"("itemNFeId");

-- CreateIndex
CREATE UNIQUE INDEX "veiculos_produto_itemNFeId_key" ON "veiculos_produto"("itemNFeId");

-- CreateIndex
CREATE UNIQUE INDEX "medicamentos_itemNFeId_key" ON "medicamentos"("itemNFeId");

-- CreateIndex
CREATE UNIQUE INDEX "combustiveis_itemNFeId_key" ON "combustiveis"("itemNFeId");

-- CreateIndex
CREATE UNIQUE INDEX "encerrantes_combustivelId_key" ON "encerrantes"("combustivelId");

-- CreateIndex
CREATE UNIQUE INDEX "intermediadores_nfeId_key" ON "intermediadores"("nfeId");

-- CreateIndex
CREATE UNIQUE INDEX "inutilizacoes_nfe_eventoId_key" ON "inutilizacoes_nfe"("eventoId");

-- CreateIndex
CREATE UNIQUE INDEX "inutilizacoes_nfe_nfeId_key" ON "inutilizacoes_nfe"("nfeId");

-- CreateIndex
CREATE INDEX "inutilizacoes_nfe_empresaId_idx" ON "inutilizacoes_nfe"("empresaId");

-- CreateIndex
CREATE INDEX "inutilizacoes_nfe_status_idx" ON "inutilizacoes_nfe"("status");

-- CreateIndex
CREATE UNIQUE INDEX "inutilizacoes_nfe_empresaId_serie_numeroInicial_numeroFinal_key" ON "inutilizacoes_nfe"("empresaId", "serie", "numeroInicial", "numeroFinal", "ano");

-- CreateIndex
CREATE INDEX "lotes_nfe_empresaId_idx" ON "lotes_nfe"("empresaId");

-- CreateIndex
CREATE INDEX "lotes_nfe_situacao_idx" ON "lotes_nfe"("situacao");

-- CreateIndex
CREATE INDEX "envios_nfe_empresaId_idx" ON "envios_nfe"("empresaId");

-- CreateIndex
CREATE INDEX "envios_nfe_nfeId_idx" ON "envios_nfe"("nfeId");

-- CreateIndex
CREATE INDEX "envios_nfe_loteId_idx" ON "envios_nfe"("loteId");

-- CreateIndex
CREATE INDEX "danfes_nfeId_idx" ON "danfes"("nfeId");

-- CreateIndex
CREATE INDEX "agendamentos_busca_empresaId_idx" ON "agendamentos_busca"("empresaId");

-- CreateIndex
CREATE INDEX "agendamentos_busca_status_idx" ON "agendamentos_busca"("status");

-- CreateIndex
CREATE UNIQUE INDEX "configuracoes_ambiente_empresaId_key" ON "configuracoes_ambiente"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "exportacoes_nfeId_key" ON "exportacoes"("nfeId");

-- CreateIndex
CREATE UNIQUE INDEX "compras_nfeId_key" ON "compras"("nfeId");

-- CreateIndex
CREATE UNIQUE INDEX "cana_nfeId_key" ON "cana"("nfeId");

-- CreateIndex
CREATE UNIQUE INDEX "fornecimentos_dia_canaId_dia_key" ON "fornecimentos_dia"("canaId", "dia");

-- CreateIndex
CREATE UNIQUE INDEX "responsaveis_tecnicos_nfeId_key" ON "responsaveis_tecnicos"("nfeId");

-- CreateIndex
CREATE INDEX "pagamentos_nfce_nfceId_idx" ON "pagamentos_nfce"("nfceId");

-- CreateIndex
CREATE INDEX "historico_status_nfce_nfceId_idx" ON "historico_status_nfce"("nfceId");

-- CreateIndex
CREATE INDEX "cte_componentes_cteId_idx" ON "cte_componentes"("cteId");

-- CreateIndex
CREATE INDEX "cte_quantidades_cteId_idx" ON "cte_quantidades"("cteId");

-- CreateIndex
CREATE INDEX "cte_documentos_cteId_idx" ON "cte_documentos"("cteId");

-- CreateIndex
CREATE INDEX "cte_documentos_chave_idx" ON "cte_documentos"("chave");

-- CreateIndex
CREATE INDEX "cte_unidades_carga_documentoId_idx" ON "cte_unidades_carga"("documentoId");

-- CreateIndex
CREATE INDEX "cte_unidades_carga_unidadeTransporteId_idx" ON "cte_unidades_carga"("unidadeTransporteId");

-- CreateIndex
CREATE INDEX "cte_unidade_carga_lacres_unidadeCargaId_idx" ON "cte_unidade_carga_lacres"("unidadeCargaId");

-- CreateIndex
CREATE INDEX "cte_unidades_transporte_documentoId_idx" ON "cte_unidades_transporte"("documentoId");

-- CreateIndex
CREATE INDEX "cte_unidade_transporte_lacres_unidadeTransporteId_idx" ON "cte_unidade_transporte_lacres"("unidadeTransporteId");

-- CreateIndex
CREATE INDEX "cte_duplicatas_cteId_idx" ON "cte_duplicatas"("cteId");

-- CreateIndex
CREATE INDEX "cte_obs_cont_cteId_idx" ON "cte_obs_cont"("cteId");

-- CreateIndex
CREATE INDEX "cte_obs_fisco_cteId_idx" ON "cte_obs_fisco"("cteId");

-- CreateIndex
CREATE INDEX "cte_aut_xml_cteId_idx" ON "cte_aut_xml"("cteId");

-- CreateIndex
CREATE INDEX "cte_historico_status_cteId_idx" ON "cte_historico_status"("cteId");

-- CreateIndex
CREATE UNIQUE INDEX "cte_complementos_cteId_key" ON "cte_complementos"("cteId");

-- CreateIndex
CREATE INDEX "cte_complementos_chCTe_idx" ON "cte_complementos"("chCTe");

-- CreateIndex
CREATE UNIQUE INDEX "cte_substitutos_cteId_key" ON "cte_substitutos"("cteId");

-- CreateIndex
CREATE INDEX "cte_substitutos_chCTe_idx" ON "cte_substitutos"("chCTe");

-- CreateIndex
CREATE INDEX "cte_globalizados_cteId_idx" ON "cte_globalizados"("cteId");

-- CreateIndex
CREATE INDEX "cte_globalizados_chCTe_idx" ON "cte_globalizados"("chCTe");

-- CreateIndex
CREATE INDEX "cte_servicos_vinculados_cteId_idx" ON "cte_servicos_vinculados"("cteId");

-- CreateIndex
CREATE INDEX "cte_servicos_vinculados_chCTeMultimodal_idx" ON "cte_servicos_vinculados"("chCTeMultimodal");

-- CreateIndex
CREATE UNIQUE INDEX "cte_responsaveis_tecnicos_cteId_key" ON "cte_responsaveis_tecnicos"("cteId");

-- CreateIndex
CREATE INDEX "cte_pagamentos_vinculados_cteId_idx" ON "cte_pagamentos_vinculados"("cteId");

-- CreateIndex
CREATE INDEX "nfaes_itens_nfaeId_idx" ON "nfaes_itens"("nfaeId");

-- CreateIndex
CREATE INDEX "nfaes_historico_status_nfaeId_idx" ON "nfaes_historico_status"("nfaeId");

-- CreateIndex
CREATE UNIQUE INDEX "mdfes_chaveAcesso_key" ON "mdfes"("chaveAcesso");

-- CreateIndex
CREATE INDEX "mdfes_empresaId_idx" ON "mdfes"("empresaId");

-- CreateIndex
CREATE INDEX "mdfes_chaveAcesso_idx" ON "mdfes"("chaveAcesso");

-- CreateIndex
CREATE INDEX "mdfes_status_idx" ON "mdfes"("status");

-- CreateIndex
CREATE INDEX "mdfes_modal_idx" ON "mdfes"("modal");

-- CreateIndex
CREATE INDEX "mdfes_loteId_idx" ON "mdfes"("loteId");

-- CreateIndex
CREATE INDEX "mdfe_municipios_carrega_mdfeId_idx" ON "mdfe_municipios_carrega"("mdfeId");

-- CreateIndex
CREATE UNIQUE INDEX "mdfe_municipios_carrega_mdfeId_cMunCarrega_key" ON "mdfe_municipios_carrega"("mdfeId", "cMunCarrega");

-- CreateIndex
CREATE INDEX "mdfe_percursos_mdfeId_idx" ON "mdfe_percursos"("mdfeId");

-- CreateIndex
CREATE UNIQUE INDEX "mdfe_percursos_mdfeId_UFPer_key" ON "mdfe_percursos"("mdfeId", "UFPer");

-- CreateIndex
CREATE INDEX "mdfe_municipios_descarga_mdfeId_idx" ON "mdfe_municipios_descarga"("mdfeId");

-- CreateIndex
CREATE UNIQUE INDEX "mdfe_municipios_descarga_mdfeId_cMunDescarga_key" ON "mdfe_municipios_descarga"("mdfeId", "cMunDescarga");

-- CreateIndex
CREATE INDEX "mdfe_ctes_munDescargaId_idx" ON "mdfe_ctes"("munDescargaId");

-- CreateIndex
CREATE INDEX "mdfe_ctes_chCTe_idx" ON "mdfe_ctes"("chCTe");

-- CreateIndex
CREATE UNIQUE INDEX "mdfe_ctes_munDescargaId_chCTe_key" ON "mdfe_ctes"("munDescargaId", "chCTe");

-- CreateIndex
CREATE INDEX "mdfe_nfes_munDescargaId_idx" ON "mdfe_nfes"("munDescargaId");

-- CreateIndex
CREATE INDEX "mdfe_nfes_chNFe_idx" ON "mdfe_nfes"("chNFe");

-- CreateIndex
CREATE UNIQUE INDEX "mdfe_nfes_munDescargaId_chNFe_key" ON "mdfe_nfes"("munDescargaId", "chNFe");

-- CreateIndex
CREATE INDEX "mdfe_mdfes_transp_munDescargaId_idx" ON "mdfe_mdfes_transp"("munDescargaId");

-- CreateIndex
CREATE INDEX "mdfe_mdfes_transp_chMDFe_idx" ON "mdfe_mdfes_transp"("chMDFe");

-- CreateIndex
CREATE UNIQUE INDEX "mdfe_mdfes_transp_munDescargaId_chMDFe_key" ON "mdfe_mdfes_transp"("munDescargaId", "chMDFe");

-- CreateIndex
CREATE INDEX "mdfe_unidades_transporte_cteId_idx" ON "mdfe_unidades_transporte"("cteId");

-- CreateIndex
CREATE INDEX "mdfe_unidades_transporte_nfeId_idx" ON "mdfe_unidades_transporte"("nfeId");

-- CreateIndex
CREATE INDEX "mdfe_unidades_transporte_mdfeTranspId_idx" ON "mdfe_unidades_transporte"("mdfeTranspId");

-- CreateIndex
CREATE INDEX "mdfe_lacres_unidade_unidadeTranspId_idx" ON "mdfe_lacres_unidade"("unidadeTranspId");

-- CreateIndex
CREATE INDEX "mdfe_unidades_carga_unidadeTranspId_idx" ON "mdfe_unidades_carga"("unidadeTranspId");

-- CreateIndex
CREATE INDEX "mdfe_lacres_unidade_carga_unidadeCargaId_idx" ON "mdfe_lacres_unidade_carga"("unidadeCargaId");

-- CreateIndex
CREATE INDEX "mdfe_perigosos_cteId_idx" ON "mdfe_perigosos"("cteId");

-- CreateIndex
CREATE INDEX "mdfe_perigosos_nfeId_idx" ON "mdfe_perigosos"("nfeId");

-- CreateIndex
CREATE INDEX "mdfe_perigosos_mdfeTranspId_idx" ON "mdfe_perigosos"("mdfeTranspId");

-- CreateIndex
CREATE INDEX "mdfe_nfes_prest_parcial_cteId_idx" ON "mdfe_nfes_prest_parcial"("cteId");

-- CreateIndex
CREATE UNIQUE INDEX "mdfe_nfes_prest_parcial_cteId_chNFe_key" ON "mdfe_nfes_prest_parcial"("cteId", "chNFe");

-- CreateIndex
CREATE INDEX "mdfe_seguros_mdfeId_idx" ON "mdfe_seguros"("mdfeId");

-- CreateIndex
CREATE INDEX "mdfe_lacres_mdfeId_idx" ON "mdfe_lacres"("mdfeId");

-- CreateIndex
CREATE INDEX "mdfe_aut_xml_mdfeId_idx" ON "mdfe_aut_xml"("mdfeId");

-- CreateIndex
CREATE UNIQUE INDEX "mdfe_encerramentos_mdfeId_key" ON "mdfe_encerramentos"("mdfeId");

-- CreateIndex
CREATE INDEX "mdfe_historico_status_mdfeId_idx" ON "mdfe_historico_status"("mdfeId");

-- CreateIndex
CREATE INDEX "lotes_mdfe_empresaId_idx" ON "lotes_mdfe"("empresaId");

-- CreateIndex
CREATE INDEX "lotes_mdfe_situacao_idx" ON "lotes_mdfe"("situacao");

-- CreateIndex
CREATE UNIQUE INDEX "ctes_Id_key" ON "ctes"("Id");

-- CreateIndex
CREATE INDEX "ctes_empresaId_idx" ON "ctes"("empresaId");

-- CreateIndex
CREATE INDEX "ctes_chaveAcesso_idx" ON "ctes"("chaveAcesso");

-- CreateIndex
CREATE INDEX "ctes_status_idx" ON "ctes"("status");

-- CreateIndex
CREATE INDEX "ctes_modal_idx" ON "ctes"("modal");

-- CreateIndex
CREATE INDEX "ctes_tpCTe_idx" ON "ctes"("tpCTe");

-- CreateIndex
CREATE INDEX "ctes_emitenteId_idx" ON "ctes"("emitenteId");

-- CreateIndex
CREATE INDEX "ctes_remetenteId_idx" ON "ctes"("remetenteId");

-- CreateIndex
CREATE INDEX "ctes_destinatarioId_idx" ON "ctes"("destinatarioId");

-- CreateIndex
CREATE INDEX "itens_nfce_nfceId_idx" ON "itens_nfce"("nfceId");

-- CreateIndex
CREATE INDEX "nfaes_empresaId_idx" ON "nfaes"("empresaId");

-- CreateIndex
CREATE INDEX "nfaes_chaveAcesso_idx" ON "nfaes"("chaveAcesso");

-- CreateIndex
CREATE INDEX "nfaes_status_idx" ON "nfaes"("status");

-- CreateIndex
CREATE INDEX "nfaes_numero_serie_idx" ON "nfaes"("numero", "serie");

-- CreateIndex
CREATE INDEX "nfaes_destinatarioId_idx" ON "nfaes"("destinatarioId");

-- CreateIndex
CREATE INDEX "nfces_empresaId_idx" ON "nfces"("empresaId");

-- CreateIndex
CREATE INDEX "nfces_chaveAcesso_idx" ON "nfces"("chaveAcesso");

-- CreateIndex
CREATE INDEX "nfces_status_idx" ON "nfces"("status");

-- CreateIndex
CREATE INDEX "nfces_consumidorId_idx" ON "nfces"("consumidorId");

-- CreateIndex
CREATE INDEX "nfces_dataHoraEmissao_idx" ON "nfces"("dataHoraEmissao");

-- CreateIndex
CREATE INDEX "nfces_protocoloAutorizacao_idx" ON "nfces"("protocoloAutorizacao");

-- CreateIndex
CREATE INDEX "nfces_numero_serie_idx" ON "nfces"("numero", "serie");

-- CreateIndex
CREATE INDEX "nfses_empresaId_idx" ON "nfses"("empresaId");

-- CreateIndex
CREATE INDEX "nfses_chaveAcesso_idx" ON "nfses"("chaveAcesso");

-- CreateIndex
CREATE INDEX "nfses_status_idx" ON "nfses"("status");

-- CreateIndex
CREATE INDEX "nfses_tomadorId_idx" ON "nfses"("tomadorId");

-- CreateIndex
CREATE INDEX "nfses_dataHoraEmissao_idx" ON "nfses"("dataHoraEmissao");

-- CreateIndex
CREATE INDEX "nfses_protocoloAutorizacao_idx" ON "nfses"("protocoloAutorizacao");

-- CreateIndex
CREATE INDEX "nfses_numeroNfse_serieDPS_idx" ON "nfses"("numeroNfse", "serieDPS");

-- AddForeignKey
ALTER TABLE "logs_acao" ADD CONSTRAINT "logs_acao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs_acao" ADD CONSTRAINT "logs_acao_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfses" ADD CONSTRAINT "nfses_tomadorId_fkey" FOREIGN KEY ("tomadorId") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfses" ADD CONSTRAINT "nfses_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "servicos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_status_nfse" ADD CONSTRAINT "historico_status_nfse_nfseId_fkey" FOREIGN KEY ("nfseId") REFERENCES "nfses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfes" ADD CONSTRAINT "nfes_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "lotes_nfe"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_status_nfe" ADD CONSTRAINT "historico_status_nfe_nfeId_fkey" FOREIGN KEY ("nfeId") REFERENCES "nfes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfes_referencias" ADD CONSTRAINT "nfes_referencias_nfeId_fkey" FOREIGN KEY ("nfeId") REFERENCES "nfes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parametros_sistema" ADD CONSTRAINT "parametros_sistema_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_backup" ADD CONSTRAINT "historico_backup_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_rastreabilidade" ADD CONSTRAINT "itens_rastreabilidade_itemNFeId_fkey" FOREIGN KEY ("itemNFeId") REFERENCES "itens_nfe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "declaracoes_importacao" ADD CONSTRAINT "declaracoes_importacao_itemNFeId_fkey" FOREIGN KEY ("itemNFeId") REFERENCES "itens_nfe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adicoes_importacao" ADD CONSTRAINT "adicoes_importacao_diId_fkey" FOREIGN KEY ("diId") REFERENCES "declaracoes_importacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalhes_exportacao" ADD CONSTRAINT "detalhes_exportacao_itemNFeId_fkey" FOREIGN KEY ("itemNFeId") REFERENCES "itens_nfe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "veiculos_produto" ADD CONSTRAINT "veiculos_produto_itemNFeId_fkey" FOREIGN KEY ("itemNFeId") REFERENCES "itens_nfe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicamentos" ADD CONSTRAINT "medicamentos_itemNFeId_fkey" FOREIGN KEY ("itemNFeId") REFERENCES "itens_nfe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "armas" ADD CONSTRAINT "armas_itemNFeId_fkey" FOREIGN KEY ("itemNFeId") REFERENCES "itens_nfe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "combustiveis" ADD CONSTRAINT "combustiveis_itemNFeId_fkey" FOREIGN KEY ("itemNFeId") REFERENCES "itens_nfe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encerrantes" ADD CONSTRAINT "encerrantes_combustivelId_fkey" FOREIGN KEY ("combustivelId") REFERENCES "combustiveis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "origens_combustivel" ADD CONSTRAINT "origens_combustivel_combustivelId_fkey" FOREIGN KEY ("combustivelId") REFERENCES "combustiveis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lacres" ADD CONSTRAINT "lacres_transporteNFeId_fkey" FOREIGN KEY ("transporteNFeId") REFERENCES "transportes_nfe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamentos_nfe" ADD CONSTRAINT "pagamentos_nfe_nfeId_fkey" FOREIGN KEY ("nfeId") REFERENCES "nfes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intermediadores" ADD CONSTRAINT "intermediadores_nfeId_fkey" FOREIGN KEY ("nfeId") REFERENCES "nfes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inutilizacoes_nfe" ADD CONSTRAINT "inutilizacoes_nfe_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inutilizacoes_nfe" ADD CONSTRAINT "inutilizacoes_nfe_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "eventos_nfe"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inutilizacoes_nfe" ADD CONSTRAINT "inutilizacoes_nfe_nfeId_fkey" FOREIGN KEY ("nfeId") REFERENCES "nfes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lotes_nfe" ADD CONSTRAINT "lotes_nfe_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "envios_nfe" ADD CONSTRAINT "envios_nfe_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "envios_nfe" ADD CONSTRAINT "envios_nfe_nfeId_fkey" FOREIGN KEY ("nfeId") REFERENCES "nfes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "envios_nfe" ADD CONSTRAINT "envios_nfe_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "lotes_nfe"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "danfes" ADD CONSTRAINT "danfes_nfeId_fkey" FOREIGN KEY ("nfeId") REFERENCES "nfes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos_busca" ADD CONSTRAINT "agendamentos_busca_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuracoes_ambiente" ADD CONSTRAINT "configuracoes_ambiente_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exportacoes" ADD CONSTRAINT "exportacoes_nfeId_fkey" FOREIGN KEY ("nfeId") REFERENCES "nfes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras" ADD CONSTRAINT "compras_nfeId_fkey" FOREIGN KEY ("nfeId") REFERENCES "nfes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cana" ADD CONSTRAINT "cana_nfeId_fkey" FOREIGN KEY ("nfeId") REFERENCES "nfes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fornecimentos_dia" ADD CONSTRAINT "fornecimentos_dia_canaId_fkey" FOREIGN KEY ("canaId") REFERENCES "cana"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deducoes_cana" ADD CONSTRAINT "deducoes_cana_canaId_fkey" FOREIGN KEY ("canaId") REFERENCES "cana"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "responsaveis_tecnicos" ADD CONSTRAINT "responsaveis_tecnicos_nfeId_fkey" FOREIGN KEY ("nfeId") REFERENCES "nfes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processos_referenciados" ADD CONSTRAINT "processos_referenciados_nfeId_fkey" FOREIGN KEY ("nfeId") REFERENCES "nfes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamentos_nfce" ADD CONSTRAINT "pagamentos_nfce_nfceId_fkey" FOREIGN KEY ("nfceId") REFERENCES "nfces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_status_nfce" ADD CONSTRAINT "historico_status_nfce_nfceId_fkey" FOREIGN KEY ("nfceId") REFERENCES "nfces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ctes" ADD CONSTRAINT "ctes_emitenteId_fkey" FOREIGN KEY ("emitenteId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ctes" ADD CONSTRAINT "ctes_remetenteId_fkey" FOREIGN KEY ("remetenteId") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ctes" ADD CONSTRAINT "ctes_destinatarioId_fkey" FOREIGN KEY ("destinatarioId") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ctes" ADD CONSTRAINT "ctes_expedidorId_fkey" FOREIGN KEY ("expedidorId") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ctes" ADD CONSTRAINT "ctes_recebedorId_fkey" FOREIGN KEY ("recebedorId") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cte_componentes" ADD CONSTRAINT "cte_componentes_cteId_fkey" FOREIGN KEY ("cteId") REFERENCES "ctes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cte_quantidades" ADD CONSTRAINT "cte_quantidades_cteId_fkey" FOREIGN KEY ("cteId") REFERENCES "ctes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cte_documentos" ADD CONSTRAINT "cte_documentos_cteId_fkey" FOREIGN KEY ("cteId") REFERENCES "ctes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cte_unidades_carga" ADD CONSTRAINT "cte_unidades_carga_documentoId_fkey" FOREIGN KEY ("documentoId") REFERENCES "cte_documentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cte_unidades_carga" ADD CONSTRAINT "cte_unidades_carga_unidadeTransporteId_fkey" FOREIGN KEY ("unidadeTransporteId") REFERENCES "cte_unidades_transporte"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cte_unidade_carga_lacres" ADD CONSTRAINT "cte_unidade_carga_lacres_unidadeCargaId_fkey" FOREIGN KEY ("unidadeCargaId") REFERENCES "cte_unidades_carga"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cte_unidades_transporte" ADD CONSTRAINT "cte_unidades_transporte_documentoId_fkey" FOREIGN KEY ("documentoId") REFERENCES "cte_documentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cte_unidade_transporte_lacres" ADD CONSTRAINT "cte_unidade_transporte_lacres_unidadeTransporteId_fkey" FOREIGN KEY ("unidadeTransporteId") REFERENCES "cte_unidades_transporte"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cte_duplicatas" ADD CONSTRAINT "cte_duplicatas_cteId_fkey" FOREIGN KEY ("cteId") REFERENCES "ctes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cte_obs_cont" ADD CONSTRAINT "cte_obs_cont_cteId_fkey" FOREIGN KEY ("cteId") REFERENCES "ctes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cte_obs_fisco" ADD CONSTRAINT "cte_obs_fisco_cteId_fkey" FOREIGN KEY ("cteId") REFERENCES "ctes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cte_aut_xml" ADD CONSTRAINT "cte_aut_xml_cteId_fkey" FOREIGN KEY ("cteId") REFERENCES "ctes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cte_historico_status" ADD CONSTRAINT "cte_historico_status_cteId_fkey" FOREIGN KEY ("cteId") REFERENCES "ctes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cte_complementos" ADD CONSTRAINT "cte_complementos_cteId_fkey" FOREIGN KEY ("cteId") REFERENCES "ctes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cte_substitutos" ADD CONSTRAINT "cte_substitutos_cteId_fkey" FOREIGN KEY ("cteId") REFERENCES "ctes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cte_globalizados" ADD CONSTRAINT "cte_globalizados_cteId_fkey" FOREIGN KEY ("cteId") REFERENCES "ctes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cte_servicos_vinculados" ADD CONSTRAINT "cte_servicos_vinculados_cteId_fkey" FOREIGN KEY ("cteId") REFERENCES "ctes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cte_responsaveis_tecnicos" ADD CONSTRAINT "cte_responsaveis_tecnicos_cteId_fkey" FOREIGN KEY ("cteId") REFERENCES "ctes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cte_pagamentos_vinculados" ADD CONSTRAINT "cte_pagamentos_vinculados_cteId_fkey" FOREIGN KEY ("cteId") REFERENCES "ctes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfaes" ADD CONSTRAINT "nfaes_destinatarioId_fkey" FOREIGN KEY ("destinatarioId") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfaes_itens" ADD CONSTRAINT "nfaes_itens_nfaeId_fkey" FOREIGN KEY ("nfaeId") REFERENCES "nfaes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfaes_historico_status" ADD CONSTRAINT "nfaes_historico_status_nfaeId_fkey" FOREIGN KEY ("nfaeId") REFERENCES "nfaes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_nfe" ADD CONSTRAINT "eventos_nfe_nfeId_fkey" FOREIGN KEY ("nfeId") REFERENCES "nfes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_nfe" ADD CONSTRAINT "eventos_nfe_inutilizacaoId_fkey" FOREIGN KEY ("inutilizacaoId") REFERENCES "inutilizacoes_nfe"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mdfes" ADD CONSTRAINT "mdfes_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mdfes" ADD CONSTRAINT "mdfes_emitenteId_fkey" FOREIGN KEY ("emitenteId") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mdfes" ADD CONSTRAINT "mdfes_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "lotes_mdfe"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mdfe_municipios_carrega" ADD CONSTRAINT "mdfe_municipios_carrega_mdfeId_fkey" FOREIGN KEY ("mdfeId") REFERENCES "mdfes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mdfe_percursos" ADD CONSTRAINT "mdfe_percursos_mdfeId_fkey" FOREIGN KEY ("mdfeId") REFERENCES "mdfes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mdfe_municipios_descarga" ADD CONSTRAINT "mdfe_municipios_descarga_mdfeId_fkey" FOREIGN KEY ("mdfeId") REFERENCES "mdfes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mdfe_ctes" ADD CONSTRAINT "mdfe_ctes_munDescargaId_fkey" FOREIGN KEY ("munDescargaId") REFERENCES "mdfe_municipios_descarga"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mdfe_nfes" ADD CONSTRAINT "mdfe_nfes_munDescargaId_fkey" FOREIGN KEY ("munDescargaId") REFERENCES "mdfe_municipios_descarga"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mdfe_mdfes_transp" ADD CONSTRAINT "mdfe_mdfes_transp_munDescargaId_fkey" FOREIGN KEY ("munDescargaId") REFERENCES "mdfe_municipios_descarga"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mdfe_unidades_transporte" ADD CONSTRAINT "mdfe_unidades_transporte_cteId_fkey" FOREIGN KEY ("cteId") REFERENCES "mdfe_ctes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mdfe_unidades_transporte" ADD CONSTRAINT "mdfe_unidades_transporte_nfeId_fkey" FOREIGN KEY ("nfeId") REFERENCES "mdfe_nfes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mdfe_unidades_transporte" ADD CONSTRAINT "mdfe_unidades_transporte_mdfeTranspId_fkey" FOREIGN KEY ("mdfeTranspId") REFERENCES "mdfe_mdfes_transp"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mdfe_lacres_unidade" ADD CONSTRAINT "mdfe_lacres_unidade_unidadeTranspId_fkey" FOREIGN KEY ("unidadeTranspId") REFERENCES "mdfe_unidades_transporte"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mdfe_unidades_carga" ADD CONSTRAINT "mdfe_unidades_carga_unidadeTranspId_fkey" FOREIGN KEY ("unidadeTranspId") REFERENCES "mdfe_unidades_transporte"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mdfe_lacres_unidade_carga" ADD CONSTRAINT "mdfe_lacres_unidade_carga_unidadeCargaId_fkey" FOREIGN KEY ("unidadeCargaId") REFERENCES "mdfe_unidades_carga"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mdfe_perigosos" ADD CONSTRAINT "mdfe_perigosos_cteId_fkey" FOREIGN KEY ("cteId") REFERENCES "mdfe_ctes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mdfe_perigosos" ADD CONSTRAINT "mdfe_perigosos_nfeId_fkey" FOREIGN KEY ("nfeId") REFERENCES "mdfe_nfes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mdfe_perigosos" ADD CONSTRAINT "mdfe_perigosos_mdfeTranspId_fkey" FOREIGN KEY ("mdfeTranspId") REFERENCES "mdfe_mdfes_transp"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mdfe_nfes_prest_parcial" ADD CONSTRAINT "mdfe_nfes_prest_parcial_cteId_fkey" FOREIGN KEY ("cteId") REFERENCES "mdfe_ctes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mdfe_seguros" ADD CONSTRAINT "mdfe_seguros_mdfeId_fkey" FOREIGN KEY ("mdfeId") REFERENCES "mdfes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mdfe_lacres" ADD CONSTRAINT "mdfe_lacres_mdfeId_fkey" FOREIGN KEY ("mdfeId") REFERENCES "mdfes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mdfe_aut_xml" ADD CONSTRAINT "mdfe_aut_xml_mdfeId_fkey" FOREIGN KEY ("mdfeId") REFERENCES "mdfes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mdfe_encerramentos" ADD CONSTRAINT "mdfe_encerramentos_mdfeId_fkey" FOREIGN KEY ("mdfeId") REFERENCES "mdfes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mdfe_historico_status" ADD CONSTRAINT "mdfe_historico_status_mdfeId_fkey" FOREIGN KEY ("mdfeId") REFERENCES "mdfes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lotes_mdfe" ADD CONSTRAINT "lotes_mdfe_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

