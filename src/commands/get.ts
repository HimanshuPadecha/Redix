import type { Socket } from "node:net";
import { memory } from "../memory";
import { encoder } from "../core/encoder";

export const get = (socket: Socket, args: string[]) => {
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
    socket.write("$-1\r\n");
    return;
  }

  const value = memory.get(key)

  const encoded = encoder.get(value!)

  socket.write(encoded)
};
