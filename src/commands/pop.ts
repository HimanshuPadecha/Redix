import { memory } from "../memory";
import { writeCommandInAOF } from "../persistence/utils";
import { encoder } from "../core/encoder";

export const pop = (args: string[], at: "left" | "right") => {
  if (!args || args.length !== 1) {
    return "-ERR wrong number of arguments\r\n";
  }

  const [key] = args;

  if (!key) {
    return "-ERR wrong number of arguments\r\n";
  }

  const current = memory.get(key);

  if (!current) {
    return ":-1\r\n";
  }

  if (current.value.type !== "list") {
    return "-WRONGTYPE Operation against a key holding the wrong kind of value\r\n";
  }

  if (current.value.value.length === 0) {
    return ":-1\r\n";
  }

  let popped;

  if (at === "left") {
    writeCommandInAOF(`lpop ${key}`);
    popped = current.value.value.shift();
  } else if (at === "right") {
    writeCommandInAOF(`rpop ${key}`);
    popped = current.value.value.pop();
  }

  return encoder.pop(popped!);
};
