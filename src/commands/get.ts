import { memory } from "../memory";
import { encoder } from "../core/encoder";
import { writeCommandInAOF } from "../persistence/utils";

export const get = (args: string[]) => {
  if (!args || args.length > 1) {
    return "-ERR wrong number of arguments\r\n";
  }

  const [key] = args;

  if (!key) {
    return "-ERR wrong number of arguments\r\n";
  }

  const value = memory.get(key);

  if (!value) {
    return ":-1\r\n";
  }

  const { value: actualVal, expiresAt } = value;

  if (expiresAt && expiresAt < Date.now()) {
    writeCommandInAOF(`del ${key}`);
    memory.delete(key);
    return ":-2\r\n";
  }

  if (actualVal.type !== "string") {
    return "-WRONGTYPE Operation against a key holding the wrong kind of value\r\n";
  }

  const encoded = encoder.get(actualVal.value);

  return encoded;
};
