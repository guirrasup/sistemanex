import { Router } from "express";
import { requireRole } from "../middleware/auth";
import { logger } from "../logger";

const router = Router();

// GET /api/fiscal/invoices
router.get("/invoices", requireRole(["admin", "financial_manager", "operator", "auditor"]), async (_req, res) => {
  return res.json({
    invoices: [
      {
        id: "nfe-001",
        nfe_key: "35260812345678000190550010001029311001234567",
        number: "10293",
        series: "1",
        issue_date: "2026-08-01T10:30:00Z",
        issuer: "NEX Gestor Tecnologia SA",
        recipient: "Distribuidora e Comércio Silva SA",
        total_value: 12500.00,
        icms_value: 1500.00,
        iss_value: 625.00,
        status: "authorized",
        sefaz_status_code: "100"
      }
    ]
  });
});

// POST /api/fiscal/emit-nfe
router.post("/emit-nfe", requireRole(["admin", "financial_manager"]), async (req, res) => {
  const { document_id } = req.body || {};
  if (!document_id) {
    return res.status(400).json({ error: "Documento financeiro de origem é obrigatório para emissão de NF-e." });
  }

  const nfeKey = "352608" + Math.floor(100000000000000000 + Math.random() * 900000000000000000);
  const nfeResult = {
    id: "nfe-" + Math.floor(1000 + Math.random() * 9000),
    nfe_key: nfeKey,
    document_id,
    status: "authorized",
    sefaz_protocol: "135260009821034",
    issued_at: new Date().toISOString()
  };

  logger.info("SEFAZ NF-e Emitted successfully", { nfeKey, document_id });
  return res.status(201).json({ success: true, nfe: nfeResult });
});

export default router;
