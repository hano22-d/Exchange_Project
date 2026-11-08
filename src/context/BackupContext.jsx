import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import googleAuthService from "../integrations/googleDriveOAuth";
import {
  initializeBackupDriveService,
  uploadDailyBackupService,
  createEndOfDayBackupService,
  updateDailyArchiveIfExistsService,
  restoreFullBackupFromDriveService,
} from "../services/backupOrchestratorService";
import {
  flushBackupNow,
  getBackupSchedulerStatus,
  markBackupDirty,
  startBackupScheduler,
} from "../services/backupSchedulerService";

// ======================================================
// Context
// ======================================================

const BackupContext = createContext(null);

// ======================================================
// Token Request
// ======================================================

function requestTokenFromUserAction() {
  const existingToken = googleAuthService.getValidAccessToken();

  if (existingToken) {
    return Promise.resolve(existingToken);
  }

  return googleAuthService.requestGoogleAccessToken();
}

// ======================================================
// Provider
// ======================================================

export function BackupProvider({ children }) {
  const [authReady, setAuthReady] = useState(false);

  const [connected, setConnected] = useState(false);

  const [schedulerStatus, setSchedulerStatus] = useState(
    getBackupSchedulerStatus()
  );

  const [busyAction, setBusyAction] = useState(null);

  const [error, setError] = useState(null);

  const [message, setMessage] = useState(null);

  const [needsReload, setNeedsReload] = useState(false);

  // ----------------------------------------------------
  // Initialize Google Auth + Scheduler
  // ----------------------------------------------------

  useEffect(() => {
    let mounted = true;

    const stopScheduler = startBackupScheduler({
      onStatusChange: (nextStatus) => {
        if (!mounted) return;

        setSchedulerStatus(nextStatus);

        if (nextStatus.status === "auth-required") {
          setConnected(false);
        }
      },
    });

    googleAuthService
      .initializeGoogleAuth()
      .then(() => {
        if (!mounted) return;

        setAuthReady(true);
      })
      .catch((initializationError) => {
        if (!mounted) return;

        setError(
          initializationError?.message ||
            "Could not initialize Google authentication."
        );
      });

    return () => {
      mounted = false;

      stopScheduler();
    };
  }, []);

  // ----------------------------------------------------
  // Common Action Wrapper
  // ----------------------------------------------------

  const runAction = useCallback(
    async (actionName, operation) => {
      if (busyAction) return null;

      setBusyAction(actionName);

      setError(null);
      setMessage(null);

      try {
        return await operation();
      } catch (actionError) {
        setError(
          actionError?.message || "An unexpected backup error occurred."
        );

        return null;
      } finally {
        setBusyAction(null);
      }
    },
    [busyAction]
  );

  // ----------------------------------------------------
  // Connect Google Drive
  // ----------------------------------------------------

  const connectGoogleDrive = useCallback(() => {
    return runAction("connect", async () => {
      if (!authReady) {
        throw new Error("Google authentication is not initialized yet.");
      }

      // requestGoogleAccessToken is invoked synchronously
      // before awaiting its Promise.
      const tokenPromise = requestTokenFromUserAction();

      const token = await tokenPromise;

      setConnected(true);

      await initializeBackupDriveService(token);

      markBackupDirty("google-drive-connected");

      const result = await flushBackupNow();

      setMessage("تم ربط Google Drive ورفع النسخة الاحتياطية الأولى.");

      return result;
    });
  }, [authReady, runAction]);

  // ----------------------------------------------------
  // Manual Full Backup
  // ----------------------------------------------------

  const backupNow = useCallback(() => {
    return runAction("backup", async () => {
      if (!authReady) {
        throw new Error("Google authentication is not initialized yet.");
      }

      const tokenPromise = requestTokenFromUserAction();

      await tokenPromise;

      setConnected(true);

      const result = await flushBackupNow();

      setMessage("تم رفع النسخة الاحتياطية بنجاح.");

      return result;
    });
  }, [authReady, runAction]);

  // ----------------------------------------------------
  // Restore Current / Previous
  // ----------------------------------------------------

  const restoreFromDrive = useCallback(
    (source) => {
      return runAction("restore", async () => {
        if (!authReady) {
          throw new Error("Google authentication is not initialized yet.");
        }

        if (source !== "current" && source !== "previous") {
          throw new Error("Invalid restore source.");
        }

        const tokenPromise = requestTokenFromUserAction();

        const token = await tokenPromise;

        setConnected(true);

        const result = await restoreFullBackupFromDriveService({
          source,
          accessToken: token,
        });

        setNeedsReload(true);

        setMessage(
          "تمت الاستعادة بنجاح. أعد تحميل التطبيق لتحديث جميع الحالات."
        );

        return result;
      });
    },
    [authReady, runAction]
  );

  // ----------------------------------------------------
  // Create Daily Archive
  // ----------------------------------------------------

  const createDailyArchive = useCallback(
    (businessDate) => {
      return runAction("daily", async () => {
        if (!authReady) {
          throw new Error("Google authentication is not initialized yet.");
        }

        const tokenPromise = requestTokenFromUserAction();

        const token = await tokenPromise;

        setConnected(true);

        const result = await uploadDailyBackupService(businessDate, token);

        setMessage(`تم حفظ أرشيف يوم ${businessDate} بنجاح.`);

        return result;
      });
    },
    [authReady, runAction]
  );

  // ----------------------------------------------------
  // Reload After Restore
  // ----------------------------------------------------

  const reloadApplication = useCallback(() => {
    window.location.reload();
  }, []);

  const endOfDayBackup = useCallback(
    (businessDate) => {
      return runAction("end-of-day", async () => {
        const tokenPromise = requestTokenFromUserAction();

        const token = await tokenPromise;

        setConnected(true);

        const result = await createEndOfDayBackupService(businessDate, token);

        setMessage(`تم حفظ النسخة الكاملة وأرشيف يوم ${businessDate}.`);

        return result;
      });
    },
    [runAction]
  );

  const updateHistoricalDailyArchive = useCallback(
    (businessDate) => {
      return runAction("historical-daily", async () => {
        const tokenPromise = requestTokenFromUserAction();

        const token = await tokenPromise;

        setConnected(true);

        const result = await updateDailyArchiveIfExistsService(
          businessDate,
          token
        );

        if (result.action === "skipped") {
          setMessage(
            "لا يوجد أرشيف سابق لهذا اليوم، لذلك لم يتم إنشاء ملف جديد."
          );
        } else {
          setMessage(`تم تحديث أرشيف يوم ${businessDate}.`);
        }

        return result;
      });
    },
    [runAction]
  );

  // ----------------------------------------------------
  // Context Value
  // ----------------------------------------------------

  const value = useMemo(
    () => ({
      authReady,
      connected,

      schedulerStatus,

      isDirty: schedulerStatus.isDirty,
      isUploading: schedulerStatus.isUploading,
      lastBackupAt: schedulerStatus.lastBackupAt,

      busyAction,
      isBusy: Boolean(busyAction),

      error,
      message,

      needsReload,

      connectGoogleDrive,
      backupNow,
      restoreFromDrive,
      createDailyArchive,

      endOfDayBackup,
      updateHistoricalDailyArchive,

      reloadApplication,
    }),
    [
      authReady,
      connected,
      schedulerStatus,
      busyAction,
      error,
      message,
      needsReload,
      connectGoogleDrive,
      backupNow,
      restoreFromDrive,
      createDailyArchive,
      endOfDayBackup,
      updateHistoricalDailyArchive,
      reloadApplication,
    ]
  );

  return (
    <BackupContext.Provider value={value}>{children}</BackupContext.Provider>
  );
}

// ======================================================
// Custom Hook
// ======================================================

export function useBackup() {
  const context = useContext(BackupContext);

  if (!context) {
    throw new Error("useBackup must be used inside BackupProvider.");
  }

  return context;
}
