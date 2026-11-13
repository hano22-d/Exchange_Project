# Exchange Office — Local License Issuer

This is a small offline Node.js tool. It is **not** a backend, API, web server, or dashboard.
It creates an Ed25519 key pair once and issues signed permanent licenses bound to one
browser installation ID.

## Requirements

- Node.js 22 or later (an Active LTS release is recommended).
- No npm dependencies are required.
- Run this tool only on the license owner's computer.

## Data location

By default, secrets and issued files are stored outside the application repository:

`<user-home>/ExchangeLicenseIssuer/`

- `keys/private.ed25519.pem` — AES-256-CBC encrypted private signing key. Never share or commit it; you also need its passphrase.
- `keys/public.ed25519.pem` — public key in PEM format.
- `keys/public-key.raw.base64.txt` — public key in raw Base64 format for the browser app.
- `licenses/` — generated customer license files.
- `registry/issued-licenses.json` — local issuance history (not a central database).

To use another folder, set `EXCHANGE_LICENSE_ISSUER_HOME` before running the scripts.

## Generate the key pair (once)

From this directory:

```bash
npm run keys:generate
```

The script asks you to create and confirm a passphrase (minimum 12 characters) and encrypts the private PEM. The passphrase is not saved by the tool. The script refuses to overwrite existing key files. Do not regenerate the key pair casually:
existing licenses were signed by the old private key and the app will verify them using the
corresponding public key.

## Issue a license

```bash
npm run license:issue
```

Enter the private-key passphrase, office name, and the Installation ID shown by the production app. The tool signs the
license and writes a `.license.json` file into the external `licenses/` folder.

If the same Installation ID appears in the local issuance history, the tool asks for explicit
confirmation before issuing another license.

## Signing format

The tool signs the canonicalized payload using Ed25519. The exact serialization function is
shared with the React source at:

`src/features/licensing/utils/licenseSigning.mjs`

The browser verification service must use this same function and the raw Base64 public key.

## Important limits

- The local registry is only bookkeeping. It is not tamper-proof and does not enforce global
  one-time activation.
- The license is bound to an Installation ID, not to physical hardware.
- Keep a secure backup of the encrypted private key and store its passphrase separately. Losing
  either prevents issuing new licenses with the existing public key.
- Never put the private key in the React app, Git, Vercel frontend environment variables, or
  a file sent to customers.
