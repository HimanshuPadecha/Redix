import { memory } from "../memory";
import { writeCommandInAOF } from "../persistence/utils";
import { encoder } from "../core/encoder";

export const del = (args: string[]) => {
  if (!args || args.length > 1) {
    return "-ERR wrong number of arguments\r\n";
  }

  const [key] = args;

  if (!key) {
    return "-ERR wrong number of arguments\r\n";
  }

  const isDeleted = memory.delete(key);

  if (!isDeleted) {
    return ":0\r\n";
  }

  writeCommandInAOF(`del ${key}`);

  return encoder.del();
};
