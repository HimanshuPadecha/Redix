import { memory } from "../memory";
import { writeCommandInAOF } from "../persistence/utils";
import { encoder } from "../core/encoder";

export const push = (args: string[], at: "left" | "right") => {
  if (!args || args.length !== 2) {
    return "-ERR wrong number of arguments\r\n";
  }

  const key = args.shift();

  if (!key) {
    return "-ERR wrong number of arguments\r\n";
  }

  if (!memory.has(key)) {
    memory.set(key, { value: { value: [], type: "list" } });
  }

  const current = memory.get(key);

  const value = args.shift();

  if (!value) {
    return "-ERR wrong number of arguments\r\n";
  }

  if (current!.value.type !== "list") {
    return "-WRONGTYPE Operation against a key holding the wrong kind of value\r\n";
  }

  if (at === "left") {
    current!.value.value.unshift(value);
    writeCommandInAOF(`lpush ${key} ${value}`);
  } else if (at === "right") {
    current!.value.value.push(value);
    writeCommandInAOF(`rpush ${key} ${value}`);
  }

  return encoder.lpush(current!.value.value.length);
};
