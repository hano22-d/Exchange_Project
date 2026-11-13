import readline from "node:readline";
import { stdin, stdout } from "node:process";

export async function promptSecret(label) {
  const fromEnvironment = process.env.EXCHANGE_LICENSE_KEY_PASSPHRASE;

  if (typeof fromEnvironment === "string" && fromEnvironment.length > 0) {
    return fromEnvironment;
  }

  if (!stdin.isTTY || typeof stdin.setRawMode !== "function") {
    throw new Error(
      "A terminal is required to enter the private-key passphrase. " +
        "Run this command in Windows Terminal / PowerShell, or set EXCHANGE_LICENSE_KEY_PASSPHRASE temporarily."
    );
  }

  readline.emitKeypressEvents(stdin);

  return new Promise((resolve, reject) => {
    let value = "";
    const wasRaw = Boolean(stdin.isRaw);

    const cleanup = () => {
      stdin.removeListener("keypress", onKeypress);
      stdin.setRawMode(wasRaw);
      stdin.pause();
    };

    const onKeypress = (character, key = {}) => {
      if (key.ctrl && key.name === "c") {
        cleanup();
        stdout.write("\n");
        reject(new Error("Passphrase entry cancelled."));
        return;
      }

      if (key.name === "return" || key.name === "enter") {
        cleanup();
        stdout.write("\n");
        resolve(value);
        return;
      }

      if (key.name === "backspace") {
        if (value.length > 0) {
          value = value.slice(0, -1);
          stdout.write("\b \b");
        }
        return;
      }

      if (typeof character === "string" && character && !key.ctrl && !key.meta) {
        value += character;
        stdout.write("*");
      }
    };

    stdout.write(label);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.on("keypress", onKeypress);
  });
}
