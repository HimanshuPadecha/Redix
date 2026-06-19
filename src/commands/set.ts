import type { Socket } from "node:net";
import { memory } from "../memory";
import { writeCommandInAOF } from "../persistence/utils";
import { encoder } from "../core/encoder";

export const set = (socket: Socket, args: string[]) => {
  if (!args) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  if (args.length !== 2) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  const [key, value] = args;

  if (!key) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  if (!value) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  memory.set(key, value);
  writeCommandInAOF(`set ${key} ${value}`);
  socket.write(encoder.set());
};
