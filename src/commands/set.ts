import { memory } from "../memory";
import { writeCommandInAOF } from "../persistence/utils";
import { encoder } from "../core/encoder";

export const set = (args: string[]): string => {
  if (!args) {
    return "-ERR wrong number of arguments\r\n";
  }

  const [key, value, arg, seconds] = args;

  if (!key || !value) {
    return "-ERR wrong number of arguments\r\n";
  }

  if ((arg && !seconds) || (!args && seconds)) {
    return "-ERR provide both expiry and seconds\r\n";
  }

  if (arg && arg !== "ex") {
    return "-ERR server currently support expirations\r\n";
  }

  const current: {
    value: { type: "string"; value: string };
    expiresAt?: number;
  } = { value: { type: "string", value } };

  if (arg && seconds) {
    if (Number.isNaN(parseInt(seconds))) {
      return "-ERR Invalid seconds \r\n";
    }

    current.expiresAt = Date.now() + parseInt(seconds) * 1000;
  }

  memory.set(key, current);

  writeCommandInAOF(`set ${key} ${value}`);

  return encoder.set();
};
