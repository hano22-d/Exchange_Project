import {
  createFile,
  createFolder,
  downloadFile,
  findFilesByName,
  updateFile,
} from "../integrations/googleDriveApi";
import googleAuthService from "../integrations/googleDriveOAuth";
import {
  createFullBackupBlobService,
  createFullBackupService,
  parseFullBackupFileService,
  restoreFullBackupService,
} from "./backupService";

// ======================================================
// Constants
// ======================================================

export const BACKUP_FOLDER_NAME = "Exchange Office Backups";

export const DAILY_ARCHIVES_FOLDER_NAME = "Daily Archives";

export const CURRENT_BACKUP_FILE_NAME = "Exchange_Backup_Current.json";

export const PREVIOUS_BACKUP_FILE_NAME = "Exchange_Backup_Previous.json";

const DAILY_BACKUP_PREFIX = "Exchange_Backup_Daily_";

const PRE_RESTORE_BACKUP_PREFIX = "Exchange_Backup_PreRestore_";

const DRIVE_FOLDER_MIME_TYPE = "application/vnd.google-apps.folder";

const JSON_MIME_TYPE = "application/json";

const BUSINESS_TIME_ZONE = "Asia/Damascus";

const DAILY_STORE_NAMES = ["exchanges", "transfers", "debts"];

// ======================================================
// General Helpers
// ======================================================

function requireAccessToken(accessToken) {
  const token = accessToken || googleAuthService.getValidAccessToken();

  if (!token) {
    const error = new Error("Google Drive authorization is required.");

    error.code = "AUTH_REQUIRED";

    throw error;
  }

  return token;
}

function createOrchestratorError(message, code) {
  const error = new Error(message);

  error.code = code;

  return error;
}

function generateUniqueSuffix() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function validateBusinessDate(businessDate) {
  if (
    typeof businessDate !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(businessDate)
  ) {
    throw new Error("Business date must have YYYY-MM-DD format.");
  }

  const [year, month, day] = businessDate.split("-").map(Number);

  const date = new Date(Date.UTC(year, month - 1, day));

  const isValid =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() + 1 === month &&
    date.getUTCDate() === day;

  if (!isValid) {
    throw new Error("Invalid business date.");
  }

  return { year, month, day };
}

// ======================================================
// Drive File Lookup
// ======================================================

async function findUniqueDriveFileService({
  name,
  parentId,
  mimeType,
  accessToken,
}) {
  const token = requireAccessToken(accessToken);

  const files = await findFilesByName(name, token, parentId, mimeType);

  if (files.length > 1) {
    throw createOrchestratorError(
      `Multiple Google Drive files found with name: ${name}`,
      "DUPLICATE_DRIVE_FILES"
    );
  }

  return files[0] || null;
}

// ======================================================
// Backup Folder
// ======================================================

export async function getOrCreateBackupFolderService(accessToken) {
  const token = requireAccessToken(accessToken);

  const existingFolder = await findUniqueDriveFileService({
    name: BACKUP_FOLDER_NAME,
    parentId: "root",
    mimeType: DRIVE_FOLDER_MIME_TYPE,
    accessToken: token,
  });

  if (existingFolder) {
    return existingFolder;
  }

  const createdFolder = await createFolder(BACKUP_FOLDER_NAME, token, "root");

  if (!createdFolder?.id) {
    throw new Error("Google Drive did not return the backup folder ID.");
  }

  return createdFolder;
}

// ======================================================
// Daily Archives Folder
// ======================================================
export async function getOrCreateDailyArchivesFolderService(
  accessToken,
  backupFolderId
) {
  const token = requireAccessToken(accessToken);

  if (!backupFolderId) {
    throw new Error("Backup folder ID is required.");
  }

  const existingFolder = await findUniqueDriveFileService({
    name: DAILY_ARCHIVES_FOLDER_NAME,
    parentId: backupFolderId,
    mimeType: DRIVE_FOLDER_MIME_TYPE,
    accessToken: token,
  });

  if (existingFolder) {
    return existingFolder;
  }

  const createdFolder = await createFolder(
    DAILY_ARCHIVES_FOLDER_NAME,
    token,
    backupFolderId
  );

  if (!createdFolder?.id) {
    throw new Error("Google Drive did not return the daily folder ID.");
  }

  return createdFolder;
}

// ======================================================
// Create Or Update A Drive File
// ======================================================
export async function uploadOrUpdateDriveFileService({
  name,
  blob,
  parentId,
  accessToken,
  mimeType = JSON_MIME_TYPE,
}) {
  const token = requireAccessToken(accessToken);

  if (!name || !blob || !parentId) {
    throw new Error("File name, Blob and parent folder ID are required.");
  }

  const existingFile = await findUniqueDriveFileService({
    name,
    parentId,
    mimeType,
    accessToken: token,
  });

  if (existingFile) {
    const updatedFile = await updateFile(
      existingFile.id,
      blob,
      token,
      mimeType
    );

    return {
      action: "updated",
      file: updatedFile,
    };
  }

  const createdFile = await createFile(
    {
      name,
      blob,
      parentId,
      mimeType,
    },
    token
  );

  return {
    action: "created",
    file: createdFile,
  };
}

// ======================================================
// Current Full Backup
// ======================================================
export async function uploadCurrentBackupService(accessToken) {
  const token = requireAccessToken(accessToken);

  const backupFolder = await getOrCreateBackupFolderService(token);

  const { backup, blob } = await createFullBackupBlobService();

  const currentFile = await findUniqueDriveFileService({
    name: CURRENT_BACKUP_FILE_NAME,
    parentId: backupFolder.id,
    mimeType: JSON_MIME_TYPE,
    accessToken: token,
  });

  let previousResult = null;

  if (currentFile) {
    const oldCurrentBlob = await downloadFile(currentFile.id, token);

    previousResult = await uploadOrUpdateDriveFileService({
      name: PREVIOUS_BACKUP_FILE_NAME,
      blob: oldCurrentBlob,
      parentId: backupFolder.id,
      accessToken: token,
      mimeType: JSON_MIME_TYPE,
    });
  }

  let currentResult;

  if (currentFile) {
    const updatedFile = await updateFile(
      currentFile.id,
      blob,
      token,
      JSON_MIME_TYPE
    );

    currentResult = {
      action: "updated",
      file: updatedFile,
    };
  } else {
    const createdFile = await createFile(
      {
        name: CURRENT_BACKUP_FILE_NAME,
        blob,
        parentId: backupFolder.id,
        mimeType: JSON_MIME_TYPE,
      },
      token
    );

    currentResult = {
      action: "created",
      file: createdFile,
    };
  }

  return {
    backupId: backup.meta.backupId,
    recordCounts: backup.meta.recordCounts,
    uploadedAt: new Date().toISOString(),
    current: currentResult,
    previous: previousResult,
  };
}

// ======================================================
// Business Date -> UTC Range
// ======================================================
function getZonedMidnightTimestamp(
  businessDate,
  timeZone = BUSINESS_TIME_ZONE
) {
  const { year, month, day } = validateBusinessDate(businessDate);

  const targetUtc = Date.UTC(year, month - 1, day, 0, 0, 0);

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  let guess = targetUtc;

  for (let i = 0; i < 5; i++) {
    const parts = formatter.formatToParts(new Date(guess));

    const values = {};

    for (const part of parts) {
      if (part.type !== "literal") {
        values[part.type] = Number(part.value);
      }
    }

    const representedUtc = Date.UTC(
      values.year,
      values.month - 1,
      values.day,
      values.hour,
      values.minute,
      values.second
    );

    const difference = targetUtc - representedUtc;

    guess += difference;

    if (difference === 0) {
      break;
    }
  }

  return guess;
}

function getNextBusinessDate(businessDate) {
  const { year, month, day } = validateBusinessDate(businessDate);

  const nextDate = new Date(Date.UTC(year, month - 1, day + 1));

  return [
    nextDate.getUTCFullYear(),
    String(nextDate.getUTCMonth() + 1).padStart(2, "0"),
    String(nextDate.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function getBusinessDateRange(businessDate) {
  const nextBusinessDate = getNextBusinessDate(businessDate);

  return {
    from: getZonedMidnightTimestamp(businessDate),
    toExclusive: getZonedMidnightTimestamp(nextBusinessDate),
  };
}

// ======================================================
// Create Daily Backup
// =====================================================
export async function createDailyBackupBlobService(businessDate) {
  validateBusinessDate(businessDate);

  const { backup: fullBackup } = await createFullBackupService();

  const { from, toExclusive } = getBusinessDateRange(businessDate);

  const data = {};

  for (const storeName of DAILY_STORE_NAMES) {
    data[storeName] = fullBackup.data[storeName].filter((record) => {
      const timestamp = Number(record.date);

      return (
        Number.isFinite(timestamp) &&
        timestamp >= from &&
        timestamp < toExclusive
      );
    });
  }

  const recordCounts = {};

  for (const storeName of DAILY_STORE_NAMES) {
    recordCounts[storeName] = data[storeName].length;
  }

  const backup = {
    meta: {
      ...fullBackup.meta,
      backupId: generateUniqueSuffix(),
      backupType: "daily",
      businessDate,
      timeZone: BUSINESS_TIME_ZONE,
      includedStores: [...DAILY_STORE_NAMES],
      recordCounts,
    },
    data,
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: JSON_MIME_TYPE,
  });

  return { backup, blob };
}

// ======================================================
// Upload Or Update Daily Archive
// ======================================================
export async function uploadDailyBackupService(businessDate, accessToken) {
  const token = requireAccessToken(accessToken);

  validateBusinessDate(businessDate);

  const backupFolder = await getOrCreateBackupFolderService(token);

  const dailyFolder = await getOrCreateDailyArchivesFolderService(
    token,
    backupFolder.id
  );

  const { backup, blob } = await createDailyBackupBlobService(businessDate);

  const fileName = `${DAILY_BACKUP_PREFIX}${businessDate}.json`;

  const result = await uploadOrUpdateDriveFileService({
    name: fileName,
    blob,
    parentId: dailyFolder.id,
    accessToken: token,
    mimeType: JSON_MIME_TYPE,
  });

  return {
    backupId: backup.meta.backupId,
    businessDate,
    recordCounts: backup.meta.recordCounts,
    ...result,
  };
}

// ======================================================
// Restore Full Backup From Google Drive
// =====================================================
export async function restoreFullBackupFromDriveService({
  source = "current",
  accessToken,
}) {
  const token = requireAccessToken(accessToken);

  const sourceFileName =
    source === "current"
      ? CURRENT_BACKUP_FILE_NAME
      : source === "previous"
      ? PREVIOUS_BACKUP_FILE_NAME
      : null;

  if (!sourceFileName) {
    throw new Error('Restore source must be "current" or "previous".');
  }

  const backupFolder = await getOrCreateBackupFolderService(token);

  const sourceFile = await findUniqueDriveFileService({
    name: sourceFileName,
    parentId: backupFolder.id,
    mimeType: JSON_MIME_TYPE,
    accessToken: token,
  });

  if (!sourceFile) {
    throw createOrchestratorError(
      `Backup file not found: ${sourceFileName}`,
      "BACKUP_FILE_NOT_FOUND"
    );
  }

  const sourceBlob = await downloadFile(sourceFile.id, token);

  const backup = await parseFullBackupFileService(sourceBlob);

  if (backup.meta.backupType !== "full") {
    throw createOrchestratorError(
      "The selected file is not a full backup.",
      "INVALID_BACKUP_TYPE"
    );
  }

  const { backup: safetyBackup, blob: safetyBlob } =
    await createFullBackupBlobService();

  const safetyFileName =
    `${PRE_RESTORE_BACKUP_PREFIX}` +
    `${Date.now()}_${generateUniqueSuffix()}.json`;

  const safetyFile = await createFile(
    {
      name: safetyFileName,
      blob: safetyBlob,
      parentId: backupFolder.id,
      mimeType: JSON_MIME_TYPE,
    },
    token
  );

  if (!safetyFile?.id) {
    throw new Error("Could not save the pre-restore safety backup.");
  }

  const restoreResult = await restoreFullBackupService(backup);

  return {
    source,
    sourceFileId: sourceFile.id,
    sourceBackupId: backup.meta.backupId,
    safetyBackupId: safetyBackup.meta.backupId,
    safetyFileId: safetyFile.id,
    safetyFileName,
    restoredAt: new Date().toISOString(),
    restoreResult,
  };
}

// ======================================================
// Initialize Google Drive Backup Folders
// ======================================================
export async function initializeBackupDriveService(accessToken) {
  const token = requireAccessToken(accessToken);

  const backupFolder = await getOrCreateBackupFolderService(token);

  const dailyFolder = await getOrCreateDailyArchivesFolderService(
    token,
    backupFolder.id
  );

  return {
    backupFolder,
    dailyFolder,
  };
}

export async function updateDailyArchiveIfExistsService(
  businessDate,
  accessToken
) {
  const token = requireAccessToken(accessToken);

  validateBusinessDate(businessDate);

  const backupFolder = await getOrCreateBackupFolderService(token);

  const dailyFolder = await getOrCreateDailyArchivesFolderService(
    token,
    backupFolder.id
  );

  const fileName = `${DAILY_BACKUP_PREFIX}${businessDate}.json`;

  const existingFile = await findUniqueDriveFileService({
    name: fileName,
    parentId: dailyFolder.id,
    mimeType: JSON_MIME_TYPE,
    accessToken: token,
  });

  if (!existingFile) {
    return {
      action: "skipped",
      reason: "daily-archive-does-not-exist",
      businessDate,
    };
  }

  const { backup, blob } = await createDailyBackupBlobService(businessDate);

  const updatedFile = await updateFile(
    existingFile.id,
    blob,
    token,
    JSON_MIME_TYPE
  );

  return {
    action: "updated",
    file: updatedFile,
    backupId: backup.meta.backupId,
    businessDate,
  };
}

export async function createEndOfDayBackupService(businessDate, accessToken) {
  const token = requireAccessToken(accessToken);

  const fullBackup = await uploadCurrentBackupService(token);

  const dailyBackup = await uploadDailyBackupService(businessDate, token);

  return {
    fullBackup,
    dailyBackup,
  };
}
