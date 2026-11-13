export const INSTALLATION_ID_STORAGE_KEY =
  "exchange_app:installation_id";

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getLocalStorage() {
  if (typeof window === "undefined") {
    throw new Error(
      "Installation ID storage is only available in a browser environment."
    );
  }

  try {
    return window.localStorage;
  } catch (error) {
    throw new Error(
      "The browser did not allow access to localStorage. Check the browser's site-data/privacy settings.",
      { cause: error }
    );
  }
}

export function isValidInstallationId(value) {
  return typeof value === "string" && UUID_V4_PATTERN.test(value);
}

function createInstallationId() {
  const cryptoApi = globalThis.crypto;

  if (!cryptoApi) {
    throw new Error(
      "A secure browser crypto API is unavailable. Open the app over HTTPS and use a modern browser."
    );
  }

  if (typeof cryptoApi.randomUUID === "function") {
    return cryptoApi.randomUUID();
  }

  if (typeof cryptoApi.getRandomValues !== "function") {
    throw new Error(
      "The browser does not support a cryptographically secure random generator."
    );
  }

  const bytes = new Uint8Array(16);
  cryptoApi.getRandomValues(bytes);

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0")
  );

  return [
    hex.slice(0, 4).join(""),
    hex.slice(4, 6).join(""),
    hex.slice(6, 8).join(""),
    hex.slice(8, 10).join(""),
    hex.slice(10, 16).join(""),
  ].join("-");
}

export function getInstallationId() {
  const storage = getLocalStorage();
  const installationId = storage.getItem(
    INSTALLATION_ID_STORAGE_KEY
  );

  if (installationId === null) {
    return null;
  }

  if (!isValidInstallationId(installationId)) {
    throw new Error(
      "The saved Installation ID is malformed. Do not replace it automatically; investigate the local licensing data first."
    );
  }

  return installationId;
}

export function getOrCreateInstallationId() {
  const storage = getLocalStorage();
  const existingId = getInstallationId();

  if (existingId) {
    return existingId;
  }

  const newInstallationId = createInstallationId();

  try {
    storage.setItem(
      INSTALLATION_ID_STORAGE_KEY,
      newInstallationId
    );
  } catch (error) {
    throw new Error(
      "The browser could not save the Installation ID. Check available site storage and privacy settings.",
      { cause: error }
    );
  }

  return newInstallationId;
}
