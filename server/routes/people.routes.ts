import { Router } from "express";
import { CreatePersonSchema } from "../validators";
import { requireRole } from "../middleware/auth";
import { logger } from "../logger";

const router = Router();

// GET /api/people
router.get("/", requireRole(["admin", "financial_manager", "operator", "auditor"]), async (req, res) => {
  const role = req.query.role as string; // 'customer' or 'supplier'
  const people = [
    {
      id: "p-001",
      legal_name: "TechSupply Soluções em Tecnologia LTDA",
      trade_name: "TechSupply",
      tax_id: "12.345.678/0001-90",
      person_type: "company",
      person_role: "supplier",
      state_registration: "112.334.556.110",
      is_active: true
    },
    {
      id: "p-002",
      legal_name: "Distribuidora e Comércio Silva SA",
      trade_name: "Silva Atacado",
      tax_id: "98.765.432/0001-10",
      person_type: "company",
      person_role: "customer",
      state_registration: "987.654.321.000",
      is_active: true
    }
  ];

  const filtered = role ? people.filter(p => p.person_role === role || p.person_role === "both") : people;
  return res.json({ people: filtered });
});

// POST /api/people
router.post("/", requireRole(["admin", "financial_manager", "operator"]), async (req, res) => {
  const validation = CreatePersonSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: "Dados inválidos para cadastro", details: validation.error.format() });
  }

  const newPerson = {
    id: "p-" + Math.floor(1000 + Math.random() * 9000),
    ...validation.data,
    is_active: true,
    created_at: new Date().toISOString()
  };

  logger.info("Person record created", { id: newPerson.id, name: newPerson.legal_name });
  return res.status(201).json({ success: true, person: newPerson });
});

export default router;
