import { createPublicKey, generateKeyPairSync } from "node:crypto";
import { access, mkdir, writeFile } from "node:fs/promises";
import { promptSecret } from "./secret-prompt.js";
import {
  KEYS_DIR,
  PRIVATE_KEY_PATH,
  PUBLIC_KEY_PEM_PATH,
  PUBLIC_KEY_RAW_BASE64_PATH,
} from "./config.js";

async function ensureFilesDoNotExist(paths) {
  for (const filePath of paths) {
    try {
      await access(filePath);
      throw new Error(
        `A key file already exists: ${filePath}\n` +
          "Key generation stopped to avoid replacing your existing identity."
      );
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
  }
}

async function main() {
  await mkdir(KEYS_DIR, { recursive: true, mode: 0o700 });

  await ensureFilesDoNotExist([
    PRIVATE_KEY_PATH,
    PUBLIC_KEY_PEM_PATH,
    PUBLIC_KEY_RAW_BASE64_PATH,
  ]);

  const firstPassphrase = await promptSecret(
    "Create a private-key passphrase (minimum 12 characters): "
  );
  const confirmation = await promptSecret("Confirm passphrase: ");

  if (firstPassphrase.length < 12) {
    throw new Error("The passphrase must contain at least 12 characters.");
  }

  if (firstPassphrase !== confirmation) {
    throw new Error("The passphrases do not match.");
  }

  const { publicKey, privateKey } = generateKeyPairSync("ed25519", {
    publicKeyEncoding: {
      type: "spki", // بنية المفتاح العام
      format: "pem", // جعل المفتاح في ملف نصي منظم
    },
    privateKeyEncoding: {
      type: "pkcs8", // بنية المفتاح الخاص
      format: "pem", // جعل المفتاح في ملف نصي منظم
      cipher: "aes-256-cbc", // تشفير المفتاح
      passphrase: firstPassphrase, // كلمة المرور تطبق على المفتاح الخاص
    },
  });

  const publicKeyDer = createPublicKey(publicKey).export({
    type: "spki",
    format: "der",
  });
  const publicKeyRaw = publicKeyDer.subarray(-32);

  if (publicKeyRaw.length !== 32) {
    throw new Error("Unexpected Ed25519 public-key length.");
  }

  const publicKeyRawBase64 = publicKeyRaw.toString("base64");

  await writeFile(PRIVATE_KEY_PATH, privateKey, {
    encoding: "utf8", // لان الناتج يكون pem نصي
    mode: 0o600, // قراءة وكتابة للمالك فقط
    flag: "wx", // منع الكتابة فوق ملف موجود
  });

  await writeFile(PUBLIC_KEY_PEM_PATH, publicKey, {
    encoding: "utf8",
    mode: 0o644, // المالك قراءة وكتابة - المحموع و الاخرون قراءة فقط
    flag: "wx",
  });

  await writeFile(PUBLIC_KEY_RAW_BASE64_PATH, `${publicKeyRawBase64}\n`, {
    encoding: "utf8",
    mode: 0o644,
    flag: "wx",
  });

  console.log("\nEd25519 key pair created successfully.\n");
  console.log(`Encrypted private key (KEEP SECRET): ${PRIVATE_KEY_PATH}`);
  console.log(`Public key (PEM):          ${PUBLIC_KEY_PEM_PATH}`);
  console.log(`Public key (raw Base64):   ${PUBLIC_KEY_RAW_BASE64_PATH}`);
}

main().catch((error) => {
  console.error("\nKey generation failed:", error.message);
  process.exitCode = 1; // إنهاء العملية الجارية
});
