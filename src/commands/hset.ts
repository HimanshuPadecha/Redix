import { memory } from "../memory";
import { writeCommandInAOF } from "../persistence/utils";
import { encoder } from "../core/encoder";

export const hset = (args: string[]) => {
  if (!args || args.length !== 3) {
    return "-ERR wrong number of arguments\r\n";
  }

  const [key, hkey, hvalue] = args;

  if (!key || !hkey || !hvalue) {
    return "-ERR wrong number of arguments\r\n";
  }

  if (!memory.has(key)) {
    memory.set(key, { value: { type: "hash", value: {} } });
  }

  const currnet = memory.get(key);

  if (currnet!.value.type !== "hash") {
    return "-WRONGTYPE Operation against a key holding the wrong kind of value\r\n";
  }

  currnet!.value.value[hkey] = hvalue;

  writeCommandInAOF(`hset ${key} ${hkey} ${hvalue}`);

  if (Object.hasOwn(currnet!.value.value, hkey)) {
    return encoder.hset(0);
  } else {
    return encoder.hset(1);
  }
};
