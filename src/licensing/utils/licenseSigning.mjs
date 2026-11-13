/**
 * Shared signing serialization used by both:
 * - the local Node.js license issuer
 * - the React app when it verifies a license
 *
 * Keep this module dependency-free and do not change the signing context
 * without intentionally migrating the license format.
 */
export const LICENSE_SIGNING_CONTEXT = "exchange-office-license:v1";

function sortJsonKeys(value) {
  if (Array.isArray(value)) {
    return value.map(sortJsonKeys);
  }

  if (value !== null && typeof value === "object") {
    const prototype = Object.getPrototypeOf(value);

    if (prototype !== Object.prototype && prototype !== null) {
      throw new TypeError(
        "License payload must contain plain JSON objects only."
      );
    }

    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, sortJsonKeys(value[key])])
    );
  }

  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  throw new TypeError("License payload contains a non-JSON value.");
}

/**
 * Produces the exact UTF-8 text that must be signed and later verified.
 * Sorting object keys prevents property-order differences from changing bytes.
 */
export function serializeLicensePayloadForSigning(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new TypeError("License payload must be a plain object.");
  }

  return `${LICENSE_SIGNING_CONTEXT}\n${JSON.stringify(sortJsonKeys(payload))}`;
}
