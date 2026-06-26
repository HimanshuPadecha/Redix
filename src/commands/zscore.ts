import { memory } from "../memory";
import { encoder } from "../core/encoder";

export const zscore = (args: string[]) => {
  if (!args || args.length !== 2) {
    return "-ERR wrong number of arguments\r\n";
  }

  const [key, name] = args;

  if (!key || !name) {
    return "-ERR wrong number of arguments\r\n";
  }

  const current = memory.get(key);

  if (!current) {
    return "$-1\r\n";
  }

  if (current.value.type !== "zset") {
    return "-WRONGTYPE Operation against a key holding the wrong kind of value\r\n";
  }

  const currentPlayer = current.value.value.find(
    (player) => player.name === name,
  );

  if (!currentPlayer) {
    return "$-1\r\n";
  }

  return encoder.zscore(currentPlayer.score);
};
