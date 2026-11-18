import { requestToPromise } from "../shared/utilsDB";

const ELECTRONIC_WALLETS_STORE = "electronicWallets";

// ========================================
// جلب جميع المحافظ الإلكترونية
// ========================================

function getAllWallets(tx) {
  const store = tx.objectStore(ELECTRONIC_WALLETS_STORE);

  return requestToPromise(store.getAll());
}

// ========================================
// جلب محفظة واحدة بواسطة id
// ========================================

function getWalletById(tx, walletId) {
  const store = tx.objectStore(ELECTRONIC_WALLETS_STORE);

  return requestToPromise(store.get(walletId));
}

// ========================================
// جلب المحافظ حسب مزوّد الخدمة
// ========================================

function getWalletsByProvider(tx, provider) {
  const store = tx.objectStore(ELECTRONIC_WALLETS_STORE);

  return requestToPromise(store.index("providerIndex").getAll(provider));
}

// ========================================
// إضافة محفظة إلكترونية
// ========================================

function addWallet(tx, wallet) {
  const store = tx.objectStore(ELECTRONIC_WALLETS_STORE);

  return requestToPromise(store.add(wallet));
}

// ========================================
// تعديل بيانات محفظة
// ========================================

async function updateWallet(tx, wallet) {
  const store = tx.objectStore(ELECTRONIC_WALLETS_STORE);

  await requestToPromise(store.put(wallet));

  return wallet;
}

// ========================================
// تفعيل / تعطيل محفظة
// ========================================

async function setWalletActive(tx, walletId, active) {
  const store = tx.objectStore(ELECTRONIC_WALLETS_STORE);

  const request = store.get(walletId);

  const wallet = await requestToPromise(request);

  if (!wallet) {
    throw new Error(`Wallet "${walletId}" does not exist.`);
  }

  const updatedWallet = {
    ...wallet,
    active,
    updatedAt: Date.now(),
  };

  await requestToPromise(store.put(updatedWallet));

  return updatedWallet;
}

// ========================================
// Repository Object
// ========================================

const electronicWalletRepository = {
  getAllWallets,
  getWalletById,
  getWalletsByProvider,
  addWallet,
  updateWallet,
  setWalletActive,
};

export default electronicWalletRepository;
