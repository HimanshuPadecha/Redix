import type { Socket } from "node:net";
import { memory } from "../memory";
import { writeCommandInAOF } from "../persistence/utils";
import { encoder } from "../core/encoder";

export const set = (socket: Socket, args: string[]) => {
  if (!args) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  const [key, value, arg, seconds] = args;

  if (!key || !value) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  if ((arg && !seconds) || (!args && seconds)) {
    socket.write("-ERR provide both expiry and seconds\r\n");
    return;
  }

  if (arg && arg !== "ex") {
    socket.write("-ERR server currently support expirations\r\n");
    return;
  }

  const current: {
    value: { type: "string"; value: string };
    expiresAt?: number;
  } = { value: { type: "string", value } };

  if (arg && seconds) {
    if (Number.isNaN(parseInt(seconds))) {
      socket.write("-ERR Invalid seconds \r\n");
      return;
    }

    current.expiresAt = Date.now() + parseInt(seconds) * 1000;
  }

  memory.set(key, current);

  writeCommandInAOF(`set ${key} ${value}`);
  
  socket.write(encoder.set());
};
