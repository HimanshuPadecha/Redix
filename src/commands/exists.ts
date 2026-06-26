import { memory } from "../memory";
import { encoder } from "../core/encoder";
import type { RedisSocket } from "../types";

export const exists = (socket: RedisSocket, args: string[]) => {
  if (!args || args.length > 1) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  const [key] = args;

  if (!key) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  if (!memory.has(key)) {
    socket.write(":0\r\n");
    return;
  }

  socket.write(encoder.exists());
};
