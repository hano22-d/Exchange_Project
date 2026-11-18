import { requestToPromise } from "../shared/utilsDB";

const ELECTRONIC_WALLET_BALANCES_STORE = "electronicWalletBalances";

// ========================================
// جلب جميع أرصدة المحافظ
// ========================================

function getAllWalletBalances(tx) {
  const store = tx.objectStore(ELECTRONIC_WALLET_BALANCES_STORE);

  return requestToPromise(store.getAll());
}

// ========================================
// جلب رصيد عملة داخل محفظة محددة
// ========================================

function getWalletBalance(tx, walletId, currency) {
  const store = tx.objectStore(ELECTRONIC_WALLET_BALANCES_STORE);

  return requestToPromise(store.get([walletId, currency]));
}

// ========================================
// جلب جميع أرصدة محفظة معينة
// ========================================

function getWalletBalancesByWalletId(tx, walletId) {
  const store = tx.objectStore(ELECTRONIC_WALLET_BALANCES_STORE);

  return requestToPromise(store.index("walletIdIndex").getAll(walletId));
}

// ========================================
// جلب جميع أرصدة عملة معينة عبر المحافظ
// ========================================

function getWalletBalancesByCurrency(tx, currency) {
  const store = tx.objectStore(ELECTRONIC_WALLET_BALANCES_STORE);

  return requestToPromise(store.index("currencyIndex").getAll(currency));
}

// ========================================
// إضافة رصيد جديد إلى محفظة
// ========================================

function addWalletBalance(tx, walletBalance) {
  const store = tx.objectStore(ELECTRONIC_WALLET_BALANCES_STORE);

  return requestToPromise(store.add(walletBalance));
}

// ========================================
// تعديل سجل رصيد
// ========================================

async function updateWalletBalance(tx, walletBalance) {
  const store = tx.objectStore(ELECTRONIC_WALLET_BALANCES_STORE);

  await requestToPromise(store.put(walletBalance));

  return walletBalance;
}

// ========================================
// تعديل رصيد المحفظة بعد عملية ذرية
// ========================================

async function adjustWalletBalance(tx, walletId, currency, delta) {
  const store = tx.objectStore(ELECTRONIC_WALLET_BALANCES_STORE);

  const request = store.get([walletId, currency]);

  const walletBalance = await requestToPromise(request);

  if (!walletBalance) {
    throw new Error(`Wallet balance "${walletId}-${currency}" does not exist.`);
  }

  const updatedWalletBalance = {
    ...walletBalance,
    balance: walletBalance.balance + delta,
    updatedAt: Date.now(),
  };

  await requestToPromise(store.put(updatedWalletBalance));

  return updatedWalletBalance;
}

// ========================================
// Repository Object
// ========================================

const electronicWalletBalanceRepository = {
  getAllWalletBalances,
  getWalletBalance,
  getWalletBalancesByWalletId,
  getWalletBalancesByCurrency,
  addWalletBalance,
  updateWalletBalance,
  adjustWalletBalance,
};

export default electronicWalletBalanceRepository;
