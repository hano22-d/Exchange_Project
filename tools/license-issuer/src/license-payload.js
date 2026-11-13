import { randomBytes } from "node:crypto";

const INSTALLATION_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function createLicenseId() {
  const year = new Date().getUTCFullYear();
  const randomPart = randomBytes(8).toString("hex").toUpperCase();

  return `LIC-${year}-${randomPart}`;
}

export function validateLicenseInput({ customerName, installationId }) {
  if (
    typeof customerName !== "string" ||
    customerName.trim().length === 0 ||
    customerName.trim().length > 150
  ) {
    return {
      valid: false,
      reason: "Customer name must contain 1 to 150 characters.",
    };
  }

  if (
    typeof installationId !== "string" ||
    !INSTALLATION_ID_PATTERN.test(installationId.trim())
  ) {
    return {
      valid: false,
      reason: "Installation ID must be a valid UUID version 4.",
    };
  }

  return { valid: true, reason: null };
}

export function createLicensePayload({
  customerName,
  installationId,
  licenseId = createLicenseId(),
  issuedAt = new Date().toISOString(),
}) {
  const normalizedInput = {
    customerName: customerName.trim(),
    installationId: installationId.trim(),
  };

  const validation = validateLicenseInput(normalizedInput);

  if (!validation.valid) {
    throw new Error(validation.reason);
  }

  return {
    schemaVersion: 1,
    licenseId,
    productId: "exchange-office",
    customerName: normalizedInput.customerName,
    installationId: normalizedInput.installationId,
    licenseType: "perpetual",
    issuedAt,
    expiresAt: null,
  };
}
