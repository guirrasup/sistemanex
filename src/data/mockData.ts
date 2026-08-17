import {
  Company, Address, CompanyAddress, Person, Contact, PersonAddress,
  Product, Warehouse, Lot, InventoryBalance, FinancialAccount, Category, CostCenter,
  FinancialDocument, Installment, Settlement, BankAccount, BankTransaction,
  ReconciliationMatch, ReconciliationRule, FiscalDocument, FiscalDocumentItem,
  TaxCalculation, OcrJob, AiInferenceLog, AiDecision, PredictiveModelOutput,
  OutboxEvent, AuditLog, AppUser
} from "../types";

export const mockCompanies: Company[] = [
  {
    id: "comp-001",
    legal_name: "NEXS Tecnologia e Soluções Logísticas S.A.",
    trade_name: "NEXS Enterprise",
    cnpj: "34.891.204/0001-92",
    state_registration: "110.492.381.112",
    municipal_registration: "8.912.401-0",
    tax_regime: "actual_profit", // Lucro Real
    email: "financeiro@nexs.com.br",
    phone: "(11) 4003-8920",
    is_active: true,
    created_at: "2025-01-15T08:00:00Z",
    updated_at: "2026-08-11T10:00:00Z"
  },
  {
    id: "comp-002",
    legal_name: "Alfa Indústria de Componentes Ltda",
    trade_name: "Alfa Tech",
    cnpj: "18.234.567/0001-44",
    state_registration: "254.891.002.990",
    municipal_registration: "3.201.554-1",
    tax_regime: "presumed_profit", // Lucro Presumido
    email: "contato@alfatech.com.br",
    phone: "(41) 3320-1100",
    is_active: true,
    created_at: "2025-03-20T09:30:00Z",
    updated_at: "2026-08-10T14:15:00Z"
  }
];

export const mockAddresses: Address[] = [
  {
    id: "addr-001",
    street: "Av. Paulista",
    number: "1100",
    complement: "Andar 18 - CJ 1802",
    neighborhood: "Bela Vista",
    city: "São Paulo",
    state: "SP",
    zip_code: "01310-100",
    country: "Brasil",
    ibge_code: "3550308",
    created_at: "2025-01-15T08:00:00Z"
  },
  {
    id: "addr-002",
    street: "Rua Marechal Deodoro",
    number: "450",
    neighborhood: "Centro",
    city: "Curitiba",
    state: "PR",
    zip_code: "80020-010",
    country: "Brasil",
    ibge_code: "4106902",
    created_at: "2025-03-20T09:30:00Z"
  }
];

export const mockCompanyAddresses: CompanyAddress[] = [
  {
    id: "caddr-001",
    company_id: "comp-001",
    address_id: "addr-001",
    address_type: "commercial",
    is_primary: true,
    created_at: "2025-01-15T08:00:00Z"
  }
];

export const mockPeople: Person[] = [
  {
    id: "pers-001",
    company_id: "comp-001",
    person_type: "company",
    legal_name: "TechSupply Equipamentos e Insumos Ltda",
    trade_name: "TechSupply",
    tax_id: "08.451.982/0001-10",
    person_role: "supplier",
    state_registration: "109.843.112.001",
    is_active: true,
    created_at: "2025-02-01T10:00:00Z",
    updated_at: "2026-08-01T12:00:00Z"
  },
  {
    id: "pers-002",
    company_id: "comp-001",
    person_type: "company",
    legal_name: "Global Logistics Importadora e Distribuidora S.A.",
    trade_name: "GlobalLog",
    tax_id: "45.123.890/0001-88",
    person_role: "supplier",
    state_registration: "112.900.450.887",
    is_active: true,
    created_at: "2025-02-10T11:20:00Z",
    updated_at: "2026-08-05T15:00:00Z"
  },
  {
    id: "pers-003",
    company_id: "comp-001",
    person_type: "company",
    legal_name: "Rede de Postos Shell - Combustíveis Central",
    trade_name: "Posto Shell SP",
    tax_id: "12.345.678/0001-90",
    person_role: "supplier",
    is_active: true,
    created_at: "2025-03-01T14:00:00Z",
    updated_at: "2026-08-08T09:00:00Z"
  },
  {
    id: "pers-004",
    company_id: "comp-001",
    person_type: "company",
    legal_name: "Supermercados & Varejo Brasil Ltda",
    trade_name: "Varejo Brasil",
    tax_id: "98.765.432/0001-11",
    person_role: "customer",
    is_active: true,
    created_at: "2025-04-12T16:00:00Z",
    updated_at: "2026-08-11T11:00:00Z"
  }
];

export const mockUsers: AppUser[] = [
  {
    id: "user-001",
    company_id: "comp-001",
    email: "carlos.silva@nexs.com.br",
    password_hash: "$2a$10$e812...",
    first_name: "Carlos",
    last_name: "Silva",
    role: "admin",
    is_active: true,
    mfa_enabled: true,
    last_login_at: "2026-08-11T17:45:00Z",
    created_at: "2025-01-15T08:00:00Z",
    updated_at: "2026-08-11T17:45:00Z"
  },
  {
    id: "user-002",
    company_id: "comp-001",
    email: "mariana.costa@nexs.com.br",
    password_hash: "$2a$10$p902...",
    first_name: "Mariana",
    last_name: "Costa",
    role: "accountant",
    is_active: true,
    mfa_enabled: false,
    last_login_at: "2026-08-11T16:30:00Z",
    created_at: "2025-02-01T09:00:00Z",
    updated_at: "2026-08-11T16:30:00Z"
  }
];

export const mockFinancialAccounts: FinancialAccount[] = [
  { id: "fa-101", company_id: "comp-001", code: "1.1.01", name: "Caixa Geral e Disponibilidades", account_type: "asset", is_active: true, created_at: "2025-01-15T08:00:00Z" },
  { id: "fa-102", company_id: "comp-001", code: "1.1.02", name: "Contas Bancárias Movimento", account_type: "asset", is_active: true, created_at: "2025-01-15T08:00:00Z" },
  { id: "fa-201", company_id: "comp-001", code: "2.1.01", name: "Fornecedores Nacionais a Pagar", account_type: "liability", is_active: true, created_at: "2025-01-15T08:00:00Z" },
  { id: "fa-301", company_id: "comp-001", code: "3.1.01", name: "Receita de Vendas de Produtos e Serviços", account_type: "revenue", is_active: true, created_at: "2025-01-15T08:00:00Z" },
  { id: "fa-401", company_id: "comp-001", code: "4.1.01", name: "Despesas Operacionais e Administrativas", account_type: "expense", is_active: true, created_at: "2025-01-15T08:00:00Z" }
];

export const mockCategories: Category[] = [
  { id: "cat-001", company_id: "comp-001", name: "Vendas de Hardware & Licenças", type: "revenue", created_at: "2025-01-15T08:00:00Z" },
  { id: "cat-002", company_id: "comp-001", name: "Serviços de Consultoria e Suporte", type: "revenue", created_at: "2025-01-15T08:00:00Z" },
  { id: "cat-003", company_id: "comp-001", name: "Aquisição de Insumos e Mercadorias", type: "expense", created_at: "2025-01-15T08:00:00Z" },
  { id: "cat-004", company_id: "comp-001", name: "Frota, Combustível e Transporte", type: "expense", created_at: "2025-01-15T08:00:00Z" },
  { id: "cat-005", company_id: "comp-001", name: "Infraestrutura Cloud e Software", type: "expense", created_at: "2025-01-15T08:00:00Z" }
];

export const mockCostCenters: CostCenter[] = [
  { id: "cc-001", company_id: "comp-001", code: "CC-100", name: "Diretoria e Operações SP", created_at: "2025-01-15T08:00:00Z" },
  { id: "cc-002", company_id: "comp-001", code: "CC-200", name: "Engenharia de Software & IA", created_at: "2025-01-15T08:00:00Z" },
  { id: "cc-003", company_id: "comp-001", code: "CC-300", name: "Logística & Suprimentos", created_at: "2025-01-15T08:00:00Z" }
];

export const mockBankAccounts: BankAccount[] = [
  {
    id: "bank-001",
    company_id: "comp-001",
    bank_code: "341", // Itaú
    agency: "0912",
    account_number: "48201",
    account_digit: "8",
    account_type: "checking",
    account_name: "Itaú Unibanco - Conta Movimento Principal",
    balance: 284500.00,
    blocked_balance: 12000.00,
    available_balance: 272500.00,
    financial_account_id: "fa-102",
    is_active: true,
    open_finance_consent_id: "of-consent-98124",
    last_sync_at: "2026-08-11T17:30:00Z",
    created_at: "2025-01-15T08:00:00Z",
    updated_at: "2026-08-11T17:30:00Z"
  },
  {
    id: "bank-002",
    company_id: "comp-001",
    bank_code: "237", // Bradesco
    agency: "3201",
    account_number: "99102",
    account_digit: "3",
    account_type: "checking",
    account_name: "Bradesco Corporate - Liquidação & Custódia",
    balance: 142000.50,
    blocked_balance: 0.00,
    available_balance: 142000.50,
    financial_account_id: "fa-102",
    is_active: true,
    last_sync_at: "2026-08-11T16:00:00Z",
    created_at: "2025-02-01T09:00:00Z",
    updated_at: "2026-08-11T16:00:00Z"
  }
];

export const mockFinancialDocuments: FinancialDocument[] = [
  {
    id: "findoc-001",
    company_id: "comp-001",
    direction: "receivable",
    document_type: "invoice",
    person_id: "pers-004", // Varejo Brasil
    document_number: "NF-9021",
    description: "Fornecimento de Servidores NEXS Edge & Licenciamento Anual",
    issue_date: "2026-08-01",
    total_amount: 150000.00,
    category_id: "cat-001",
    cost_center_id: "cc-002",
    financial_account_id: "fa-301",
    created_by: "user-001",
    created_at: "2026-08-01T10:00:00Z",
    updated_at: "2026-08-01T10:00:00Z"
  },
  {
    id: "findoc-002",
    company_id: "comp-001",
    direction: "payable",
    document_type: "invoice",
    person_id: "pers-001", // TechSupply
    document_number: "NF-48190",
    description: "Aquisição de Lote de Microprocessadores e Módulos IoT",
    issue_date: "2026-07-25",
    total_amount: 85000.00,
    category_id: "cat-003",
    cost_center_id: "cc-003",
    financial_account_id: "fa-201",
    created_by: "user-002",
    created_at: "2026-07-25T14:30:00Z",
    updated_at: "2026-08-05T09:00:00Z"
  },
  {
    id: "findoc-003",
    company_id: "comp-001",
    direction: "payable",
    document_type: "purchase_order",
    person_id: "pers-003", // Posto Shell
    document_number: "REC-9912",
    description: "Abastecimento da Frota de Entregas - Mês de Agosto",
    issue_date: "2026-08-10",
    total_amount: 4250.00,
    category_id: "cat-004",
    cost_center_id: "cc-003",
    financial_account_id: "fa-401",
    created_by: "user-001",
    created_at: "2026-08-10T16:00:00Z",
    updated_at: "2026-08-10T16:00:00Z"
  }
];

export const mockInstallments: Installment[] = [
  {
    id: "inst-001",
    financial_document_id: "findoc-001",
    installment_number: 1,
    due_date: "2026-08-10",
    original_amount: 75000.00,
    current_amount: 0.00, // fully paid
    status: "paid",
    approval_status: "approved",
    approved_by: "user-001",
    created_at: "2026-08-01T10:00:00Z",
    updated_at: "2026-08-10T15:20:00Z"
  },
  {
    id: "inst-002",
    financial_document_id: "findoc-001",
    installment_number: 2,
    due_date: "2026-09-10",
    original_amount: 75000.00,
    current_amount: 75000.00,
    status: "pending",
    approval_status: "approved",
    approved_by: "user-001",
    created_at: "2026-08-01T10:00:00Z",
    updated_at: "2026-08-01T10:00:00Z"
  },
  {
    id: "inst-003",
    financial_document_id: "findoc-002",
    installment_number: 1,
    due_date: "2026-08-05", // overdue
    original_amount: 42500.00,
    current_amount: 42500.00,
    interest_rate: 0.02,
    late_fee: 500.00,
    status: "overdue",
    approval_status: "approved",
    approved_by: "user-001",
    created_at: "2026-07-25T14:30:00Z",
    updated_at: "2026-08-06T00:00:00Z"
  },
  {
    id: "inst-004",
    financial_document_id: "findoc-002",
    installment_number: 2,
    due_date: "2026-08-25",
    original_amount: 42500.00,
    current_amount: 42500.00,
    status: "pending",
    approval_status: "pending",
    created_at: "2026-07-25T14:30:00Z",
    updated_at: "2026-07-25T14:30:00Z"
  },
  {
    id: "inst-005",
    financial_document_id: "findoc-003",
    installment_number: 1,
    due_date: "2026-08-11",
    original_amount: 4250.00,
    current_amount: 4250.00,
    status: "pending",
    approval_status: "approved",
    approved_by: "user-002",
    created_at: "2026-08-10T16:00:00Z",
    updated_at: "2026-08-10T16:00:00Z"
  }
];

export const mockSettlements: Settlement[] = [
  {
    id: "settle-001",
    installment_id: "inst-001",
    payment_method: "pix",
    paid_amount: 75000.00,
    discount_given: 0,
    interest_charged: 0,
    fine_charged: 0,
    paid_date: "2026-08-10",
    bank_account_id: "bank-001",
    authorization_code: "PIX-E34891204-20260810-0912",
    status: "completed",
    created_by: "user-001",
    created_at: "2026-08-10T15:20:00Z"
  }
];

export const mockBankTransactions: BankTransaction[] = [
  {
    id: "tx-1001",
    bank_account_id: "bank-001",
    external_id: "EXT-341-20260810-9012",
    transaction_date: "2026-08-10",
    settlement_date: "2026-08-10",
    amount: 75000.00, // Credit
    balance_after: 284500.00,
    description: "PIX RECEBIDO VAREJO BRASIL - REF NF 9021 PARC 1",
    category_suggested: "Vendas de Hardware & Licenças",
    confidence_score: 0.98,
    status: "reconciled",
    reconciled_at: "2026-08-10T15:25:00Z",
    reconciled_by: "user-001",
    is_reconciled_auto: true,
    created_at: "2026-08-10T15:00:00Z"
  },
  {
    id: "tx-1002",
    bank_account_id: "bank-001",
    external_id: "EXT-341-20260811-0012",
    transaction_date: "2026-08-11",
    amount: -4250.00, // Debit
    balance_after: 280250.00,
    description: "DEBITO CONVENIENCIA POSTO SHELL SP 4250",
    category_suggested: "Frota, Combustível e Transporte",
    confidence_score: 0.91,
    status: "unmatched", // Pending reconciliation
    created_at: "2026-08-11T09:10:00Z"
  },
  {
    id: "tx-1003",
    bank_account_id: "bank-001",
    external_id: "EXT-341-20260811-0089",
    transaction_date: "2026-08-11",
    amount: -42500.00, // Debit (matches overdue installment 3)
    balance_after: 237750.00,
    description: "PAGTO FORNECEDOR TECHSUPPLY EQUIPAMENTOS",
    category_suggested: "Aquisição de Insumos e Mercadorias",
    confidence_score: 0.94,
    status: "unmatched",
    created_at: "2026-08-11T14:00:00Z"
  }
];

export const mockReconciliationMatches: ReconciliationMatch[] = [
  {
    id: "rmatch-001",
    bank_transaction_id: "tx-1001",
    settlement_id: "settle-001",
    matched_amount: 75000.00,
    match_method: "exact",
    confidence_score: 0.98,
    matched_by: "user-001",
    matched_at: "2026-08-10T15:25:00Z",
    created_at: "2026-08-10T15:25:00Z"
  }
];

export const mockReconciliationRules: ReconciliationRule[] = [
  {
    id: "rule-001",
    company_id: "comp-001",
    name: "Match Exato PIX por CNPJ e Valor",
    condition: { same_amount: true, date_window_days: 2 },
    matching_type: "exact",
    priority: 1,
    is_active: true,
    created_at: "2025-01-15T08:00:00Z"
  },
  {
    id: "rule-002",
    company_id: "comp-001",
    name: "Match Tolerante de Juros e Tarifa (Até R$ 50,00)",
    condition: { date_window_days: 5 },
    matching_type: "amount_tolerance",
    tolerance_amount: 50.00,
    priority: 2,
    is_active: true,
    created_at: "2025-01-15T08:00:00Z"
  }
];

export const mockProducts: Product[] = [
  {
    id: "prod-001",
    company_id: "comp-001",
    sku: "NEXS-SRV-EDGE01",
    name: "Servidor NEXS Edge AI Industrial v2",
    description: "Servidor embarcado com aceleração de inferência para visão computacional",
    product_type: "product",
    ncm_code: "8471.50.10",
    cest_code: "21.001.00",
    unit_of_measure: "UN",
    stock_quantity: 12,
    cost_price: 8500.00,
    selling_price: 14200.00,
    weight_kg: 4.5,
    is_active: true,
    created_at: "2025-02-01T10:00:00Z",
    updated_at: "2026-08-01T10:00:00Z"
  },
  {
    id: "prod-002",
    company_id: "comp-001",
    sku: "NEXS-MOD-IOT02",
    name: "Módulo Sensor Telemetria LoRaWAN/5G",
    description: "Módulo transceptor para monitoramento de frotas e estoques",
    product_type: "product",
    ncm_code: "8517.62.77",
    unit_of_measure: "UN",
    stock_quantity: 45,
    cost_price: 280.00,
    selling_price: 550.00,
    weight_kg: 0.25,
    is_active: true,
    created_at: "2025-02-05T11:00:00Z",
    updated_at: "2026-08-01T10:00:00Z"
  }
];

export const mockWarehouses: Warehouse[] = [
  {
    id: "wh-001",
    company_id: "comp-001",
    name: "Depósito Central São Paulo",
    code: "DEP-SP01",
    type: "physical",
    is_active: true,
    created_at: "2025-01-15T08:00:00Z"
  },
  {
    id: "wh-002",
    company_id: "comp-001",
    name: "Armazém Consignado Varejo SP",
    code: "CONS-SP02",
    type: "consignment",
    is_active: true,
    created_at: "2025-03-01T10:00:00Z"
  }
];

export const mockLots: Lot[] = [
  {
    id: "lot-001",
    product_id: "prod-001",
    lot_number: "LOT-2026-08A",
    serial_number: "SN-NEXS-99210",
    manufacture_date: "2026-07-15",
    expiration_date: "2031-07-15",
    received_at: "2026-07-25T14:30:00Z",
    supplier_id: "pers-001",
    created_at: "2026-07-25T14:30:00Z"
  }
];

export const mockInventoryBalances: InventoryBalance[] = [
  {
    id: "inv-001",
    product_id: "prod-001",
    warehouse_id: "wh-001",
    lot_id: "lot-001",
    quantity: 42,
    reserved_quantity: 5,
    cost_price: 3200.00,
    last_cost_price: 3100.00,
    valuation_method: "fifo",
    last_updated: "2026-08-01T10:00:00Z"
  },
  {
    id: "inv-002",
    product_id: "prod-002",
    warehouse_id: "wh-001",
    quantity: 280,
    reserved_quantity: 20,
    cost_price: 185.00,
    last_cost_price: 180.00,
    valuation_method: "average",
    last_updated: "2026-08-05T11:00:00Z"
  }
];

export const mockFiscalDocuments: FiscalDocument[] = [
  {
    id: "fisc-001",
    company_id: "comp-001",
    document_type: "nf_e",
    document_number: "000009021",
    series: "1",
    access_key: "35260834891204000192550010000090211004819201",
    protocol: "135260098124012",
    issue_date: "2026-08-01T10:00:00Z",
    operation_type: "sales",
    status: "authorized",
    person_id: "pers-004", // Varejo Brasil
    total_value: 150000.00,
    discount_value: 0,
    freight_value: 1200.00,
    insurance_value: 0,
    expenses_value: 0,
    base_calc_icms: 150000.00,
    icms_value: 27000.00, // 18% ICMS
    pis_value: 2475.00,  // 1.65%
    cofins_value: 11400.00, // 7.6%
    cbs_value: 13200.00, // Reforma Tributária CBS (8.8%)
    ibs_value: 26500.00, // Reforma Tributária IBS (17.7%)
    tax_regime: "actual_profit",
    signer_certificate: "A1_NEXS_CERT_EXP2027",
    created_by: "user-001",
    created_at: "2026-08-01T10:00:00Z",
    updated_at: "2026-08-01T10:02:00Z"
  }
];

export const mockFiscalDocumentItems: FiscalDocumentItem[] = [
  {
    id: "fitem-001",
    fiscal_document_id: "fisc-001",
    product_id: "prod-001",
    line_number: 1,
    quantity: 10,
    unit_price: 15000.00,
    total_price: 150000.00,
    ncm_code: "8471.50.10",
    cfop: "5102",
    base_calc_icms_item: 150000.00,
    icms_item_value: 27000.00,
    pis_item_value: 2475.00,
    cofins_item_value: 11400.00,
    cbs_item_value: 13200.00,
    ibs_item_value: 26500.00,
    created_at: "2026-08-01T10:00:00Z"
  }
];

export const mockTaxCalculations: TaxCalculation[] = [
  {
    id: "tax-001",
    document_item_id: "fitem-001",
    tax_type: "cbs",
    calculation_method: "configured",
    tax_regime: "actual_profit",
    base_value: 150000.00,
    tax_rate: 0.088,
    tax_value: 13200.00,
    rule_version: "NEXS-TAX-REFORMA-2026.1",
    calculated_at: "2026-08-01T10:00:00Z",
    calculated_by: "user-001"
  },
  {
    id: "tax-002",
    document_item_id: "fitem-001",
    tax_type: "ibs",
    calculation_method: "configured",
    tax_regime: "actual_profit",
    base_value: 150000.00,
    tax_rate: 0.177,
    tax_value: 26500.00,
    rule_version: "NEXS-TAX-REFORMA-2026.1",
    calculated_at: "2026-08-01T10:00:00Z",
    calculated_by: "user-001"
  }
];

export const mockOcrJobs: OcrJob[] = [
  {
    id: "ocr-001",
    company_id: "comp-001",
    file_name: "cupom_posto_shell_agosto.pdf",
    file_path: "/uploads/ocr/cupom_posto_shell_agosto.pdf",
    mime_type: "application/pdf",
    document_type: "receipt",
    extracted_data: {
      legal_name: "Posto Shell SP Ltda",
      total_value: 4250.00,
      document_number: "REC-9912",
      suggested_category: "Frota, Combustível e Transporte"
    },
    confidence_score: 0.96,
    status: "completed",
    created_at: "2026-08-10T15:50:00Z",
    processed_at: "2026-08-10T15:50:05Z"
  }
];

export const mockAiInferenceLogs: AiInferenceLog[] = [
  {
    id: "inf-101",
    company_id: "comp-001",
    entity_type: "bank_transaction",
    entity_id: "tx-1002",
    model_name: "gemini-2.5-flash-reconcile-v2",
    input_data: { description: "DEBITO CONVENIENCIA POSTO SHELL SP 4250", amount: -4250.00 },
    output_data: { matched_installment_id: "inst-005", category: "Frota, Combustível e Transporte" },
    confidence_score: 0.91,
    created_at: "2026-08-11T09:15:00Z"
  }
];

export const mockAiDecisions: AiDecision[] = [
  {
    id: "dec-101",
    company_id: "comp-001",
    inference_id: "inf-101",
    suggested_value: { matched_installment_id: "inst-005", category: "Frota, Combustível e Transporte" },
    confidence_score: 0.91,
    user_action: "accepted",
    user_id: "user-001",
    was_applied: true,
    applied_at: "2026-08-11T10:00:00Z",
    improvement_metric: 1.0,
    created_at: "2026-08-11T09:20:00Z"
  }
];

export const mockPredictiveModelOutputs: PredictiveModelOutput[] = [
  {
    id: "pred-001",
    company_id: "comp-001",
    model_type: "cash_flow",
    forecast_date: "2026-09-01",
    predicted_value: 382500.00,
    prediction_interval_lower: 350000.00,
    prediction_interval_upper: 410000.00,
    features_used: { historical_conversion: 0.94, recurring_revenue: 120000 },
    model_version: "NEXS-PREDICT-CASH-v3",
    accuracy_score: 0.95,
    created_at: "2026-08-11T08:00:00Z"
  }
];

export const mockOutboxEvents: OutboxEvent[] = [
  {
    id: "evt-9001",
    event_type: "fiscal_document.issued",
    aggregate_type: "FiscalDocument",
    aggregate_id: "fisc-001",
    payload: { document_number: "000009021", total_value: 150000.00, status: "authorized" },
    status: "published",
    retry_count: 0,
    created_at: "2026-08-01T10:02:00Z",
    published_at: "2026-08-01T10:02:01Z"
  },
  {
    id: "evt-9002",
    event_type: "settlement.created",
    aggregate_type: "Settlement",
    aggregate_id: "settle-001",
    payload: { installment_id: "inst-001", paid_amount: 75000.00, payment_method: "pix" },
    status: "published",
    retry_count: 0,
    created_at: "2026-08-10T15:20:00Z",
    published_at: "2026-08-10T15:20:02Z"
  },
  {
    id: "evt-9003",
    event_type: "reconciliation.completed",
    aggregate_type: "ReconciliationMatch",
    aggregate_id: "rmatch-001",
    payload: { bank_transaction_id: "tx-1001", settlement_id: "settle-001", amount: 75000.00 },
    status: "published",
    retry_count: 0,
    created_at: "2026-08-10T15:25:00Z",
    published_at: "2026-08-10T15:25:01Z"
  }
];

export const mockAuditLogs: AuditLog[] = [
  {
    id: "audit-001",
    company_id: "comp-001",
    user_id: "user-001",
    entity_type: "FiscalDocument",
    entity_id: "fisc-001",
    action: "emit",
    old_values: { status: "draft" },
    new_values: { status: "authorized", access_key: "35260834891204000192550010000090211004819201" },
    change_reason: "Emissão e autorização de NF-e junto à SEFAZ SP",
    ip_address: "187.102.44.12",
    user_agent: "Mozilla/5.0 NEXS Web App v2.4",
    created_at: "2026-08-01T10:02:00Z"
  },
  {
    id: "audit-002",
    company_id: "comp-001",
    user_id: "user-001",
    entity_type: "Settlement",
    entity_id: "settle-001",
    action: "create",
    new_values: { paid_amount: 75000.00, payment_method: "pix", installment_id: "inst-001" },
    change_reason: "Liquidação de parcela de recebimento via PIX",
    ip_address: "187.102.44.12",
    user_agent: "Mozilla/5.0 NEXS Web App v2.4",
    created_at: "2026-08-10T15:20:00Z"
  }
];
