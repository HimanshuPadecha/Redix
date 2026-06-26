import { memory } from "../memory";
import { indiciesValidator } from "../persistence/utils";
import { encoder } from "../core/encoder";

export const zrange = (args: string[]) => {
  if (!args || args.length !== 3) {
    return "-ERR wrong number of arguments\r\n";
  }

  const [key, start, end] = args;

  if (!key || !start || !end || Number.isNaN(start) || Number.isNaN(end)) {
    return "-ERR wrong number of arguments\r\n";
  }

  const current = memory.get(key);

  if (!current) {
    return "*0\r\n";
  }

  if (current.value.type !== "zset") {
    return "-WRONGTYPE Operation against a key holding the wrong kind of value\r\n";
  }

  const range = indiciesValidator(
    parseInt(start),
    parseInt(end),
    current.value.value.length,
  );

  if (!range) {
    return `*0\r\n`;
  }

  const players = current.value.value
    .slice(range.start, range.end + 1)
    .map((player) => player.name);

  return encoder.zrange(players);
};
