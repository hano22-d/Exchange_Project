import os from "node:os";
import path from "node:path";

export const ISSUER_HOME = process.env.EXCHANGE_LICENSE_ISSUER_HOME
  ? path.resolve(process.env.EXCHANGE_LICENSE_ISSUER_HOME)
  : path.join(os.homedir(), "ExchangeLicenseIssuer");

export const KEYS_DIR = path.join(ISSUER_HOME, "keys");
export const LICENSES_DIR = path.join(ISSUER_HOME, "licenses");
export const REGISTRY_DIR = path.join(ISSUER_HOME, "registry");

export const PRIVATE_KEY_PATH = path.join(KEYS_DIR, "private.ed25519.pem");
export const PUBLIC_KEY_PEM_PATH = path.join(KEYS_DIR, "public.ed25519.pem");
export const PUBLIC_KEY_RAW_BASE64_PATH = path.join(
  KEYS_DIR,
  "public-key.raw.base64.txt"
);

export const ISSUED_LICENSES_REGISTRY_PATH = path.join(
  REGISTRY_DIR,
  "issued-licenses.json"
);
