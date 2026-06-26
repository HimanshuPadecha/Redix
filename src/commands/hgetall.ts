import { memory } from "../memory";
import { encoder } from "../core/encoder";

export const hgetall = (args: string[]) => {
  if (!args || args.length !== 1) {
    return "-ERR wrong number of arguments\r\n";
  }

  const key = args.shift();

  if (!key) {
    return "-ERR wrong number of arguments\r\n";
  }

  const current = memory.get(key);

  if (!current) {
    return "*0\r\n";
  }

  if (current.value.type === "string" || current.value.type === "list") {
    return "-WRONGTYPE Operation against a key holding the wrong kind of value\r\n";
  }

  let transformed: string[] = [];

  for (const [key, value] of Object.entries(current.value.value)) {
    transformed = [...transformed, key, value];
  }

  return encoder.hgetall(transformed);
};
