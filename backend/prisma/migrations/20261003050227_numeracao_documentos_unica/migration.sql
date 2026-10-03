-- Numeração de documentos fiscais: contadores sincronizados + unicidade
-- Em transação: se qualquer passo falhar, nada é aplicado pela metade.

BEGIN;

-- ============================================================
-- 1. Aborta com mensagem clara se já houver números duplicados
--    (documento fiscal emitido não pode ser renumerado automaticamente;
--    os casos precisam ser analisados — ex.: inutilizar/cancelar um deles).
-- ============================================================
DO $$
DECLARE
  duplicados TEXT;
BEGIN
  SELECT string_agg(descricao, '; ') INTO duplicados FROM (
    SELECT format('NF-e empresa %s série %s nº %s', "empresaId", serie, numero) AS descricao
      FROM "nfes" GROUP BY "empresaId", modelo, serie, numero HAVING COUNT(*) > 1
    UNION ALL
    SELECT format('NFC-e empresa %s série %s nº %s', "empresaId", serie, numero)
      FROM "nfces" GROUP BY "empresaId", serie, numero HAVING COUNT(*) > 1
    UNION ALL
    SELECT format('CT-e empresa %s série %s nº %s', "empresaId", serie, "nCT")
      FROM "ctes" GROUP BY "empresaId", serie, "nCT" HAVING COUNT(*) > 1
    UNION ALL
    SELECT format('MDF-e empresa %s série %s nº %s', "empresaId", serie, numero)
      FROM "mdfes" GROUP BY "empresaId", serie, numero HAVING COUNT(*) > 1
    UNION ALL
    SELECT format('NFA-e empresa %s série %s nº %s', "empresaId", serie, numero)
      FROM "nfaes" GROUP BY "empresaId", serie, numero HAVING COUNT(*) > 1
    UNION ALL
    SELECT format('NFS-e empresa %s série %s nº %s', "empresaId", "serieDPS", "numeroNfse")
      FROM "nfses" GROUP BY "empresaId", "serieDPS", "numeroNfse" HAVING COUNT(*) > 1
  ) AS d;

  IF duplicados IS NOT NULL THEN
    RAISE EXCEPTION 'Numeração duplicada encontrada — resolva antes de aplicar esta migration: %', duplicados;
  END IF;
END $$;

-- ============================================================
-- 2. Contadores da empresa nunca abaixo do maior número já usado
--    (o de CT-e não era incrementado; o de NFA-e não era usado).
-- ============================================================
UPDATE "empresas" e SET "proximoNumeroNfe" = GREATEST(e."proximoNumeroNfe", m.prox)
FROM (SELECT "empresaId", MAX(numero) + 1 AS prox FROM "nfes" GROUP BY "empresaId") m
WHERE m."empresaId" = e.id;

UPDATE "empresas" e SET "proximoNumeroNfce" = GREATEST(e."proximoNumeroNfce", m.prox)
FROM (SELECT "empresaId", MAX(numero) + 1 AS prox FROM "nfces" GROUP BY "empresaId") m
WHERE m."empresaId" = e.id;

UPDATE "empresas" e SET "proximoNumeroCte" = GREATEST(e."proximoNumeroCte", m.prox)
FROM (SELECT "empresaId", MAX("nCT") + 1 AS prox FROM "ctes" GROUP BY "empresaId") m
WHERE m."empresaId" = e.id;

UPDATE "empresas" e SET "proximoNumeroMdfe" = GREATEST(e."proximoNumeroMdfe", m.prox)
FROM (SELECT "empresaId", MAX(numero) + 1 AS prox FROM "mdfes" GROUP BY "empresaId") m
WHERE m."empresaId" = e.id;

UPDATE "empresas" e SET "proximoNumeroNfae" = GREATEST(e."proximoNumeroNfae", m.prox)
FROM (SELECT "empresaId", MAX(numero) + 1 AS prox FROM "nfaes" GROUP BY "empresaId") m
WHERE m."empresaId" = e.id;

UPDATE "empresas" e SET "proximoNumeroNfse" = GREATEST(e."proximoNumeroNfse", m.prox)
FROM (SELECT "empresaId", MAX("numeroNfse") + 1 AS prox FROM "nfses" GROUP BY "empresaId") m
WHERE m."empresaId" = e.id;

-- ============================================================
-- 3. Unicidade do número por empresa e série
-- ============================================================
CREATE UNIQUE INDEX "nfes_empresaId_modelo_serie_numero_key" ON "nfes"("empresaId", "modelo", "serie", "numero");
CREATE UNIQUE INDEX "nfces_empresaId_serie_numero_key" ON "nfces"("empresaId", "serie", "numero");
CREATE UNIQUE INDEX "ctes_empresaId_serie_nCT_key" ON "ctes"("empresaId", "serie", "nCT");
CREATE UNIQUE INDEX "mdfes_empresaId_serie_numero_key" ON "mdfes"("empresaId", "serie", "numero");
CREATE UNIQUE INDEX "nfaes_empresaId_serie_numero_key" ON "nfaes"("empresaId", "serie", "numero");
CREATE UNIQUE INDEX "nfses_empresaId_serieDPS_numeroNfse_key" ON "nfses"("empresaId", "serieDPS", "numeroNfse");

COMMIT;
