import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  ISSUED_LICENSES_REGISTRY_PATH,
  REGISTRY_DIR,
} from "./config.js";

async function readRegistry() {
  try {
    const content = await readFile(ISSUED_LICENSES_REGISTRY_PATH, "utf8");
    const records = JSON.parse(content);

    if (!Array.isArray(records)) {
      throw new Error("The local license registry must contain a JSON array.");
    }

    return records;
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }

    throw new Error(`Could not read the local license registry: ${error.message}`, {
      cause: error,
    });
  }
}

export async function findLicensesForInstallation(installationId) {
  const records = await readRegistry();
  return records.filter((record) => record.installationId === installationId);
}

export async function hasLicenseId(licenseId) {
  const records = await readRegistry();
  return records.some((record) => record.licenseId === licenseId);
}

/**
 * Local bookkeeping only. This is NOT a central activation database and
 * cannot prevent a copied/modified registry from being changed.
 */
export async function appendIssuedLicenseRecord(record) {
  await mkdir(REGISTRY_DIR, { recursive: true });

  const records = await readRegistry();
  records.push(record);

  const temporaryPath = `${ISSUED_LICENSES_REGISTRY_PATH}.tmp`;
  const serialized = `${JSON.stringify(records, null, 2)}\n`;

  await writeFile(temporaryPath, serialized, { encoding: "utf8" });
  await rename(temporaryPath, ISSUED_LICENSES_REGISTRY_PATH);
}

export function getRegistryFileName() {
  return path.basename(ISSUED_LICENSES_REGISTRY_PATH);
}
