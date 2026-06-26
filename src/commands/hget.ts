import { memory } from "../memory";
import { encoder } from "../core/encoder";

export const hget = (args: string[]) => {
  if (!args || args.length !== 2) {
    return "-ERR wrong number of arguments\r\n";
  }

  const [key, hkey] = args;

  if (!key || !hkey) {
    return "-ERR wrong number of arguments\r\n";
  }

  const current = memory.get(key);

  if (!current) {
    return "$-1\r\n";
  }

  if (current.value.type !== "hash") {
    return "-WRONGTYPE Operation against a key holding the wrong kind of value\r\n";
  }

  if (!current.value.value[hkey]) {
    return "$-1\r\n";
  }

  return encoder.hget(current.value.value[hkey]);
};
