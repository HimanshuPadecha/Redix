import { memory } from "../memory";
import { writeCommandInAOF } from "../persistence/utils";
import { encoder } from "../core/encoder";

export const ttl = (args: string[]) => {
  if (!args || args.length > 1) {
    return "-ERR wrong number of arguments\r\n";
  }

  const [key] = args;

  if (!key) {
    return "-ERR wrong number of arguments\r\n";
  }

  const current = memory.get(key);

  if (!current) {
    return ":-2\r\n";
  }

  const { expiresAt } = current;

  if (!expiresAt) {
    return ":-1\r\n";
  }

  // check if the key is expired or not ?
  if (Date.now() > expiresAt) {
    writeCommandInAOF(`del ${key}`);
    memory.delete(key);
    return ":-2\r\n";
  }

  return encoder.ttl(Math.round((expiresAt - Date.now()) / 1000));
};
