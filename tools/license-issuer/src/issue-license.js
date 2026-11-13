import { createPrivateKey, sign } from "node:crypto";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import readline from "node:readline";
import { stdin, stdout } from "node:process";
import path from "node:path";
import { promptSecret } from "./secret-prompt.js";
import { ISSUER_HOME, LICENSES_DIR, PRIVATE_KEY_PATH } from "./config.js";
import {
  createLicenseId,
  createLicensePayload,
  validateLicenseInput,
} from "./license-payload.js";
import {
  appendIssuedLicenseRecord,
  findLicensesForInstallation,
  hasLicenseId,
} from "./registry.js";
import { serializeLicensePayloadForSigning } from "../../../src/licensing/utils/licenseSigning.mjs";

// دالة التعامل مع ادخالات المستخدم في terminal
function createAsk(rl) {
  const inputLines = rl[Symbol.asyncIterator]();

  return async function ask(prompt) {
    stdout.write(prompt);
    const result = await inputLines.next();

    if (result.done) {
      throw new Error("Input ended before all license details were entered.");
    }

    return result.value;
  };
}

//دالة التاكد من وجود الملف
async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

async function getUniqueLicenseId() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const id = createLicenseId();
    if (!(await hasLicenseId(id))) return id;
  }

  throw new Error("Could not generate a unique license ID. Try again.");
}

async function main() {
  const privateKeyExists = await fileExists(PRIVATE_KEY_PATH);

  if (!privateKeyExists) {
    throw new Error(
      `Private key not found: ${PRIVATE_KEY_PATH}\nRun "npm run keys:generate" first.`
    );
  }

  const privateKeyPem = await readFile(PRIVATE_KEY_PATH, "utf8");
  const passphrase = await promptSecret("Private-key passphrase: ");
  //لكي نستخدمه في عمليات التوقيع keyObject نقرأ المفتاح الخاص وننشئ منه كائن
  const privateKey = createPrivateKey({
    key: privateKeyPem,
    passphrase,
  });

  if (
    privateKey.type !== "private" ||
    privateKey.asymmetricKeyType !== "ed25519"
  ) {
    throw new Error(
      "The configured private key is not an Ed25519 private key."
    );
  }

  const rl = readline.createInterface({ input: stdin, crlfDelay: Infinity });
  const ask = createAsk(rl);

  try {
    console.log("\n=== Exchange Office — Local License Issuer ===\n");
    console.log(
      "This tool creates a permanent license bound to one browser installation."
    );
    console.log(
      "The customer must send you the Installation ID shown by the production app.\n"
    );

    const customerName = (await ask("Customer / office name: ")).trim();
    const installationId = (await ask("Installation ID: ")).trim();

    const validation = validateLicenseInput({ customerName, installationId });

    if (!validation.valid) {
      throw new Error(validation.reason);
    }

    const previousRecords = await findLicensesForInstallation(installationId);

    if (previousRecords.length > 0) {
      console.log(
        "\nWarning: this Installation ID already appears in your local issuance history:"
      );
      for (const record of previousRecords) {
        console.log(
          `- ${record.licenseId} | ${record.customerName} | ${record.issuedAt}`
        );
      }

      const answer = (
        await ask(
          "Issue another license for this same installation? Type YES to continue: "
        )
      ).trim();

      if (answer !== "YES") {
        console.log("\nIssuance cancelled.");
        return;
      }
    }

    const licenseId = await getUniqueLicenseId();
    const payload = createLicensePayload({
      licenseId,
      customerName,
      installationId,
    });

    const contentToSign = serializeLicensePayloadForSigning(payload);
    // إنشاء التوقيع الرقمي
    const signature = sign(
      null,
      Buffer.from(contentToSign, "utf8"),
      privateKey
    ).toString("base64");

    const signedLicense = { payload, signature };
    const fileName = `${licenseId}.license.json`;
    const licenseFilePath = path.join(LICENSES_DIR, fileName);

    // إنشاء مجلد وملف الترخيص
    await mkdir(LICENSES_DIR, { recursive: true });
    await writeFile(
      licenseFilePath,
      `${JSON.stringify(signedLicense, null, 2)}\n`,
      {
        encoding: "utf8",
        flag: "wx",
      }
    );

    const registryRecord = {
      licenseId,
      customerName: payload.customerName,
      installationId: payload.installationId,
      licenseType: payload.licenseType,
      issuedAt: payload.issuedAt,
      fileName,
    };

    //حفظ الترخيص في سجل التراخيص
    try {
      await appendIssuedLicenseRecord(registryRecord);
    } catch (error) {
      console.error(
        "\nWarning: the license file was created, but the local registry could not be updated."
      );
      console.error(error.message);
    }

    console.log("\nLicense created successfully.\n");
    console.log(`License ID:      ${licenseId}`);
    console.log(`Customer:        ${payload.customerName}`);
    console.log(`Installation ID: ${payload.installationId}`);
    console.log(`License file:    ${licenseFilePath}`);
    console.log(`Issuer data:     ${ISSUER_HOME}`);
    console.log("\nSend the .license.json file to the customer.");
    console.log(
      "Do not send the private key. The license file contains only the signed payload."
    );
  } finally {
    rl.close();
  }
}

main().catch((error) => {
  console.error("\nLicense issuance failed:", error.message);
  process.exitCode = 1;
});
