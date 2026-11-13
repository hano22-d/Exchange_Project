export const LICENSE_SCHEMA_VERSION = 1;
export const LICENSE_PRODUCT_ID = "exchange-office";

export const LICENSE_TYPE = Object.freeze({
  PERPETUAL: "perpetual",
});

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const BASE64_PATTERN =
  /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)$/;

// التحقق من صلاحية النصوص
function isNonEmptyString(value, maxLength = 200) {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.length <= maxLength
  );
}

//التحقق من تاريخ اصدار الترخيص
function isCanonicalIsoDate(value) {
  if (typeof value !== "string") {
    return false;
  }

  const timestamp = Date.parse(value);

  return (
    Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value
  );
}

// من الترخيص المستلم والتحقق منه بنيويا payload تكوين بيانات الترخيص
export function createLicensePayload({
  licenseId,
  customerName,
  installationId,
  issuedAt = new Date().toISOString(),
} = {}) {
  const payload = {
    schemaVersion: LICENSE_SCHEMA_VERSION,
    licenseId: typeof licenseId === "string" ? licenseId.trim() : licenseId,
    productId: LICENSE_PRODUCT_ID,
    customerName:
      typeof customerName === "string" ? customerName.trim() : customerName,
    installationId,
    licenseType: LICENSE_TYPE.PERPETUAL,
    issuedAt,
    expiresAt: null,
  };

  const validation = validateLicensePayload(payload);

  if (!validation.valid) {
    throw new Error(`Cannot create license payload: ${validation.reason}`);
  }

  return payload;
}

// دالة التحقق من بنية كائن بيانات الترخيص
export function validateLicensePayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { valid: false, reason: "License payload must be an object." };
  }

  if (payload.schemaVersion !== LICENSE_SCHEMA_VERSION) {
    return { valid: false, reason: "Unsupported license schema version." };
  }

  if (payload.productId !== LICENSE_PRODUCT_ID) {
    return { valid: false, reason: "This license belongs to another product." };
  }

  if (!isNonEmptyString(payload.licenseId, 100)) {
    return { valid: false, reason: "License ID is missing or invalid." };
  }

  if (!isNonEmptyString(payload.customerName, 150)) {
    return { valid: false, reason: "Customer name is missing or invalid." };
  }

  if (
    typeof payload.installationId !== "string" ||
    !UUID_V4_PATTERN.test(payload.installationId)
  ) {
    return { valid: false, reason: "Installation ID is missing or invalid." };
  }

  if (payload.licenseType !== LICENSE_TYPE.PERPETUAL) {
    return { valid: false, reason: "Unsupported license type." };
  }

  if (!isCanonicalIsoDate(payload.issuedAt)) {
    return { valid: false, reason: "License issue date is invalid." };
  }

  if (payload.expiresAt !== null) {
    return {
      valid: false,
      reason: "A perpetual license must have expiresAt set to null.",
    };
  }

  return { valid: true, reason: null };
}

// (payload + signature) دالة التحقق من كائن الترخيص النهائي
export function validateSignedLicense(license) {
  if (!license || typeof license !== "object" || Array.isArray(license)) {
    return { valid: false, reason: "Signed license must be an object." };
  }

  const payloadValidation = validateLicensePayload(license.payload);

  if (!payloadValidation.valid) {
    return payloadValidation;
  }

  if (
    typeof license.signature !== "string" ||
    license.signature.length === 0 ||
    !BASE64_PATTERN.test(license.signature)
  ) {
    return {
      valid: false,
      reason: "License signature is missing or malformed.",
    };
  }

  return { valid: true, reason: null };
}
