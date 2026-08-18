-- =========================================================
-- NEX ERP - DATABASE SCHEMA (PostgreSQL 16)
-- Complete Schema with UUIDs, Foreign Keys, and Indexes
-- =========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Companies (Multi-Tenant)
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legal_name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255),
    tax_id VARCHAR(20) UNIQUE NOT NULL, -- CNPJ/CPF
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users & RBAC
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'operator', -- admin, financial_manager, operator, auditor
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- People (Customers & Suppliers)
CREATE TABLE IF NOT EXISTS people (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    legal_name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255),
    tax_id VARCHAR(20) NOT NULL,
    person_type VARCHAR(20) NOT NULL CHECK (person_type IN ('individual', 'company')),
    person_role VARCHAR(20) NOT NULL CHECK (person_role IN ('customer', 'supplier', 'both')),
    state_registration VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bank Accounts & Cash Drawers
CREATE TABLE IF NOT EXISTS bank_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    account_name VARCHAR(255) NOT NULL,
    bank_code VARCHAR(10) NOT NULL,
    agency VARCHAR(20) NOT NULL,
    account_number VARCHAR(30) NOT NULL,
    account_type VARCHAR(20) NOT NULL DEFAULT 'checking',
    balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    blocked_balance NUMERIC(15, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Financial Documents (NFe, Invoices, Receipts)
CREATE TABLE IF NOT EXISTS financial_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    person_id UUID REFERENCES people(id),
    document_type VARCHAR(20) NOT NULL CHECK (document_type IN ('payable', 'receivable')),
    title VARCHAR(255) NOT NULL,
    document_number VARCHAR(100),
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    total_amount NUMERIC(15, 2) NOT NULL,
    net_amount NUMERIC(15, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'draft', -- draft, approved, partially_paid, paid, cancelled
    is_fiscal_locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Installments (Parcelas)
CREATE TABLE IF NOT EXISTS installments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES financial_documents(id) ON DELETE CASCADE,
    installment_number INT NOT NULL,
    due_date DATE NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    paid_amount NUMERIC(15, 2) DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'open', -- open, partially_paid, paid, overdue, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Settlements (Baixas / Pagamentos)
CREATE TABLE IF NOT EXISTS settlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    installment_id UUID REFERENCES installments(id) ON DELETE CASCADE,
    bank_account_id UUID REFERENCES bank_accounts(id),
    payment_date DATE NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    interest_amount NUMERIC(15, 2) DEFAULT 0.00,
    fine_amount NUMERIC(15, 2) DEFAULT 0.00,
    discount_amount NUMERIC(15, 2) DEFAULT 0.00,
    net_paid NUMERIC(15, 2) NOT NULL,
    payment_method VARCHAR(30) NOT NULL, -- pix, bank_transfer, credit_card, cash, boleto
    reconciliation_status VARCHAR(30) DEFAULT 'unreconciled', -- unreconciled, reconciled, rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products & Inventory
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    unit_price NUMERIC(15, 2) NOT NULL,
    cost_price NUMERIC(15, 2) NOT NULL,
    current_stock NUMERIC(12, 3) NOT NULL DEFAULT 0,
    min_stock NUMERIC(12, 3) DEFAULT 5,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    payload JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_people_company ON people(company_id);
CREATE INDEX IF NOT EXISTS idx_people_tax_id ON people(tax_id);
CREATE INDEX IF NOT EXISTS idx_financial_docs_company ON financial_documents(company_id);
CREATE INDEX IF NOT EXISTS idx_financial_docs_due_date ON financial_documents(due_date);
CREATE INDEX IF NOT EXISTS idx_installments_doc ON installments(document_id);
CREATE INDEX IF NOT EXISTS idx_installments_due_date ON installments(due_date);
CREATE INDEX IF NOT EXISTS idx_settlements_installment ON settlements(installment_id);
CREATE INDEX IF NOT EXISTS idx_settlements_bank_account ON settlements(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_audit_logs_company ON audit_logs(company_id);
