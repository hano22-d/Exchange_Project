import { LICENSE_PUBLIC_KEY_RAW_BASE64 } from "../constants/licensePublicKey";
import { serializeLicensePayloadForSigning } from "../utils/licenseSigning.mjs";

const ED25519_PUBLIC_KEY_LENGTH = 32;
const ED25519_SIGNATURE_LENGTH = 64;

// Cache the imported CryptoKey so we do not import it on every verification.
let importedPublicKeyPromise = null;

/**
 * Returns the browser's SubtleCrypto API.
 */
function getSubtleCrypto() {
  const subtle = globalThis.crypto?.subtle;

  if (!subtle) {
    throw new Error(
      "Web Crypto API is unavailable. Open the app using HTTPS or localhost."
    );
  }

  return subtle;
}

/**
 * Decodes a Base64 string into Uint8Array bytes.
 */
function decodeBase64ToBytes(value, fieldName) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${fieldName} must be a non-empty Base64 string.`);
  }

  if (typeof globalThis.atob !== "function") {
    throw new Error(
      "The browser does not support the Base64 decoder required by licensing."
    );
  }

  let binaryString;

  try {
    binaryString = globalThis.atob(value.trim());
  } catch (error) {
    throw new Error(`${fieldName} contains invalid Base64 data.`, {
      cause: error,
    });
  }

  return Uint8Array.from(binaryString, (character) => character.charCodeAt(0));
}

/**
 * Imports the raw Ed25519 public key into Web Crypto.
 * The imported key is cached for later verification calls.
 */
async function getLicensePublicKey() {
  if (!importedPublicKeyPromise) {
    importedPublicKeyPromise = (async () => {
      const publicKeyBytes = decodeBase64ToBytes(
        LICENSE_PUBLIC_KEY_RAW_BASE64,
        "License public key"
      );

      if (publicKeyBytes.length !== ED25519_PUBLIC_KEY_LENGTH) {
        throw new Error(
          `The Ed25519 public key must contain exactly ${ED25519_PUBLIC_KEY_LENGTH} bytes.`
        );
      }

      return getSubtleCrypto().importKey(
        "raw",
        publicKeyBytes,
        {
          name: "Ed25519",
        },
        false,
        ["verify"]
      );
    })().catch((error) => {
      importedPublicKeyPromise = null;

      throw error;
    });
  }

  return importedPublicKeyPromise;
}

/**
 * Verifies the digital signature of a signed license.
 *
 * Expected input:
 * {
 *   payload: {...},
 *   signature: "BASE64_SIGNATURE"
 * }
 *
 * Returns:
 * {
 *   valid: boolean,
 *   reason: string | null
 * }
 *
 * This function verifies the cryptographic signature only.
 * Structural validation and Installation ID matching are handled elsewhere.
 */
export async function verifyLicenseSignature(license) {
  if (
    !license ||
    typeof license !== "object" ||
    Array.isArray(license) ||
    !license.payload ||
    typeof license.payload !== "object" ||
    Array.isArray(license.payload) ||
    typeof license.signature !== "string"
  ) {
    return {
      valid: false,
      reason: "The signed license structure is invalid.",
    };
  }

  let signatureBytes;

  try {
    signatureBytes = decodeBase64ToBytes(
      license.signature,
      "License signature"
    );
  } catch {
    return {
      valid: false,
      reason: "The license signature is not valid Base64.",
    };
  }

  if (signatureBytes.length !== ED25519_SIGNATURE_LENGTH) {
    return {
      valid: false,
      reason: "The Ed25519 signature must contain exactly 64 bytes.",
    };
  }

  const contentToVerify = serializeLicensePayloadForSigning(license.payload);

  const messageBytes = new TextEncoder().encode(contentToVerify);

  const publicKey = await getLicensePublicKey();

  const isValid = await getSubtleCrypto().verify(
    {
      name: "Ed25519",
    },
    publicKey,
    signatureBytes,
    messageBytes
  );

  return {
    valid: isValid,
    reason: isValid
      ? null
      : "The digital signature does not match the license payload.",
  };
}
