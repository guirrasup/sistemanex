import { Router } from "express";
import { requireRole } from "../middleware/auth";
import { logger } from "../logger";

const router = Router();

// GET /api/audit/logs
router.get("/logs", requireRole(["admin", "financial_manager", "operator", "auditor"]), async (_req, res) => {
  return res.json({
    logs: [
      {
        id: "audit-1001",
        company_id: "comp-001",
        user_id: "usr-demo-admin",
        user_name: "Gestor NEXS Admin",
        user_role: "admin",
        entity_type: "FinancialDocument",
        entity_id: "doc-101",
        action: "create",
        change_reason: "Inclusão de Título Financeiro de Venda NF-10293",
        ip_address: "187.102.44.12",
        user_agent: "NEXS Web Client v2.5",
        created_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: "audit-1002",
        company_id: "comp-001",
        user_id: "usr-demo-admin",
        user_name: "Gestor NEXS Admin",
        user_role: "admin",
        entity_type: "FiscalDocument",
        entity_id: "fisc-9002",
        action: "emit",
        change_reason: "Emissão de NF-E autorizada pela SEFAZ SP",
        ip_address: "187.102.44.12",
        user_agent: "NEXS Web Client v2.5",
        created_at: new Date(Date.now() - 1800000).toISOString()
      }
    ]
  });
});

export default router;
