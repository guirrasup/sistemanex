import { Router } from "express";
import { CreateBankAccountSchema } from "../validators";
import { requireRole } from "../middleware/auth";
import { logger } from "../logger";

const router = Router();

// GET /api/banks
router.get("/", requireRole(["admin", "financial_manager", "operator", "auditor"]), async (_req, res) => {
  return res.json({
    bankAccounts: [
      {
        id: "bank-001",
        account_name: "Itaú Unibanco - Principal",
        bank_code: "341",
        agency: "1234",
        account_number: "56789-0",
        account_type: "checking",
        balance: 185450.00,
        blocked_balance: 0.00,
        is_active: true
      },
      {
        id: "bank-002",
        account_name: "Banco do Brasil - Operacional",
        bank_code: "001",
        agency: "4321",
        account_number: "98765-4",
        account_type: "checking",
        balance: 64550.00,
        blocked_balance: 5000.00,
        is_active: true
      }
    ]
  });
});

// POST /api/banks
router.post("/", requireRole(["admin", "financial_manager"]), async (req, res) => {
  const validation = CreateBankAccountSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: "Dados bancários inválidos", details: validation.error.format() });
  }

  const newAccount = {
    id: "bank-" + Math.floor(1000 + Math.random() * 9000),
    account_name: validation.data.account_name,
    bank_code: validation.data.bank_code,
    agency: validation.data.agency,
    account_number: validation.data.account_number,
    account_type: "checking",
    balance: validation.data.initial_balance,
    blocked_balance: 0,
    is_active: true,
    created_at: new Date().toISOString()
  };

  logger.info("Bank Account Created", { accountId: newAccount.id });
  return res.status(201).json({ success: true, bankAccount: newAccount });
});

export default router;
