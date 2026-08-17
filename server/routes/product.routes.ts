import { Router } from "express";
import { CreateProductSchema } from "../validators";
import { requireRole } from "../middleware/auth";
import { logger } from "../logger";

const router = Router();

// GET /api/products
router.get("/", requireRole(["admin", "financial_manager", "operator", "auditor"]), async (_req, res) => {
  return res.json({
    products: [
      {
        id: "prod-001",
        sku: "SOFT-001",
        name: "Licença Anual NEXS Gestor Financeiro",
        category: "Software",
        unit_price: 1490.00,
        cost_price: 250.00,
        current_stock: 999,
        min_stock: 10,
        is_active: true
      },
      {
        id: "prod-002",
        sku: "SERV-002",
        name: "Consultoria de Implantação e Treinamento",
        category: "Serviços",
        unit_price: 2500.00,
        cost_price: 800.00,
        current_stock: 50,
        min_stock: 5,
        is_active: true
      }
    ]
  });
});

// POST /api/products
router.post("/", requireRole(["admin", "financial_manager", "operator"]), async (req, res) => {
  const validation = CreateProductSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: "Dados do produto inválidos", details: validation.error.format() });
  }

  const newProduct = {
    id: "prod-" + Math.floor(1000 + Math.random() * 9000),
    ...validation.data,
    is_active: true,
    created_at: new Date().toISOString()
  };

  logger.info("Product created", { id: newProduct.id, sku: newProduct.sku });
  return res.status(201).json({ success: true, product: newProduct });
});

export default router;
