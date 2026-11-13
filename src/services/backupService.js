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
const BACKUP_FORMAT_VERSION = 1;
const FULL_BACKUP_TYPE = "full";
const SYRIA_TIME_ZONE = "Asia/Damascus";
const APP_VERSION = packageInfo.version ?? "unknown";

// ================= الدوال المساعدة =================

// إنشاء معرف فريد للنسخة الاحتياطية
function generateBackupId() {
  if (!globalThis.crypto?.randomUUID) {
    throw new Error("المتصفح لا يدعم إنشاء معرفات النسخ الاحتياطية");
  }

  return globalThis.crypto.randomUUID();
}

// استخراج تاريخ العمل حسب توقيت دمشق
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

// حساب عدد السجلات في كل مخزن
function calculateRecordCounts(data) {
  return Object.fromEntries(
    BACKUP_STORE_NAMES.map((storeName) => [storeName, data[storeName].length])
  );
}

// التحقق من أن القيمة كائن وليست null أو Array
function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

// ================= إنشاء النسخة الشاملة =================
export async function createFullBackupService() {
  // جلب Snapshot من جميع مخازن IndexedDB
  const data = await runInTransaction(
    BACKUP_STORE_NAMES,
    "readonly",
    async (tx) => {
      return getBackupData(tx);
    }
  );

  const createdAt = new Date();

  // تجهيز البيانات الوصفية
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

  return {
    meta,
    data,
  };
}

// ================= تحويل النسخة إلى Blob =================
export async function createFullBackupBlobService() {
  const backup = await createFullBackupService();

  const json = JSON.stringify(backup, null, 2);

  const blob = new Blob([json], {
    type: "application/json",
  });

  return {
    backup,
    blob,
  };
}

// ================= التحقق من مفاتيح السجلات =================
function validateStoreRecords(storeName, records) {
  const keys = new Set();

  for (const record of records) {
    if (!isObject(record)) {
      throw new Error(`يوجد سجل غير صالح في مخزن ${storeName}`);
    }

    // الصناديق تستخدم currency كمفتاح أساسي
    const key = storeName === "cashboxes" ? record.currency : record.id;

    if (storeName === "cashboxes" && (typeof key !== "string" || !key.trim())) {
      throw new Error("يوجد صندوق لا يحتوي على عملة صالحة");
    }

    if (storeName !== "cashboxes" && (!Number.isSafeInteger(key) || key <= 0)) {
      throw new Error(`يوجد سجل بمعرف غير صالح في مخزن ${storeName}`);
    }

    // منع تكرار المفاتيح الأساسية
    if (keys.has(key)) {
      throw new Error(`يوجد مفتاح مكرر في مخزن ${storeName}`);
    }

    keys.add(key);
  }

  return keys;
}

// ================= التحقق من بيانات النسخة =================
function validateFullBackup(backup) {
  if (!isObject(backup) || !isObject(backup.meta) || !isObject(backup.data)) {
    throw new Error("بنية ملف النسخة الاحتياطية غير صحيحة");
  }

  const { meta, data } = backup;

  // التحقق من هوية الملف
  if (meta.format !== BACKUP_FORMAT) {
    throw new Error("الملف ليس نسخة احتياطية صالحة للتطبيق");
  }

  // التحقق من إصدار تنسيق النسخة
  if (meta.backupFormatVersion !== BACKUP_FORMAT_VERSION) {
    throw new Error("إصدار تنسيق النسخة الاحتياطية غير مدعوم");
  }

  // منع استرجاع نسخة يومية كنسخة شاملة
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

  // التحقق من قاعدة البيانات
  if (meta.databaseName !== DATABASE_NAME) {
    throw new Error("النسخة تخص قاعدة بيانات مختلفة");
  }

  if (meta.databaseVersion !== CURRENT_VERSION) {
    throw new Error(
      "إصدار قاعدة البيانات في النسخة غير متوافق مع الإصدار الحالي"
    );
  }

  // التحقق من المخازن المشمولة
  if (!Array.isArray(meta.includedStores)) {
    throw new Error("قائمة المخازن في النسخة غير صالحة");
  }

  const includedStores = new Set(meta.includedStores);

  if (
    includedStores.size !== BACKUP_STORE_NAMES.length ||
    !BACKUP_STORE_NAMES.every((name) => includedStores.has(name))
  ) {
    throw new Error("النسخة لا تحتوي جميع مخازن البيانات المطلوبة");
  }

  // التحقق من عدد السجلات
  if (!isObject(meta.recordCounts)) {
    throw new Error("إحصائيات النسخة غير صالحة");
  }

  // التحقق من البيانات داخل كل مخزن
  const storeKeys = {};

  for (const storeName of BACKUP_STORE_NAMES) {
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
  for (const party of data.parties) {
    if (typeof party.fullName !== "string" || !party.fullName.trim()) {
      throw new Error("يوجد شخص لا يحتوي على اسم صالح");
    }
  }

  // التحقق من العلاقات بين الأشخاص وحركات الدين
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

    if (typeof debt.currency !== "string" || !debt.currency.trim()) {
      throw new Error("توجد حركة دين بدون عملة صالحة");
    }

    if (!["لنا", "له"].includes(debt.direction)) {
      throw new Error("يوجد اتجاه دين غير صالح");
    }
  }

  return backup;
}

// ================= قراءة ملف النسخة والتحقق منه =================
export async function parseFullBackupFileService(file) {
  let json;

  if (typeof file === "string") {
    json = file;
  } else if (file instanceof Blob) {
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

  return validateFullBackup(backup);
}

// ================= استعادة النسخة الشاملة =================
export async function restoreFullBackupService(backup) {
    const validatedBackup = validateFullBackup(backup);
  
    return runInTransaction(
      BACKUP_STORE_NAMES,
      "readwrite",
      async (tx) => {
        await restoreBackupData(
          validatedBackup.data,
          tx
        );
  
        return {
          backupId: validatedBackup.meta.backupId,
          recordCounts: validatedBackup.meta.recordCounts,
          restoredAt: new Date().toISOString(),
        };
      }
    );
  }
