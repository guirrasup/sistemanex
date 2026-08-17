import { logger } from "../logger";

export interface SettlementInput {
  installment_id: string;
  bank_account_id: string;
  payment_date: string;
  amount: number;
  interest_amount?: number;
  fine_amount?: number;
  discount_amount?: number;
  payment_method: "pix" | "bank_transfer" | "credit_card" | "cash" | "boleto";
}

export class FinancialService {
  // Business Rule Engine for Financial Operations
  public static async validateAndExecuteSettlement(
    data: SettlementInput,
    getBankAccountBalance: (bankId: string) => number,
    getInstallmentDetails: (installmentId: string) => {
      id: string;
      status: string;
      amount: number;
      paidAmount: number;
      docType: "payable" | "receivable";
      isFiscalLocked?: boolean;
    } | null,
    updateState: (settlementData: any, newInstallmentStatus: string, newBalance: number) => void
  ) {
    const { installment_id, bank_account_id, amount, payment_method } = data;

    // 1. Fetch Installment Context
    const inst = getInstallmentDetails(installment_id);
    if (!inst) {
      throw new Error("FIN-000: Parcela financeira não encontrada.");
    }

    // 2. FISC-001: Fiscal Immutability Check
    if (inst.isFiscalLocked) {
      throw new Error("FISC-001: Documento bloqueado fiscalmente. Não é permitida alteração direta sem estorno homologado.");
    }

    // 3. FIN-002: Installment Status Validation
    if (inst.status === "paid" || inst.status === "cancelled") {
      throw new Error(`FIN-002: A parcela já está com status '${inst.status}' e não pode receber novas baixas.`);
    }

    const netPaid = amount + (data.interest_amount || 0) + (data.fine_amount || 0) - (data.discount_amount || 0);

    // 4. FIN-001: Available Balance Verification for Payables
    const currentBalance = getBankAccountBalance(bank_account_id);
    if (inst.docType === "payable" && currentBalance < netPaid && payment_method !== "credit_card") {
      logger.warn("FIN-001: Tentativa de baixa de título a pagar sem saldo suficiente em conta bancária", {
        bankAccountId: bank_account_id,
        currentBalance,
        required: netPaid
      });
      // Throw clear error unless override is configured
      throw new Error(`FIN-001: Saldo insuficiente na conta bancária (Disponível: R$ ${currentBalance.toFixed(2)}, Requerido: R$ ${netPaid.toFixed(2)}).`);
    }

    // Calculate new status
    const totalPaidAfter = inst.paidAmount + amount;
    let newStatus = "partially_paid";
    if (totalPaidAfter >= inst.amount - 0.01) {
      newStatus = "paid";
    }

    // Balance update
    const balanceImpact = inst.docType === "receivable" ? netPaid : -netPaid;
    const newBalance = currentBalance + balanceImpact;

    const settlementRecord = {
      id: "settle-" + Math.floor(100000 + Math.random() * 900000),
      installment_id,
      bank_account_id,
      payment_date: data.payment_date,
      amount,
      interest_amount: data.interest_amount || 0,
      fine_amount: data.fine_amount || 0,
      discount_amount: data.discount_amount || 0,
      net_paid: netPaid,
      payment_method,
      reconciliation_status: "unreconciled",
      created_at: new Date().toISOString()
    };

    updateState(settlementRecord, newStatus, newBalance);

    logger.info("Settlement executed successfully with business rule validation", {
      settlementId: settlementRecord.id,
      installmentId: installment_id,
      newStatus,
      newBalance
    });

    return settlementRecord;
  }
}
