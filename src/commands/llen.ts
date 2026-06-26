import { memory } from "../memory";
import { encoder } from "../core/encoder";
import type { RedisSocket } from "../types";

export const llen = (socket: RedisSocket, args: string[]) => {
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

  if (currnet.value.type !== "list") {
    socket.write(
      "-WRONGTYPE Operation against a key holding the wrong kind of value\r\n",
    );
    return;
  }

  socket.write(encoder.llen(currnet.value.value.length));
};
