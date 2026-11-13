import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { activateLicenseFile as activateLicenseFileService } from "../licensing/services/licenseActivation.service.js";

import {
  getStoredLicense,
  removeStoredLicense,
} from "../licensing/storage/licenseStorage.js";

import { getOrCreateInstallationId } from "../licensing/services/installationId.service.js";

import { validateLicense } from "../licensing/services/licenseValidation.service.js";


const LicenseContext = createContext(null);

export function LicenseProvider({ children }) {
  const [status, setStatus] = useState("checking");
  const [license, setLicense] = useState(null);
  const [installationId, setInstallationId] = useState(null);
  const [error, setError] = useState(null);

  const checkStoredLicense = useCallback(async () => {
    setStatus("checking");
    setError(null);

    try {
      const currentId = getOrCreateInstallationId();
      setInstallationId(currentId);

      const storedLicense = getStoredLicense();

      if (!storedLicense) {
        setLicense(null);
        setStatus("unlicensed");
        return { valid: false, code: "NO_LICENSE", reason: null };
      }

      //نرسل الترخيص والمعرف الخاص بالتطبيق الى دالة التحقق العامة
      const result = await validateLicense(storedLicense, currentId);

      if (!result.valid) {
        // Keep the stored file for diagnosis. A valid replacement may overwrite
        // it only after that replacement passes all validation steps.
        setLicense(null);
        setError(result);
        setStatus("invalid");
        return result;
      }

      setLicense(storedLicense);
      setError(null);
      setStatus("licensed");
      return result;
    } catch (cause) {
      const failure = {
        code: "LICENSE_INITIALIZATION_ERROR",
        reason:
          cause instanceof Error
            ? cause.message
            : "The licensing system could not be initialized.",
      };

      setLicense(null);
      setError(failure);
      setStatus("error");
      return { valid: false, ...failure };
    }
  }, []);

  useEffect(() => {
    // In React StrictMode this check may run twice during development.
    // It is safe: reading the same installation ID/license is idempotent,
    // and the imported public CryptoKey is cached by the signature service.
    void checkStoredLicense();
  }, [checkStoredLicense]);

  const activateLicenseFile = useCallback(
    async (file) => {
      setStatus("activating");
      setError(null);

      let currentId = installationId;

      try {
        currentId = currentId ?? getOrCreateInstallationId();
        setInstallationId(currentId);
      } catch (cause) {
        const failure = {
          valid: false,
          code: "INSTALLATION_ID_UNAVAILABLE",
          reason:
            cause instanceof Error
              ? cause.message
              : "The installation ID is unavailable.",
        };
        setStatus("unlicensed");
        setError(failure);
        return failure;
      }

      let result;

      try {
        result = await activateLicenseFileService(file, currentId);
      } catch (cause) {
        result = {
          valid: false,
          code: "ACTIVATION_UNEXPECTED_ERROR",
          reason:
            cause instanceof Error
              ? cause.message
              : "An unexpected activation error occurred.",
        };
      }

      if (!result.valid) {
        setLicense(null);
        setStatus("unlicensed");
        setError(result);
        return result;
      }

      setLicense(result.license);
      setError(null);
      setStatus("licensed");
      return result;
    },
    [installationId]
  );

  const deactivateLicense = useCallback(() => {
    try {
      removeStoredLicense();
      setLicense(null);
      setError(null);
      setStatus("unlicensed");
      return { success: true };
    } catch (cause) {
      const failure = {
        code: "LICENSE_REMOVAL_ERROR",
        reason:
          cause instanceof Error
            ? cause.message
            : "The saved license could not be removed.",
      };
      setError(failure);
      setStatus("error");
      return { success: false, error: failure };
    }
  }, []);

  const value = useMemo(
    () => ({
      status,
      license,
      installationId,
      error,
      activateLicenseFile,
      checkStoredLicense,
      deactivateLicense,
    }),
    [
      status,
      license,
      installationId,
      error,
      activateLicenseFile,
      checkStoredLicense,
      deactivateLicense,
    ]
  );

  return (
    <LicenseContext.Provider value={value}>{children}</LicenseContext.Provider>
  );
}

export function useLicense() {
  const context = useContext(LicenseContext);

  if (!context) {
    throw new Error("useLicense must be used inside LicenseProvider.");
  }

  return context;
}
