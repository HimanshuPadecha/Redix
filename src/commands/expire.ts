import { memory } from "../memory";
import { encoder } from "../core/encoder";

export const expire = (args: string[]) => {
  if (!args || args.length !== 2) {
    return "-ERR wrong number of arguments\r\n";
  }

  const [key, seconds] = args;

  if (!key || !seconds) {
    return "-ERR wrong number of arguments\r\n";
  }

  if (Number.isNaN(parseInt(seconds))) {
    return "-ERR Invalid time to live\r\n";
  }

  const current = memory.get(key);

  if (!current) {
    return ":0\r\n";
  }

  memory.set(key, {
    value: current.value,
    expiresAt: Date.now() + parseInt(seconds) * 1000,
  });

  return encoder.expires();
};
