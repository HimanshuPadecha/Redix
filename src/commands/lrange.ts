import { memory } from "../memory";
import { encoder } from "../core/encoder";

export const lrange = (args: string[]) => {
  if (!args || args.length !== 3) {
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

  if (current.value.type !== "list") {
    return "-WRONGTYPE Operation against a key holding the wrong kind of value\r\n";
  }

  const [start, end] = args;

  if (
    !start ||
    !end ||
    Number.isNaN(parseInt(start)) ||
    Number.isNaN(parseInt(end))
  ) {
    return "-ERR wrong number of arguments\r\n";
  }

  const sliced = current.value.value.slice(parseInt(start), parseInt(end));

  console.log(sliced);

  return encoder.lrange(sliced);
};
