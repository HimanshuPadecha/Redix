import { memory } from "../memory";
import { encoder } from "../core/encoder";
import type { RedisSocket } from "../types";

export const expire = (socket: RedisSocket, args: string[]) => {
  if (!args || args.length !== 2) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  const [key, seconds] = args;

  if (!key || !seconds) {
    socket.write("-ERR wrong number of arguments\r\n");
    return;
  }

  if (Number.isNaN(parseInt(seconds))) {
    socket.write("-ERR Invalid time to live\r\n");
    return;
  }

  const current = memory.get(key);

  if (!current) {
    socket.write(":0\r\n");
    return;
  }

  memory.set(key, {
    value: current.value,
    expiresAt: Date.now() + parseInt(seconds) * 1000,
  });

  socket.write(encoder.expires());
};
