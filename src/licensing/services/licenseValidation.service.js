import { validateSignedLicense } from "../models/license.model.js";
import {
  getOrCreateInstallationId,
  isValidInstallationId,
} from "./installationId.service.js";
import { verifyLicenseSignature } from "./licenseSignature.service.js";

/**
 * Performs complete local license validation:
 * 1. Structure validation.
 * 2. Current Installation ID validation.
 * 3. Ed25519 signature verification.
 * 4. Installation ID matching.
 */
export async function validateLicense(license, currentInstallationId) {
  // Step 1: Validate the license structure.
  const structureResult = validateSignedLicense(license);

  if (!structureResult.valid) {
    return {
      valid: false,
      code: "INVALID_STRUCTURE",
      reason: structureResult.reason,
    };
  }

  // Step 2: Obtain the current installation ID.
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

  // Step 3: Verify the digital signature.
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

  // Step 4: Match the signed license to this installation.
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
