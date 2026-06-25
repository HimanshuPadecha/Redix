import type { Socket } from "node:net";
import { memory } from "../memory";
import { encoder } from "../core/encoder";

export const llen = (socket: Socket, args: string[]) => {
  if (!args || args.length !== 1) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  const [key] = args;

  if (!key) {
    socket.write("-ERR Error while finding key\r\n");
    return;
  }

  const currnet = memory.get(key);

  if (!currnet) {
    socket.write(":0\r\n");
    return;
  }

  if (currnet.value.type === "string") {
    socket.write(
      "-WRONGTYPE Operation against a key holding the wrong kind of value\r\n",
    );
    return;
  }

  socket.write(encoder.llen(currnet.value.value.length));
};
