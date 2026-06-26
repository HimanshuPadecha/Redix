import { memory } from "../memory";
import { encoder } from "../core/encoder";

export const keys = (args: string[]) => {
  if (args.length !== 1) {
    return "-ERR wrong number of arguments\r\n";
  }

  const key = args.shift();

  if (key !== "*") {
    return "-ERR wrong arguments currently support only all keys\r\n";
  }

  const keys = [...memory.keys()];

  if (keys.length === 0) {
    return "*0\r\n";
  }

  return encoder.keys(keys);
};
