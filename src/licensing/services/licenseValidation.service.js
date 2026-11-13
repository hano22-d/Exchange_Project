import { validateSignedLicense } from "../models/license.model.js";
import {
  getOrCreateInstallationId,
  isValidInstallationId,
} from "./installationId.service.js";
import { verifyLicenseSignature } from "./licenseSignature.service.js";


//دالة التحقق الشامل من الترخيص (التحقق البنيوي والتشفيري ومطابقة المعرف الموجود في الترخيص مع معرف الترخيص)
export async function validateLicense(license, currentInstallationId) {
  // 1 التحقق من صحة بنية بيانات الترخيص (Structure)
  const structureResult = validateSignedLicense(license);

  if (!structureResult.valid) {
    return {
      valid: false,
      code: "INVALID_STRUCTURE",
      reason: structureResult.reason,
    };
  }

  // 2 التحقق من صحة معرّف التثبيت الحالي (Current Installation ID)
  let installationId = currentInstallationId;

  try {
    installationId = installationId ?? getOrCreateInstallationId();
  } catch (error) {
    return {
      valid: false,
      code: "INSTALLATION_ID_UNAVAILABLE",
      reason:
        "The current browser installation ID could not be read or created.",
      details: error instanceof Error ? error.message : String(error),
    };
  }

  if (!isValidInstallationId(installationId)) {
    return {
      valid: false,
      code: "INVALID_LOCAL_INSTALLATION_ID",
      reason: "The current browser installation ID is invalid.",
    };
  }

  // 3 التحقق من صحة التوقيع الرقمي باستخدام خوارزمية Ed25519
  let signatureResult;

  try {
    signatureResult = await verifyLicenseSignature(license);
  } catch (error) {
    return {
      valid: false,
      code: "SIGNATURE_VERIFICATION_ERROR",
      reason:
        "The browser could not complete cryptographic signature verification.",
      details: error instanceof Error ? error.message : String(error),
    };
  }

  if (!signatureResult.valid) {
    return {
      valid: false,
      code: "INVALID_SIGNATURE",
      reason: signatureResult.reason,
      details: signatureResult.details ?? null,
    };
  }

  // 4 مطابقة معرف التثبيت القادم مع الترخيص بالمعرف الحالي للتطبيق
  if (
    license.payload.installationId.toLowerCase() !==
    installationId.toLowerCase()
  ) {
    return {
      valid: false,
      code: "INSTALLATION_MISMATCH",
      reason: "This license was issued for a different browser installation.",
    };
  }

  return {
    valid: true,
    code: "VALID",
    reason: null,
    license,
    installationId,
  };
}
