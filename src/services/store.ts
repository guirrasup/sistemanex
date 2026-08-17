import {
  Company, Person, Product, Warehouse, InventoryBalance,
  FinancialAccount, Category, CostCenter, FinancialDocument, Installment,
  Settlement, BankAccount, BankTransaction, ReconciliationMatch,
  FiscalDocument, FiscalDocumentItem, TaxCalculation, OcrJob,
  AiInferenceLog, AiDecision, PredictiveModelOutput, OutboxEvent,
  AuditLog, AppUser, Direction, PaymentMethod, MatchMethod, FiscalDocType, Lot
} from "../types";

import {
  mockCompanies, mockPeople, mockProducts, mockWarehouses, mockInventoryBalances,
  mockFinancialAccounts, mockCategories, mockCostCenters, mockFinancialDocuments,
  mockInstallments, mockSettlements, mockBankAccounts, mockBankTransactions,
  mockReconciliationMatches, mockFiscalDocuments, mockFiscalDocumentItems,
  mockTaxCalculations, mockOcrJobs, mockAiInferenceLogs, mockAiDecisions,
  mockPredictiveModelOutputs, mockOutboxEvents, mockAuditLogs, mockUsers, mockLots
} from "../data/mockData";

export class NexsStore {
  private static instance: NexsStore;

  public activeCompanyId: string = "comp-001";
  public currentUser: AppUser = mockUsers[0];

  public companies: Company[] = [...mockCompanies];
  public people: Person[] = [...mockPeople];
  public products: Product[] = [...mockProducts];
  public warehouses: Warehouse[] = [...mockWarehouses];
  public lots: Lot[] = [...mockLots];
  public inventoryBalances: InventoryBalance[] = [...mockInventoryBalances];
  public financialAccounts: FinancialAccount[] = [...mockFinancialAccounts];
  public categories: Category[] = [...mockCategories];
  public costCenters: CostCenter[] = [...mockCostCenters];
  public financialDocuments: FinancialDocument[] = [...mockFinancialDocuments];
  public installments: Installment[] = [...mockInstallments];
  public settlements: Settlement[] = [...mockSettlements];
  public bankAccounts: BankAccount[] = [...mockBankAccounts];
  public bankTransactions: BankTransaction[] = [...mockBankTransactions];
  public reconciliationMatches: ReconciliationMatch[] = [...mockReconciliationMatches];
  public fiscalDocuments: FiscalDocument[] = [...mockFiscalDocuments];
  public fiscalDocumentItems: FiscalDocumentItem[] = [...mockFiscalDocumentItems];
  public taxCalculations: TaxCalculation[] = [...mockTaxCalculations];
  public ocrJobs: OcrJob[] = [...mockOcrJobs];
  public aiInferenceLogs: AiInferenceLog[] = [...mockAiInferenceLogs];
  public aiDecisions: AiDecision[] = [...mockAiDecisions];
  public predictiveOutputs: PredictiveModelOutput[] = [...mockPredictiveModelOutputs];
  public outboxEvents: OutboxEvent[] = [...mockOutboxEvents];
  public auditLogs: AuditLog[] = [...mockAuditLogs];

  private listeners: Array<() => void> = [];

  private constructor() {}

  public static getInstance(): NexsStore {
    if (!NexsStore.instance) {
      NexsStore.instance = new NexsStore();
    }
    return NexsStore.instance;
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  public getActiveCompany(): Company {
    return this.companies.find(c => c.id === this.activeCompanyId) || this.companies[0];
  }

  public setActiveCompany(companyId: string) {
    this.activeCompanyId = companyId;
    this.notify();
  }

  // --- EVENT BUS & OUTBOX EMITTER ---
  public emitOutboxEvent(eventType: string, aggregateType: string, aggregateId: string, payload: Record<string, any>) {
    const newEvent: OutboxEvent = {
      id: "evt-" + Math.floor(100000 + Math.random() * 900000),
      event_type: eventType,
      aggregate_type: aggregateType,
      aggregate_id: aggregateId,
      payload,
      status: "pending",
      retry_count: 0,
      created_at: new Date().toISOString()
    };
    this.outboxEvents.unshift(newEvent);

    // Simulate async Outbox Worker publishing
    setTimeout(() => {
      newEvent.status = "published";
      newEvent.published_at = new Date().toISOString();
      this.notify();
    }, 800);

    this.notify();
  }

  // --- AUDIT LOG EMITTER ---
  public logAudit(entityType: string, entityId: string, action: 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'emit', oldValues?: Record<string, any>, newValues?: Record<string, any>, changeReason?: string) {
    const newLog: AuditLog = {
      id: "audit-" + Math.floor(100000 + Math.random() * 900000),
      company_id: this.activeCompanyId,
      user_id: this.currentUser.id,
      entity_type: entityType,
      entity_id: entityId,
      action,
      old_values: oldValues,
      new_values: newValues,
      change_reason: changeReason || `Ação ${action} executada em ${entityType}`,
      ip_address: "187.102.44.12",
      user_agent: "NEXS Web Client",
      created_at: new Date().toISOString()
    };
    this.auditLogs.unshift(newLog);
    this.notify();
  }

  // --- FINANCIAL & INSTALLMENT MANAGEMENT ---
  public createFinancialDocument(data: {
    direction: Direction;
    person_id: string;
    document_number: string;
    description: string;
    issue_date: string;
    total_amount: number;
    category_id?: string;
    cost_center_id?: string;
    financial_account_id?: string;
    installment_count: number;
    first_due_date: string;
  }) {
    const docId = "findoc-" + Math.floor(100000 + Math.random() * 900000);
    const newDoc: FinancialDocument = {
      id: docId,
      company_id: this.activeCompanyId,
      direction: data.direction,
      document_type: "invoice",
      person_id: data.person_id,
      document_number: data.document_number,
      description: data.description,
      issue_date: data.issue_date,
      total_amount: data.total_amount,
      category_id: data.category_id,
      cost_center_id: data.cost_center_id,
      financial_account_id: data.financial_account_id,
      created_by: this.currentUser.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.financialDocuments.unshift(newDoc);

    // Generate Installments
    const perAmount = Number((data.total_amount / data.installment_count).toFixed(2));
    const firstDate = new Date(data.first_due_date);

    for (let i = 1; i <= data.installment_count; i++) {
      const dueDate = new Date(firstDate);
      dueDate.setMonth(dueDate.getMonth() + (i - 1));

      const installment: Installment = {
        id: "inst-" + Math.floor(100000 + Math.random() * 900000),
        financial_document_id: docId,
        installment_number: i,
        due_date: dueDate.toISOString().split("T")[0],
        original_amount: i === data.installment_count ? Number((data.total_amount - (perAmount * (data.installment_count - 1))).toFixed(2)) : perAmount,
        current_amount: i === data.installment_count ? Number((data.total_amount - (perAmount * (data.installment_count - 1))).toFixed(2)) : perAmount,
        status: "pending",
        approval_status: "approved",
        approved_by: this.currentUser.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      this.installments.unshift(installment);
    }

    this.logAudit("FinancialDocument", docId, "create", undefined, newDoc, "Inclusão de Título Financeiro");
    this.emitOutboxEvent("financial_document.created", "FinancialDocument", docId, newDoc);
    this.notify();
    return newDoc;
  }

  // --- SETTLEMENT STATE APPLICATOR (Business rules validated on Backend financial.service.ts) ---
  public applySettlementToStore(data: {
    installment_id: string;
    payment_method?: PaymentMethod;
    paid_amount: number;
    paid_date?: string;
    bank_account_id?: string;
  }) {
    const inst = this.installments.find(i => i.id === data.installment_id);
    if (!inst) return null;

    const settleId = "settle-" + Math.floor(100000 + Math.random() * 900000);
    const settlement: Settlement = {
      id: settleId,
      installment_id: data.installment_id,
      payment_method: data.payment_method || "pix",
      paid_amount: data.paid_amount,
      discount_given: 0,
      interest_charged: 0,
      paid_date: data.paid_date || new Date().toISOString().split("T")[0],
      bank_account_id: data.bank_account_id,
      authorization_code: "AUT-" + Math.floor(100000 + Math.random() * 900000),
      status: "completed",
      created_by: this.currentUser.id,
      created_at: new Date().toISOString()
    };
    this.settlements.unshift(settlement);

    // Update Installment Balance & Status
    const newCurrent = Number((inst.current_amount - data.paid_amount).toFixed(2));
    inst.current_amount = Math.max(0, newCurrent);
    inst.status = inst.current_amount === 0 ? "paid" : "partially_paid";
    inst.updated_at = new Date().toISOString();

    // Update Bank Account Balance
    if (data.bank_account_id) {
      const bank = this.bankAccounts.find(b => b.id === data.bank_account_id);
      if (bank) {
        const doc = this.financialDocuments.find(d => d.id === inst.financial_document_id);
        const isReceivable = doc?.direction === "receivable";
        if (isReceivable) {
          bank.balance += data.paid_amount;
          bank.available_balance += data.paid_amount;
        } else {
          bank.balance -= data.paid_amount;
          bank.available_balance -= data.paid_amount;
        }
        bank.updated_at = new Date().toISOString();
      }
    }

    this.logAudit("Settlement", settleId, "create", undefined, settlement, "Baixa de Parcela Efetuada via Servidor");
    this.notify();
    return settlement;
  }

  // --- N:N RECONCILIATION MATCHING (BANK-002 & BANK-003) ---
  public matchReconciliation(bankTxId: string, settlementId: string, matchedAmount: number, method: MatchMethod = "manual") {
    const tx = this.bankTransactions.find(t => t.id === bankTxId);
    if (!tx) throw new Error("Transação bancária não encontrada");

    const settle = this.settlements.find(s => s.id === settlementId);
    if (!settle) throw new Error("Liquidação/Título não encontrado");

    // BANK-002: Sum of matches <= abs(bankTx.amount)
    const existingTxMatches = this.reconciliationMatches.filter(m => m.bank_transaction_id === bankTxId);
    const currentMatchedTxSum = existingTxMatches.reduce((acc, m) => acc + m.matched_amount, 0);
    const txTotal = Math.abs(tx.amount);

    if (currentMatchedTxSum + matchedAmount > txTotal + 0.01) {
      throw new Error(`BANK-002 Violada: Soma das conciliações (R$ ${(currentMatchedTxSum + matchedAmount).toFixed(2)}) excede o valor da transação extrato (R$ ${txTotal.toFixed(2)}).`);
    }

    // BANK-003: Sum of matches <= settle.paid_amount
    const existingSettleMatches = this.reconciliationMatches.filter(m => m.settlement_id === settlementId);
    const currentMatchedSettleSum = existingSettleMatches.reduce((acc, m) => acc + m.matched_amount, 0);

    if (currentMatchedSettleSum + matchedAmount > settle.paid_amount + 0.01) {
      throw new Error(`BANK-003 Violada: Soma das conciliações excede o valor da liquidação (R$ ${settle.paid_amount.toFixed(2)}).`);
    }

    const matchId = "rmatch-" + Math.floor(100000 + Math.random() * 900000);
    const match: ReconciliationMatch = {
      id: matchId,
      bank_transaction_id: bankTxId,
      settlement_id: settlementId,
      matched_amount: matchedAmount,
      match_method: method,
      confidence_score: method === "exact" ? 0.99 : 0.92,
      matched_by: this.currentUser.id,
      matched_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    this.reconciliationMatches.unshift(match);

    // Check if Bank Transaction is fully matched
    if (currentMatchedTxSum + matchedAmount >= txTotal - 0.01) {
      tx.status = "reconciled";
      tx.reconciled_at = new Date().toISOString();
      tx.reconciled_by = this.currentUser.id;
      tx.is_reconciled_auto = method !== "manual";
    }

    this.logAudit("ReconciliationMatch", matchId, "create", undefined, match, "Conciliação N:N realizada");
    this.emitOutboxEvent("reconciliation.completed", "ReconciliationMatch", matchId, match);
    this.notify();
    return match;
  }

  // --- FISCAL DOCUMENT ISSUANCE WITH TAX ENGINE & FISC-001 IMMUTABILITY ---
  public issueFiscalDocument(data: {
    document_type: FiscalDocType;
    person_id: string;
    items: Array<{ product_id: string; quantity: number; unit_price: number }>;
  }) {
    const docId = "fisc-" + Math.floor(100000 + Math.random() * 900000);
    const accessKey = "352608" + this.getActiveCompany().cnpj.replace(/\D/g, "") + "55001" + Math.floor(100000000 + Math.random() * 900000000) + "1";

    let grandTotal = 0;
    let totalICMS = 0;
    let totalPIS = 0;
    let totalCOFINS = 0;
    let totalCBS = 0; // Reforma tributária
    let totalIBS = 0; // Reforma tributária

    const createdItems: FiscalDocumentItem[] = [];

    data.items.forEach((item, index) => {
      const lineTotal = Number((item.quantity * item.unit_price).toFixed(2));
      grandTotal += lineTotal;

      // Tax engine calculations (Simples/Lucro Real baseline)
      const icms = Number((lineTotal * 0.18).toFixed(2));
      const pis = Number((lineTotal * 0.0165).toFixed(2));
      const cofins = Number((lineTotal * 0.076).toFixed(2));
      const cbs = Number((lineTotal * 0.088).toFixed(2));
      const ibs = Number((lineTotal * 0.177).toFixed(2));

      totalICMS += icms;
      totalPIS += pis;
      totalCOFINS += cofins;
      totalCBS += cbs;
      totalIBS += ibs;

      const itemId = "fitem-" + Math.floor(100000 + Math.random() * 900000);
      const docItem: FiscalDocumentItem = {
        id: itemId,
        fiscal_document_id: docId,
        product_id: item.product_id,
        line_number: index + 1,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: lineTotal,
        ncm_code: "8471.50.10",
        cfop: "5102",
        base_calc_icms_item: lineTotal,
        icms_item_value: icms,
        pis_item_value: pis,
        cofins_item_value: cofins,
        cbs_item_value: cbs,
        ibs_item_value: ibs,
        created_at: new Date().toISOString()
      };

      createdItems.push(docItem);
      this.fiscalDocumentItems.unshift(docItem);

      // Log Tax Calculation Breakdown
      this.taxCalculations.unshift({
        id: "tax-" + Math.floor(100000 + Math.random() * 900000),
        document_item_id: itemId,
        tax_type: "cbs",
        calculation_method: "configured",
        tax_regime: this.getActiveCompany().tax_regime,
        base_value: lineTotal,
        tax_rate: 0.088,
        tax_value: cbs,
        calculated_at: new Date().toISOString(),
        calculated_by: this.currentUser.id
      });
    });

    const fiscalDoc: FiscalDocument = {
      id: docId,
      company_id: this.activeCompanyId,
      document_type: data.document_type,
      document_number: String(Math.floor(1000 + Math.random() * 9000)).padStart(9, "0"),
      series: "1",
      access_key: accessKey,
      protocol: "1352600" + Math.floor(10000000 + Math.random() * 90000000),
      issue_date: new Date().toISOString(),
      operation_type: "sales",
      status: "authorized",
      person_id: data.person_id,
      total_value: grandTotal,
      base_calc_icms: grandTotal,
      icms_value: totalICMS,
      pis_value: totalPIS,
      cofins_value: totalCOFINS,
      cbs_value: totalCBS,
      ibs_value: totalIBS,
      tax_regime: this.getActiveCompany().tax_regime,
      signer_certificate: "A1_NEXS_CERT_ACTIVE",
      created_by: this.currentUser.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.fiscalDocuments.unshift(fiscalDoc);

    this.logAudit("FiscalDocument", docId, "emit", undefined, fiscalDoc, `Emissão de ${data.document_type.toUpperCase()} autorizada na SEFAZ`);
    this.emitOutboxEvent("fiscal_document.issued", "FiscalDocument", docId, fiscalDoc);
    this.notify();
    return fiscalDoc;
  }

  public cancelFiscalDocument(docId: string, reason: string) {
    const doc = this.fiscalDocuments.find(d => d.id === docId);
    if (!doc) throw new Error("Documento fiscal não encontrado");

    if (doc.status === "canceled") {
      throw new Error("Documento já cancelado");
    }

    const oldValues = { ...doc };
    doc.status = "canceled";
    doc.cancellation_reason = reason;
    doc.updated_at = new Date().toISOString();

    this.logAudit("FiscalDocument", docId, "update", oldValues, doc, `Cancelamento de Nota Fiscal: ${reason}`);
    this.emitOutboxEvent("fiscal_document.canceled", "FiscalDocument", docId, { docId, reason });
    this.notify();
  }

  // --- AI DECISION FEEDBACK HANDLER (AI-003) ---
  public handleAiDecisionFeedback(decisionId: string, userAction: 'accepted' | 'rejected' | 'modified', correction?: Record<string, any>) {
    const decision = this.aiDecisions.find(d => d.id === decisionId);
    if (!decision) throw new Error("Decisão de IA não encontrada");

    decision.user_action = userAction;
    decision.user_correction = correction;
    decision.user_id = this.currentUser.id;
    decision.was_applied = true;
    decision.applied_at = new Date().toISOString();
    decision.improvement_metric = userAction === "accepted" ? 1.0 : (userAction === "modified" ? 0.7 : 0.0);

    this.logAudit("AiDecision", decisionId, "update", undefined, decision, `Feedback do Usuário para IA: ${userAction}`);
    this.notify();
  }

  // --- SIMPLE HELPER METHODS FOR STREAMLINED UX ---
  public addSimpleTransaction(data: {
    description: string;
    amount: number;
    direction: Direction;
    category?: string;
    date?: string;
    isPaid?: boolean;
    paymentMethod?: PaymentMethod;
  }) {
    const docId = "findoc-" + Math.floor(100000 + Math.random() * 900000);
    const date = data.date || new Date().toISOString().split("T")[0];

    const newDoc: FinancialDocument = {
      id: docId,
      company_id: this.activeCompanyId,
      direction: data.direction,
      document_type: "invoice",
      person_id: this.people[0]?.id || "person-001",
      document_number: `LANÇ-${Math.floor(1000 + Math.random() * 9000)}`,
      description: data.description,
      issue_date: date,
      total_amount: data.amount,
      created_by: this.currentUser.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.financialDocuments.unshift(newDoc);

    const instId = "inst-" + Math.floor(100000 + Math.random() * 900000);
    const isPaid = data.isPaid ?? true;

    const installment: Installment = {
      id: instId,
      financial_document_id: docId,
      installment_number: 1,
      due_date: date,
      original_amount: data.amount,
      current_amount: isPaid ? 0 : data.amount,
      status: isPaid ? "paid" : "pending",
      approval_status: "approved",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.installments.unshift(installment);

    if (isPaid) {
      const settleId = "settle-" + Math.floor(100000 + Math.random() * 900000);
      const settlement: Settlement = {
        id: settleId,
        installment_id: instId,
        payment_method: data.paymentMethod || "pix",
        paid_amount: data.amount,
        paid_date: date,
        bank_account_id: this.bankAccounts[0]?.id,
        status: "completed",
        created_at: new Date().toISOString()
      };
      this.settlements.unshift(settlement);

      if (this.bankAccounts[0]) {
        if (data.direction === "receivable") {
          this.bankAccounts[0].balance += data.amount;
        } else {
          this.bankAccounts[0].balance -= data.amount;
        }
      }
    }

    this.notify();
    return newDoc;
  }

  public adjustStock(productId: string, quantityChange: number) {
    const prod = this.products.find(p => p.id === productId);
    if (prod) {
      prod.stock_quantity = Math.max(0, (prod.stock_quantity || 0) + quantityChange);
      prod.updated_at = new Date().toISOString();
    }

    const bal = this.inventoryBalances.find(b => b.product_id === productId);
    if (bal) {
      bal.quantity = Math.max(0, bal.quantity + quantityChange);
    } else if (prod) {
      this.inventoryBalances.unshift({
        id: "bal-" + Math.floor(100000 + Math.random() * 900000),
        product_id: productId,
        warehouse_id: this.warehouses[0]?.id || "wh-001",
        quantity: Math.max(0, quantityChange),
        reserved_quantity: 0,
        cost_price: prod.cost_price || 0,
        valuation_method: "average",
        last_updated: new Date().toISOString()
      });
    }

    this.notify();
  }

  public deleteInstallment(installmentId: string) {
    const inst = this.installments.find(i => i.id === installmentId);
    if (inst) {
      this.logAudit("Installment", inst.id, "delete", inst, undefined, `Exclusão do título parcelado ${inst.id}`);
      this.emitOutboxEvent("INSTALLMENT_DELETED", "Installment", inst.id, { id: inst.id });
      this.installments = this.installments.filter(i => i.id !== installmentId);
      this.financialDocuments = this.financialDocuments.filter(d => d.id !== inst.financial_document_id);
      this.settlements = this.settlements.filter(s => s.installment_id !== installmentId);
      this.notify();
    }
  }

  public updateInstallment(installmentId: string, data: { current_amount?: number; due_date?: string; status?: 'pending' | 'partially_paid' | 'paid' | 'canceled' | 'overdue' }) {
    const inst = this.installments.find(i => i.id === installmentId);
    if (inst) {
      const oldVal = { ...inst };
      if (data.current_amount !== undefined) inst.current_amount = data.current_amount;
      if (data.due_date !== undefined) inst.due_date = data.due_date;
      if (data.status !== undefined) inst.status = data.status;

      this.logAudit("Installment", inst.id, "update", oldVal, { ...inst }, `Alteração do título ${inst.id}`);
      this.emitOutboxEvent("INSTALLMENT_UPDATED", "Installment", inst.id, { ...inst });
      this.notify();
    }
  }

  public addProduct(product: {
    sku: string;
    name: string;
    description?: string;
    unit_of_measure: string;
    cost_price: number;
    selling_price: number;
    initial_stock: number;
    gtin?: string;
    category?: string;
    ncm_code?: string;
    cest_code?: string;
    origin?: string;
    cfop?: string;
    icms_rate?: number;
    pis_rate?: number;
    cofins_rate?: number;
    ipi_rate?: number;
    min_stock_quantity?: number;
    max_stock_quantity?: number;
    location_rack?: string;
    min_selling_price?: number;
  }) {
    const newProd: Product = {
      id: "prod-" + Math.floor(100000 + Math.random() * 900000),
      company_id: this.activeCompanyId,
      sku: product.sku,
      gtin: product.gtin || "",
      name: product.name,
      description: product.description || "",
      category: product.category || "Geral",
      product_type: "product",
      unit_of_measure: product.unit_of_measure,
      cost_price: product.cost_price,
      selling_price: product.selling_price,
      min_selling_price: product.min_selling_price || product.selling_price * 0.9,
      stock_quantity: product.initial_stock,
      min_stock_quantity: product.min_stock_quantity || 5,
      max_stock_quantity: product.max_stock_quantity || 500,
      location_rack: product.location_rack || "A-01",
      ncm_code: product.ncm_code || "8471.50.10",
      cest_code: product.cest_code || "21.001.00",
      origin: product.origin || "0",
      cfop: product.cfop || "5102",
      icms_rate: product.icms_rate ?? 18,
      pis_rate: product.pis_rate ?? 1.65,
      cofins_rate: product.cofins_rate ?? 7.6,
      ipi_rate: product.ipi_rate ?? 0,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.products.unshift(newProd);

    this.inventoryBalances.unshift({
      id: "bal-" + Math.floor(100000 + Math.random() * 900000),
      product_id: newProd.id,
      warehouse_id: this.warehouses[0]?.id || "wh-001",
      quantity: product.initial_stock,
      reserved_quantity: 0,
      cost_price: product.cost_price,
      valuation_method: "average",
      last_updated: new Date().toISOString()
    });

    this.logAudit("Product", newProd.id, "create", undefined, newProd, `Cadastro de produto ${newProd.name} (SKU: ${newProd.sku})`);
    this.emitOutboxEvent("PRODUCT_CREATED", "Product", newProd.id, { ...newProd });
    this.notify();
    return newProd;
  }

  public updateProduct(productId: string, data: Partial<Product>) {
    const prod = this.products.find(p => p.id === productId);
    if (prod) {
      const oldVal = { ...prod };
      Object.assign(prod, data, { updated_at: new Date().toISOString() });

      this.logAudit("Product", prod.id, "update", oldVal, { ...prod }, `Atualização do produto ${prod.name}`);
      this.emitOutboxEvent("PRODUCT_UPDATED", "Product", prod.id, { ...prod });
      this.notify();
    }
  }

  public deleteProduct(productId: string) {
    const prod = this.products.find(p => p.id === productId);
    if (prod) {
      this.logAudit("Product", prod.id, "delete", prod, undefined, `Exclusão do produto ${prod.name}`);
      this.emitOutboxEvent("PRODUCT_DELETED", "Product", prod.id, { id: prod.id });
      this.products = this.products.filter(p => p.id !== productId);
      this.notify();
    }
  }

  public addPerson(data: {
    legal_name: string;
    trade_name?: string;
    tax_id: string;
    person_type: "individual" | "company";
    role?: "customer" | "supplier" | "both";
    state_registration?: string;
    municipal_registration?: string;
    tax_regime?: string;
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
  }) {
    const newPerson: Person = {
      id: "person-" + Math.floor(100000 + Math.random() * 900000),
      company_id: this.activeCompanyId,
      legal_name: data.legal_name,
      trade_name: data.trade_name || data.legal_name,
      tax_id: data.tax_id,
      person_type: data.person_type,
      person_role: data.role || "customer",
      state_registration: data.state_registration || "",
      municipal_registration: data.municipal_registration || "",
      tax_regime: data.tax_regime || "simples",
      email: data.email || "",
      phone: data.phone || "",
      contact_person: data.contact_person || "",
      street: data.street || "",
      number: data.number || "",
      complement: data.complement || "",
      neighborhood: data.neighborhood || "",
      city: data.city || "São Paulo",
      state: data.state || "SP",
      zip_code: data.zip_code || "",
      ibge_code: data.ibge_code || "3550308",
      credit_limit: data.credit_limit || 10000,
      payment_terms: data.payment_terms || "30 Dias",
      pix_key: data.pix_key || data.tax_id,
      notes: data.notes || "",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.people.unshift(newPerson);

    this.logAudit("Person", newPerson.id, "create", undefined, newPerson, `Inclusão de cadastro: ${newPerson.legal_name} (${newPerson.person_type.toUpperCase()})`);
    this.emitOutboxEvent("PERSON_CREATED", "Person", newPerson.id, { ...newPerson });
    this.notify();
    return newPerson;
  }

  public updatePerson(personId: string, data: Partial<Person>) {
    const person = this.people.find(p => p.id === personId);
    if (person) {
      const oldVal = { ...person };
      Object.assign(person, data, { updated_at: new Date().toISOString() });

      this.logAudit("Person", person.id, "update", oldVal, { ...person }, `Atualização de cadastro de ${person.legal_name}`);
      this.emitOutboxEvent("PERSON_UPDATED", "Person", person.id, { ...person });
      this.notify();
    }
  }

  public deletePerson(personId: string) {
    const person = this.people.find(p => p.id === personId);
    if (person) {
      this.logAudit("Person", person.id, "delete", person, undefined, `Exclusão de cadastro: ${person.legal_name}`);
      this.emitOutboxEvent("PERSON_DELETED", "Person", person.id, { id: person.id });
      this.people = this.people.filter(p => p.id !== personId);
      this.notify();
    }
  }

  public addBankAccount(data: {
    account_name: string;
    bank_code: string;
    bank_name?: string;
    agency: string;
    agency_digit?: string;
    account_number: string;
    account_digit?: string;
    initial_balance: number;
    account_type?: "checking" | "savings" | "investment";
    holder_name?: string;
    holder_tax_id?: string;
    pix_key?: string;
    overdraft_limit?: number;
    monthly_fee?: number;
  }) {
    const newBank: BankAccount = {
      id: "bank-" + Math.floor(100000 + Math.random() * 900000),
      company_id: this.activeCompanyId,
      bank_code: data.bank_code || "001",
      bank_name: data.bank_name || "Banco do Brasil",
      agency: data.agency || "0001",
      agency_digit: data.agency_digit || "0",
      account_number: data.account_number || "12345",
      account_digit: data.account_digit || "6",
      account_type: data.account_type || "checking",
      account_name: data.account_name,
      holder_name: data.holder_name || "Sua Empresa LTDA",
      holder_tax_id: data.holder_tax_id || "12.345.678/0001-90",
      pix_key: data.pix_key || data.account_number,
      overdraft_limit: data.overdraft_limit || 0,
      monthly_fee: data.monthly_fee || 0,
      balance: data.initial_balance,
      blocked_balance: 0,
      available_balance: data.initial_balance + (data.overdraft_limit || 0),
      is_active: true,
      open_finance_status: "connected",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.bankAccounts.unshift(newBank);

    this.logAudit("BankAccount", newBank.id, "create", undefined, newBank, `Abertura de conta bancária ${newBank.account_name}`);
    this.emitOutboxEvent("BANK_ACCOUNT_CREATED", "BankAccount", newBank.id, { ...newBank });
    this.notify();
    return newBank;
  }

  public updateBankAccount(bankId: string, data: Partial<BankAccount>) {
    const bank = this.bankAccounts.find(b => b.id === bankId);
    if (bank) {
      const oldVal = { ...bank };
      Object.assign(bank, data, { updated_at: new Date().toISOString() });

      this.logAudit("BankAccount", bank.id, "update", oldVal, { ...bank }, `Atualização da conta bancária ${bank.account_name}`);
      this.emitOutboxEvent("BANK_ACCOUNT_UPDATED", "BankAccount", bank.id, { ...bank });
      this.notify();
    }
  }

  public deleteBankAccount(bankId: string) {
    const bank = this.bankAccounts.find(b => b.id === bankId);
    if (bank) {
      this.logAudit("BankAccount", bank.id, "delete", bank, undefined, `Exclusão de conta bancária ${bank.account_name}`);
      this.emitOutboxEvent("BANK_ACCOUNT_DELETED", "BankAccount", bank.id, { id: bank.id });
      this.bankAccounts = this.bankAccounts.filter(b => b.id !== bankId);
      this.notify();
    }
  }
}

export const store = NexsStore.getInstance();
