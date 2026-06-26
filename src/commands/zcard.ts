import { memory } from "../memory";
import { encoder } from "../core/encoder";

export const zcard = (args: string[]) => {
  if (!args || args.length !== 1) {
    return "-ERR wrong number of arguments\r\n";
  }

  const [key] = args;

  if (!key) {
    return "-ERR wrong number of arguments\r\n";
  }

  const current = memory.get(key);

  if (!current) {
    return ":0\r\n";
  }

  if (current.value.type !== "zset") {
    return "-WRONGTYPE Operation against a key holding the wrong kind of value\r\n";
  }

  return encoder.zcard(current.value.value.length);
};
