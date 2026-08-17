import { Router } from "express";
import { CreateDocumentSchema, CreateSettlementSchema } from "../validators";
import { requireRole, AuthenticatedRequest } from "../middleware/auth";
import { FinancialService } from "../services/financial.service";
import { logger } from "../logger";

const router = Router();

// GET /api/financial/documents
router.get("/documents", requireRole(["admin", "financial_manager", "operator", "auditor"]), async (_req, res) => {
  return res.json({
    documents: [
      {
        id: "doc-101",
        title: "Venda de Serviços de Software ERP",
        document_number: "NF-10293",
        document_type: "receivable",
        issue_date: "2026-08-01",
        due_date: "2026-08-25",
        total_amount: 12500.00,
        net_amount: 12500.00,
        status: "open",
        is_fiscal_locked: false
      },
      {
        id: "doc-102",
        title: "Insumos Servidores em Nuvem Cloud",
        document_number: "NF-88210",
        document_type: "payable",
        issue_date: "2026-08-05",
        due_date: "2026-08-20",
        total_amount: 3450.00,
        net_amount: 3450.00,
        status: "open",
        is_fiscal_locked: false
      }
    ]
  });
});

// POST /api/financial/documents
router.post("/documents", requireRole(["admin", "financial_manager", "operator"]), async (req: AuthenticatedRequest, res) => {
  const validation = CreateDocumentSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: "Dados do documento inválidos", details: validation.error.format() });
  }

  const newDoc = {
    id: "doc-" + Math.floor(100000 + Math.random() * 900000),
    ...validation.data,
    status: "open",
    is_fiscal_locked: false,
    created_at: new Date().toISOString()
  };

  logger.info("Financial document created via REST API", { docId: newDoc.id, user: req.user?.email });
  return res.status(201).json({ success: true, document: newDoc });
});

// POST /api/financial/settlements
router.post("/settlements", requireRole(["admin", "financial_manager", "operator"]), async (req: AuthenticatedRequest, res) => {
  try {
    const validation = CreateSettlementSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: "Dados da baixa inválidos", details: validation.error.format() });
    }

    const settlement = await FinancialService.validateAndExecuteSettlement(
      validation.data,
      (_bankId) => 250000.00, // Mock balance query
      (_installmentId) => ({
        id: validation.data.installment_id,
        status: "open",
        amount: validation.data.amount,
        paidAmount: 0,
        docType: "payable",
        isFiscalLocked: false
      }),
      (settlementData, newStatus, newBalance) => {
        logger.info("Financial Settlement Committed", { settlementData, newStatus, newBalance });
      }
    );

    return res.json({ success: true, settlement });
  } catch (err: any) {
    return res.status(422).json({ error: err.message || "Erro na validação da baixa." });
  }
});

export default router;
