import { validateSignedLicense } from "../models/license.model.js";

export const LICENSE_STORAGE_KEY = "exchange_app:license";

function getLocalStorage() {
  if (typeof window === "undefined") {
    throw new Error(
      "License storage is only available in a browser environment."
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

export function saveLicense(license) {
  const validation = validateSignedLicense(license);

  if (!validation.valid) {
    throw new Error(`Cannot save license: ${validation.reason}`);
  }

  let serializedLicense;

  try {
    serializedLicense = JSON.stringify(license);
  } catch (error) {
    throw new Error("The license could not be converted to JSON.", {
      cause: error,
    });
  }

  try {
    getLocalStorage().setItem(LICENSE_STORAGE_KEY, serializedLicense);
  } catch (error) {
    throw new Error(
      "The browser could not save the license. Check available site storage and privacy settings.",
      { cause: error }
    );
  }

  return license;
}

export function getStoredLicense() {
  let serializedLicense;

  try {
    serializedLicense = getLocalStorage().getItem(LICENSE_STORAGE_KEY);
  } catch (error) {
    throw new Error("The saved license could not be read from the browser.", {
      cause: error,
    });
  }

  if (serializedLicense === null) {
    return null;
  }

  let license;

  try {
    license = JSON.parse(serializedLicense);
  } catch (error) {
    throw new Error("The saved license contains invalid JSON.", {
      cause: error,
    });
  }

  const validation = validateSignedLicense(license);

  if (!validation.valid) {
    throw new Error(`The saved license is invalid: ${validation.reason}`);
  }

  return license;
}

export function removeStoredLicense() {
  try {
    getLocalStorage().removeItem(LICENSE_STORAGE_KEY);
  } catch (error) {
    throw new Error("The saved license could not be removed.", {
      cause: error,
    });
  }
}
