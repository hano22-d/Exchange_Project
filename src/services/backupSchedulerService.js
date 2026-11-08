import googleAuthService from "../integrations/googleDriveOAuth";
import { uploadCurrentBackupService } from "./backupOrchestratorService";

// ======================================================
// Configuration
// ======================================================

const DEBOUNCE_DELAY = 60 * 1000;

const MAX_WAIT_DELAY = 5 * 60 * 1000;

const RETRY_DELAY = 30 * 1000;

// ======================================================
// Internal State
// ======================================================

let schedulerStarted = false;

let debounceTimer = null;
let maxWaitTimer = null;
let retryTimer = null;

let firstDirtyAt = null;

let uploadPromise = null;

let rerunRequested = false;

const listeners = new Set();

const schedulerState = {
  status: "idle",
  isDirty: false,
  isUploading: false,
  revision: 0,
  lastBackupAt: null,
  lastError: null,
  lastChangeReason: null,
};

// ======================================================
// State Helpers
// ======================================================

function publishStatus() {
  const snapshot = { ...schedulerState };

  for (const listener of listeners) {
    listener(snapshot);
  }
}

export function getBackupSchedulerStatus() {
  return { ...schedulerState };
}

function isOnline() {
  return typeof navigator === "undefined" || navigator.onLine !== false;
}

function createAuthRequiredError() {
  const error = new Error("Reconnect Google Drive to continue backup.");

  error.code = "AUTH_REQUIRED";

  return error;
}

function clearTimer(timer) {
  if (timer !== null) {
    window.clearTimeout(timer);
  }
}

function clearScheduledTimers() {
  clearTimer(debounceTimer);
  clearTimer(maxWaitTimer);
  clearTimer(retryTimer);

  debounceTimer = null;
  maxWaitTimer = null;
  retryTimer = null;
}

// ======================================================
// Schedule Automatic Upload
// ======================================================

function scheduleAutomaticBackup() {
  if (!schedulerStarted) return;

  if (!schedulerState.isDirty) return;

  if (schedulerState.status === "auth-required") {
    return;
  }

  if (!isOnline()) {
    schedulerState.status = "offline";
    publishStatus();
    return;
  }

  clearTimer(debounceTimer);

  debounceTimer = window.setTimeout(() => {
    debounceTimer = null;

    executeAutomaticBackup("debounce").catch(() => {});
  }, DEBOUNCE_DELAY);


  if (maxWaitTimer === null) {
    const elapsed = firstDirtyAt ? Date.now() - firstDirtyAt : 0;

    const remaining = Math.max(0, MAX_WAIT_DELAY - elapsed);

    maxWaitTimer = window.setTimeout(() => {
      maxWaitTimer = null;

      executeAutomaticBackup("maximum-wait").catch(() => {});
    }, remaining);
  }
}

// ======================================================
// Mark Local Database As Dirty
// ======================================================

export function markBackupDirty(reason = "database-change") {
  schedulerState.revision += 1;

  schedulerState.isDirty = true;

  schedulerState.lastChangeReason = reason;

  schedulerState.status = schedulerState.isUploading ? "uploading" : "dirty";

  if (firstDirtyAt === null) {
    firstDirtyAt = Date.now();
  }

  publishStatus();

  scheduleAutomaticBackup();

  return schedulerState.revision;
}

// ======================================================
// Execute Upload
// ======================================================

async function executeBackup({
  force = false,
  accessToken = null,
  reason = "automatic",
  throwOnError = false,
} = {}) {
  if (uploadPromise) {
    rerunRequested = true;

    return uploadPromise;
  }

  if (!force && !schedulerState.isDirty) {
    return null;
  }

  if (!isOnline()) {
    schedulerState.status = "offline";
    publishStatus();

    if (throwOnError) {
      throw new Error("There is no internet connection.");
    }

    return null;
  }

  const token = accessToken || googleAuthService.getValidAccessToken();

  if (!token) {
    schedulerState.status = "auth-required";
    schedulerState.lastError = null;

    publishStatus();

    if (throwOnError) {
      throw createAuthRequiredError();
    }

    return null;
  }

  if (force && !schedulerState.isDirty) {
    schedulerState.revision += 1;

    schedulerState.isDirty = true;

    firstDirtyAt = Date.now();
  }

  clearScheduledTimers();

  const snapshotRevision = schedulerState.revision;

  schedulerState.isUploading = true;
  schedulerState.status = "uploading";
  schedulerState.lastError = null;

  publishStatus();

  const operation = (async () => {
    try {
      const result = await uploadCurrentBackupService(token);

      schedulerState.lastBackupAt = new Date().toISOString();

      schedulerState.lastError = null;

      if (schedulerState.revision === snapshotRevision) {
        schedulerState.isDirty = false;

        firstDirtyAt = null;

        schedulerState.status = "success";
      } else {
        schedulerState.isDirty = true;

        schedulerState.status = "dirty";
      }

      publishStatus();

      return {
        ...result,
        reason,
        uploadedRevision: snapshotRevision,
        currentRevision: schedulerState.revision,
      };
    } catch (error) {
      schedulerState.lastError = error?.message || "Backup upload failed.";

      const requiresAuthentication =
        error?.code === "AUTH_REQUIRED" || error?.status === 401;

      if (requiresAuthentication) {
        schedulerState.status = "auth-required";
      } else if (!isOnline()) {
        schedulerState.status = "offline";
      } else {
        schedulerState.status = "error";
      }

      publishStatus();

      if (
        schedulerStarted &&
        schedulerState.isDirty &&
        schedulerState.status === "error"
      ) {
        retryTimer = window.setTimeout(() => {
          retryTimer = null;

          executeAutomaticBackup("retry").catch(() => {});
        }, RETRY_DELAY);
      }

      if (throwOnError) {
        throw error;
      }

      return null;
    } finally {
      schedulerState.isUploading = false;

      uploadPromise = null;

      publishStatus();

      const wasRerunRequested = rerunRequested;

      rerunRequested = false;

      if (
        schedulerStarted &&
        schedulerState.isDirty &&
        schedulerState.status === "dirty"
      ) {
        if (wasRerunRequested || schedulerState.isDirty) {
          scheduleAutomaticBackup();
        }
      }
    }
  })();

  uploadPromise = operation;

  return operation;
}

// ======================================================
// Automatic Backup Entry
// ======================================================

function executeAutomaticBackup(reason) {
  return executeBackup({
    force: false,
    reason,
    throwOnError: false,
  });
}

// ======================================================
// Manual Backup
// ======================================================

export async function flushBackupNow() {
  const token = googleAuthService.getValidAccessToken();

  if (!token) {
    throw createAuthRequiredError();
  }

  if (!isOnline()) {
    throw new Error("There is no internet connection.");
  }

  clearScheduledTimers();

  return executeBackup({
    force: true,
    accessToken: token,
    reason: "manual",
    throwOnError: true,
  });
}

// ======================================================
// Browser Events
// ======================================================

function handleOnline() {
  if (!schedulerState.isDirty) return;

  schedulerState.status = "dirty";

  publishStatus();

  executeAutomaticBackup("internet-restored").catch(() => {});
}

function handleVisibilityChange() {
  if (!schedulerState.isDirty) return;

  if (document.visibilityState !== "visible") {
    return;
  }

  executeAutomaticBackup("app-resumed").catch(() => {});
}

// ======================================================
// Start Scheduler
// ======================================================

function startInternalScheduler() {
  if (schedulerStarted) return;

  schedulerStarted = true;

  window.addEventListener("online", handleOnline);

  document.addEventListener("visibilitychange", handleVisibilityChange);

  if (schedulerState.isDirty) {
    scheduleAutomaticBackup();
  }
}

function stopInternalScheduler() {
  if (!schedulerStarted) return;

  schedulerStarted = false;

  clearScheduledTimers();

  window.removeEventListener("online", handleOnline);

  document.removeEventListener("visibilitychange", handleVisibilityChange);
}

export function startBackupScheduler({ onStatusChange } = {}) {
  if (onStatusChange) {
    listeners.add(onStatusChange);
  }

  startInternalScheduler();

  if (onStatusChange) {
    onStatusChange(getBackupSchedulerStatus());
  }

  return function stopThisScheduler() {
    if (onStatusChange) {
      listeners.delete(onStatusChange);
    }

    if (listeners.size === 0) {
      stopInternalScheduler();
    }
  };
}
