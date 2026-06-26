import { memory } from "../memory";
import { writeCommandInAOF } from "../persistence/utils";
import { encoder } from "../core/encoder";

export const zrem = (args: string[]) => {
  if (!args || args.length !== 2) {
    return "-ERR wrong number of arguments\r\n";
  }

  const [key, name] = args;

  if (!key || !name) {
    return "-ERR wrong number of arguments\r\n";
  }

  const current = memory.get(key);

  if (!current) {
    return "0\r\n";
  }

  if (current.value.type !== "zset") {
    return "-WRONGTYPE Operation against a key holding the wrong kind of value\r\n";
  }

  const currnetPlayer = current.value.value.find(
    (player) => player.name === name,
  );

  if (!currnetPlayer) {
    return ":0\r\n";
  }

  if (current.value.value.length === 1) {
    memory.delete(key);
  } else {
    memory.set(key, {
      value: {
        value: current.value.value.filter((player) => player.name !== name),
        type: "zset",
      },
    });
  }

  writeCommandInAOF(`zrem ${key} ${name}`);
  return encoder.zrem();
};
