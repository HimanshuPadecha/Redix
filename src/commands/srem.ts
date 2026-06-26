import { memory } from "../memory";
import { encoder } from "../core/encoder";
import { writeCommandInAOF } from "../persistence/utils";

export const srem = (args: string[]) => {
  if (!args || args.length !== 2) {
    return "-ERR wrong number of arguments\r\n";
  }

  const [key, value] = args;

  if (!key || !value) {
    return "-ERR wrong number of arguments\r\n";
  }

  const currnet = memory.get(key);

  if (!currnet) {
    return ":0\r\n";
  }

  if (currnet.value.type !== "set") {
    return "-WRONGTYPE Operation against a key holding the wrong kind of value\r\n";
  }

  const isRemoved = currnet.value.value.delete(value);

  if (!isRemoved) {
    return ":0\r\n";
  }

  if (currnet.value.value.size === 0) {
    memory.delete(key);
  }

  writeCommandInAOF(`srem ${key} ${value}`);
  return encoder.srem();
};
