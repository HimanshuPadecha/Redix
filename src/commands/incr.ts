import { memory } from "../memory";
import { writeCommandInAOF } from "../persistence/utils";
import { encoder } from "../core/encoder";

export const incr = (args: string[]) => {
  if (!args || args.length > 1) {
    return "-ERR wrong number of arguments\r\n";
  }

  const [key] = args;

  if (!key) {
    return "-ERR wrong number of arguments\r\n";
  }

  if (!memory.has(key)) {
    memory.set(key, { value: { type: "string", value: "0" } });
  }

  const val = memory.get(key);

  if (val!.value.type !== "string") {
    return "-WRONGTYPE Operation against a key holding the wrong kind of value\r\n";
  }

  const current = parseInt(val?.value.value!);

  if (Number.isNaN(current)) {
    return "-ERR not an integer\r\n";
  }

  memory.set(key, { value: { value: String(current + 1), type: "string" } });
  writeCommandInAOF(`incr ${key}`);

  return encoder.incr(current + 1);
};
