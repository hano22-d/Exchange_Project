import { saveLicense } from "../storage/licenseStorage.js";
import { validateLicense } from "./licenseValidation.service.js";

const MAX_LICENSE_FILE_SIZE = 64 * 1024;

// دالة ادارة تفعيل الترخيص مثل التحقق منه ثم حفظه
export async function activateLicenseFile(file, installationId) {
  if (!file || typeof file.text !== "function") {
    return {
      valid: false,
      code: "FILE_NOT_SELECTED",
      reason: "Please choose a license file first.",
    };
  }

  if (typeof file.size === "number" && file.size > MAX_LICENSE_FILE_SIZE) {
    return {
      valid: false,
      code: "FILE_TOO_LARGE",
      reason: "The selected license file is unexpectedly large.",
    };
  }

  let fileContent;

  try {
    fileContent = await file.text();
  } catch (error) {
    return {
      valid: false,
      code: "FILE_READ_ERROR",
      reason: "The selected license file could not be read.",
      details: error instanceof Error ? error.message : String(error),
    };
  }

  let license;

  try {
    license = JSON.parse(fileContent);
  } catch (error) {
    return {
      valid: false,
      code: "INVALID_JSON",
      reason: "The selected file is not valid JSON.",
      details: error instanceof Error ? error.message : String(error),
    };
  }

  const validation = await validateLicense(license, installationId);

  if (!validation.valid) {
    return validation;
  }

  try {
    saveLicense(license);
  } catch (error) {
    return {
      valid: false,
      code: "LICENSE_STORAGE_ERROR",
      reason: "The license is valid, but the browser could not save it.",
      details: error instanceof Error ? error.message : String(error),
    };
  }

  return {
    valid: true,
    code: "ACTIVATED",
    reason: null,
    license,
    installationId: validation.installationId,
  };
}
