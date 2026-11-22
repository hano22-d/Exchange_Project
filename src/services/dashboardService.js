import { runInTransaction } from "../db/transaction.js";

import exchangeRepository from "../repositories/exchangeRepository.js";
import transferRepository from "../repositories/transferRepository.js";
import debtRepository from "../repositories/debtRepository.js";
import electronicWalletOperationRepository from "../repositories/electronicWalletOperationRepository.js";
import { formatNumber } from "../shared/utils.js";

// ========================================
// أسماء مخازن IndexedDB
// ========================================

const DASHBOARD_STORES = [
  "exchanges",
  "transfers",
  "debts",
  "electronicWalletOperations",
];

const DEFAULT_LIMIT = 5;

// ========================================
// أسماء أنواع عمليات المحافظ الإلكترونية
// ========================================

const WALLET_OPERATION_LABELS = {
  opening_balance: "رصيد افتتاحي",
  withdrawal: "سحب",
  deposit: "إيداع",
  external_in: "إيداع خارجي",
  external_out: "سحب خارجي",
  adjustment: "تسوية",
};

// ========================================
// توحيد شكل حركة الصرف
// ========================================

function normalizeExchange(exchange) {
  return {
    key: `exchange:${exchange.id}`,
    id: exchange.id,
    type: "exchange",
    date: exchange.date,

    title: "عملية صرف",
    subtitle: `${exchange.toCurrency} ← ${exchange.fromCurrency}`,

    description:
      `صرف ${exchange.fromAmount} ${exchange.fromCurrency}` +
      ` مقابل ${formatNumber(exchange.toAmount)} ${exchange.toCurrency}`,

    original: exchange,
  };
}

// ========================================
// توحيد شكل الحوالة
// ========================================

function normalizeTransfer(transfer) {
  const title = transfer.direction === "صادر" ? "حوالة صادرة" : "حوالة واردة";

  return {
    key: `transfer:${transfer.id}`,
    id: transfer.id,
    type: "transfer",
    date: transfer.date,

    title,
    subtitle: transfer.direction,

    description:
      `المستلم: ${transfer.receiverFullname}` +
      ` -  المبلغ:  ${transfer.amount} ${transfer.currency}`,

    original: transfer,
  };
}

// ========================================
// توحيد شكل حركة الدين
// ========================================

function normalizeDebt(debt) {
  return {
    key: `debt:${debt.id}`,
    id: debt.id,
    type: "debt",
    date: debt.date,

    title: "حركة دين",
    subtitle: debt.direction,

    description: `المبلغ: ${debt.amount} ${debt.currency}` + `- ${debt.note}`,

    partyId: debt.partyId,

    original: debt,
  };
}

// ========================================
// توحيد شكل عملية المحفظة الإلكترونية
// ========================================

function normalizeWalletOperation(operation) {
  return {
    key: `wallet:${operation.id}`,
    id: operation.id,
    type: "wallet",
    date: operation.date,

    title: "عملية محفظة إلكترونية",

    subtitle:
      WALLET_OPERATION_LABELS[operation.operationType] ??
      operation.operationType,

    description:
      `المبلغ: ${formatNumber(operation.amount)} ${operation.currency}` +
      (operation.note ? ` - ${operation.note}` : ""),

    walletId: operation.walletId,

    original: operation,
  };
}

// ========================================
// جلب أحدث العمليات من جميع الكيانات
// ========================================

export async function getLatestOperationsService(limit = DEFAULT_LIMIT) {
  if (!Number.isSafeInteger(limit) || limit < 1) {
    throw new RangeError("Limit must be a positive integer.");
  }

  return runInTransaction(DASHBOARD_STORES, "readonly", async (tx) => {
    // جلب أحدث الحركات من كل مخزن بالتوازي
    const [exchanges, transfers, debts, walletOperations] = await Promise.all([
      exchangeRepository.getLatestExchanges(tx, limit),

      transferRepository.getLatestTransfers(tx, limit),

      debtRepository.getLatestDebts(tx, limit),

      electronicWalletOperationRepository.getLatestWalletOperations(tx, limit),
    ]);

    // توحيد شكل البيانات ودمج المصفوفات
    const allOperations = [
      ...exchanges.map(normalizeExchange),
      ...transfers.map(normalizeTransfer),
      ...debts.map(normalizeDebt),
      ...walletOperations.map(normalizeWalletOperation),
    ];

    // ترتيب الحركات من الأحدث إلى الأقدم
    allOperations.sort((a, b) => b.date - a.date);

    // إرجاع أحدث عدد مطلوب فقط
    return allOperations.slice(0, limit);
  });
}

const dashboardService = {
  getLatestOperationsService,
};

export default dashboardService;
