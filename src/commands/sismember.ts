import { memory } from "../memory";
import { encoder } from "../core/encoder";

export const sismember = (args: string[]) => {
  if (!args || args.length !== 2) {
    return "-ERR wrong number of arguments\r\n";
  }

  const [key, member] = args;

  if (!key || !member) {
    return "-ERR wrong number of arguments\r\n";
  }

  const current = memory.get(key);

  if (!current) {
    return ":0\r\n";
  }

  if (current.value.type !== "set") {
    return "-WRONGTYPE Operation against a key holding the wrong kind of value\r\n";
  }

  if (!current.value.value.has(member)) {
    return ":0\r\n";
  }

  return encoder.sismember();
};
