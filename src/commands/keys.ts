import type { Socket } from "node:net";
import { memory } from "../memory";
import { encoder } from "../core/encoder";

export const keys = (socket: Socket, args: string[]) => {
  if (args.length !== 1) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  const key = args.shift();

  if (key !== "*") {
    socket.write("-ERR wrong arguments currently support only all keys\r\n");
    return;
  }

  const keys = [...memory.keys()];

  if (keys.length === 0) {
    socket.write("*0\r\n");
    return;
  }

  socket.write(encoder.keys(keys));
};
