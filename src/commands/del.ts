import type { Socket } from "node:net";
import { memory } from "../memory";
import { writeCommandInAOF } from "../persistence/utils";
import { encoder } from "../core/encoder";

export const del = (socket: Socket, args: string[]) => {
  if (!args || args.length > 1) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  const [key] = args;

  if (!key || key === undefined) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  if (!memory.has(key)) {
    socket.write(":0\r\n");
    return;
  }

  memory.delete(key);

  writeCommandInAOF(`del ${key}`);

  socket.write(encoder.del());
};
