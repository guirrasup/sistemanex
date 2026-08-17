import { z } from "zod";

// Auth DTOs
export const LoginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres")
});

export const RegisterUserSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha com pelo menos 6 caracteres"),
  role: z.enum(["admin", "financial_manager", "operator", "auditor"]).default("operator")
});

// Financial Document DTOs
export const CreateDocumentSchema = z.object({
  person_id: z.string().optional(),
  document_type: z.enum(["payable", "receivable"]),
  title: z.string().min(3, "Título deve ter ao menos 3 caracteres"),
  document_number: z.string().optional(),
  issue_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD"),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD"),
  total_amount: z.number().positive("Valor total deve ser positivo"),
  installments_count: z.number().int().min(1).max(120).default(1)
});

// Settlement (Baixa) DTO
export const CreateSettlementSchema = z.object({
  installment_id: z.string().min(1, "ID da parcela é obrigatório"),
  bank_account_id: z.string().min(1, "Conta bancária é obrigatória"),
  payment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data no formato YYYY-MM-DD"),
  amount: z.number().positive("Valor baixado deve ser maior que zero"),
  interest_amount: z.number().min(0).default(0),
  fine_amount: z.number().min(0).default(0),
  discount_amount: z.number().min(0).default(0),
  payment_method: z.enum(["pix", "bank_transfer", "credit_card", "cash", "boleto"])
});

// Person (Customer/Supplier) DTO
export const CreatePersonSchema = z.object({
  legal_name: z.string().min(3, "Razão Social/Nome é obrigatório"),
  trade_name: z.string().optional(),
  tax_id: z.string().min(11, "CPF/CNPJ inválido"),
  person_type: z.enum(["individual", "company"]),
  person_role: z.enum(["customer", "supplier", "both"]).default("customer")
});

// Bank Account DTO
export const CreateBankAccountSchema = z.object({
  account_name: z.string().min(2, "Nome da conta é obrigatório"),
  bank_code: z.string().min(1, "Código do banco é obrigatório"),
  agency: z.string().min(1, "Agência é obrigatória"),
  account_number: z.string().min(1, "Número da conta é obrigatório"),
  initial_balance: z.number().default(0)
});

// Product DTO
export const CreateProductSchema = z.object({
  sku: z.string().min(1, "SKU é obrigatório"),
  name: z.string().min(2, "Nome do produto é obrigatório"),
  category: z.string().optional(),
  unit_price: z.number().nonnegative(),
  cost_price: z.number().nonnegative(),
  current_stock: z.number().default(0),
  min_stock: z.number().default(5)
});
