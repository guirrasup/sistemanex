import { FinancialService } from "../server/services/financial.service";

// Simple test suite simulation for Financial Service
async function runTests() {
  console.log("🧪 Running NEX Financial Service Rules Tests...");

  // Test 1: Successful Settlement with sufficient balance
  try {
    const settlement = await FinancialService.validateAndExecuteSettlement(
      {
        installment_id: "inst-101",
        bank_account_id: "bank-1",
        payment_date: "2026-08-11",
        amount: 500,
        payment_method: "pix"
      },
      () => 1000, // Balance: 1000
      () => ({
        id: "inst-101",
        status: "open",
        amount: 500,
        paidAmount: 0,
        docType: "payable"
      }),
      (_s, newStatus, newBal) => {
        if (newStatus !== "paid" || newBal !== 500) {
          throw new Error("State calculation error in test 1");
        }
      }
    );
    console.log("✅ Test 1 Passed: Successful Settlement executed.");
  } catch (err: any) {
    console.error("❌ Test 1 Failed:", err.message);
  }

  // Test 2: Reject settlement if insufficient balance (FIN-001)
  try {
    await FinancialService.validateAndExecuteSettlement(
      {
        installment_id: "inst-102",
        bank_account_id: "bank-1",
        payment_date: "2026-08-11",
        amount: 2000,
        payment_method: "pix"
      },
      () => 500, // Balance: 500 < 2000
      () => ({
        id: "inst-102",
        status: "open",
        amount: 2000,
        paidAmount: 0,
        docType: "payable"
      }),
      () => {}
    );
    console.error("❌ Test 2 Failed: Should have thrown FIN-001 error.");
  } catch (err: any) {
    if (err.message.includes("FIN-001")) {
      console.log("✅ Test 2 Passed: Insufficient balance FIN-001 rule enforced correctly.");
    } else {
      console.error("❌ Test 2 Failed with unexpected error:", err.message);
    }
  }
}

runTests();
