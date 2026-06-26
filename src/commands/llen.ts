import { memory } from "../memory";
import { encoder } from "../core/encoder";

export const llen = (args: string[]) => {
  if (!args || args.length !== 1) {
    return "-ERR wrong number of arguments\r\n";
  }

  const [key] = args;

  if (!key) {
    return "-ERR Error while finding key\r\n";
  }

  const currnet = memory.get(key);

  if (!currnet) {
    return ":0\r\n";
  }

  if (currnet.value.type !== "list") {
    return "-WRONGTYPE Operation against a key holding the wrong kind of value\r\n";
  }

  return encoder.llen(currnet.value.value.length);
};
