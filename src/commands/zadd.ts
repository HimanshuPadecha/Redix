import { memory } from "../memory";
import { writeCommandInAOF } from "../persistence/utils";
import { encoder } from "../core/encoder";

export const zadd = (args: string[]) => {
  if (!args || args.length !== 3) {
    return "-ERR wrong number of arguments\r\n";
  }

  const [key, score, name] = args;

  if (!key || !score || !name || Number.isNaN(parseInt(score))) {
    return "-ERR wrong number of arguments\r\n";
  }

  if (!memory.has(key)) {
    memory.set(key, { value: { type: "zset", value: [] } });
  }

  const current = memory.get(key);

  if (current!.value.type !== "zset") {
    return "-WRONGTYPE Operation against a key holding the wrong kind of value\r\n";
  }

  const exsistingPlayer = current!.value.value.find(
    (player) => player.name === name,
  );

  if (exsistingPlayer) {
    exsistingPlayer.score = parseInt(score);
  } else {
    current!.value.value.push({ name, score: parseInt(score) });
  }

  current!.value.value.sort((a, b) => b.score - a.score);
  writeCommandInAOF(`zadd ${key} ${score} ${name}`);

  return encoder.zadd(exsistingPlayer ? 0 : 1);
};
