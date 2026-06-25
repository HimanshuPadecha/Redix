import type { Socket } from "node:net";
import { memory } from "../memory";
import { encoder } from "../core/encoder";

export const hexists = (socket: Socket, args: string[]) => {
  if (!args || args.length !== 2) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  const [key, hkey] = args;

  if (!key || !hkey) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  const current = memory.get(key);

  if (!current) {
    socket.write(":0\r\n");
    return;
  }

  if (current.value.type !== "hash") {
    socket.write(
      "-WRONGTYPE Operation against a key holding the wrong kind of value\r\n",
    );
    return;
  }

  if (!current.value.value[hkey]) {
    socket.write(":0\r\n");
    return;
  }

  socket.write(encoder.hexists());
};
