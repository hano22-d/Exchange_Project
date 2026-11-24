import packageInfo from "../../package.json";
import {
  BACKUP_STORE_NAMES,
  getBackupData,
  restoreBackupData,
} from "../repositories/backupRepository.js";
import { runInTransaction } from "../db/transaction.js";
import { CURRENT_VERSION, DATABASE_NAME } from "../db/database.js";

// ================= إعدادات النسخ الاحتياطي =================

const BACKUP_FORMAT = "exchange-office-backup";
const BACKUP_FORMAT_VERSION = 2;
const LEGACY_BACKUP_FORMAT_VERSION = 1;
const LEGACY_DATABASE_VERSION = 3;
const LEGACY_BACKUP_STORE_NAMES = [
  "cashboxes",
  "exchanges",
  "transfers",
  "parties",
  "debts",
];
const NEW_WALLET_STORE_NAMES = [
  "electronicWallets",
  "electronicWalletBalances",
  "electronicWalletOperations",
];
const FULL_BACKUP_TYPE = "full";
const SYRIA_TIME_ZONE = "Asia/Damascus";
const APP_VERSION = packageInfo.version ?? "unknown";

const WALLET_OPERATION_TYPES = new Set([
  "opening_balance",
  "withdrawal",
  "deposit",
  "external_in",
  "external_out",
  "adjustment",
]);

// ================= الدوال المساعدة العامة =================

function generateBackupId() {
  if (!globalThis.crypto?.randomUUID) {
    throw new Error("المتصفح لا يدعم إنشاء معرفات النسخ الاحتياطية");
  }

  return globalThis.crypto.randomUUID();
}

export function getBusinessDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: SYRIA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year").value;
  const month = parts.find((part) => part.type === "month").value;
  const day = parts.find((part) => part.type === "day").value;

  return `${year}-${month}-${day}`;
}

function calculateRecordCounts(data, storeNames = BACKUP_STORE_NAMES) {
  return Object.fromEntries(
    storeNames.map((storeName) => [storeName, data[storeName].length])
  );
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isValidCurrency(value) {
  return typeof value === "string" && value.trim().length > 0;
}

// ================= تحويل Blob إلى Base64 =================

function bytesToBase64(bytes) {
  let binary = "";
  const chunkSize = 0x8000;

  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    const chunk = bytes.subarray(offset, offset + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return globalThis.btoa(binary);
}

function base64ToBytes(base64) {
  let binary;

  try {
    binary = globalThis.atob(base64);
  } catch {
    throw new Error("بيانات صورة المحفظة في النسخة الاحتياطية غير صالحة");
  }

  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function isSerializedBlob(value) {
  return (
    isObject(value) &&
    value.__backupType === "blob" &&
    typeof value.mimeType === "string" &&
    typeof value.base64 === "string"
  );
}

async function serializeWalletLogo(logo) {
  if (logo === null || logo === undefined) {
    return logo ?? null;
  }

  if (typeof Blob === "undefined" || !(logo instanceof Blob)) {
    throw new Error("شعار إحدى المحافظ ليس من نوع Blob صالح");
  }

  const bytes = new Uint8Array(await logo.arrayBuffer());

  return {
    __backupType: "blob",
    mimeType: logo.type || "application/octet-stream",
    base64: bytesToBase64(bytes),
  };
}

async function serializeBackupForJson(backup) {
  const wallets = await Promise.all(
    backup.data.electronicWallets.map(async (wallet) => ({
      ...wallet,
      logo: await serializeWalletLogo(wallet.logo),
    }))
  );

  return {
    ...backup,
    data: {
      ...backup.data,
      electronicWallets: wallets,
    },
  };
}

async function deserializeWalletLogo(logo) {
  if (logo === null || logo === undefined) {
    return null;
  }

  if (typeof Blob !== "undefined" && logo instanceof Blob) {
    return logo;
  }

  if (!isSerializedBlob(logo)) {
    throw new Error("صيغة شعار إحدى المحافظ غير مدعومة");
  }

  const bytes = base64ToBytes(logo.base64);

  return new Blob([bytes], {
    type: logo.mimeType || "application/octet-stream",
  });
}

async function deserializeBackupWalletLogos(backup) {
  const wallets = await Promise.all(
    backup.data.electronicWallets.map(async (wallet) => ({
      ...wallet,
      logo: await deserializeWalletLogo(wallet.logo),
    }))
  );

  return {
    ...backup,
    data: {
      ...backup.data,
      electronicWallets: wallets,
    },
  };
}

// ================= إنشاء النسخة الشاملة =================

export async function createFullBackupService() {
  const data = await runInTransaction(
    BACKUP_STORE_NAMES,
    "readonly",
    async (tx) => getBackupData(tx)
  );

  const createdAt = new Date();

  const meta = {
    format: BACKUP_FORMAT,
    backupFormatVersion: BACKUP_FORMAT_VERSION,
    backupType: FULL_BACKUP_TYPE,
    backupId: generateBackupId(),

    createdAt: createdAt.toISOString(),
    businessDate: getBusinessDate(createdAt),
    timeZone: SYRIA_TIME_ZONE,

    appVersion: APP_VERSION,

    databaseName: DATABASE_NAME,
    databaseVersion: CURRENT_VERSION,

    includedStores: [...BACKUP_STORE_NAMES],
    recordCounts: calculateRecordCounts(data),
  };

  return { meta, data };
}

// ================= تحويل النسخة إلى Blob =================

export async function createFullBackupBlobService() {
  const rawBackup = await createFullBackupService();
  const backup = await serializeBackupForJson(rawBackup);

  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: "application/json" });

  return { backup, blob };
}

// ================= التحقق من Blob الخاص بالشعار =================

function validateWalletLogo(logo) {
  if (logo === null || logo === undefined) return true;

  if (typeof Blob !== "undefined" && logo instanceof Blob) {
    return true;
  }

  return isSerializedBlob(logo);
}

// ================= التحقق من مفاتيح السجلات =================

function validateStoreRecords(storeName, records) {
  const keys = new Set();

  for (const record of records) {
    if (!isObject(record)) {
      throw new Error(`يوجد سجل غير صالح في مخزن ${storeName}`);
    }

    let key;

    if (storeName === "cashboxes") {
      key = record.currency;

      if (!isValidCurrency(key)) {
        throw new Error("يوجد صندوق لا يحتوي على عملة صالحة");
      }
    } else if (storeName === "electronicWalletBalances") {
      if (!Number.isSafeInteger(record.walletId) || record.walletId <= 0) {
        throw new Error("يوجد رصيد محفظة بمعرف محفظة غير صالح");
      }

      if (!isValidCurrency(record.currency)) {
        throw new Error("يوجد رصيد محفظة بدون عملة صالحة");
      }

      key = JSON.stringify([record.walletId, record.currency]);
    } else {
      key = record.id;

      if (!Number.isSafeInteger(key) || key <= 0) {
        throw new Error(`يوجد سجل بمعرف غير صالح في مخزن ${storeName}`);
      }
    }

    if (keys.has(key)) {
      throw new Error(`يوجد مفتاح مكرر في مخزن ${storeName}`);
    }

    keys.add(key);
  }

  return keys;
}

// ================= تحديد مخازن النسخة حسب إصدارها =================

function getExpectedStores(meta) {
  if (meta.backupFormatVersion === LEGACY_BACKUP_FORMAT_VERSION) {
    if (meta.databaseVersion !== LEGACY_DATABASE_VERSION) {
      throw new Error("إصدار قاعدة البيانات للنسخة القديمة غير مدعوم");
    }

    return LEGACY_BACKUP_STORE_NAMES;
  }

  if (meta.backupFormatVersion === BACKUP_FORMAT_VERSION) {
    if (meta.databaseVersion !== CURRENT_VERSION) {
      throw new Error(
        "إصدار قاعدة البيانات في النسخة غير متوافق مع الإصدار الحالي"
      );
    }

    return BACKUP_STORE_NAMES;
  }

  throw new Error("إصدار تنسيق النسخة الاحتياطية غير مدعوم");
}

// ================= التحقق من بيانات النسخة =================

function validateFullBackup(backup) {
  if (!isObject(backup) || !isObject(backup.meta) || !isObject(backup.data)) {
    throw new Error("بنية ملف النسخة الاحتياطية غير صحيحة");
  }

  const { meta, data } = backup;

  if (meta.format !== BACKUP_FORMAT) {
    throw new Error("الملف ليس نسخة احتياطية صالحة للتطبيق");
  }

  if (meta.backupType !== FULL_BACKUP_TYPE) {
    throw new Error("هذا الملف ليس نسخة احتياطية شاملة");
  }

  if (typeof meta.backupId !== "string" || !meta.backupId.trim()) {
    throw new Error("معرف النسخة الاحتياطية غير صالح");
  }

  if (
    typeof meta.createdAt !== "string" ||
    !Number.isFinite(Date.parse(meta.createdAt))
  ) {
    throw new Error("تاريخ إنشاء النسخة غير صالح");
  }

  if (
    typeof meta.businessDate !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(meta.businessDate)
  ) {
    throw new Error("تاريخ العمل في النسخة غير صالح");
  }

  if (meta.timeZone !== SYRIA_TIME_ZONE) {
    throw new Error("المنطقة الزمنية للنسخة غير متوافقة");
  }

  if (meta.databaseName !== DATABASE_NAME) {
    throw new Error("النسخة تخص قاعدة بيانات مختلفة");
  }

  const expectedStores = getExpectedStores(meta);

  if (!Array.isArray(meta.includedStores)) {
    throw new Error("قائمة المخازن في النسخة غير صالحة");
  }

  const includedStores = new Set(meta.includedStores);

  if (
    includedStores.size !== expectedStores.length ||
    !expectedStores.every((name) => includedStores.has(name))
  ) {
    throw new Error("النسخة لا تحتوي مخازن البيانات المطلوبة لإصدارها");
  }

  if (!isObject(meta.recordCounts)) {
    throw new Error("إحصائيات النسخة غير صالحة");
  }

  const storeKeys = {};

  for (const storeName of expectedStores) {
    const records = data[storeName];

    if (!Array.isArray(records)) {
      throw new Error(`بيانات مخزن ${storeName} غير موجودة أو غير صالحة`);
    }

    if (
      !Number.isSafeInteger(meta.recordCounts[storeName]) ||
      meta.recordCounts[storeName] !== records.length
    ) {
      throw new Error(
        `عدد السجلات في مخزن ${storeName} لا يتطابق مع بيانات النسخة`
      );
    }

    storeKeys[storeName] = validateStoreRecords(storeName, records);
  }

  // التحقق من بيانات الأشخاص
  if (expectedStores.includes("parties")) {
    for (const party of data.parties) {
      if (typeof party.fullName !== "string" || !party.fullName.trim()) {
        throw new Error("يوجد شخص لا يحتوي على اسم صالح");
      }
    }
  }

  // التحقق من العلاقات بين الأشخاص وحركات الدين
  if (expectedStores.includes("debts")) {
    for (const debt of data.debts) {
      if (
        !Number.isSafeInteger(debt.partyId) ||
        !storeKeys.parties.has(debt.partyId)
      ) {
        throw new Error("توجد حركة دين مرتبطة بشخص غير موجود في النسخة");
      }

      if (
        typeof debt.amount !== "number" ||
        !Number.isFinite(debt.amount) ||
        debt.amount <= 0
      ) {
        throw new Error("يوجد مبلغ دين غير صالح");
      }

      if (!isValidCurrency(debt.currency)) {
        throw new Error("توجد حركة دين بدون عملة صالحة");
      }

      if (!["لنا", "له"].includes(debt.direction)) {
        throw new Error("يوجد اتجاه دين غير صالح");
      }
    }
  }

  // التحقق من بنية المحافظ وأرصدة العملات والحركات
  if (meta.backupFormatVersion === BACKUP_FORMAT_VERSION) {
    for (const wallet of data.electronicWallets) {
      if (typeof wallet.name !== "string" || !wallet.name.trim()) {
        throw new Error("توجد محفظة بدون اسم صالح");
      }

      if (typeof wallet.provider !== "string" || !wallet.provider.trim()) {
        throw new Error("توجد محفظة بدون مزود صالح");
      }

      if (!validateWalletLogo(wallet.logo)) {
        throw new Error("شعار إحدى المحافظ غير صالح");
      }
    }

    for (const balance of data.electronicWalletBalances) {
      if (!storeKeys.electronicWallets.has(balance.walletId)) {
        throw new Error("يوجد رصيد مرتبط بمحفظة غير موجودة");
      }

      if (
        typeof balance.balance !== "number" ||
        !Number.isFinite(balance.balance)
      ) {
        throw new Error("يوجد رصيد محفظة غير صالح");
      }
    }

    for (const operation of data.electronicWalletOperations) {
      if (!storeKeys.electronicWallets.has(operation.walletId)) {
        throw new Error("توجد حركة مرتبطة بمحفظة غير موجودة");
      }

      if (!isValidCurrency(operation.currency)) {
        throw new Error("توجد حركة محفظة بدون عملة صالحة");
      }

      if (!WALLET_OPERATION_TYPES.has(operation.operationType)) {
        throw new Error("يوجد نوع حركة محفظة غير مدعوم");
      }

      if (!Number.isFinite(operation.date)) {
        throw new Error("توجد حركة محفظة بتاريخ غير صالح");
      }
    }
  }

  // النسخ القديمة لا تحتوي مخازن المحافظ؛ نضيفها فارغة للتوافق مع قاعدة V4.
  const normalizedData = { ...data };

  if (meta.backupFormatVersion === LEGACY_BACKUP_FORMAT_VERSION) {
    for (const storeName of NEW_WALLET_STORE_NAMES) {
      normalizedData[storeName] = [];
    }
  }

  return {
    ...backup,
    data: normalizedData,
  };
}

// ================= قراءة ملف النسخة والتحقق منه =================

export async function parseFullBackupFileService(file) {
  let json;

  if (typeof file === "string") {
    json = file;
  } else if (typeof Blob !== "undefined" && file instanceof Blob) {
    json = await file.text();
  } else {
    throw new Error("يجب تمرير ملف JSON أو نص JSON صالح");
  }

  let backup;

  try {
    backup = JSON.parse(json);
  } catch {
    throw new Error("تعذر قراءة الملف: صيغة JSON غير صالحة");
  }

  const validatedBackup = validateFullBackup(backup);

  return deserializeBackupWalletLogos(validatedBackup);
}

// ================= استعادة النسخة الشاملة =================

export async function restoreFullBackupService(backup) {
  const validatedBackup = validateFullBackup(backup);
  const restorableBackup = await deserializeBackupWalletLogos(validatedBackup);

  return runInTransaction(BACKUP_STORE_NAMES, "readwrite", async (tx) => {
    await restoreBackupData(restorableBackup.data, tx);

    return {
      backupId: restorableBackup.meta.backupId,
      recordCounts: calculateRecordCounts(restorableBackup.data),
      restoredAt: new Date().toISOString(),
    };
  });
}
