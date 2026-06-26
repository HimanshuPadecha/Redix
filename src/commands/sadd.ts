import { memory } from "../memory";
import { writeCommandInAOF } from "../persistence/utils";
import { encoder } from "../core/encoder";

export const sadd = (args: string[]) => {
  if (!args || args.length < 2) {
    return "-ERR wrong number of arguments\r\n";
  }

  const [key, ...values] = args;

  if (!key || !values) {
    return "-ERR wrong number of arguments\r\n";
  }

  if (!memory.has(key)) {
    memory.set(key, { value: { value: new Set(), type: "set" } });
  }

  const current = memory.get(key);

  if (current!.value.type !== "set") {
    return "-WRONGTYPE Operation against a key holding the wrong kind of value\r\n";
  }

  let valuesAdded = 0;

  for (const item of values) {
    if (!current!.value.value.has(item)) valuesAdded++;
    current!.value.value.add(item);
  }

  writeCommandInAOF(`sadd ${key} ${values.join(" ")}`);

  return encoder.sadd(valuesAdded);
};
