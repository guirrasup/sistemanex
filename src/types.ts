/**
 * NEX - Tipos e Interfaces do Sistema Completo de Bancos e Relacionamentos
 */

export type TaxRegime = 'simples' | 'presumed_profit' | 'actual_profit';
export type AddressType = 'commercial' | 'fiscal' | 'shipping';
export type PersonType = 'individual' | 'company';
export type ContactType = 'email' | 'phone' | 'whatsapp';
export type ProductType = 'product' | 'service' | 'consumable';
export type WarehouseType = 'physical' | 'virtual' | 'consignment';
export type ValuationMethod = 'average' | 'fifo' | 'specific';
export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
export type Direction = 'payable' | 'receivable';
export type DocumentType = 'invoice' | 'purchase_order' | 'contract';
export type InstallmentStatus = 'pending' | 'partially_paid' | 'paid' | 'canceled' | 'overdue';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type PaymentMethod = 'pix' | 'boleto' | 'credit_card' | 'debit' | 'cash' | 'transfer';
export type SettlementStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type BankAccountType = 'checking' | 'savings' | 'investment';
export type TransactionStatus = 'pending' | 'reconciled' | 'unmatched';
export type MatchMethod = 'exact' | 'fuzzy' | 'manual';
export type FiscalDocType = 'nf_e' | 'nfc_e' | 'nfs_e' | 'cte' | 'cte_os';
export type FiscalDocOperation = 'sales' | 'purchase' | 'return' | 'transfer';
export type FiscalDocStatus = 'draft' | 'authorized' | 'denied' | 'canceled' | 'contingency';
export type TaxType = 'icms' | 'ipi' | 'pis' | 'cofins' | 'iss' | 'cbs' | 'ibs';
export type CalculationMethod = 'manual' | 'automatic' | 'configured';
export type OcrDocType = 'invoice' | 'receipt' | 'bank_statement' | 'boleto';
export type OcrStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type UserAction = 'accepted' | 'rejected' | 'modified';
export type ModelType = 'cash_flow' | 'demand_forecast' | 'default_score';
export type OutboxStatus = 'pending' | 'published' | 'failed';
export type AuditAction = 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'emit';
export type UserRole = 'admin' | 'manager' | 'accountant' | 'user' | 'viewer';

export interface Company {
  id: string;
  legal_name: string;
  trade_name?: string;
  cnpj: string;
  state_registration?: string;
  municipal_registration?: string;
  tax_regime: TaxRegime;
  email?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  street: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  ibge_code?: string;
  created_at: string;
}

export interface CompanyAddress {
  id: string;
  company_id: string;
  address_id: string;
  address_type: AddressType;
  is_primary: boolean;
  created_at: string;
}

export interface Person {
  id: string;
  company_id: string;
  person_type: PersonType;
  legal_name: string;
  trade_name?: string;
  tax_id: string; // CNPJ or CPF
  person_role?: "customer" | "supplier" | "both";
  state_registration?: string; // Inscrição Estadual (IE)
  municipal_registration?: string; // Inscrição Municipal (IM)
  tax_regime?: TaxRegime | string; // Simples Nacional, Lucro Presumido, Lucro Real, MEI
  email?: string;
  phone?: string;
  contact_person?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  ibge_code?: string;
  credit_limit?: number;
  payment_terms?: string;
  pix_key?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  person_id: string;
  contact_type: ContactType;
  value: string;
  is_primary: boolean;
  created_at: string;
}

export interface PersonAddress {
  id: string;
  person_id: string;
  address_id: string;
  address_type: AddressType;
  is_primary: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  company_id: string;
  sku: string;
  gtin?: string; // Código de Barras EAN-13
  name: string;
  description?: string;
  category?: string; // Categoria / Grupo de Produto
  product_type: ProductType;
  unit_of_measure: string; // UN, KG, LT, CX, M, M2, M3, TON, PCT
  
  // Fiscal Data
  ncm_code?: string; // NCM (8 dígitos)
  cest_code?: string; // CEST
  origin?: string; // Origem (0-Nacional, 1-Estrangeira, etc)
  cfop?: string; // CFOP Padrão (5102, 6102)
  icms_rate?: number; // % ICMS
  pis_rate?: number; // % PIS
  cofins_rate?: number; // % COFINS
  ipi_rate?: number; // % IPI
  
  // Inventory Management
  stock_quantity?: number;
  min_stock_quantity?: number; // Ponto de Pedido
  max_stock_quantity?: number;
  location_rack?: string; // Corredor / Prateleira / Almoxarifado
  
  // Pricing
  cost_price: number;
  selling_price: number;
  min_selling_price?: number; // Preço Mínimo com Desconto
  
  weight_kg?: number;
  volume_m3?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductSupplierMapping {
  id: string;
  product_id: string;
  supplier_id: string;
  supplier_sku?: string;
  supplier_code?: string;
  last_purchase_price?: number;
  created_at: string;
}

export interface Warehouse {
  id: string;
  company_id: string;
  name: string;
  code?: string;
  type: WarehouseType;
  is_active: boolean;
  created_at: string;
}

export interface Lot {
  id: string;
  product_id: string;
  lot_number?: string;
  serial_number?: string;
  manufacture_date?: string;
  expiration_date?: string;
  received_at: string;
  supplier_id?: string;
  document_id?: string;
  created_at: string;
}

export interface InventoryBalance {
  id: string;
  product_id: string;
  warehouse_id: string;
  lot_id?: string;
  quantity: number;
  reserved_quantity: number;
  cost_price: number;
  last_cost_price?: number;
  valuation_method: ValuationMethod;
  last_updated: string;
}

export interface FinancialAccount {
  id: string;
  company_id: string;
  code: string;
  name: string;
  account_type: AccountType;
  parent_id?: string;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  company_id: string;
  name: string;
  parent_id?: string;
  type: 'revenue' | 'expense';
  created_at: string;
}

export interface CostCenter {
  id: string;
  company_id: string;
  name: string;
  code?: string;
  parent_id?: string;
  created_at: string;
}

export interface FinancialDocument {
  id: string;
  company_id: string;
  direction: Direction;
  document_type: DocumentType;
  person_id: string;
  document_number?: string;
  description?: string;
  issue_date: string;
  total_amount: number;
  category_id?: string;
  cost_center_id?: string;
  financial_account_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Installment {
  id: string;
  financial_document_id: string;
  installment_number: number;
  due_date: string;
  original_amount: number;
  current_amount: number;
  interest_rate?: number;
  late_fee?: number;
  discount_amount?: number;
  status: InstallmentStatus;
  recurrence_id?: string;
  approval_status: ApprovalStatus;
  approved_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Settlement {
  id: string;
  installment_id: string;
  payment_method: PaymentMethod;
  paid_amount: number;
  discount_given?: number;
  interest_charged?: number;
  fine_charged?: number;
  paid_date: string;
  bank_account_id?: string;
  authorization_code?: string;
  processor_response?: Record<string, any>;
  status: SettlementStatus;
  created_by?: string;
  created_at: string;
}

export interface Recurrence {
  id: string;
  company_id: string;
  frequency: RecurrenceFrequency;
  interval_count: number;
  start_date: string;
  end_date?: string;
  next_due_date?: string;
  is_active: boolean;
  created_at: string;
}

export interface BankAccount {
  id: string;
  company_id: string;
  bank_code: string;
  bank_name?: string;
  agency: string;
  agency_digit?: string;
  account_number: string;
  account_digit?: string;
  account_type: BankAccountType;
  account_name: string;
  holder_name?: string;
  holder_tax_id?: string;
  pix_key?: string;
  overdraft_limit?: number;
  monthly_fee?: number;
  balance: number;
  blocked_balance: number;
  available_balance: number;
  financial_account_id?: string;
  is_active: boolean;
  open_finance_consent_id?: string;
  open_finance_consent_expires?: string;
  open_finance_status?: "connected" | "disconnected" | "testing";
  last_sync_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BankTransaction {
  id: string;
  bank_account_id: string;
  external_id?: string;
  transaction_date: string;
  settlement_date?: string;
  amount: number; // positive = credit, negative = debit
  balance_after?: number;
  description: string;
  category_manual?: string;
  category_suggested?: string;
  confidence_score?: number;
  status: TransactionStatus;
  reconciled_at?: string;
  reconciled_by?: string;
  is_reconciled_auto?: boolean;
  created_at: string;
}

export interface ReconciliationMatch {
  id: string;
  bank_transaction_id: string;
  settlement_id: string;
  matched_amount: number;
  match_method: MatchMethod;
  confidence_score?: number;
  matched_by?: string;
  matched_at: string;
  created_at: string;
}

export interface ReconciliationRule {
  id: string;
  company_id: string;
  name: string;
  condition: Record<string, any>;
  matching_type: 'exact' | 'fuzzy' | 'amount_tolerance';
  tolerance_amount?: number;
  tolerance_percentage?: number;
  priority: number;
  is_active: boolean;
  created_at: string;
}

export interface FiscalDocument {
  id: string;
  company_id: string;
  document_type: FiscalDocType;
  document_number?: string;
  series?: string;
  access_key?: string; // 44 digits
  protocol?: string;
  issue_date: string;
  operation_type: FiscalDocOperation;
  status: FiscalDocStatus;
  person_id: string;
  shipping_address_id?: string;
  total_value: number;
  discount_value?: number;
  freight_value?: number;
  insurance_value?: number;
  expenses_value?: number;
  
  // Tax totals (snapshot)
  base_calc_icms?: number;
  icms_value?: number;
  base_calc_icms_st?: number;
  icms_st_value?: number;
  ipi_value?: number;
  pis_value?: number;
  cofins_value?: number;
  iss_value?: number;
  // Reforma Tributária
  cbs_value?: number;
  ibs_value?: number;
  
  tax_regime: TaxRegime;
  xml_content?: string;
  pdf_content?: string;
  signer_certificate?: string;
  cancellation_reason?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface FiscalDocumentItem {
  id: string;
  fiscal_document_id: string;
  product_id: string;
  line_number: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  discount_value?: number;
  product_code?: string;
  ncm_code?: string;
  cest_code?: string;
  cfop?: string;
  
  base_calc_icms_item?: number;
  icms_item_value?: number;
  ipi_item_value?: number;
  pis_item_value?: number;
  cofins_item_value?: number;
  cbs_item_value?: number;
  ibs_item_value?: number;
  created_at: string;
}

export interface TaxCalculation {
  id: string;
  document_item_id: string;
  tax_type: TaxType;
  calculation_method: CalculationMethod;
  tax_regime: TaxRegime;
  base_value: number;
  tax_rate: number;
  tax_value: number;
  deduction_value?: number;
  rule_version?: string;
  rule_parameters?: Record<string, any>;
  calculated_at: string;
  calculated_by?: string;
}

export interface OcrJob {
  id: string;
  company_id: string;
  file_name: string;
  file_path: string;
  file_hash?: string;
  mime_type?: string;
  document_type: OcrDocType;
  extracted_data?: Record<string, any>;
  confidence_score?: number;
  status: OcrStatus;
  error_message?: string;
  created_at: string;
  processed_at?: string;
}

export interface AiInferenceLog {
  id: string;
  company_id: string;
  entity_type: 'financial_document' | 'installment' | 'settlement' | 'bank_transaction' | 'product' | 'fiscal_document';
  entity_id?: string;
  model_name: string;
  input_data: Record<string, any>;
  output_data: Record<string, any>;
  confidence_score: number;
  created_at: string;
}

export interface AiDecision {
  id: string;
  company_id: string;
  inference_id: string;
  suggested_value: Record<string, any>;
  confidence_score: number;
  user_action: UserAction;
  user_correction?: Record<string, any>;
  user_id?: string;
  was_applied: boolean;
  applied_at?: string;
  improvement_metric?: number;
  created_at: string;
}

export interface PredictiveModelOutput {
  id: string;
  company_id: string;
  model_type: ModelType;
  forecast_date: string;
  predicted_value: number;
  actual_value?: number;
  prediction_interval_lower?: number;
  prediction_interval_upper?: number;
  features_used?: Record<string, any>;
  model_version?: string;
  accuracy_score?: number;
  created_at: string;
}

export interface OutboxEvent {
  id: string;
  event_type: string;
  aggregate_type: string;
  aggregate_id: string;
  payload: Record<string, any>;
  metadata?: Record<string, any>;
  status: OutboxStatus;
  retry_count: number;
  last_attempt_at?: string;
  created_at: string;
  published_at?: string;
}

export interface AuditLog {
  id: string;
  company_id: string;
  user_id: string;
  entity_type: string;
  entity_id: string;
  action: AuditAction;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  change_reason?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface AppUser {
  id: string;
  company_id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  permissions?: Record<string, any>;
  is_active: boolean;
  mfa_enabled: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}
