import { memory } from "../memory";
import { encoder } from "../core/encoder";

export const exists = (args: string[]) => {
  if (!args || args.length > 1) {
    return "-ERR wrong number of arguments\r\n";
  }

  const [key] = args;

  if (!key) {
    return "-ERR wrong number of arguments\r\n";
  }

  if (!memory.has(key)) {
    return ":0\r\n";
  }

  return encoder.exists();
};
