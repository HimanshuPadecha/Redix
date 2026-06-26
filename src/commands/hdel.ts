import { memory } from "../memory";
import { writeCommandInAOF } from "../persistence/utils";
import { encoder } from "../core/encoder";

export const hdel = (args: string[]) => {
  if (!args || args.length !== 2) {
    return "-ERR wrong number of arguments\r\n";
  }

  const [key, hkey] = args;

  if (!key || !hkey) {
    return "-ERR wrong number of arguments\r\n";
  }

  const current = memory.get(key);

  if (!current) {
    return ":0\r\n";
  }

  if (current.value.type !== "hash") {
    return "-WRONGTYPE Operation against a key holding the wrong kind of value\r\n";
  }

  if (!current.value.value[hkey]) {
    return ":0\r\n";
  }

  delete current.value.value[hkey];
  writeCommandInAOF(`hdel ${key} ${hkey}`);

  if (Object.entries(current.value.value).length === 0) {
    memory.delete(key);
  }

  return encoder.hdel();
};
